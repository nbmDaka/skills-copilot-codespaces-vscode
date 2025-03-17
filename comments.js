// create web server
var app = express();
var bodyParser = require('body-parser');
var fs = require('fs');

// create web server
var server = require('http').createServer(app);

// create socket server
var io = require('socket.io')(server);

// create comments array
var comments = [];

// load comments from file
fs.exists('comments.txt', function(exists) {
  if (exists) {
    fs.readFile('comments.txt', 'utf8', function(err, data) {
      if (err) {
        console.log(err);
      } else {
        comments = JSON.parse(data);
      }
    });
  }
});

// set up body parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// serve static files
app.use(express.static('public'));

// serve comments
app.get('/comments', function(req, res) {
  res.json(comments);
});

// add comment
app.post('/comments', function(req, res) {
  var comment = req.body;
  comments.push(comment);
  res.json(comment);
  io.emit('comment', comment);
});

// save comments to file
function saveComments() {
  fs.writeFile('comments.txt', JSON.stringify(comments), function(err) {
    if (err) {
      console.log(err);
    }
  });
}

// save comments every 5 seconds
setInterval(function() {
  saveComments();
}, 5000);

// listen on port 3000
server.listen(3000, function() {
  console.log('listening on *:3000');
});

// listen for socket connections
io.on('connection', function(socket) {
  console.log('a user connected');
  socket.on('disconnect', function() {
    console.log('user disconnected');
  });
});