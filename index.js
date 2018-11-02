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

io.on('connection', function (socket) {
    console.log('made socket conection', socket.id);


    socket.on('userPlus', function (username) {
        io.emit('userPlus', username);
    });


    socket.on('message', function (msg) {
        io.emit('message', msg);
    })
});