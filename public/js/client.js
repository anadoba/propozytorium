/* jshint browser: true */
/* globalstrict: true */
/* devel: true */
/* global io: false */
/* global $: false */

$(document).ready(function() {
    
    var socket;
    
    var username;
    
    var loginText = $('#loginText');
    var passwordText = $('#passwordText');
    var connectButton = $('#connectButton');
    var disconnectButton = $('#disconnectButton');
    var statusIndicator = $('#status');
    
    // do usuniecia
    loginText.val("Test");
    passwordText.val("test");
    
    var topicContainer = $('#topicContainer');
    var topicSelect = $('#topicSelect');
    var propositionContainer = $('#propositionContainer');
    var resultContainer = $('#resultContainer');
    
    //connectButton.prop("disabled", true);
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
        
        socket.on('authenticated', function(flag) {
            loginText.prop("disabled", true);
            passwordText.prop("disabled", true);
            connectButton.prop("disabled", true);
            disconnectButton.prop("disabled", false);
            statusIndicator.prop("src", "img/bullet_green.png");
            
            if (flag === true) {
                username = loginText.val();    
            }
            
            socket.emit('getTopics');
            socket.emit('getPropositions');
        });
        
        socket.on('topicList', function(data) {
            for (var indeks in data) {
                topicSelect.append('<option value="' + data[indeks].name + '">' + data[indeks].name + '</option>');
            }
        });
        
        topicSelect.on('change', function() {
            socket.emit('getPropositions');
        });
        
        socket.on('propositionList', function(data) {
            data = data.filter(function(obj) {if (obj.topic === topicSelect.val()) return true; else return false;});
            
            propositionContainer.html("");
            resultContainer.html("");
            for (var indeks in data) {
                if (data[indeks].approved === false) {
                    appendProposition(data[indeks]);
                } else {
                    appendResult(data[indeks]);
                }
            }
        });
    });
    
    function appendProposition(proposition) {
        var html = 
            '<div id="proposition">' + 
                '<div id="vote">' +
                    proposition.points + '&nbsp;' +
                    '<input id=' + proposition._id + ' type="button" value="+"' + ((proposition.votes.indexOf(username) !== -1) ? 'disabled' : '') + '>' +
                '</div>' +
                '<div id="body">' +
                    proposition.name +
                '</div>' +
            '</div>';
        propositionContainer.append(html);
        $('#' + proposition._id).click(function() {
            voteOn(proposition.name);    
        });
    }
    
    function appendResult(proposition) {
        var html = 
            '<div id="proposition">' +
                '<div id="body">' +
                    proposition.name +
                '</div>' +
            '</div>';
        resultContainer.append(html);
    }
    
    function voteOn(name) {
        socket.emit('voteProposition', {"name": name});
    }
    
    disconnectButton.click(function() {
        socket.disconnect();
        statusIndicator.prop("src", "img/bullet_red.png");
        loginText.prop("disabled", false);
        passwordText.prop("disabled", false);
        connectButton.prop("disabled", false);
        disconnectButton.prop("disabled", true);
        
        loginText.val("");
        passwordText.val("");
    });
});