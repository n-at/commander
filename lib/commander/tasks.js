var Task = require('./models/task').Task;
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
