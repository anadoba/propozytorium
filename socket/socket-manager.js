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
        client.on("error", function (err) {
            console.dir(err);
        });
    });
    
    
    function emitTopicListUpdate (client) {
        Topic.find({}, function(err, topics) {
            if (err || !topics) return new Error("error getting topics from DB");

            client.emit('topicList', topics);
        });
    }
};