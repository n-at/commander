var tasks = require('../tasks');
var log = require('../../logger')(module);

/*
    /tasks/:action?/:id?
 */
exports.action = function(req, res) {
    var session = req.session;
    if(!session || !session.auth) {
        res.redirect('/');
        return;
    }

    var taskId = req.params.id;

    switch(req.params.action) {

        case 'add':
            res.render('tasks-edit.twig', {
                action: 'add'
            });
            break;

        case 'edit':
            if(!taskId) {
                log.info('Trying to edit task without id');
                res.redirect('/tasks');
                break;
            }
            tasks.getTaskById(taskId, function(task) {
                res.render('tasks-edit.twig', {
                    action: 'edit',
                    task: task
                });
            });
            break;

        case 'delete':
            if(!taskId) {
                log.info('Trying to remove task without id');
                res.redirect('/tasks');
                break;
            }
            tasks.removeTaskById(taskId, function() {
                res.redirect('/tasks');
            });
            break;

        case 'run':
            if(!taskId) {
                log.info('Trying to run task without id');
                res.redirect('/tasks');
                break;
            }
            tasks.runTaskById(taskId, function(task, runId) {
                if(!task) {
                    res.redirect('/tasks');
                    return;
                }
                res.render('tasks-run.twig', {
                    task: task,
                    runId: runId
                });
            });
            break;

        case 'log':
            if(!taskId) {
                log.info('Trying to show run log for task without id');
                res.redirect('/tasks');
                break;
            }
            tasks.getTaskById(taskId, function(task) {
                tasks.getRunsByTaskId(taskId, function(runs) {
                    res.render('tasks-log.twig', {
                        runs: runs,
                        task: task
                    });
                });
            });
            break;

        default:
            tasks.getAllTasks(function(tasks) {
                res.render('tasks.twig', {tasks: tasks});
            });
    }
};

/*
    /task-save
 */
exports.save = function(req, res) {
    var session = req.session;
    if(!session || !session.auth) {
        res.redirect('/');
        return;
    }

    var units = [];
    try {
        units = JSON.parse(req.param('units'));
    } catch(err) {
        log.error('Error occurred while parsing unit list: %s', err.message);
    }

    var steps = [];
    try {
        steps = JSON.parse(req.param('steps'));
    } catch(err) {
        log.error('Error occurred while parsing step list: %s', err.message);
    }

    var task = {
        id: req.param('task_id'),
        name: req.param('name'),
        units: units,
        steps: steps
    };

    tasks.saveTask(task, function() {
        res.redirect('/tasks');
    });
};

/*
    /task-units/:id
 */
exports.units = function(req, res) {
    var session = req.session;
    if(!session || !session.auth) {
        res.json([]);
        return;
    }

    tasks.getTaskById(req.params.id, function(task) {
        if(!task) {
            req.json([]);
        } else {
            res.json(task.units);
        }
    });
};

/*
    /task-steps/:id
 */
exports.steps = function(req, res) {
    var session = req.session;
    if(!session || !session.auth) {
        res.json([]);
        return;
    }

    tasks.getTaskById(req.params.id, function(task) {
        if(!task) {
            res.json([]);
        } else {
            res.json(task.steps);
        }
    });
};