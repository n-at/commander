var http = require('http');
var qs = require('qs');
var url = require('url');
var config = require('../../conf/index');
var log = require('../logger')(module);
var task = require('./task');

/////////////////////////////////////////////////////////////////////////////////////////////////////////

function serverCallback(req, res) {
    log.debug('Receiving connection...');
    log.debug('Request method: %s', req.method);

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
            log.warn('Flood detected');
            res.statusCode = 413;
            res.end('Request body limit exceeded');
            req.connection.destroy();
        }
    });

    req.on('end', function() {
        log.debug('Processing request...');

        var request;
        try {
            request = qs.parse(body);
        } catch(err) {
            log.warn('Error while parsing request: %s', err.message);
            res.statusCode = 400;
            res.end('Bad (malformed) request');
            return;
        }

        var status = checkRequest(request);
        if(status.code != 200) {
            res.statusCode = status.code;
            res.end(status.message);
            return;
        }

        //execute task
        log.info('Starting task "%s" run "%s"', request.task_id, request.run_id);
        var timeStart = (new Date()).getTime();
        task.executeTask(request.task, function(result) {
            var timeElapsed = (new Date()).getTime() - timeStart;
            log.info('Run "%s" finished in %s seconds', request.run_id, timeElapsed / 1000);

            res.statusCode = 200;
            res.end(qs.stringify(result));
        });
    });
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////

function sendStatus(req, res) {
    log.debug('Status check...');

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

function checkRequest(request) {
    //check API key
    if(request.api_key != config.get('unit:api_key')) {
        log.info('Wrong API key: %s', request.api_key);
        return {
            code: 403,
            message: 'Wrong API key'
        };
    }

    //check fields
    if(!request.task_id) {
        log.info('task_id missing');
        return {
            code: 400,
            message: 'Missing task_id'
        };
    }

    if(!request.run_id) {
        log.info('run_id missing');
        return {
            code: 400,
            message: 'Missing run_id'
        };
    }

    if(!request.task || request.task.length === 0) {
        log.info('task missing');
        return {
            code: 400,
            message: 'Missing task'
        };
    }

    //ok
    return {
        code: 200,
        message: 'OK'
    };
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////

var port = config.get('unit:port');
var host = config.get('unit:host');

var server = http.createServer(serverCallback);

server.on('error', function(err) {
    log.error('Unit server error: %s', err.message);
    throw err;
});

server.listen(port, host);

log.info('Unit is started on %s:%s', host, port);
