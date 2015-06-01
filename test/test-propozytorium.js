/*jshint node: true */

var should = require('should');
var io = require('socket.io-client');

var socketURL = 'http://localhost:3000';

var testUsername = 'Test';
var testPassword = 'test';

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
        client = io.connect(socketURL, {'forceNew': true});
        
        client.on('connect', function() {
            client.connected.should.be.true;
            client.emit('authentication', {username: testUsername, password: testPassword});
        });
        
        client.on('authenticated', function(flag) {
            flag.should.be.true;
            done();
        });
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
            // test że się dodało
            done();
        });
    });
    
    it("pozwala na usunięcie tematu", function (done) {
        var usunTemat = {
            name: "Testowy Temat"
        };
        
        client.emit("removeTopic", usunTemat);
        
        client.on('topicList', function (topics) {
            Array.isArray(topics).should.be.true;
            // test że już nie ma?
            done();
        });
    });
    
});