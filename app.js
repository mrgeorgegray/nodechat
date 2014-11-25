/*---------------------------------------------------
APP SET UP
---------------------------------------------------*/
var express = require('express');
var app = express();
app.use(express.static('public'));




/*---------------------------------------------------
DATA STORAGE
---------------------------------------------------*/
var redis = require('redis');
var redisClient = redis.createClient();

var storeMessage = function(name, data){
  var message = JSON.stringify({name: name, data: data});

  redisClient.lpush("messages", message, function(err, response) {
    redisClient.ltrim("messages", 0, 9);
  });
};





/*---------------------------------------------------
WEB SOCKETS
---------------------------------------------------*/
var server = require('http').createServer(app);
var io = require('socket.io')(server);

io.on('connection', function(client) {
  /*---------------------------------------*/
  client.on('join', function(name) {
    client.username = name;
    var joinMessage = name + " joined the chat!";
    client.broadcast.emit("messages", joinMessage);

    redisClient.lrange("messages", 0, -1, function(err, messages){
      messages = messages.reverse();
      messages.forEach(function(message){
        message = JSON.parse(message);
        client.emit("messages", message.name + ": " + message.data);  
      });
      client.emit("messages", "You joined the chat!");
    });
    storeMessage(name, joinMessage);
  });

  /*---------------------------------------*/
  client.on('messages', function (message) {
    var username = client.username;

    client.broadcast.emit("messages", username +  ": " + message);
    client.emit("messages", "You: " + message);
    storeMessage(username, message);
  });

  /*---------------------------------------*/
  client.on('disconnect', function() { 
    var username = client.username,
        leavingMessage = username + " left the chat";
    
    client.broadcast.emit("messages", leavingMessage);
    storeMessage(username, leavingMessage);
  });
});

io.on('error', function() {
    alert('END OF THE WORLD!');
});





/*---------------------------------------------------
ROUTES
---------------------------------------------------*/
app.get('/', function(req,res){
  res.sendFile(__dirname + '/index.html');
});

app.get('/chat', function(req,res){
  res.sendFile(__dirname + '/chat.html');
});




/*---------------------------------------------------
START APP
---------------------------------------------------*/
server.listen(8080);