/*jshint node: true */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var propositionSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    topic: { 
        type: String,
        required: true
    },
    points: {
        type: Number,
        default: 0
    },
    approved: {
        type: Boolean,
        default: false
    }
});

module.exports = mongoose.model("Proposition", propositionSchema);