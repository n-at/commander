var async = require('async');
var http = require('http');
var qs = require('qs');
var util = require('util');
var url = require('url');
var log = require('../logger')(module);
var config = require('../../conf');
var Unit = require('./models/unit').Unit;

/////////////////////////////////////////////////////////////////////////////////////////////////////////

exports.getAllUnits = function(callback) {
    log.debug('Querying all units...');

    Unit.find({})
        .sort('name')
        .exec(function(err, units) {
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
            log.debug('Updated %d unit(s)', num);
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
    log.debug('Removing unit with id "%s"', id);

    Unit.remove({id: id}, function(err, num) {
        if(err) {
            log.error('Error occurred while removing unit with id "%s": %s', id, err.message);
        }
        log.debug('Removed %d unit(s)', num);
        callback();
    });
};

exports.getUnitsCount = function(callback) {
    log.debug('Querying units count...');

    exports.getAllUnits(function(units) {
        var countOnline = 0, countOffline = 0;
        for(var i = 0; i < units.length; i++) {
            if(units[i].status.message == 'ONLINE') {
                countOnline++;
            } else if(units[i].status.message == 'OFFLINE') {
                countOffline++;
            }
        }
        callback(null, {
            total: units.length,
            online: countOnline,
            offline: countOffline
        });
    });
};

exports.getUnitsByIds = function(ids, callback) {
    log.debug('Querying units with ids...', ids);

    Unit.find({})
        .where('id').in(ids)
        .sort('name')
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

/////////////////////////////////////////////////////////////////////////////////////////////////////////

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
            callback(unitsWithStatus ? unitsWithStatus : units);
        });
    } else {
        if(!units) {
            callback({});
            return;
        }
        checkUnitStatus(units, function(err, unit) {
            callback(unit);
        });
    }
};

exports.unitUrl = function(unit) {
    if(!unit) {
        return {};
    }
    var address = unit.address;
    if(address.indexOf('http://') == -1) {
        address = 'http://' + address;
    }
    return url.parse(address);
};

function checkUnitStatus(unit, callback) {
    log.debug('Checking status of unit with id "%s"', unit.id);

    unit = unit.toObject();

    if(!config.get('commander:check_unit_status')) {
        unit.status = emptyStatus('');
        callback(null, unit);
        return;
    }

    var unitUrl = exports.unitUrl(unit);
    var connectionOptions = {
        hostname: unitUrl.hostname,
        port: unitUrl.port,
        path: '/status?' + unit.api_key
    };

    var statusReturned = false;

    var req = http.request(connectionOptions, function(res) {
        var body = '';

        res.on('error', function() {
            unit.status = emptyStatus('UNKNOWN');
            if(!statusReturned) {
                statusReturned = true;
                callback(null, unit);
            }
        });

        res.on('data', function(data) {
            body += data;
        });

        res.on('end', function() {
            unit.status = emptyStatus('UNKNOWN');
            try {
                unit.status = qs.parse(body);
            } catch(err) {
                log.info('Error occurred while parsing unit "%s" status: %s', unit.id, err.message);
            }
            if(!statusReturned) {
                statusReturned = true;
                callback(null, unit);
            }
        });
    });

    req.on('error', function(err) {
        log.info('Error occurred while connecting to unit with id "%s": %s', unit.id, err.message);
        unit.status = emptyStatus('OFFLINE');
        if(!statusReturned) {
            statusReturned = true;
            callback(null, unit);
        }
    });

    req.setTimeout(config.get('commander:unit_status_timeout'), function() {
        log.info('Connection with unit "%s" timed out', unit.id);
        unit.status = emptyStatus('TIMEOUT');
        if(!statusReturned) {
            statusReturned = true;
            callback(null, unit);
        }
    });

    req.end();
}

function emptyStatus(message) {
    return {
        message: message,
        version: ''
    };
}
