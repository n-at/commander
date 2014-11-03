var child_process = require('child_process');
var fs = require('fs');
var uuid = require('node-uuid');
var path = require('path');

var logger = require('../logger')(module);
var config = require('../../conf/index');

/////////////////////////////////////////////////////////////////////////////////////////////////////////

//execute script from string
exports.executeScript = function(script, callback) {
    var fileName = path.join(config.get('tmp_path'), uuid.v1());

    fs.writeFile(fileName, script, function(err) {
        if(err) {
            logger.warn('Error while saving script: %s', err.message);
            callback(err);
        }

        runShellScriptFromFile(fileName, callback);
    });
};

//execute string from preset file
exports.executePreset = function(presetName, callback) {
    var fileName = path.join(config.get('preset_path'), presetName);
    var absoluteFileName = path.normalize(fileName);

    logger.debug('Executing preset script "%s"', presetName);
    logger.debug('Preset absolute path: %s', absoluteFileName);

    if(absoluteFileName.indexOf(presetName) == -1) {
        logger.warn('Access to file "%s" which is not inside of presets path', presetName);
        callback(new Error('Security violation. Access to file: ' + absoluteFileName));
        return;
    }

    fs.exists(absoluteFileName, function(exists) {
        if(!exists) {
            logger.warn('Preset script "%s" does not exist', presetName);
            callback(new Error('Preset script not exists: ' + presetName));
        } else {
            runShellScriptFromFile(fileName, callback);
        }
    });
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////

function runShellScriptFromFile(fileName, callback) {
    logger.debug('Spawning shell...');

    var timeStart = (new Date()).getTime();

    var shellExecutable = config.get('unit:shell');
    var shell = child_process.spawn(shellExecutable, [fileName], {cwd: config.get('tmp_path')});
    var shellOutput = '', shellErrors = '';

    shell.on('error', function(err) {
        logger.warn('Error while starting shell: %s', err.message);
        callback(err);
    });

    shell.on('exit', function(code, signal) {
        logger.debug('Shell finished');
        callback(null, {
            code: code,
            signal: signal,
            stdout: shellOutput,
            stderr: shellErrors,
            time: (new Date()).getTime() - timeStart
        });
    });

    //shell outputs
    shell.stdout.on('data', function(data) {
        shellOutput += data;
    });

    shell.stderr.on('data', function(data) {
        shellErrors += data;
    });
}
