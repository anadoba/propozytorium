/*jshint node: true */
'use strict';

module.exports = function (app, db) {
    
    // launch socket.io
    var io = require('socket.io')(app);

    // attach authorization module
    require('./authentication')(io);
    
    // Mongo models
    var Topic = require('../model/topic');
    var Proposition = require('../model/proposition');
    
    // WebSocket logic
    io.sockets.on("connection", function (client) {
        
        
        // Topics
        client.on("getTopics", function (data) {
            emitTopicListUpdate();
        });
        client.on("addTopic", function (data) {
            var topic = new Topic({
                name: data.name,
                neededPoints: data.neededPoints,
                singleResult: data.singleResult
            });
            topic.save(function (err, topic) {
                if (err) return console.error(err);
                console.log("Topic " + topic.name + " successfully saved to DB."); 
                emitTopicListUpdate();
            });
        });
        client.on("removeTopic", function (data) {
            Topic.remove({name: data.name}, function(err) {
                if (err) return console.error(err);
                console.log("Topic " + data.name + " successfully removed from DB.");
                emitTopicListUpdate();
            });
        });
        
        
        // Propositions
        client.on("getPropositions", function (data) {
            emitPropositionListUpdate();
        });
        client.on("addProposition", function (data) {
            var proposition = new Proposition({
                name: data.name,
                topic: data.topic
            });
            proposition.save(function (err, proposition) {
                if (err) return console.error(err);
                console.log("Proposition " + proposition.name + " successfully saved to DB."); 
                emitPropositionListUpdate();
            });
        });
        client.on("removeProposition", function (data) {
            Proposition.remove({name: data.name}, function(err) {
                if (err) return console.error(err);
                console.log("Proposition " + data.name + " successfully removed from DB.");
                emitPropositionListUpdate();
            });
        });
        
        client.on("voteProposition", function (data) {
            Proposition.findOne({name: data.name}, function(err, proposition) {
                if (err || !proposition) return console.error(err);
                
                // sprawdzamy, czy użytkownik już nie głosował
                if (proposition.votes.indexOf(client.username) !== -1) {
                    console.log("Proposition " + proposition.name + " has been already voted by " + client.username + " - aborting...");
                    return emitPropositionListUpdate();
                }
                
                proposition.points += 1;
                proposition.votes.push(client.username);
                console.log("Proposition " + proposition.name + " voted up by " + client.username + ".");
                
                // sprawdzamy, czy po głosowaniu nie musimy zaakceptować propozycji
                var neededPoints = 0;
                Topic.findOne({name: proposition.topic}, function(err, topic) {
                    if (err || !topic) return new Error("error getting topic from DB");

                    neededPoints = topic.neededPoints;
                    console.log("Proposition " + proposition.name + " has " + proposition.points + "/" + neededPoints + " votes to be accepted.");
                    if (proposition.points === neededPoints) {
                        proposition.approved = true;
                        console.log("Proposition " + proposition.name + " accepted.");
                        
                        if (topic.singleResult === true) {
                            console.log("Topic " + topic.name + " was type singleResult - deactivating it...");
                            topic.isActive = false;
                            topic.save(function (err, topic) {
                                if (err) return console.error(err);
                                emitTopicListUpdate();
                            });
                        }
                    }

                    proposition.save(function (err, proposition) {
                        if (err) return console.error(err);
                        emitPropositionListUpdate();
                    });
                });
                
            });
        });
        
        
        client.on("error", function (err) {
            console.dir(err);
        });
    });
    
    
    function emitTopicListUpdate() {
        Topic.find({}, function(err, topics) {
            if (err || !topics) return new Error("error getting topics from DB");

            io.sockets.emit('topicList', topics);
            console.log("Topic list update sent to clients.");
        });
    }
    
    function emitPropositionListUpdate() {
        Proposition.find({}, function(err, propositions) {
            if (err || !propositions) return new Error("error getting propositions from DB");

            io.sockets.emit('propositionList', propositions);
            console.log("Proposition list update sent to clients.");
        });
    }
};