const express = require('express');
const socket = require('socket.io');
const fs = require('fs');


const app = express();
const port = process.env.PORT || 3000;


const server = app.listen(port, function () {
    console.log('index has been started');
});


// static files
app.use(express.static('public'));


//socket setup
const io = socket(server);


io.on('connection', function (client) {
    console.log('made socket conection', client.id);
    io.emit('online', JSON.parse(fs.readFileSync('public/server/onlineUsers.json', 'utf8')));


    client.on('userPlus', function (userData) {
        let online = JSON.parse(fs.readFileSync('public/server/onlineUsers.json', 'utf8'));
        online[client.id] = userData;
        fs.writeFileSync('public/server/onlineUsers.json', JSON.stringify(online));

        io.emit('userPlus', userData);
    });


    client.on('message', function (data) {
        io.emit('message', data);
    });

    client.on('online', function () {
        io.emit('online', JSON.parse(fs.readFileSync('public/server/onlineUsers.json', 'utf8')));
    });

    client.on('typing', function (userData) {
        io.emit('typing', userData);
    });


    client.on('disconnect', function (reason) {
        let online = JSON.parse(fs.readFileSync('public/server/onlineUsers.json', 'utf8'));
        let userData = online[client.id];
        if (userData){
            delete online[client.id];
            fs.writeFileSync('public/server/onlineUsers.json', JSON.stringify(online));

            io.emit('writeLogout', userData.username);
        }
    });

});