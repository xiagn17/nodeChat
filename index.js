const express = require('express');
const socket = require('socket.io');


const app = express();
const server = app.listen(4000, function () {
    console.log('index has been started');
});


// static files
app.use(express.static('public'));


//socket setup
const io = socket(server);

io.on('connection', function (socket) {
    console.log('made socket conection', socket.id);
});