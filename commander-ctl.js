var daemonOptions = {
    main: '../commander.js',
    pidfile: '../commander.pid',
    name: 'commander server'
};

require('./lib/daemon')(daemonOptions);
