// подключение конфига
var config = require('config.json')('./config.json');

// подключение базы
var mysql      = require('mysql');
var connection = mysql.createConnection({
  host     : config.connect.host,
  user     : config.connect.user,
  password : config.connect.password,
  database : config.connect.database 
});

connection.connect((err)=> {
  console.log(err);
});

var timerId = setInterval(function() {
  connection.ping(function (err) {
    if (err) throw err;
    console.log('Server responded to ping');
  })
}, 250000);


// Import the Express module
var express = require('express');

// Import the 'path' module (packaged with Node.js)
var path = require('path');

// Create a new instance of Express
var app = express();

// Import the game file.
var game = require('./game');

// Create a simple Express application
app.configure(function() {
    // Turn down the logging activity
    app.use(express.logger('dev'));

    // Serve static html, js, css, and image files from the 'public' directory
    app.use(express.static(path.join(__dirname,'public')));
});

// Create a Node.js based http server on port 8080
var server = require('http').createServer(app).listen(process.env.PORT || config.port);

// Create a Socket.IO server and attach it to the http server
var io = require('socket.io').listen(server);

// Reduce the logging output of Socket.IO
io.set('log level',1);

// Listen for Socket.IO Connections. Once connected, start the game logic.
io.sockets.on('connection', function (socket) {
    console.log('client connected');
    game.initGame(io, socket, connection);
});
