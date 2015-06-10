/*jshint node: true */
'use strict';

var MD5 = require('blueimp-md5').md5;
var MD5key = require('../config/authentication').key;

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
            if (err) return callback(new Error("Mongo error!"));
            if (!user) {
                var newUser = new User({
                    "username": username,
                    "password": MD5(password, MD5key)
                });
                newUser.save(function (err, user) {
                    if (err) return console.error(err);
                    console.log("New user " + user.username + " successfully registered.");
                    return callback(null, true);
                });
            } else {
                return callback(null, user.password === MD5(password, MD5key));
            }
        });
    }
                    
    function postAuthenticate(socket, data) {
        var username = data.username;

        User.findOne({username:username}, function(err, user) {
            socket.client.user = user;
        });
    }  
};