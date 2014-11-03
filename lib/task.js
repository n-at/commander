var logger = require('./logger')(module);
var config = require('../conf');

exports.executeTask = function(task, callback) {
    callback(task); //TODO do some work
};
