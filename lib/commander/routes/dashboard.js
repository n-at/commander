var async = require('async');
var log = require('../../logger')(module);
var units = require('../units');
var tasks = require('../tasks');
var runs = require('../runs');

/*
    /dashboard
 */
exports.info = function(req, res) {
    var session = req.session;
    if(!session || !session.auth) {
        res.redirect('/');
        return;
    }

    async.parallel({
            unitsCount: units.getUnitsCount,
            tasksCount: tasks.getTasksCount,
            runsCount: runs.getRunsCount
        },
        function(err, results) {
            log.debug(err, results);
            if(err) {
                log.error('Error occurred while calculating dashboard: %s', err.message);
            }

            res.render('dashboard.twig', {stats: results});
        });
};
