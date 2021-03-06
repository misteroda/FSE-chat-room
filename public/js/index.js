function init() {
  var username = $('#name').text();
  var serverBaseUrl = document.domain;
  /* 
   On client init, try to connect to the socket.IO server.
  */
  var socket = io.connect(serverBaseUrl);

  var sessionId = '';

  //Helper function to update the participants' list
  function updateParticipants(participants) {
   $('#participants').html('');
   for (var i = 0; i < participants.length; i++) {
      $('#participants').append('<span id="' + participants[i].id + '">' +
        participants[i].name + ' ' + (participants[i].id === sessionId ? '(You)' : '') + '<br /></span>');
    } 
  }

  /*
 When the client successfully connects to the server, an
 event "connect" is emitted. Let's get the session ID and
 log it. Also, let the socket.IO server there's a new user
 with a session ID and a name. We'll emit the "newUser" event
 for that. 
  */
  socket.on('connect', function () {
    sessionId = socket.io.engine.id;
    console.log('Connected ' + sessionId);
    socket.emit('newUser', {id: sessionId, name: username});
  });

  /*
 When the server emits the "newConnection" event, we'll reset
 the participants section and display the connected clients. 
 Note we are assigning the sessionId as the span ID.
  */
  socket.on('newConnection', function (data) {    
    updateParticipants(data.participants);
  });

  /*
 When the server emits the "userDisconnected" event, we'll
 remove the span element from the participants element
  */
  socket.on('userDisconnected', function(data) {
    $('#' + data.id).remove();
  });

  /*
 When receiving a new chat message with the "incomingMessage" event,
 we'll prepend it to the messages section
  */
  socket.on('incomingMessage', function (data) {
    var message = data.message;
    var name = data.name;
    var timestamp = data.timestamp;
    $('#messages').prepend(
	    '<div id="form"><div id="fHead"><div id="fName">' + name 
	    + '</div><div id="fTimestamp">' + timestamp 
	    + '</div></div>' + message + '</div>' );
  });

  /*
 Log an error if unable to connect to server
  */
  socket.on('error', function (reason) {
    console.log('Unable to connect to server', reason);
  });

  /*
 "sendMessage" will do a simple ajax POST call to our server with
 whatever message we have in our textarea
  */
  function sendMessage() {
    var outgoingMessage = $('#outgoingMessage').val();
    $.ajax({
      url:  '/message',
      type: 'POST',
      contentType: 'application/json',
      dataType: 'json',
      data: JSON.stringify({message: outgoingMessage, name: username})
    });
  }

  /*
 If user presses Enter key on textarea, call sendMessage if there
 is something to share
  */
  function outgoingMessageKeyDown(event) {
    if (event.which == 13) {
      event.preventDefault();
      if ($('#outgoingMessage').val().trim().length <= 0) {
        return;
      }
      sendMessage();
      $('#outgoingMessage').val('');
    }
  }

  /*
 Helper function to disable/enable Send button
  */
  function outgoingMessageKeyUp() {
    var outgoingMessageValue = $('#outgoingMessage').val();
    $('#send').attr('disabled', (outgoingMessageValue.trim()).length > 0 ? false : true);
  }

  /* Elements setup */
  $('#outgoingMessage').on('keydown', outgoingMessageKeyDown);
  $('#outgoingMessage').on('keyup', outgoingMessageKeyUp);
  $('#send').on('click', sendMessage);

}

$(document).on('ready', init);
