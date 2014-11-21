var express = require('express'),
    nunjucks = require('nunjucks'),
    http = require("http"),
    url = require("url"),
    multipart = require("multipart"),
    sys = require("sys")
    fs = require('fs'),
    util = require('util'),
    formidable = require('formidable'),
    Dropbox = require('dropbox');

var app = express();
app.use(express.bodyParser());

var client = new Dropbox.Client({
  "key": "cmaxb1qhw6byslk",
  "secret": "nhki36ncb7j7gmi",
  "token": 'jUh7UpaPBbQAAAAAAAAK_ppDT_TTCO1YFFVczZmi4fUkCFZH_JYJbF6ol6nLJtGf'

 
});


//client.authDriver(new Dropbox.AuthDriver.NodeServer());
/*Sets up the Initial DropboxFlow We have set the static token here , Not really a cool|clean way .if you want the client to use his own DPB , Delete the token ,Set your own Oauth flow*/
client.authenticate({interactive:true},function (error, client) {
    if (error) {
        console.log(error);
    }
	
    if (client.isAuthenticated()) {
        console.log("Dropbox Credentials::"+client.credentials());
        
    }


});


var jinjEnv = new nunjucks.Environment(new nunjucks.FileSystemLoader('templates'));
var uploadDirectory = __dirname + '/uploads';




app.get('/', function (req, res) {

    var t = jinjEnv.getTemplate('index.html');
	var response = t.render({});
	res.send(response);
});

/* File upload Module..  'f' reads the file sent By client and it is written to Dropbox By client.writeFile method!*/
app.post('/upload', function (req, res) {
    var files = req.files.uploads; 
    var dbx_file_stat;
    var short_url;
    var FileLength = files[0].length;

    console.log("File(s) Upload in progress!\n ");
    console.log("length:"+FileLength);
    var response = [];
    var files_ = []
    for(var iter=0; iter<FileLength;iter++){
       
     files_.push(files[0][iter]);
     console.log(files_);
    }
   //console.log(files_[0]);
    for(file_obj in files_[0]){    
     fs.readFile(file_obj.path, function (error, data) {
        if (error) {
            return console.log(error);
        }

        client.writeFile(file_obj.name, data, function (error, stat) {
            if (error) {
                return console.log(error);
            }
            //stopReportingProgress();

            client.makeUrl(file_obj.name, {downloadHack:true},function (error,url) {

                if (error) {

                    return console.log(error);
                }
					
		client.stat(file_obj.name,function(error,stat){
		 
		     dbx_file_stat= {name:stat.name,Icon:stat.typeIcon,version:stat.versionTag, 
                               mimeType:stat.mimeType,size:stat.size,humansize:stat.humanSize,
                               hasIcon:stat.hasThumbnail,long_url:url.url};
		     console.log(dbx_file_stat);
                     response.push(dbx_file_stat)
                         
		});
	    });
	  });
         });
     
          res.type('text/plain');
          res.send(response);
          res.end();
          console.log("File(s) Upload Done");
        }
 
  })



app.use('/static', express.static(__dirname + '/static'));

app.listen(8080);
console.log("Running on port *:8080");





