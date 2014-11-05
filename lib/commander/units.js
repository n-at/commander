var async = require('async');
var http = require('http');
var util = require('util');
var url = require('url');
var log = require('../logger')(module);
var Unit = require('./models/unit').Unit;

exports.getAllUnits = function(callback) {
    log.debug('Querying all units...');

    Unit.find({}, function(err, units) {
        if(err) {
            log.error('Error occurred while querying all units : %s', err.message);
            callback([]);
        } else {
            log.debug('Found %s unit(s)', units.length);
            exports.unitsWithStatus(units, callback);
        }
    });
};

exports.getUnitById = function(id, callback) {
    log.debug('Querying unit with id "%s"', id);

    Unit.findOne({id: id}, function(err, unit) {
        if(err) {
            log.error('Error occurred while querying one unit with id "%s": %s', id, err.message);
            callback(false);
            return;
        }

        if(!unit) {
            log.debug('No units found');
            callback(false);
            return;
        }

        exports.unitsWithStatus(unit, callback);
    });
};

exports.saveUnit = function(unit, callback) {
    log.debug('Saving...', unit);

    //validate
    if(!unit.name || !unit.address) {
        callback();
        return;
    }

    if(unit.id) {
        //update
        Unit.update({'id': unit.id}, unit, function(err, num) {
            if(err) {
                log.error('Error occurred while updating unit: %s', err.message);
            }
            log.debug('Updated %d record(s)', num);
            callback();
        });
    } else {
        //add
        delete unit.id; //id will be assigned automatically
        Unit.create(unit, function(err) {
            if(err) {
                log.error('Error occurred while adding unit: %s', err.message);
            }
            log.debug('Unit added');
            callback();
        });
    }
};

exports.deleteUnit = function(id, callback) {
    log.debug('Delete unit with id "%s"', id);

    Unit.remove({id: id}, function(err, num) {
        if(err) {
            log.error('Error occurred while removing unit with id "%s": %s', id, err.message);
        }
        log.debug('Removed %d record(s)', num);
        callback();
    });
};

exports.getUnitsCount = function(callback) {
    log.debug('Querying units count...');

    Unit.count({}, function(err, count) {
        if(err) {
            log.error('Error occurred while retrieving units count: %s', err.message);
            callback(null, 0);
        } else {
            callback(null, count);
        }
    });
};

exports.getUnitsByIds = function(ids, callback) {
    log.debug('Querying units with ids...', ids);

    Unit.find({})
        .where('id').in(ids)
        .exec(function(err, units) {
            if(err) {
                log.error('Error occurred while querying units with ids %s: %s', ids, err.message);
                callback([]);
            } else {
                log.debug('Found %d unit(s)', units.length);
                exports.unitsWithStatus(units, callback);
            }
        });
};

exports.unitsWithStatus = function(units, callback) {
    if(util.isArray(units)) {
        var statusCheck = function(unit) {
            return function(callback) {
                checkUnitStatus(unit, callback);
            };
        };
        var statusRequests = [];
        for(var i = 0; i < units.length; i++) {
            statusRequests.push(statusCheck(units[i]));
        }
        async.parallel(statusRequests, function(err, unitsWithStatus) {
            if(!unitsWithStatus) {
                callback(units);
            } else {
                var returnUnits = [];
                for(var i = 0; i < unitsWithStatus.length; i++) {
                    var unit = unitsWithStatus[i];
                    //FIXME better object transform
                    returnUnits.push({
                        name: unit.name,
                        address: unit.address,
                        api_key: unit.api_key,
                        id: unit.id,
                        status: unit.status
                    });
                }
                callback(returnUnits);
            }
        });
    } else {
        checkUnitStatus(units, function(err, unit) {
            //FIXME find better object transform
            callback({
                id: unit.id,
                name: unit.name,
                address: unit.address,
                api_key: unit.api_key,
                status: unit.status
            });
        });
    }
};

exports.unitUrl = function(unit) {
    var address = unit.address;
    if(address.indexOf('http://') == -1) {
        address = 'http://' + address;
    }
    return url.parse(address);
};

function checkUnitStatus(unit, callback) {
    log.debug('Checking status of unit with id "%s"', unit.id);

    var unitUrl = exports.unitUrl(unit);
    var connectionOptions = {
        hostname: unitUrl.hostname,
        port: unitUrl.port,
        path: '/status?' + unit.api_key
    };

    var req = http.request(connectionOptions, function(res) {
        var body = '';

        res.on('error', function(err) {
            unit.status = 'UNKNOWN';
            callback(null, unit);
        });

        res.on('data', function(data) {
            body += data;
        });

        res.on('end', function() {
            switch(body) {
                case 'OK':
                    unit.status = 'ONLINE';
                    break;
                case 'KEY':
                    unit.status = 'WRONG KEY';
                    break;
                default:
                    unit.status = 'UNKNOWN';
            }
            callback(null, unit);
        });
    });

    req.on('error', function(err) {
        log.info('Error occurred while connecting to unit with id "%s": %s', unit.id, err.message);
        unit.status = 'OFFLINE';
        callback(null, unit);
    });

    req.end('');
}