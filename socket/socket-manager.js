/*jshint node: true */
'use strict';

module.exports = function (app, db) {
    
    // launch socket.io
    var io = require('socket.io')(app);

    // attach authorization module
    require('./authentication')(io);
    
    var Topic = require('../model/topic');
    
    // WebSocket logic
    io.sockets.on("connection", function (client) {
        client.on("getTopics", function (data) {
            emitTopicListUpdate(client);
        });
        
        client.on("addTopic", function (data) {
            var topic = new Topic({
                name: data.name,
                neededPoints: data.neededPoints,
                singleResult: data.singleResult
            });
            topic.save(function (err, topic) {
                if (err) return console.error(err);
                console.log(topic.name + " successfully saved to DB."); 
                emitTopicListUpdate(client);
            });
        });
        
        client.on("removeTopic", function (data) {
            Topic.remove({name: data.name}, function(err) {
                if (err) return console.error(err);
                console.log(data.name + " successfully removed from DB.");
                emitTopicListUpdate(client);
            });
            
        });
        
        client.on("error", function (err) {
            console.dir(err);
        });
    });
    
    
    function emitTopicListUpdate(client) {
        Topic.find({}, function(err, topics) {
            if (err || !topics) return new Error("error getting topics from DB");

            client.emit('topicList', topics);
            console.log("Topic list sent to clients.");
        });
    }
};