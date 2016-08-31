var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
//The default stuff for express basic app is above.

//Auto-compile es6 to es5 in jade
var jade = require('jade');

var app = express();
var http = require( "http" ).createServer( app );
var io = require("socket.io")(http)

var connectedUsers = []
var connectedSockets = []
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.get("/", function(req, res){
  res.render('index')
  io.on('connection', function(socket){
    //Do nothing unless we are in chat room itself.
    removeListeners(['username return', 'chat message', 'disconnect'], socket)
  })
})
app.get("/chat", function(req, res){
  var name = req.param('name')
  setupSocket()
  res.render('chat', {username: name})
})
function removeListeners(listeners, socketToRemove){
  for(var i = 0; i<listeners.length;i++){
    socketToRemove.removeAllListeners(listeners[i])

  }
}
function setupSocket(){
  io.on('connection', function(socket) {
    removeListeners(['username return', 'chat message', 'disconnect'], socket)
    //Tell the socket all currently connected users
    socket.on('username return', function(data){
      console.log("user connected: " + data.username)
      connectedUsers.push(data.username);
      connectedSockets.push(socket)

      io.emit('user connected', {
        "username" : data.username
      })
      updateConnected()
    })
    //When a new guy joins add them to our array, send them the users.


    socket.on('chat message', function(data){
      console.log("Got a message")
      io.emit('chat message', data)
    })
    socket.on('disconnect', function(){
      var disconnectedUser = ''
      var newSockets = []
      var newUsers = []
      for(var i = 0; i<connectedSockets.length;i++){
        if(connectedSockets[i].id == socket.id){
          disconnectedUser = connectedUsers[i]
        }
        else{
          newSockets.push(connectedSockets[i])
          newUsers.push(connectedUsers[i])
        }
      }
      connectedUsers = newUsers;
      connectedSockets = newSockets;
      io.emit('user disconnect', {
        "username" : disconnectedUser
      })
      updateConnected()

    })
  })
}
function updateConnected(){
  io.emit('update connected', {
    "connected" : connectedUsers
  })
}

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

http.listen(process.env.PORT || 3000, function(){
  console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
});
