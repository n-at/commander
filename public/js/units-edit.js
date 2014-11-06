
(function() {

    $(function() {
        $('form').submit(beforeSubmit);
    });

    function beforeSubmit() {
        var name = $('#name').val();
        if(!name) {
            notify('Enter unit name', 'error');
            return false;
        }

        var address = $('#address').val();
        if(!address) {
            notify('Enter unit address', 'error');
            return false;
        }
    }

})();
