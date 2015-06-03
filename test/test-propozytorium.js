/*jshint node: true */

var should = require('should');
var io = require('socket.io-client');

// socket configuration
var socketURL = 'http://localhost:3000';
var testUsername = 'Test';
var testPassword = 'test';

// db configuration
var mongoose = require('mongoose');
var mongoConfig = require('../config/mongo');
mongoose.connect(mongoConfig.url);

// db models
var Topic = require('../model/topic');
var Proposition = require('../model/proposition');

// actual tests
describe("Serwer Propozytorium", function() {
    
    var client;
    
    beforeEach(function() {
        client = io.connect(socketURL, {'forceNew': true});
    });
    
    it("jest osiągalny przez protokół WebSockets", function (done) {

        client.on('connect', function (data) {
            client.connected.should.be.true;
            done();
        });
    });
    
    it("pozwala zalogować się użytkownikowi", function (done) {
        
        client.on('connect', function() {
            client.connected.should.be.true;
            client.emit('authentication', {username: testUsername, password: testPassword});
        });
        
        client.on('authenticated', function(flag) {
            flag.should.be.true;
            done();
        });
    });
});

describe("Aplikacja Propozytorium", function () {
    
    var client;
    
    beforeEach(function(done) {
        client = io.connect(socketURL, {
            'forceNew': true,
            'reconnect': false
        });
        
        client.on('connect', function() {
            client.connected.should.be.true;
            client.emit('authentication', {username: testUsername, password: testPassword});
        });
        
        client.on('authenticated', function(flag) {
            flag.should.be.true;
            done();
        });
    });
    
    afterEach(function() {
        client.disconnect();    
    });
    
    it("wysyła listę tematów na żądanie", function (done) {
        client.emit('getTopics');
        
        client.on('topicList', function (topics) {
            Array.isArray(topics).should.be.true;
            done();
        });
    });
    
    it("pozwala na dodanie tematu", function (done) {
        var nowyTemat = {
            name: "Testowy Temat",
            neededPoints: 1,
            singleResult: true
        };
        
        client.emit("addTopic", nowyTemat);
        
        client.on('topicList', function (topics) {
            Array.isArray(topics).should.be.true;
            
            Topic.findOne({name: nowyTemat.name}, function(err, topic) {
                if (err || !topic) return new Error("error getting topic from DB");

                topic.name.should.equal(nowyTemat.name);
                done();
            });
        });
    });
    
    it("wysyła listę propozycji na żądanie", function (done) {
        var wybranyTemat = {
            topic: "Testowy Temat"    
        };
        client.emit('getPropositions', wybranyTemat);
        
        client.on('propositionList', function (propositions) {
            Array.isArray(propositions).should.be.true;
            done();
        });
    });
    
    it("pozwala na dodanie propozycji", function (done) {
        var nowaPropozycja = {
            name: "Testowa Propozycja",
            topic: "Testowy Temat"
        };
        
        client.emit("addProposition", nowaPropozycja);
        
        client.on('propositionList', function (propositions) {
            Array.isArray(propositions).should.be.true;
            
            Proposition.findOne({name: nowaPropozycja.name}, function(err, proposition) {
                if (err || !proposition) return new Error("error getting proposition from DB");

                proposition.name.should.equal(nowaPropozycja.name);
                done();
            });
        });
    });
    
    it("pozwala na zagłosowanie na propozycję i akceptuje ją", function (done) {
        var wybranaPropozycja = {
            name: "Testowa Propozycja"  
        };
        
        // zapisujemy stare punkty
        var obecnaPunktacja = 0;
        Proposition.findOne({name: wybranaPropozycja.name}, function(err, proposition) {
            if (err || !proposition) return new Error("error getting proposition from DB");

            proposition.name.should.equal(wybranaPropozycja.name);
            obecnaPunktacja = proposition.points;
        });
        
        client.emit("voteProposition", wybranaPropozycja);
        
        // sprawdzamy czy udało się zagłosować
        client.on('propositionList', function (propositions) {
            Array.isArray(propositions).should.be.true;
            
            Proposition.findOne({name: wybranaPropozycja.name}, function(err, proposition) {
                if (err || !proposition) return new Error("error getting proposition from DB");

                proposition.name.should.equal(wybranaPropozycja.name);
                proposition.points.should.equal(obecnaPunktacja + 1);
                proposition.approved.should.be.true;
                done();
            });
        });
    });
    
    it("pozwala na usunięcie propozycji", function (done) {
        var usunPropozycje = {
            name: "Testowa Propozycja"
        };
        
        client.emit("removeProposition", usunPropozycje);
        
        client.on('propositionList', function (propositions) {
            Array.isArray(propositions).should.be.true;
            
            Proposition.findOne({name: usunPropozycje.name}, function(err, proposition) {
                if (err) return new Error("error getting proposition from DB");
                
                if (!proposition) done();
                //if (proposition === null) done();
            });
        });
    });
    
    it("pozwala na usunięcie tematu", function (done) {
        var usunTemat = {
            name: "Testowy Temat"
        };
        
        client.emit("removeTopic", usunTemat);
        
        client.on('topicList', function (topics) {
            Array.isArray(topics).should.be.true;
            
            Topic.findOne({name: usunTemat.name}, function(err, topic) {
                if (err) return new Error("error getting topic from DB");
                
                if (!topic) done();
                //if (topic === null) done();
            });
        });
    });
    
});