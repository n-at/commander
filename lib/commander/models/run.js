var mongoose = require('../mongodb').mongoose;
var uuid = require('node-uuid');
var Schema = mongoose.Schema;

var schema = new Schema({

    id: {
        type: String,
        index: true,
        "default": function() {
            return uuid.v4();
        }
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
    }

});

exports.Run = mongoose.model('Run', schema);
