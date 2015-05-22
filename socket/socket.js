module.exports = function (app) {
    
  var io = require('socket.io')(app);
    
  io.sockets.on("connection", function (socket) {
    socket.on("login", function (data) {
        console.dir(data);
        io.sockets.emit("loginResponse", "login successful"); 
    });
    socket.on("error", function (err) {
        console.dir(err);
    });
  });
    
};