/* jshint browser: true */
/* globalstrict: true */
/* devel: true */
/* global io: false */
/* global $: false */
"use strict";

$(document).ready(function () {
    
    var socket;
    
    if (!socket || !socket.connected) {
            socket = io({forceNew: true});
    }
    
    socket.on('connect', function () {
        console.log('Nawiązano połączenie przez Socket.io');
        socket.emit('login', 'test');
    });
});