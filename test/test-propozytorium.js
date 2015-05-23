/*jshint node: true */

var should = require('should');
var io = require('socket.io-client');

var socketURL = 'http://localhost:3001';


describe("Serwer Propozytorium", function() {
    
    var client;
    
    beforeEach(function() {
        client = io.connect(socketURL, {'forceNew': true});
    })
    
    it("jest osiągalny przez protokół WebSockets", function (done) {

        client.on('connect', function (data) {
            client.connected.should.be.true;
            done();
        });
    });
    
    it("pozwala zalogować się użytkownikowi", function (done) {
        
        client.on('connect', function() {
            client.connected.should.be.true;
            client.emit('authentication', {username: "Test", password: "test"});
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
            client.emit('authentication', {username: "Test", password: "test"});
        });
        
        client.on('authenticated', function(flag) {
            flag.should.be.true;
            done();
        });
    })
    
    it("odpowiada na komunikat login", function (done) {
        
        var testMsg = 'krowa';
        
        client.emit('login', testMsg);
        
        client.on('loginResponse', function (data) {
            data.should.equal(testMsg);
            done();
        });
    });
    
});