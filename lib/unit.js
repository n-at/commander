var http = require('http');
var config = require('../conf');
var logger = require('./logger')(module);
var runner = require('./runner');

function serverCallback(req, res) {
    //TODO 1. Parse body. 2. Execute script. 3. Call commander with response
    res.end('OK');
}

var port = config.get('unit:port');
var host = config.get('unit:host');

var server = http.createServer(serverCallback);

server.on('error', function(err) {
    logger.error('Unit server error: %s', err.message);
    throw err;
});

server.listen(port, host);

logger.info('Unit is started on %s:%s', host, port);
