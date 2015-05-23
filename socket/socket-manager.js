/*jshint node: true */
'use strict';

module.exports = function (app, db) {
    
    // launch socket.io
    var io = require('socket.io')(3001, app);

    // attach authorization module
    require('./authentication')(io);       
    
    // WebSocket logic
    io.sockets.on("connection", function (socket) {
        socket.on("login", function (data) {
            console.log(data);
            io.sockets.emit("loginResponse", data); 
        });
        socket.on("error", function (err) {
            console.dir(err);
        });
    });
     
};