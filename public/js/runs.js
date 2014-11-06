
(function() {
    $(function() {
        $('.output-text').find('p').click(toggleOutputVisibility);
        $('pre').each(calculateOutputLength);
    });

    function toggleOutputVisibility() {
        var $this = $(this);
        $this.next().slideToggle();
        $this.find('i').toggle();
    }

    function calculateOutputLength() {
        var $this = $(this);
        var numOfLines = numberOfLines($this.text());
        if(numOfLines > 20) {
            toggleOutputVisibility.call($this.prev()); //hide large output
        }
    }

    function numberOfLines(string) {
        var index = 0;
        var count = 0;
        while(true) {
            index = string.indexOf('\n', index);
            if(index == -1) {
                break;
            }
            index++;
            count++;
        }
        return count;
    }

})();
