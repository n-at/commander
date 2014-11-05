var qs = require('qs');
var uuid = require('node-uuid');
var config = require('../conf');
var request = require('./test_request');

var options = {
    host: config.get('unit:host'),
    port: config.get('unit:port'),
    method: 'POST',
    path: '/'
};

var data = qs.stringify({
    api_key: config.get('unit:api_key'),
    task_id: uuid.v4(),
    run_id: uuid.v4(),
    task: [{
        type: 'script',
        action: '#!/bin/bash\nls /tmp\n',
        breakOnError: 0
    }]
});

//standard POST
request(options, data);

//POST with arbitrary path
options.path = '/aaaaaaa?aaa=aaa';
request(options, data);

//GET status without a key
options.method = 'GET';
options.path = '/status';
request(options, data);

//GET with a correct key
options.path = '/status?' + config.get('unit:api_key');
request(options, data);

//GET with a incorrect key
options.path = '/status?aabbcc';
request(options, data);

//GET with arbitrary path
options.path = '/aaaaaaa?aaa=aaa';
request(options, data);
