(function(){

    var units = [];
    var steps = [];

    var unitsAvailable = {};

    var scriptEditor = null;

    /////////////////////////////////////////////////////////////////////////////////////////////////////////

    $(function() {
        $('#form').submit(prepareToSubmit);

        $('#add-unit').click(function() {
            var currentUnit = $('#unit-select').val();
            appendUnit(currentUnit);
        });

        $('#add-step').click(function() {
            var currentStepType = $('#step-select').val();
            resetStepForm();
            showStepForm(currentStepType);
        });

        $('#cancel-script').click(function() {
            resetStepForm();
        });

        $('#save-script').click(function() {
            submitStepForm();
        });

        setupMessenger();
        setupScriptEditor();

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

            taskUnitsList();
        });
    }

    function taskUnitsList() {
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
        $('<span></span>')
            .text(unit ? ' '+unit.status : '')
            .addClass('text-info')
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

    /////////////////////////////////////////////////////////////////////////////////////////////////////////

    var editingStep = -1;

    //load step list for current task
    function loadStepList() {
        var id = $('#form').find('input[name="task_id"]').val();
        if(!id) return;

        $.get('/task-steps/' + id, function(steps) {
            for(var i = 0; i < steps.length; i++) {
                appendStep(steps[i]);
            }
        });
    }

    function appendStep(step) {
        steps.push(step);

        //step block
        var $stepList = $('#step-list');
        var $stepContainer = $('<div class="panel panel-default"></div>')
            .attr('data-step-id', step.id)
            .appendTo($stepList);
        var $step = $('<div class="panel-body"></div>').appendTo($stepContainer);

        //description
        var $caption = $('<p></p>').appendTo($step);
        $('<strong class="step-type-caption"></strong>')
            .text(step.type)
            .appendTo($caption);
        $('<span class="text-info step-break-caption"> Break on error</span>')
            .addClass(step.breakOnError ? '' : 'hidden')
            .appendTo($caption);
        var $action = $('<pre></pre>').appendTo($step);
        $('<code class="step-action-text"></code>')
            .text(step.action)
            .appendTo($action);

        //control buttons
        var $controlButtons = $('<div class="pull-right control-buttons"></div>').appendTo($step);
        $('<a href="javascript:void(0)"></a>')
            .html('<i class="fa fa-edit"></i> Edit')
            .appendTo($controlButtons)
            .click(function() {
                editStepForm(step.id);
            });
        $('<a href="javascript:void(0)"></a>')
            .html('<i class="fa fa-remove"></i> Remove')
            .addClass('text-danger')
            .appendTo($controlButtons)
            .click(function() {
                removeStep(step.id);
            });
    }

    function removeStep(stepId) {
        resetStepForm();

        for(var i = 0; i < steps.length; i++) {
            if(steps[i].id == stepId) {
                steps.splice(i, 1);
                break;
            }
        }

        $('.panel[data-step-id="'+stepId+'"]').remove();
    }

    /////////////////////////////////////////////////////////////////////////////////////////////////////////

    var stepType = 'script';

    function showStepForm(type) {
        clearStepForm();

        var $scriptControls = $('#script-controls');
        var $presetControls = $('#preset-controls');

        switch(type) {
            case 'script':
                $scriptControls.show();
                $presetControls.hide();
                break;

            case 'preset':
                $scriptControls.hide();
                $presetControls.show();
                break;

            default:
        }

        $('#script-form').removeClass('hidden');
        stepType = type;
    }

    //reset step form to it's initial state
    function resetStepForm() {
        editingStep = -1;
        stepType = 'script';
        clearStepForm();
        $('#script-form').addClass('hidden');
    }

    function clearStepForm() {
        scriptEditor.setValue('');
        var $form = $('#form');
        $form.find('input[name="breakOnError"]').prop('checked', false);
        $form.find('input[name="preset-name"]').val('');
    }

    function submitStepForm() {
        var action = '';
        switch(stepType) {
            case 'script':
                action = scriptEditor.getValue();
                break;
            case 'preset':
                action = $('input[name="preset-name"]').val();
                break;
            default:
                action = '';
        }

        var breakOnError = $('input[name="breakOnError"]').is(':checked');

        var step = {
            id: uuid.v4(),
            type: stepType,
            action: action,
            breakOnError: breakOnError ? 1 : 0
        };

        if(editingStep != -1) {
            //edit step
            step.id = steps[editingStep].id;
            steps[editingStep] = step;
            updateStepBlock(step);
        } else {
            //add step
            appendStep(step);
        }

        resetStepForm();
    }

    //show step editing form
    function editStepForm(stepId) {
        var step = null;
        var stepIndex = null;
        for(var i = 0; i < steps.length; i++) {
            if(steps[i].id == stepId) {
                step = steps[i];
                stepIndex = i;
                break;
            }
        }
        if(step === null) return;

        editingStep = stepIndex;

        showStepForm(step.type);

        //load form data
        switch(step.type) {
            case 'script':
                scriptEditor.setValue(step.action);
                break;

            case 'preset':
                $('input[name="preset-name"]').val(step.action);
                break;

            default:
        }

        $('input[name="breakOnError"]').prop('checked', step.breakOnError);
    }

    function updateStepBlock(step) {
        var $stepBlock = $('.panel[data-step-id="'+step.id+'"]');
        $stepBlock.find('.step-type-caption').text(step.type);
        $stepBlock.find('.step-action-text').text(step.action);

        var $stepBreakCaption = $stepBlock.find('.step-break-caption');
        if(step.breakOnError) {
            $stepBreakCaption.removeClass('hidden');
        } else {
            $stepBreakCaption.addClass('hidden');
        }
    }

    /////////////////////////////////////////////////////////////////////////////////////////////////////////

    function setupScriptEditor() {
        scriptEditor = ace.edit('script-editor');
        scriptEditor.setTheme('ace/theme/github');
        scriptEditor.getSession().setMode('ace/mode/sh');
    }

    /////////////////////////////////////////////////////////////////////////////////////////////////////////

    function setupMessenger() {
        Messenger.options = {
            extraClasses: 'messenger-fixed messenger-on-bottom messenger-on-right',
            theme: 'flat'
        };
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
