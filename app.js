var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
//The default stuff for express basic app is above.
var session = require('express-session')

//Auto-compile es6 to es5 in jade
var jade = require('jade');

var app = express();
var http = require( "http" ).createServer( app );

var currentUsername = ""

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.get("/", function(req, res){
  res.render('index')
})
app.get("/chat", function(req, res){
  var name = req.param('name')
  currentUsername = name
  res.render('chat', {username: name})
})

//Socket.io below. Solution for adding it to express found here: http://stackoverflow.com/questions/24609991/using-socket-io-in-express-4-and-express-generators-bin-www
var io = require("socket.io")(http)

io.on('connection', function(socket) {
  console.log("New SOCKETIO connection")
  socket.on('chat message', function(data){
    console.log("Got a message")
    io.emit('chat message', data)
  })
  socket.on('disconnect', function(){
    var message = " disconnected."
    io.emit('system message', {
      "message" : message,
      "username" : currentUsername
    })
  })
});

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(express.static(path.join(__dirname, 'public')));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

var port = process.env.PORT || 8080;

http.listen(port)

module.exports = app;
