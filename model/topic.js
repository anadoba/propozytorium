/*jshint node: true */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var topicSchema = new Schema({
    name: { 
        type: String,
        required: true,
        unique: true
    }
});

module.exports = mongoose.model("Topic", topicSchema);