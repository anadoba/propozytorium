/* jshint node: true */
var app = require('express')();
var path = require('path');
var less = require('less-middleware');
var httpServer = require('http').Server(app);
var logger = require('morgan');
var errorHandler = require('errorhandler');
var path = require('path');
var static = require('serve-static');
var socketioManager = require('./socket/socket');

var mongoose = require('mongoose');
var mongoConfig = require('./config/mongo');
mongoose.connect(mongoConfig.url);
var db = mongoose.connection;

socketioManager(httpServer, db);

var port = process.env.PORT || 3000;
var env = process.env.NODE_ENV || 'development';


var oneDay = 86400000;
app.use('/img', static(__dirname + '/public/img', { 
    maxAge: oneDay 
}));
app.use(less(path.join(__dirname, '/less')));
app.use('/js/jquery.min.js', static(__dirname + '/bower_components/jquery/dist/jquery.min.js'));
app.use('/js/jquery.min.map', static(__dirname + '/bower_components/jquery/dist/jquery.min.map'));
app.use(static(__dirname + '/public'));

if ('development' == env) {
    app.use(logger('dev'));
    app.use(errorHandler());
}

httpServer.listen(port, function () {
    console.log('Aplikacja Propozytorium uruchomiona na porcie ' + port);
});
