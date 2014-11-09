var mongoose = require('../mongodb').mongoose;
var uuid = require('node-uuid');
var Schema = mongoose.Schema;

var schema = new Schema({

    id: {
        type: String,
        index: true,
        required: true,
        "default": function() {
            return uuid.v4();
        }
    },

    task_id: {
        type: String,
        required: true,
        index: true
    },

    //date of start
    date: {
        type: Date,
        "default": function() {
            return new Date();
        }
    },

    //logs by unit
    units: Schema.Types.Mixed //{status, message, steps}

});

exports.Run = mongoose.model('Run', schema);
