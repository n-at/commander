var uuid = require('node-uuid');
var Task = require('./models/task').Task;
var Run = require('./models/run').Run;
var log = require('../logger')(module);

exports.getAllTasks = function(callback) {
    log.debug('Querying all tasks...');

    Task.find({}, function(err, tasks) {
        if(err) {
            log.error('Error occurred while querying all tasks: %s', err.message);
            callback([]);
        } else {
            log.debug('Got %d tasks', tasks.length);
            callback(tasks);
        }
    });
};

exports.getTaskById = function(id, callback) {
    log.debug('Querying task with id "%s"', id);

    Task.findOne({id: id}, function(err, task) {
        if(err) {
            log.error('Error occurred while querying task with id "%s": %s', id, err.message);
            callback(false);
        } else {
            callback(task);
        }
    });
};

exports.saveTask = function(task, callback) {
    log.debug('Saving task...', task);

    if(task.id) {
        //update
        Task.update({id: task.id}, task, function(err, count) {
            if(err) {
                log.error('Error occurred while updating task with id "%s": %s', task.id, err.message);
            } else {
                log.debug('Updated %d task(s)', count);
            }
            callback();
        });
    } else {
        //add
        delete task.id;
        Task.create(task, function(err) {
            if(err) {
                log.error('Error occurred while creating task: %s', err.message);
            }
            callback();
        });
    }
};

exports.removeTaskById = function(id, callback) {
    log.debug('Removing task with id "%s"', id);

    Task.remove({id: id}, function(err, count) {
        if(err) {
            log.error('Error occurred while removing task with id "%s": %s', id, err.message);
        } else {
            log.debug('Removed %d task(s)', count);
        }
        callback();
    });
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////

exports.runTaskById = function(id, callback) {
    log.debug('Running task with id "%s"', id);

    Task.findOne({id: id}, function(err, task) {
        if(err) {
            log.error('Error occurred while running task with id "%s": %s', id, err.message);
            callback(false);
            return;
        }

        if(!task) {
            log.debug('No tasks found');
            callback(false);
            return;
        }

        //create Run
        var run = {
            id: uuid.v4(),
            task_id: task.id,
            units: {}
        };

        //set status by unit
        for(var i = 0; i < task.units.length; i++) {
            var unitStatus = {
                status: 'WAITING',
                message: 'Pending run',
                steps: []
            };
            var unitId = task.units[i];
            run.units[unitId] = unitStatus;
        }

        //save in db
        Run.create(run, function(err) {
            if(err) {
                log.error('Error while creating run: %s', err.message);
                callback(false);
                return;
            }

            callback(task, run.id);

            //start task
            require('./runs').run(task, run);
        });
    });
};

exports.getRunsByTaskId = function(id, callback) {
    log.debug('Querying all runs for task with id "%s"', id);

    Run.find({task_id: id})
        .sort('-date')
        .exec(function(err, runs) {
            if(err) {
                log.debug('Error occurred while querying all runs for task with id "%s": %s', id, err.message);
                callback([]);
            } else {
                log.debug('Found %d run(s)', runs.length);
                callback(runs);
            }
        });
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////

exports.getTasksCount = function(callback) {
    log.debug('Querying tasks count');

    Task.count({}, function(err, count) {
        if(err) {
            log.error('Error occurred while querying tasks count: %s', err.message);
            callback(null, 0);
        } else {
            log.debug('Tasks count: %d', count);
            callback(null, count);
        }
    });
};