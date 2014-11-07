
(function() {

    $(function() {
        $('.filter-form').submit(function() {
            return false;
        });

        $('.filter-string').keyup(function() {
            filter($(this).val());
        });
    });

    function filter(string) {
        var pattern = string.toUpperCase();

        $('.list-group-item').each(function() {
            var $this = $(this);
            var value = $this.find('.item-name').text().toUpperCase();
            if(value.indexOf(pattern) != -1) {
                $this.show();
            } else {
                $this.hide();
            }
        });
    }

})();
