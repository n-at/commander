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

//control
request(options, data);

//without type
data = qs.stringify({
    api_key: config.get('unit:api_key'),
    task_id: uuid.v4(),
    run_id: uuid.v4(),
    task: [{
        action: '#!/bin/bash\nls /tmp\n',
        breakOnError: 0
    }]
});
request(options, data);

//incorrect type
data = qs.stringify({
    api_key: config.get('unit:api_key'),
    task_id: uuid.v4(),
    run_id: uuid.v4(),
    task: [{
        type: 'abcdef',
        action: '#!/bin/bash\nls /tmp\n',
        breakOnError: 0
    }]
});
request(options, data);

//without action
data = qs.stringify({
    api_key: config.get('unit:api_key'),
    task_id: uuid.v4(),
    run_id: uuid.v4(),
    task: [{
        type: 'script',
        breakOnError: 0
    }]
});
request(options, data);

//without breakOnError
data = qs.stringify({
    api_key: config.get('unit:api_key'),
    task_id: uuid.v4(),
    run_id: uuid.v4(),
    task: [{
        type: 'script',
        action: '#!/bin/bash\nls /tmp\n'
    }]
});
request(options, data);
