var qs = require('qs');
var uuid = require('node-uuid');
var config = require('../conf');

var options = {
    host: config.get('unit:host'),
    port: config.get('unit:port'),
    method: 'POST'
};

var data = qs.stringify({
    api_key: config.get('unit:api_key'),
    task_id: uuid.v4(),
    run_id: uuid.v4(),
    task: [
        {
            type: 'script',
            action: '#!/bin/bash\nls /tmp\n',
            breakOnError: 0
        }, {
            type: 'preset',
            action: 'uname.sh',
            breakOnError: 0
        }
    ]
});

require('./test_request')(options, data);
