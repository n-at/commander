var mongoose = require('../mongodb').mongoose;
var uuid = require('node-uuid');
var Schema = mongoose.Schema;

var schema = new Schema({

    id: {
        type: String,
        index: true,
        required: true,
        default: uuid.v4
    },

    address: {
        type: String,
        required: true
    },

    name: {
        type: String,
        required: true,
        index: true
    },

    api_key: String

});

exports.Unit = mongoose.model('Unit', schema);
