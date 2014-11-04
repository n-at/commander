(function(){

    var units = [];
    var steps = [];

    var unitsAvailable = {};

    /////////////////////////////////////////////////////////////////////////////////////////////////////////

    $(function() {
        $('#form').submit(prepareToSubmit);

        loadUnitList();

        loadStepList();
    });

    /////////////////////////////////////////////////////////////////////////////////////////////////////////

    function prepareToSubmit() {
        //TODO fill units and steps fields
    }

    /////////////////////////////////////////////////////////////////////////////////////////////////////////

    function loadUnitList() {
        $.get('/unit-list', function(units) {
            $unitSelect = $('#unit-select');

            for(var i = 0; i < units.length; i++) {
                var unit = units[i];
                unitsAvailable[unit.id] = unit;
                $('<option></option>').val(unit.id).text(unit.name).appendTo($unitSelect);
            }

            usedUnitsList();
        });
    }

    function usedUnitsList() {
        //TODO load and fill units list
    }

    /////////////////////////////////////////////////////////////////////////////////////////////////////////

    function loadStepList() {

    }

})();
