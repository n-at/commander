var mongoose = require('../mongodb').mongoose;
var Schema = mongoose.Schema;

var schema = new Schema({

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
