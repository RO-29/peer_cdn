(function() {
  var express = require('express');
  var app = express();
  http = require('http').Server(app),
  io = require('socket.io').listen(http)
  var url = require("url");
  var port = Number(process.env.PORT || 5000)
  var pg = require('pg')
  var moment = require('moment');
   var multipart = require("multipart")
  , sys = require("sys")
  ,cors = require('cors')
  , fs = require('fs')
  , Dropbox = require('dropbox');

  var knex = require('knex')({
  client: 'pg',
  connection: {
    host     : '127.0.0.1',
    user     : 'postgres',
    password : 'rohit',
    database : 'video'
  }
});
  


  http.listen(port, function() {
    console.log('Listening on *:' + port);
});
/*
 knex.schema.createTable('usernames', function (table) {
  table.integer('count');
  table.string('room');
  table.string('unique');
  table.integer('valid');
}).exec();*/


app.use('/static', express.static(__dirname + '/static'));
  app.get('/', function (req, res) {
  res.sendfile(__dirname+'/video.html');
});

//To Allow Cross-Origin AJax request
app.use(cors());
app.use(function(req, res, next) {
    res.setHeader('Access-Control-Allow-origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With', 'content-type');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    next();
});

//We are hiding our turnServer uRL somehow so that it's not visible to naked eyes but still anyone can print it's valuse in Browser console anytime
var turn_stun = {
    'iceServers': [{
        url: "stun:23.21.150.121"
    }, {
        url: "stun:stun.l.google.com:19302"
    }, {
        url: "turn:xxx@128.199.132.46:3478",
        credential: "xxx"
    }]
};


 
  app.use(function() {
    app.use(express.static(__dirname + '/'));
  });

  app.use(function(err, req, res, next) {
    console.error(err.stack);
    res.send(500, 'Internal server error');
  });

  io.configure(function() {
    io.enable('browser client minification'); 
    io.enable('browser client etag'); 
    io.enable('browser client gzip'); 
    io.set('transports', ['websocket']);
  });

  app.get('/',function(req,res){

   res.send('video.html');

  })

// Attach the sharejs REST and Socket.io interfaces to the app
  function log(socket) {
    var array = ['>>> Message from server: '];
    for (var i = 1; i < arguments.length; i++) {
      array.push(arguments[i]);
    }
    socket.emit('log', array);
  }

  function emitToRoom(socket, message, room) {
    log(socket, 'Got message: ', message);
    if (message === 'bye') {
      log(socket, 'client ' + socket.id + ' left the call ');
    }
    if(message === "got user media" || message.type === "offer"){

        var a = io.sockets.clients(room).length;
          if(a==2)
            socket.broadcast.to(room).emit('message', message,socket.id,a);
          else
             socket.broadcast.to(room).emit('message', message,socket.id);  
       }
    socket.broadcast.to(room).emit('message', message);
  }

  function createOrJoin(socket, room) {
    var numClients = io.sockets.clients(room).length;

    log(socket, 'Room ' + room + ' has ' + numClients + ' client(s)');
    log(socket, 'Request to create or join room', room);

    if (numClients == 0) {
      socket.join(room);
      socket.emit('created', room);

    } else if (numClients >= 1) {
      io.sockets.in(room).emit('join', room);
      socket.join(room);
      socket.emit('joined', room);}
       else {
      socket.emit('full', room);
    }
    
  }

  function exitRoom(socket, room) {
    socket.broadcast.to(room).emit('debug', 'your peer left the room');
    socket.leave(room);
    log(socket, 'client ' + socket.id + ' left the room ' + room);
    socket.emit('debug', 'I left the room ' + room);
  }
io.set('log level', 1);


  var sock_mat = [];
  var sock_connection=[];

  //Usernames of all room segregrated by socket.urlroom ,
  usernames = [];

  io.sockets.on('connection', function(socket) {

 
 
 
   sock_connection.push(socket.id);
   //Emit the stun and turn urls to main.js.. somewhats Hides our turn URL from naked eys,but still accessible   
    socket.emit('stun', turn_stun);
    
   
    
     /*if (urlRoom) {
      createOrJoin(socket, urlRoom);
      urlRoom = false;
    }*/

   

    socket.on('create or join', function(room,name) {
      socket.urlRoom = room;
      socket.name=name;
      createOrJoin(socket, socket.urlRoom);
    });
    
        socket.on('adduser', function () {

        //If Current Room don't exists , usernames[urlRoom] is defined
        if (typeof (global.usernames[socket.urlRoom]) == 'undefined')
            global.usernames[socket.urlRoom] = [];
       
        global.usernames[socket.urlRoom].push(socket.name);
	socket.emit('updatechat', 'SERVER>>', 'you have connected');
	socket.username;
        socket.broadcast.to(socket.urlRoom).emit('updatechat', 'SERVER>>', socket.name + ' has connected');
        io.sockets.in(socket.urlRoom).emit('updateusers', global.usernames[socket.urlRoom]);

	});

      socket.on('sendchat', function (data) {
        console.log('sendchat:' + data);
        io.sockets.in(socket.urlRoom).emit('updatechat', socket.name, data);
    });       

     socket.on('message to room', function(message, room) {
      emitToRoom(socket, message, room);
    });
    socket.on('leave room', function(room){
      exitRoom(socket, socket.urlRoom);
    });

    socket.on('disconnect', function (data) {

        //remove from array username after disconnect  
        if (socket.name) {
            var index = global.usernames[socket.urlRoom].indexOf(socket.name);

            if (index > -1) {
                global.usernames[socket.urlRoom].splice(index, 1);
              }

            if (typeof (global.usernames[socket.urlRoom]) != 'undefined') {
                if (global.usernames[socket.urlRoom].length >= 1) {
                    io.sockets.in(socket.urlRoom).emit('updateusers',global.usernames[socket.urlRoom]);
                    socket.broadcast.to(socket.urlRoom).emit('updatechat', 'SERVER', socket.name + ' has disconnected ');
	  }}}
	  });
      });
}());
