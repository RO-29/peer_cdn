
function join_room(name,psname,constraints){
 

    helper.animateSpinner();
    caller.$startRoom(name,psname);
    room = caller.$room;
    call(constraints);
}

var isChannelReady;
var isInitiator = false;
var isStarted = false;
var localStream;
var pc;
var remoteStream;

var pc_config;

var pc_constraints = {'optional': [{'DtlsSrtpKeyAgreement': true}]};

var sdpConstraints = {'mandatory': {
  'OfferToReceiveAudio': true,
  'OfferToReceiveVideo': true }};

function Caller() {
  this.$socket;
  this.$name;
  this.$room;
  this.$constraints;
  this.$peer_id=[];
}
var local_peer;
Caller.prototype.$connection = function(url, opt) {
  var opt = opt || '';
  this.$socket = io.connect(url, opt);
};

Caller.prototype.$startRoom = function($room,$name) {
  if ($room === '' || $name==="") {
         if($name==="")
           alert('Please fill in the name.');
         else
          alert('Please fill in the room name.');
        location.reload()
         helper.stopSpinner();
  }  
   
    else {
    
    this.$room = $room;
    this.$name=$name;
    this.$socket.emit('create or join', this.$room,this.$name);
    this.$socket.emit('adduser');
    console.log('Create or join room', this.$room);
    
  }
};


var caller = new Caller();
var url = 'https://hackrtc.herokuapp.com/';
caller.$connection(url);
var socket = caller.$socket;

var room;
var name;
socket.on('stun', function(data) {

    window.pc_config = data;

});

socket.on('created', function(room) {
  helper.stopSpinner();
  console.log('Created room ' + room);
  isInitiator = true;

  helper.setRoomLink(room);
});

socket.on('full', function(room) {
  helper.stopSpinner();
  console.log('Room ' + room + ' is full');
});

socket.on('join', function(room) {
  console.log('Another peer made a request to join room ' + room);
  console.log('This peer is the initiator of room ' + room + '!');
  isChannelReady = true;
});

socket.on('joined', function(room) {
  helper.stopSpinner();
  console.log('This peer has joined room ' + room);
  isChannelReady = true;
  helper.modifyForm(room);
  helper.setRoomLink(room);
});

socket.on('log', function(array) {
  console.log.apply(console, array);
});

socket.on('debug', function(text) {
  console.log('debug:'+text);
});

function leaveRoom () {
  socket.emit('leave room', room);
  helper.setRoomLink('');
}

function sendMessageToRoom(message, room) {
  console.log('Client sending message to room ' + room + ': ', message);
  socket.emit('message to room', message, room);
}


socket.on('updatechat', function(username, data) {

    var predata = $('#conversation').val();
    $('#conversation').val( predata+"\n"+ username + ":" + data + '\n');
        $('#conversation').scrollTop(99999);


});


socket.on('updateusers', function(data) {

    $('#users').html(' ');
    console
    $.each(data, function(key, value) {

        if (value != null)
            $('#users').append('<br><br><br><br>'+ value);
    });
});


$('#datasend').click(function(e) {
    e.preventDefault();
    var message = $('#data').val();
    if (message.replace(/\s/g, "") != '') {
        $('#data').val('');
        socket.emit('sendchat', message);
    }
});

$('#data').keypress(function(e) {
    //	e.preventDefault();
    if (e.which == 13) {
        $(this).blur();
        //        $j('#datasend').focus().click();
        var message = $('#data').val();
        if (message.replace(/\s/g, "") != '') {
            $('#data').val('');
            socket.emit('sendchat', message);
        }
    }
});

socket.on('message', function(message,soc,a) {

 
  console.log('Client received message:', message);
  if (message === 'got user media') {
      maybeStart();
      //alert(soc);
  
  } else if (message.type === 'offer') {
     if (!isInitiator && !isStarted) {
    maybeStart();
      }
        
    
    pc.setRemoteDescription(new RTCSessionDescription(message));
    doAnswer();
  } else if (message.type === 'answer' && isStarted) {
    pc.setRemoteDescription(new RTCSessionDescription(message));
  } else if (message.type === 'candidate' && isStarted) {
    var candidate = new RTCIceCandidate({
        sdpMLineIndex: message.label,
        candidate: message.candidate
    });
    pc.addIceCandidate(candidate);
  } else if (message === 'bye' && isStarted) {
    handleRemoteHangup();
  }
});



