var express = require('express')
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var moment = require('moment');
var path = require('path')

users = [];
connections = [];
server.listen(process.env.PORT || 8888);
console.log('Server running port is 8888');

app.use(express.static(path.join(__dirname, 'public')));
app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

io.sockets.on('connection', function (socket) {
    connections.push(socket);
    console.log('Connected: %s sockets connected', connections.length);

    socket.on('disconnect', function (data) {
        if (!socket.username) return;
        users.splice(users.indexOf(socket.username), 1);
        updateUsernames();
        connections.splice(connections.indexOf(socket), 1);
        console.log('Disconnected: %s sockets connected', connections.length);
    });

    socket.on('send message', function (data) {
        //console.log(data);
        io.sockets.emit('new message', {
            msg: data,
            user: socket.username,
            date: moment().format('h:mm a')
        });
    });

    socket.on('get map', function (data) {
        //console.log(data);
        io.sockets.emit('new map', {
            addr: '<p></p><center><div id="map_canvas" style="margin: 0; padding: 0; height: 300px; width: 490px;"></div></center>',
            user: socket.username,
            date: moment().format('h:mm a')
        });
    });

    socket.on('new user', function (data, callback) {
        callback(true);
        socket.username = data;
        users.push(socket.username);
        updateUsernames();
    });

    function updateUsernames() {
        io.sockets.emit('get users', users);
    }
});