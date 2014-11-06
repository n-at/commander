//setup messenger
$(function() {
    Messenger.options = {
        extraClasses: 'messenger-fixed messenger-on-bottom messenger-on-right',
        theme: 'flat'
    };
});

function notify(message, type) {
    var messageType = type ? type : 'info';
    Messenger().post({
        message: message,
        type: messageType,
        hideAfter: 5,
        showCloseButton: true
    });
}
