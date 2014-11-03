var daemon = require('daemonize2').setup({
    main: 'commander.js',
    pidfile: 'commander.pid',
    name: 'commander server'
});
switch(process.argv[2]) {
    case 'start':
        daemon.start();
        break;
    case 'stop':
        daemon.stop();
        break;
    case 'restart':
        daemon.stop(function() {
            daemon.start();
        });
        break;
    case 'status':
        var pid = daemon.status();
        if(pid) {
            console.log('commander server is running with pid:%s', pid);
        } else {
            console.log('commander server is not running');
        }
        break;
    case 'version':
        console.log('commander ' + require('./package').version);
        break;
    default:
        console.log('Usage: [start|stop|restart|status|version]');
}
