(function(){

    var units = [];
    var steps = [];

    var unitsAvailable = {};

    /////////////////////////////////////////////////////////////////////////////////////////////////////////

    $(function() {
        $('#form').submit(prepareToSubmit);
        $('#add-unit').click(addUnitClick);

        setupMessenger();

        loadUnits();
        loadStepList();
    });

    /////////////////////////////////////////////////////////////////////////////////////////////////////////

    function prepareToSubmit() {
        var $form = $('#form');
        $form.find('input[name="units"]').val(JSON.stringify(units));
        $form.find('input[name="steps"]').val(JSON.stringify(steps));
    }

    /////////////////////////////////////////////////////////////////////////////////////////////////////////

    function loadUnits() {
        $.get('/unit-list', function(units) {
            var $unitSelect = $('#unit-select');

            for(var i = 0; i < units.length; i++) {
                var unit = units[i];
                unitsAvailable[unit.id] = unit;
                $('<option></option>').val(unit.id).text(unit.name).appendTo($unitSelect);
            }

            usedUnitsList();
        });
    }

    function usedUnitsList() {
        var id = $('#form').find('input[name="task_id"]').val();
        if(!id) return;

        $.get('/task-units/' + id, function(units) {
            for(var i = 0; i < units.length; i++) {
                appendUnit(units[i]);
            }
        });
    }

    function appendUnit(unitId) {
        //check appended units
        for(var i = 0; i < units.length; i++) {
            if(units[i] == unitId) {
                notify('This unit is already added', 'error');
                return;
            }
        }
        units.push(unitId);

        //unit block
        var $unitList = $('#unit-list');
        var $unitContainer = $('<div class="panel panel-default"></div>')
            .attr('data-unit-id', unitId)
            .appendTo($unitList);
        var $unit = $('<div class="panel-body"></div>').appendTo($unitContainer);

        //unit description
        var unit = unitsAvailable[unitId] ? unitsAvailable[unitId] : false;
        $('<strong></strong>')
            .text(unit ? unit.name : 'Unit with id "'+unitId+'" not found')
            .addClass(unit ? '' : 'text-danger')
            .appendTo($unit);
        $('<em></em>')
            .text(unit ? ' '+unit.address : '')
            .appendTo($unit);

        //control buttons
        var $controlBlock = $('<div class="pull-right"></div>').appendTo($unit);

        //remove button
        $('<a href="javascript:void(0)" class="text-danger"></a>')
            .appendTo($controlBlock)
            .html('<i class="fa fa-remove"></i>')
            .click(function() {
                removeUnit(unitId);
            });
    }

    function removeUnit(unitId) {
        for(var i = 0; i < units.length; i++) {
            if(units[i] == unitId) {
                units.splice(i, 1);
                break;
            }
        }

        $('.panel[data-unit-id="'+unitId+'"]').remove();
    }

    function addUnitClick() {
        var currentUnit = $('#unit-select').val();
        appendUnit(currentUnit);
    }

    /////////////////////////////////////////////////////////////////////////////////////////////////////////

    function loadStepList() {
        //TODO load step list
    }

    /////////////////////////////////////////////////////////////////////////////////////////////////////////

    function setupMessenger() {
        Messenger.options = {
            extraClasses: 'messenger-fixed messenger-on-bottom messenger-on-right',
            theme: 'flat'
        }
    }

    function notify(message, type) {
        var messageType = type ? type : 'info';
        Messenger().post({
            message: message,
            type: messageType,
            hideAfter: 5,
            showCloseButton: true
        });
    }

})();
