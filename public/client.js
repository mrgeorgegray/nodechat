function submitUsername(evt) {
  evt.preventDefault();

  var username = document.getElementById('username').value;
  if(username && username.length > 3) {
    startChat(username);
  } else {
    alert('Username must be greater than 3 characters');
  };
}




function startChat(username) {
  //Remove Username form 
  usernameForm.removeEventListener("submit", submitUsername);
  usernameForm.remove();

  var server = io.connect('http://localhost:8080');
  server.on('connect', function(data) {
    server.emit('join', username);
  });

  //Chat list and form
  var chatList = document.createElement('ul');
      chatList.id = 'message-list';
  document.getElementById('chat-app').appendChild(chatList);

  var chatForm = document.createElement('form');
      chatForm.id = 'chat-form';
      chatForm.innerHTML = '<label for="message">Enter a message</label><input type="text" id="message" name="message" val="" title="Enter a message..." /><button type="submit">Send</button>';
  document.getElementById('chat-app').appendChild(chatForm);


  function submitChatMessage(evt) {
    evt.preventDefault();

    var message = document.getElementById('message').value;
    server.emit('messages', message);
    document.getElementById('message').value = '';
  }

  if(chatForm) {
    chatForm.addEventListener("submit", submitChatMessage, false); 
  }

  //Listen for messages
  server.on('messages', function(message) { 
    var messageItem = document.createElement("li");
    messageItem.appendChild(document.createTextNode(message));

    document.getElementById('message-list').appendChild(messageItem);
  });
}


var usernameForm = document.getElementById('username-form');
if(usernameForm) {
  usernameForm.addEventListener("submit", submitUsername, false); 
}