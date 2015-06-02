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