var tasks = require('../tasks');
var units = require('../units');
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

    switch(req.params.action) {

        case 'add':
            res.render('tasks-edit.twig', {
                action: 'add'
            });
            break;

        case 'edit':
            //TODO edit
            res.render('tasks-edit.twig', {
                action: 'edit'
            });
            break;

        case 'delete':
            //TODO delete
            res.redirect('/tasks');
            break;

        case 'run':
            //TODO run
            res.render('tasks-run.twig');
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

    //TODO save

    res.redirect('/tasks');
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