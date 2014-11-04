var log = require('../logger')(module);
var Unit = require('./models/unit').Unit;

exports.getAllUnits = function(callback) {
    log.debug('Querying all units...');

    Unit.find({}, function(err, units) {
        if(err) {
            log.error('Error occurred while querying all units : %s', err.message);
            callback([]);
        } else {
            //TODO check units status
            callback(units);
        }
    });
};

exports.getUnitById = function(id, callback) {
    log.debug('Querying unit with id "%s"', id);

    Unit.findOne({id: id}, function(err, unit) {
        if(err) {
            log.error('Error occurred while querying one unit with id "%s": %s', id, err.message);
            callback(false);
        } else {
            callback(unit);
        }
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

exports.count = function(callback) {
    log.debug('Querying units count...');

    Unit.count({}, function(err, count) {
        if(err) {
            log.error('Error occurred while retrieving units count: %s', err.message);
            callback(0);
        } else {
            callback(count);
        }
    })
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
                callback(units);
            }
        });
};
