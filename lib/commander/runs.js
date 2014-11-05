var http = require('http');
var qs = require('qs');
var log = require('../logger')(module);
var Run = require('./models/run').Run;
var units = require('./units');

/////////////////////////////////////////////////////////////////////////////////////////////////////////

exports.run = function(task, run) {
    log.debug('Running task with id "%s"', task.id);

    units.getUnitsByIds(task.units, function(units) {

        var saveRunResult = function(unit) {
            return function(result) {
                var uid = unit.id;
                if(!result) {
                    //run failed
                    run.units[uid].status = 'FAIL';
                    run.units[uid].message = 'Run failed';
                } else {
                    //run succeeded
                    run.units[uid].status = 'OK';
                    run.units[uid].message = 'Run finished';
                    run.units[uid].steps = result;
                }
                updateRun(run);
            };
        };

        for(var i = 0; i < units.length; i++) {
            var uid = units[i].id;
            run.units[uid].status = 'RUNNING';
            run.units[uid].message = 'Sending task to unit...';
            updateRun(run);

            runTaskOnUnit(units[i], task, run.id, saveRunResult(units[i]));
        }
    });
};

//update run record
function updateRun(run, callback) {
    Run.update({id: run.id}, run, function(err, count) {
        if(err) {
            log.error('Error occurred while updating run with id "%s": %s', run.id, err.message);
        } else {
            log.debug('Updated %d run record(s)', count);
        }
        if(callback) {
            callback();
        }
    });
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////

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

exports.getRunsCount = function(callback) {
    log.debug('Querying runs count');

    Run.count({}, function(err, count) {
        if(err) {
            log.error('Error occurred while querying runs count: %s', err.message);
            callback(null, 0);
        } else {
            log.debug('Runs count: %d', count);
            callback(null, count);
        }
    });
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////

function runTaskOnUnit(unit, task, runId, callback) {
    log.debug('Running task "%s" on unit "%s"', task.id, unit.id);

    var urlParts = units.unitUrl(unit);

    var connectionOptions = {
        hostname: urlParts.hostname,
        port: urlParts.port ? urlParts.port : 80,
        method: 'POST'
    };

    var req = http.request(connectionOptions, function(res) {
        var body = '';

        //connection failure
        res.on('error', function(err) {
            log.warn('Error occurred while requesting unit with id "%s": %s', unit.id, err.message);
            callback(false);
        });

        //receive chunk of data
        res.on('data', function(data) {
            body += data;
        });

        //end of transmission
        res.on('end', function() {
            if(res.statusCode != 200) {
                log.info('Unit with id "%s" returned status code %s', unit.id, res.statusCode);
                callback([{
                    success: false,
                    message: body
                }]);
                return;
            }

            var result = false;
            try {
                result = qs.parse(body);
            } catch(err) {
                log.warn('Error occurred while parsing response from unit with id "%s": %s', unit.id, err.message);
            }
            callback(result);
        });
    });

    req.on('error', function(err) {
        log.warn('Error occurred while sending request to unit "%s": %s', unit.id, err.message);
        callback(false);
    });

    //send request
    req.end(qs.stringify({
        api_key: unit.api_key,
        task_id: task.id,
        run_id: runId,
        task: task.steps.toObject()
    }));
}
