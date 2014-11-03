var units = require('../units');
var log = require('../../logger')(module);

/*
    /units/:action?/:id?
*/
exports.action = function(req, res) {
    var session = req.session;
    if(!session || !session.auth) {
        res.redirect('/');
        return;
    }

    switch(req.params.action) {
        case 'add':
            res.render('units-edit.twig', {
                action: 'add'
            });
            break;

        case 'edit':
            units.getUnitById(req.params.id, function(unit) {
                if(!unit) {
                    //unit not found
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
            units.deleteUnit(req.params.id, function() {
                res.redirect('/units');
            });
            break;

        default:
            units.getAllUnits(function(units) {
                res.render('units.twig', {
                    units: units
                });
            });
    }
};

/*
    /units-save
*/
exports.save = function(req, res) {
    var session = req.session;
    if(!session || !session.auth) {
        res.redirect('/');
        return;
    }

    units.saveUnit({
        name: req.param('name'),
        address: req.param('address'),
        api_key: req.param('api_key'),
        id: req.param('unit_id')
    }, function() {
        res.redirect('/units');
    });
};
