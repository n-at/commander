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

    //logs by units
    units: {
        status: String,
        message: String,
        steps: []
    },

    status: String,

    message: String

});

exports.Run = mongoose.model('Run', schema);
