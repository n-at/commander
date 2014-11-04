var runs = require('../runs');
var tasks = require('../tasks');
var units = require('../units');

/*
    /run/:id
 */
exports.run = function(req, res) {
    var session = req.session;
    if(!session || !session.auth) {
        res.redirect('/');
        return;
    }

    runs.getRunById(req.params.id, function(run) {

        var runUnitsIds = [];
        for(var unitId in run.units) {
            if(run.units.hasOwnProperty(unitId)) {
                runUnitsIds.push(unitId);
            }
        }

        units.getUnitsByIds(runUnitsIds, function(units) {

            //get units names
            var unitNames = {};
            for(var i = 0; i < units.length; i++) {
                var unit = units[i];
                unitNames[unit.id] = unit.name;
            }
            for(var unitId in run.units) {
                if(run.units.hasOwnProperty(unitId)) {
                    if(!unitNames[unitId]) {
                        unitNames[unitId] = unitId; //if unit have no name - take id
                    }
                }
            }

            tasks.getTaskById(run.task_id, function(task) {

                res.render('run.twig', {
                    task: task,
                    run: run,
                    units: unitNames
                });

            });

        });

    });

};
