const express = require('express');
let app = express();
const http = require('http').createServer(app);
let io = require('socket.io')(http);


app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

io.on('connect', (socket) => {
    socket.on('hello', data => {
        console.log('hola', data);
    });
    socket.on('newMessage', data => {
        console.log('new', data);
    });
    
});

http.listen(666, () => {
  console.log('listening on *:666');
});

