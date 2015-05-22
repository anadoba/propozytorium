var should = require('should');
var io = require('socket.io-client');

var socketURL = 'http://localhost:3001';


describe("Serwer Propozytorium", function() {
    
    it("pozwala na podłączenie się do niego", function (done) {
        var client = io.connect(socketURL);

        client.on('connect', function (data) {
            client.connected.should.be.true;
            done();
        });
    });
});

describe("Aplikacja Propozytorium", function () {
    
    it("odpowiada na komunikat login", function (done) {
        var client = io.connect(socketURL);
        
        var testMsg = 'krowa';
        
        client.emit('login', testMsg);
        
        client.on('loginResponse', function (data) {
            data.should.equal(testMsg);
            done();
        });
    });
    
});