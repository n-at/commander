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