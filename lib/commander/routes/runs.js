var log = require('../../logger')(module);
var config = require('../../../conf');
var runs = require('../runs');
var tasks = require('../tasks');
var units = require('../units');

/*
    /run/:id
 */
exports.run = function(req, res) {
    var session = req.session;
    if(!session || !session.auth) {
        res.redirect('/');
        return;
    }

    var runId = req.params.id;

    runs.getRunById(runId, function(run) {
        if(!run) {
            log.info('Run with id "%s" not found', runId);
            res.redirect('/tasks');
            return;
        }

        var unitsIds = [];
        var unitNames = {};
        for(var unitId in run.units) {
            if(run.units.hasOwnProperty(unitId)) {
                unitsIds.push(unitId);
                unitNames[unitId] = unitId; //default unit name - it's id
            }
        }

        units.getUnitsByIds(unitsIds, function(units) {
            for(var i = 0; i < units.length; i++) {
                var unit = units[i];
                unitNames[unit.id] = unit.name; //get actual units names
            }

            tasks.getTaskById(run.task_id, function(task) {
                if(!task) {
                    log.info('Run with id "%s" references to a task with id "%s" which is not found', run.id, run.task_id);
                    res.redirect('/tasks');
                    return;
                }
                res.render('run.twig', {
                    task: task,
                    run: run,
                    units: unitNames
                });
            });
        });
    });
};

/*
    /run-result
 */
exports.runResult = function(req, res) {
    var key = req.param('api_key');
    var runId = req.param('id');

    log.debug('Remotely get run result with id "%s"', runId);

    if(key != config.get('commander:api_key')) {
        res.json({
            success: false,
            message: 'Wrong API key'
        });
        return;
    }

    if(!runId) {
        res.json({
            success: false,
            message: 'Empty run id'
        });
        return;
    }

    runs.getRunById(runId, function(run) {
        if(!run) {
            res.json({
                success: false,
                message: 'Run not found'
            });
            return;
        }

        res.json({
            success: true,
            message: 'OK',
            run: run
        });
    });
};
