/* jshint browser: true */
/* globalstrict: true */
/* devel: true */
/* global io: false */
/* global $: false */

$(document).ready(function() {
    
    var socket;
    
    var username;
    var selectedTopic;
    
    var firstSelectionDone = false;
    
    var loginText = $('#loginText');
    var passwordText = $('#passwordText');
    var newTopicText = $('#newTopicText');
    var newPropositionText = $('#newPropositionText');
    
    var connectButton = $('#connectButton');
    var disconnectButton = $('#disconnectButton');
    var addTopicButton = $('#addTopic');
    var addPropositionButton = $('#addProposition');
    
    var statusIndicator = $('#status');
    var newTopicSingleResult = $('#newTopicSingleResult');
    var newTopicNeededPoints = $('#newTopicNeededPoints');
    
    // do usuniecia
    loginText.val("Test");
    passwordText.val("test");
    
    var topicContainer = $('#topicContainer');
    var topicSelect = $('#topicSelect');
    var propositionContainer = $('#propositionList');
    var resultContainer = $('#resultList');
    
    //connectButton.prop("disabled", true);
    disconnectButton.prop("disabled", true);
    addPropositionButton.prop("disabled", true);
    addTopicButton.prop("disabled", true);
    newPropositionText.prop("disabled", true);
    topicSelect.prop("disabled", true);
    newTopicText.prop("disabled", true);
    newTopicNeededPoints.prop("disabled", true);
    newTopicSingleResult.prop("disabled", true);
    newTopicNeededPoints.val(1);
    
    loginText.on('input', function() {
       if (this.value.length === 0) {
           connectButton.prop("disabled", true);
       } else {
           connectButton.prop("disabled", false);
       }
    });
    
    newTopicText.on('input', function() {
       if (this.value.length === 0) {
           addTopicButton.prop("disabled", true);
       } else {
           addTopicButton.prop("disabled", false);
       }
    });
    
    newPropositionText.on('input', function() {
       if (this.value.length === 0) {
           addPropositionButton.prop("disabled", true);
       } else {
           addPropositionButton.prop("disabled", false);
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
            newPropositionText.prop("disabled", false);
            topicSelect.prop("disabled", false);
            newTopicText.prop("disabled", false);
            newTopicNeededPoints.prop("disabled", false);
            newTopicSingleResult.prop("disabled", false);
            statusIndicator.prop("src", "img/bullet_green.png");
            
            if (flag === true) {
                username = loginText.val();    
            }
            
            socket.emit('getTopicList');
        });
        
        socket.on('topicList', function(data) {
            topicSelect.html("");
            for (var indeks in data) {
                topicSelect.append('<option value="' + data[indeks].name + '">' + data[indeks].name + '</option>');
            }
            if (firstSelectionDone === false) {
                selectedTopic = data[0].name;
                firstSelectionDone = true;
            } else {
                topicSelect.val(selectedTopic);    
            }
            
            var obecnyTemat = data.filter(function(obj){if(obj.name === selectedTopic) return true; else return false;});
            if (obecnyTemat[0].isActive === true) {
                $('div.fadeable').unblock();
            } else {
                $('div.fadeable').block({ message: "Głosowanie zakończone" }); 
            }
            
            socket.emit('getPropositionList');
        });
        
        topicSelect.on('change', function() {
            selectedTopic = this.value;
            
            socket.emit('getTopicList');
        });
        
        socket.on('propositionList', function(data) {
            data = data.filter(function(obj) {if (obj.topic === selectedTopic) return true; else return false;});
            
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
    
    addTopicButton.click(function() {
        var newTopic = {
            "name": newTopicText.val(),
            "neededPoints": newTopicNeededPoints.val(),
            "singleResult": newTopicSingleResult.prop("checked")
        };
        socket.emit('addTopic', newTopic);
        newTopicText.val("");
        newTopicNeededPoints.val(1);
        newTopicSingleResult.prop("checked", false);
    });
    
    addPropositionButton.click(function() {
        var newProposition = {
            "name": newPropositionText.val(),
            "topic": selectedTopic
        };
        socket.emit('addProposition', newProposition);
        newPropositionText.val("");
        addPropositionButton.prop("disabled", true);
    });
    
    disconnectButton.click(function() {
        socket.disconnect();
        statusIndicator.prop("src", "img/bullet_red.png");
        loginText.prop("disabled", false);
        passwordText.prop("disabled", false);
        connectButton.prop("disabled", false);
        disconnectButton.prop("disabled", true);
        newPropositionText.prop("disabled", true);
        topicSelect.prop("disabled", true);
        addTopicButton.prop("disabled", true);
        newTopicText.prop("disabled", true);
        newTopicNeededPoints.prop("disabled", true);
        newTopicSingleResult.prop("disabled", true);
        
        loginText.val("");
        passwordText.val("");
        newPropositionText.val("");
    });
});