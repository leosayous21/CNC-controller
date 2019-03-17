
var http = require('http');
var express = require('express'),
    app = module.exports.app = express();
var morgan = require('morgan'); // Charge le middleware de logging
var favicon = require('serve-favicon'); // Charge le middleware de favicon
var server = http.createServer(app);
var io = require('socket.io').listen(server);  //pass a http.Server instance
var serial = require('./serial');
var bodyParser = require('body-parser');
server.listen(8080);


app.use(morgan('dev')) // Active le middleware de logging
    .use(express.static(__dirname + '/static')) // Indique que le dossier /static contient des fichiers statiques (middleware chargé de base)
//    .use(favicon(__dirname + '/public/favicon.ico')) // Active la favicon indiquée

app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
//recupere les routes
app.get('/', function(req, res) {
        res.setHeader('Content-Type', 'text/html');
        res.render('index.ejs',  {});
        });

app.get('/offcanvas', function(req, res) {
        res.setHeader('Content-Type', 'text/html');
        res.render('offcanvas.ejs', {});
        });

app.get('/test/:test', function(req, res) {
        res.render('page.ejs', {test: req.params.test});
        });

const makeResponse = function (data, res) {
  serial.serialPortController.write(data);
  serial.serialResponse.once('data', function (data) {
    res.send(data)
  });
};
app.post('/command', function (req, res) {
  makeResponse(req.body.data, res)
});

app.post('/command_silent', function (req, res) {
  makeResponse(req.body.data, res)
});

app.use(function(req, res, next){
        res.setHeader('Content-Type', 'text/plain');
        res.status(404).send('Page introuvable !');
        });



io.on('connection', function (socket) {
  //new connection
  console.log("new connection");
 
  socket.on('disconnect', function(){
    console.log("disconect");
  });

  socket.on('command', function(data) {
    console.log('command', data);
    serial.serialPortController.write(data)
  })
});

