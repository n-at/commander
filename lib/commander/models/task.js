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

    name: {
        type: String,
        required: true,
        index: true
    },

    units: [],

    steps: []

    //step: {type, action, breakOnError}

});

exports.Task = mongoose.model('Task', schema);
