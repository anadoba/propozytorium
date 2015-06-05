/* jshint browser: true */
/* globalstrict: true */
/* devel: true */
/* global io: false */
/* global $: false */
"use strict";

$(document).ready(function() {
    
    var socket;
    
    var loginText = $('#loginText');
    var passwordText = $('#passwordText');
    var connectButton = $('#connectButton');
    var disconnectButton = $('#disconnectButton');
    var statusIndicator = $('#status');
    
    connectButton.prop("disabled", true);
    disconnectButton.prop("disabled", true);
    
    loginText.on('input', function() {
       if (this.value.length === 0) {
           connectButton.prop("disabled", true);
       } else {
           connectButton.prop("disabled", false);
       }
    });
    
    connectButton.click(function() {
        if (!socket || !socket.connected) {
            socket= io({forceNew: true});
        }
        
        socket.on('connect', function() {
            var authenticationData = {
                "username": loginText.val(),
                "password": passwordText.val()
            };
            
            socket.emit('authentication', authenticationData);
        });
        
        socket.on('authenticated', function() {
            loginText.prop("disabled", true);
            passwordText.prop("disabled", true);
            connectButton.prop("disabled", true);
            disconnectButton.prop("disabled", false);
            statusIndicator.prop("src", "img/bullet_green.png");
        });
    });
    
    disconnectButton.click(function() {
        socket.disconnect();
        statusIndicator.prop("src", "img/bullet_red.png");
        loginText.prop("disabled", false);
        passwordText.prop("disabled", false);
        connectButton.prop("disabled", false);
        disconnectButton.prop("disabled", true);
    });
});