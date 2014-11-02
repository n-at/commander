var child_process = require('child_process');
var fs = require('fs');
var uuid = require('node-uuid');
var path = require('path');

var logger = require('./logger')(module);
var config = require('../conf');

exports.executeScript = function(script, callback) {
    var fileName = path.join(config.get('tmp_path'), uuid.v1() + '.sh');

    fs.writeFile(fileName, script, function(err) {
        if(err) {
            logger.warn('Error while saving script: %s', err.message);
            callback(err);
        }

        //execute shell script
        logger.debug('Spawning shell...');
        var shellExecutable = config.get('unit_shell');
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
                stderr: shellErrors
            });
        });

        //shell outputs
        shell.stdout.on('data', function(data) {
            shellOutput += data;
        });

        shell.stderr.on('data', function(data) {
            shellErrors += data;
        });
    });
};
