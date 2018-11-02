const express = require('express');
const socket = require('socket.io');


const app = express();
const port = process.env.PORT || 3000;


const server = app.listen(port, function () {
    console.log('index has been started');
});


// static files
app.use(express.static('public'));


//socket setup
const io = socket(server);


let onlineUsers = [];

io.on('connection', function (client) {
    console.log('made socket conection', client.id);

    client.on('userPlus', function (username) {
        onlineUsers.push(username);
        io.emit('userPlus', username);
    });

    client.on('message', function (msg) {
        io.emit('message', msg);
    });

    client.on('online', function () {
        io.emit('online', onlineUsers);
    });

    client.on('deleteUsername', function (username) {
        onlineUsers.forEach(function (el, index) {
            if (el === username) {
                onlineUsers.splice(index, 1);
            }
        });
        io.emit('online', onlineUsers);
    });
});