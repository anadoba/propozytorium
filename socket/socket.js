module.exports = function (app) {
    
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
    
};