#!/usr/bin/env node


require('coffee-script');
var express = require('express'),
  sharejs = require('../src'),
  hat = require('hat').rack(32, 36);
  var cors = require('cors');
var argv = require('optimist').
  usage("Usage: $0 [-p portnum]").
  default('p', 8000).
  alias('p', 'port').
  argv;

var server = express();
server.use(express.static(__dirname + '/../examples'));

server.use(cors());
server.use(function(req, res, next) {
    res.setHeader('Access-Control-Allow-origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With', 'content-type');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    next();
});
var options = {
  db: {type: 'none'},
  browserChannel: {cors: '*'},
  auth: function(client, action) {
    // This auth handler rejects any ops bound for docs starting with 'readonly'.
    if (action.name === 'submit op' && action.docName.match(/^readonly/)) {
      action.reject();
    } else {
      action.accept();
    }
  }
};

// Lets try and enable redis persistance if redis is installed...
try {
  require('redis');
  options.db = {type: 'redis'};
} catch (e) {}

console.log("ShareJS example server v" + sharejs.version);
console.log("Options: ", options);

var port = argv.p;

// Attach the sharejs REST and Socket.io interfaces to the server
sharejs.server.attach(server, options);

var renderer = require('../examples/_static');
server.get('/static/:docName', function(req, res, next) {
  var docName;
  docName = req.params.docName;
  renderer(docName, server.model, res, next);
});

var wiki = require('../examples/_wiki');
server.get('/wiki/?', function(req, res, next) {
  res.writeHead(301, {location: '/wiki/Main'});
  res.end();
});
server.get('/wiki/:docName', function(req, res, next) {
  var docName;
  docName = req.params.docName;
  wiki(docName, server.model, res, next);
});

server.get('/editor/?', function(req, res, next) {
  var docName;
  docName = hat();
  res.writeHead(303, {location: '/editor/pad.html#' + docName});
  res.write('');
  res.end();
});
server.get('/pad/?', function(req, res, next) {
  var docName;
  docName = hat();
  res.writeHead(303, {location: '/pad/pad.html#' + docName});
  res.write('');
  res.end();
});

server.get('/?', function(req, res, next) {
  res.writeHead(302, {location: '/index.html'});
  res.end();
});
server.listen(port);
console.log("Lisening at *:" + port);

process.title = 'sharejs'
process.on('uncaughtException', function (err) {

  console.error('Version ' + sharejs.version + ': ' + err.stack);
});
