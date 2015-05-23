/*jshint node: true */
'use strict';

module.exports = function (socket) {
    
    var User = require('../model/user');
    
    require('socketio-auth')(socket, {
        authenticate: authenticate, 
        postAuthenticate: postAuthenticate,
        timeout: 1000
    });
    
    function authenticate(data, callback) {
        var username = data.username;
        var password = data.password;

        User.findOne({username:username}, function(err, user) {
            if (err || !user) return callback(new Error("User not found!"));
            return callback(null, user.password == password); // some HASH?
        });
    };
                    
    function postAuthenticate(socket, data) {
        var username = data.username;

        User.findOne({username:username}, function(err, user) {
            socket.client.user = user;
        });
    };  
};