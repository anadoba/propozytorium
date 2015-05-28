/*jshint node: true */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var topicSchema = new Schema({
    name: { 
        type: String,
        required: true,
        unique: true
    },
    neededPoints: {
        type: Number,
        default: 1
    },
    singleResult: {
        type: Boolean,
        default: false
    }
});

module.exports = mongoose.model("Topic", topicSchema);