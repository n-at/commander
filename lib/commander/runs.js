var log = require('../logger')(module);
var Run = require('./models/run').Run;

exports.run = function(task, run) {
    //TODO run task
};

exports.getRunById = function(id, callback) {
    log.debug('Querying run with id "%s"', id);

    Run.findOne({id: id}, function(err, run) {
        if(err) {
            log.error('Error occurred while querying run with id "%s": %s', id, err.message);
            callback({});
        } else {
            callback(run);
        }
    });
};