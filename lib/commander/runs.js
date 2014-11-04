var http = require('http');
var url = require('url');
var qs = require('qs');
var log = require('../logger')(module);
var Run = require('./models/run').Run;
var units = require('./units');

/////////////////////////////////////////////////////////////////////////////////////////////////////////

exports.run = function(task, run) {
    log.debug('Running task with id "%s"', task.id);

    units.getUnitsByIds(task.units, function(units) {

        for(var i = 0; i < units.length; i++) {

            runTaskOnUnit(units[i], task, run.id, (function(unit) {

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

                    //update run record
                    Run.update({id: run.id}, run, function(err, count) {
                        if(err) {
                            log.error('Error occurred while updating run with id "%s": %s', run.id, err.message);
                        } else {
                            log.debug('Updated %d record(s)', count);
                        }
                    });
                }

            })(units[i]));

        }

    });
};

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

/////////////////////////////////////////////////////////////////////////////////////////////////////////

function runTaskOnUnit(unit, task, runId, callback) {
    log.debug('Running task "%s" on unit "%s"', task.id, unit.id);

    var address = unit.address;
    if(address.indexOf('http://') == -1) {
        address = 'http://' + address;
    }

    var urlParts = url.parse(address);

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

    //task.steps is not an usual array, so qs cannot stringify it correctly
    var taskSteps = [];
    for(var i = 0; i < task.steps.length; i++) {
        taskSteps.push(task.steps[i]);
    }

    //send request
    req.end(qs.stringify({
        api_key: unit.api_key,
        task_id: task.id,
        run_id: runId,
        task: taskSteps
    }));
}