const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path');

const port = 3000;

const users = {};

const messages = [];

let userConnect = 0;

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.use(express.static(__dirname + '/public'));

io.on('connection', (socket) => {

    console.log('Un client s\'est connecté');
    userConnect++;

    socket.emit('userCount', userConnect);
    socket.broadcast.emit('userCount', userConnect);

    socket.emit('historiqueMessage', messages);

    socket.on('disconnect', () => {
        console.log('Un client s\'est déconnecté');
    });


    socket.on('newUser', (username) => {
        console.log('Nouvel utilisateur inscrit :', username);
        users[socket.id] = username;
    });

    socket.on('chatMessage', (message) => {
        console.log('Message reçu :', message);

        messages.push(message);

        const username = users[socket.id];
        socket.broadcast.emit('chatMessage', { username, message });
    });

    socket.on('disconnect', () => {
        const username = users[socket.id];
        console.log('Utilisateur déconnecté :', username);
        delete users[socket.id];

        userConnect--;
        socket.emit('userCount', userConnect);
        socket.broadcast.emit('userCount', userConnect);
    });
});

http.listen(port, () => {
    console.log(`Serveur en écoute sur le port ${port}`);
});
