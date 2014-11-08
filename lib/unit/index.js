var http = require('http');
var qs = require('qs');
var url = require('url');
var config = require('../../conf/index');
var logger = require('../logger')(module);
var task = require('./task');

/////////////////////////////////////////////////////////////////////////////////////////////////////////

function serverCallback(req, res) {
    logger.debug('Receiving connection...');
    logger.debug('Request method: %s', req.method);

    var requestUrl = url.parse(req.url);

    if(req.method === 'GET' && requestUrl.pathname == '/status') {
        sendStatus(req, res);
        return;
    }

    if(req.method !== 'POST') {
        res.statusCode= 405;
        res.end('method is not allowed');
        req.connection.destroy();
        return;
    }

    var body = '';

    req.on('data', function(data) {
        body += data;

        if(body.length > config.get('unit:request_max_length')) {
            logger.warn('Flood detected');
            res.statusCode = 413;
            res.end('Request body limit exceeded');
            req.connection.destroy();
        }
    });

    req.on('end', function() {
        var request;

        //parse request
        try {
            request = qs.parse(body);
        } catch(err) {
            logger.warn('Error while parsing request: %s', err.message);
            res.statusCode = 400;
            res.end('Bad (malformed) request');
            return;
        }
        logger.debug('Request OK');

        //check API key
        if(request.api_key != config.get('unit:api_key')) {
            logger.info('Wrong API key: %s', request.api_key);
            res.statusCode = 403;
            res.end('Wrong API key');
            return;
        }
        logger.debug('API key OK');

        //check fields
        if(!request.task_id) {
            logger.info('task_id missing');
            res.statusCode = 400;
            res.end('Missing task_id');
            return;
        }

        if(!request.run_id) {
            logger.info('run_id missing');
            res.statusCode = 400;
            res.end('Missing run_id');
            return;
        }

        if(!request.task || request.task.length === 0) {
            logger.info('task missing');
            res.statusCode = 400;
            res.end('Missing task');
            return;
        }

        //execute task
        logger.info('Starting task "%s" run "%s"', request.task_id, request.run_id);
        var timeStart = (new Date()).getTime();
        task.executeTask(request.task, function(result) {
            var timeElapsed = (new Date()).getTime() - timeStart;
            logger.info('Run "%s" finished in %s seconds', request.run_id, timeElapsed / 1000);

            res.statusCode = 200;
            res.end(qs.stringify(result));
        });
    });
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////

function sendStatus(req, res) {
    logger.debug('Status check...');

    var status = {
        message: 'UNKNOWN',
        version: require('../../package').version
    };

    var requestUrl = url.parse(req.url);

    if(config.get('unit:api_key') == requestUrl.query) {
        status.message = 'ONLINE';
    } else {
        status.message = 'WRONG KEY';
    }

    res.setHeader('Content-Type', 'application/json');
    res.end(qs.stringify(status));
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////

var port = config.get('unit:port');
var host = config.get('unit:host');

var server = http.createServer(serverCallback);

server.on('error', function(err) {
    logger.error('Unit server error: %s', err.message);
    throw err;
});

server.listen(port, host);

logger.info('Unit is started on %s:%s', host, port);
