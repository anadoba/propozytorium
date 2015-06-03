/*jshint node: true */
'use strict';

module.exports = function (app, db) {
    
    // launch socket.io
    var io = require('socket.io')(app);

    // attach authorization module
    require('./authentication')(io);
    
    // Mongo models
    var Topic = require('../model/topic');
    var Proposition = require('../model/proposition');
    
    // WebSocket logic
    io.sockets.on("connection", function (client) {
        
        // Topics
        client.on("getTopics", function (data) {
            emitTopicListUpdate();
        });
        client.on("addTopic", function (data) {
            var topic = new Topic({
                name: data.name,
                neededPoints: data.neededPoints,
                singleResult: data.singleResult
            });
            topic.save(function (err, topic) {
                if (err) return console.error(err);
                console.log("Topic " + topic.name + " successfully saved to DB."); 
                emitTopicListUpdate();
            });
        });
        client.on("removeTopic", function (data) {
            Topic.remove({name: data.name}, function(err) {
                if (err) return console.error(err);
                console.log("Topic " + data.name + " successfully removed from DB.");
                emitTopicListUpdate();
            });
        });
        
        // Propositions
        client.on("getPropositions", function (data) {
            emitPropositionListUpdate();
        });
        client.on("addProposition", function (data) {
            var proposition = new Proposition({
                name: data.name,
                topic: data.topic
            });
            proposition.save(function (err, proposition) {
                if (err) return console.error(err);
                console.log("Proposition " + proposition.name + " successfully saved to DB."); 
                emitPropositionListUpdate();
            });
        });
        client.on("removeProposition", function (data) {
            Proposition.remove({name: data.name}, function(err) {
                if (err) return console.error(err);
                console.log("Proposition " + data.name + " successfully removed from DB.");
                emitPropositionListUpdate();
            });
        });
        
        
        client.on("error", function (err) {
            console.dir(err);
        });
    });
    
    
    function emitTopicListUpdate() {
        Topic.find({}, function(err, topics) {
            if (err || !topics) return new Error("error getting topics from DB");

            io.sockets.emit('topicList', topics);
            console.log("Topic list sent to clients.");
        });
    }
    
    function emitPropositionListUpdate() {
        Proposition.find({}, function(err, propositions) {
            if (err || !propositions) return new Error("error getting propositions from DB");

            io.sockets.emit('propositionList', propositions);
            console.log("Proposition list sent to clients.");
        });
    }
};