function handleUserMedia(stream) {
  console.log('Adding local stream.');

var local_media =$("<video class='local' autoplay='autoplay'>");
local_media.attr("muted", "true"); 
$('#local').append(local_media);
attachMediaStream(local_media[0], stream);
  localStream = stream;

  sendMessageToRoom('got user media', room);
  if (isInitiator) {
    maybeStart();
  }
}

function handleUserMediaError(error) {
  console.log('navigator.getUserMedia error: ', error);
}

function call(constraints) {
   getUserMedia(constraints, handleUserMedia, handleUserMediaError);

  console.log('Getting user media with constraints', constraints);
  //
  
  
  helper.animateSpinner();
}

function maybeStart() {
  if (!isStarted && typeof localStream != 'undefined' && isChannelReady) {
    createPeerConnection();
    pc.addStream(localStream);
    isStarted = true;
    console.log('isInitiator', isInitiator);
    if (isInitiator) {
      doCall();
    }
  }
}

window.onbeforeunload = function(event) {
  hangup();
};

function createPeerConnection() {
  try {
    pc = new RTCPeerConnection(pc_config, pc_constraints);
    pc.onicecandidate = handleIceCandidate;
    pc.onaddstream = handleRemoteStreamAdded;
    pc.onremovestream = handleRemoteStreamRemoved;
    console.log('Created RTCPeerConnnection');
  } catch (e) {
    console.log('Failed to create PeerConnection, exception: ' + e.message);
    alert('Cannot create RTCPeerConnection object.');
    return;
  }
}

function handleIceCandidate(event) {


  console.log('handleIceCandidate event: ', event);
  if (event.candidate) {
    sendMessageToRoom({
      type: 'candidate',
      label: event.candidate.sdpMLineIndex,
      id: event.candidate.sdpMid,
      candidate: event.candidate.candidate}, room);

  } else {
    console.log('End of candidates.');
     if(!(local_peer in caller.$peer_id )){
        caller.$peer_id.push(local_peer);
  
            console.log("pushed in end");      

}
    console.log(caller.$peer_id);
  }
}

function handleRemoteStreamAdded(event) {


 var remote_media = $("<video class='remote' autoplay='autoplay'>");
 $('#remote').append(remote_media);
 attachMediaStream(remote_media[0], event.stream);
 remoteStream = event.stream;
 helper.stopSpinner();
 console.log('Remote stream added.');

}

function handleCreateOfferError(event) {
  console.log('createOffer() error: ', e);
}

function doCall() {
  console.log('Sending offer to peer');
  pc.createOffer(setLocalAndSendMessage, handleCreateOfferError);
}

function handleCreateAnswerError(event) {
  console.log('createAnswer() error: ', event);
}

function doAnswer() {
  console.log('Sending answer to peer.');
  pc.createAnswer(setLocalAndSendMessage, handleCreateAnswerError, sdpConstraints);
}

audioBandwidth = 50;
videoBandwidth = 256;
function setBandwidth(sdp) {
    sdp = sdp.replace(/a=mid:audio\r\n/g, 'a=mid:audio\r\nb=AS:' + audioBandwidth + '\r\n');
    sdp = sdp.replace(/a=mid:video\r\n/g, 'a=mid:video\r\nb=AS:' + videoBandwidth + '\r\n');
    return sdp;
}



function setLocalAndSendMessage(sessionDescription) {
sessionDescription.sdp = setBandwidth(sessionDescription.sdp);
  pc.setLocalDescription(sessionDescription);
  console.log('setLocalAndSendMessage sending message' , sessionDescription);
  sendMessageToRoom(sessionDescription, room);
}

function handleRemoteStreamRemoved(event) {

  console.log('Remote stream removed. Event: ', event);
           helper.stopSpinner();

}

function hangup() {
  console.log('Hanging up.');
  helper.stopSpinner();
  try {
    stop();
  } catch (err) {
    console.log(err);
  }
  isInitiator = false;
  isChannelReady = false;
  sendMessageToRoom('bye', room);
}

function handleRemoteHangup() {
    
    
        $('#remote').fadeOut(300, function() {
            $(this).remove();
        });
        alert('your peer left the room!');

        console.log('Remote Session terminated.');
  console.log('Session terminated.');
  isChannelReady = false;
  isStarted = false;
  isInitiator = true;
}

function stop() {
  isStarted = false;
  pc.close();
  pc = null;
}
