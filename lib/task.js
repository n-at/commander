var logger = require('./logger')(module);
var config = require('../conf');
var runner = require('./runner');

/////////////////////////////////////////////////////////////////////////////////////////////////////////

exports.executeTask = function(task, callback) {
    var currentStep = 0;
    var result = [];

    var stepCallback = function(stepResult) {
        result.push(stepResult);

        var breakOnError = parseInt(task[currentStep].breakOnError);
        if(!stepResult.success && breakOnError) {
            logger.info('Step failed. Stop task execution');
            callback(result);
            return;
        }

        currentStep++;
        if(currentStep < task.length) {
            executeStep(task[currentStep], stepCallback);
        } else {
            callback(result);
        }
    };

    executeStep(task[currentStep], stepCallback);
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////

function executeStep(step, callback) {
    logger.debug('Executing step...');
    logger.debug('Step type: %s', step.type);

    var executionCallback = function(err, result) {
        if(err) {
            callback({
                success: false,
                message: err.message
            });
        } else {
            result.success = (result.code == 0);
            result.message = (result.code ? 'Script execution failed' : 'OK');
            callback(result);
        }
    };

    switch(step.type) {
        case 'script':
            if(config.get('unit:preset_only')) {
                callback({
                    success: false,
                    message: 'script execution is not allowed on this unit'
                });
                return;
            }
            runner.executeScript(step.action, executionCallback);
            break;

        case 'preset':
            runner.executePreset(step.action, executionCallback);
            break;

        default:
            callback({
                success: false,
                message: 'unknown step type'
            });
    }
}
