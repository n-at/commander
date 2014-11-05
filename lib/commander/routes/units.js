var log = require('../../logger')(module);
var units = require('../units');

/*
    /units/:action?/:id?
*/
exports.action = function(req, res) {
    var session = req.session;
    if(!session || !session.auth) {
        res.redirect('/');
        return;
    }

    var unitId = req.params.id;

    switch(req.params.action) {
        case 'add':
            res.render('units-edit.twig', { action: 'add' });
            break;

        case 'edit':
            units.getUnitById(unitId, function(unit) {
                if(!unit) {
                    log.info('Unit with id "%s" not found', unitId);
                    res.redirect('/units');
                    return;
                }
                res.render('units-edit.twig', {
                    action: 'edit',
                    unit: unit
                });
            });
            break;

        case 'delete':
            units.deleteUnit(unitId, function() {
                res.redirect('/units');
            });
            break;

        default:
            units.getAllUnits(function(units) {
                res.render('units.twig', { units: units });
            });
    }
};

/*
    /unit-save
*/
exports.save = function(req, res) {
    var session = req.session;
    if(!session || !session.auth) {
        res.redirect('/');
        return;
    }

    var unit = {
        name: req.param('name'),
        address: req.param('address'),
        api_key: req.param('api_key'),
        id: req.param('unit_id')
    };

    units.saveUnit(unit, function() {
        res.redirect('/units');
    });
};

/*
    /unit-list
 */
exports.list = function(req, res) {
    var session = req.session;
    if(!session || !session.auth) {
        res.json([]);
    } else {
        units.getAllUnits(function(units) {
            if(!units) {
                res.json([]);
            } else {
                res.json(units);
            }
        });
    }
};
