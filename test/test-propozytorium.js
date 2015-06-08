/*jshint node: true */

var should = require('should');
var io = require('socket.io-client');

// socket configuration
var socketURL = 'http://localhost:3000';
var testUsername = 'Test';
var testUsername2 = 'Test2';
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
        client.emit('getTopicList');
        
        client.on('topicList', function (topics) {
            Array.isArray(topics).should.be.true;
            done();
        });
    });
    
    it("pozwala na dodanie tematu", function (done) {
        var nowyTemat = {
            name: "Testowy Temat",
            neededPoints: 2,
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
        client.emit('getPropositionList', wybranyTemat);
        
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
    
    it("oznacza nowy temat jako aktywny", function (done) {
        Topic.findOne({name: "Testowy Temat"}, function(err, topic) {
            if (err || !topic) return new Error("error getting topic from DB");

            topic.isActive.should.be.true;
            done();
        });
    });
    
    it("pozwala na zagłosowanie na propozycję", function (done) {
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
                done();
            });
        });
    });
    
    it("nie pozwala na ponowne głosowanie przez tego samego użytkownika", function (done) {
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
                proposition.points.should.equal(obecnaPunktacja);
                done();
            });
        });
    });
    
    it("akceptuje propozycję przy wymaganej ilości głosów", function (done) {
        // loguję się jako inny użytkownik
        client.disconnect();
        client = io.connect(socketURL, {
            'forceNew': true,
            'reconnect': false
        });
        client.on('connect', function() {
            client.connected.should.be.true;
            client.emit('authentication', {username: testUsername2, password: testPassword});
        });
        
        var wybranaPropozycja = {
            name: "Testowa Propozycja"
        };
        
        client.on('authenticated', function(flag) {
            flag.should.be.true;
            
            client.emit("voteProposition", wybranaPropozycja);
            
            client.on('propositionList', function (propositions) {
                Array.isArray(propositions).should.be.true;

                Proposition.findOne({name: wybranaPropozycja.name}, function(err, proposition) {
                    if (err || !proposition) return new Error("error getting proposition from DB");

                    proposition.name.should.equal(wybranaPropozycja.name);
                    proposition.approved.should.be.true;
                    done();
                });
            });
        });
    });
    
    it("temat z pojedynczym wynikiem i jedną już zaakceptowaną propozycją powinien być nieaktywny", function (done) {
        
        // temat jest singleResult
        Topic.findOne({name: "Testowy Temat"}, function(err, topic) {
            if (err || !topic) return new Error("error getting topic from DB");

            topic.singleResult.should.be.true;
        });
        
        // mamy jedną zaakceptowaną propozycję w tym temacie
        Proposition.find({topic: "Testowy Temat", approved: true}, function(err, propositions) {
            if (err || !propositions) return new Error("error getting proposition from DB");

            propositions.length.should.equal(1);
        });
        
        // więc temat powinien być nieaktywny
        Topic.findOne({name: "Testowy Temat"}, function(err, topic) {
            if (err || !topic) return new Error("error getting topic from DB");

            topic.isActive.should.be.false;
            done();
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
    
    it("musi wszystkie propozycje akceptować, jeśli wymagane punkty w temacie to 0", function (done) {
        var nowyTemat = {
            name: "Lista zadań do wykonania",
            neededPoints: 0,
            singleResult: false
        };
        
        client.emit("addTopic", nowyTemat);
        
        client.on('topicList', function (topics) {
            Array.isArray(topics).should.be.true;
            
            var nowaPropozycja = {
                name: "Umyć zęby",
                topic: "Lista zadań do wykonania"
            };
            client.emit("addProposition", nowaPropozycja);
            
            var nowaPropozycja2 = {
                    name: "Zjeść śniadanie",
                    topic: "Lista zadań do wykonania"
                };
            client.emit("addProposition", nowaPropozycja2);
            
            setTimeout(function () {
                Proposition.find({topic: nowaPropozycja.topic}, function(err, propositions) {
                    if (err || !propositions) return new Error("error getting propositions from DB");

                    propositions.filter(function(obj) {if(obj.approved === true) return true; else return false;});
                    propositions.length.should.equal(2);
                    client.emit("truncateTopic", {"name": nowaPropozycja.topic});
                    done();
                });
            }, 100);
        });
    });
});