/*jshint node: true */
'use strict';

module.exports = function (app, db) {
    
    // launch socket.io
    var io = require('socket.io')(app);

    // attach authorization module
    require('./authentication')(io);
    
    var Topic = require('../model/topic');
    
    // WebSocket logic
    io.sockets.on("connection", function (socket) {
        socket.on("getTopics", function (data) {
            Topic.find({}, function(err, topics) {
                if (err || !topics) return callback(new Error("error getting topics from DB"));
                
                socket.emit('topicList', topics);
            });
        });
        socket.on("login", function (data) {
            console.log(data);
            io.sockets.emit("loginResponse", data);
        });
        socket.on("error", function (err) {
            console.dir(err);
        });
    });
     
};