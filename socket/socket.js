module.exports = function (app, db) {
    
  var io = require('socket.io')(3001, app);
    
    io.sockets.on("connection", function (socket) {
        socket.on("login", function (data) {
            console.log(data);
            io.sockets.emit("loginResponse", data); 
        });
        socket.on("error", function (err) {
            console.dir(err);
        });
    });
    
    db.on('open', function () {
        console.log('Połączono z MongoDB!');
    });
    db.on('error', console.error.bind(console, 'MongoDb Error: '));
};