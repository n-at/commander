var daemonOptions = {
    main: '../unit.js',
    pidfile: '../unit.pid',
    name: 'commander unit server'
};

require('./lib/daemon')(daemonOptions);
