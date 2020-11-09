const express = require('express');
let app = express();
const http = require('http').createServer(app);
let io = require('socket.io')(http);
const { exec } = require('child_process');
let  gameController = require('./gameController.js');
let  bombo = require('./bombo.js');
const PubSub = require('./pubSub.js');
const BingoCard = require('./bingoCard.js');

app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

io.on('connect', (socket) => {
  let pubSub = new PubSub;
   

    //A player wants to join a bingo game
    socket.on('join', playerName => {
      let bingoCard = new BingoCard(playerName);
      // We create a random id in order to create a hash
      // only known by joined user in order ti avoid fake cards
      let card = {
        id:"card_id_"+playerName,
        cardMatrix:bingoCard.getMatrix(),
        checksum:"checksum card"
      }
      //Should be provided to other jooined players
      let card_hidden = {
        username: playerName,
        card:bingoCard.getMatrix()
      }
     
      let game=gameController.getCurrentGame(card_hidden,pubSub);
      socket.join(game.id);

      //SEND TO JOINED USER THE CARD WITH ID AND CHECKSUM
      io.to(socket.id).emit('joined_game', JSON.stringify(card));

      //SEND TO EVERY PLAYER IN THE GAME THAT NEW PLAYER HAS JOINED, AND ONLY THE CARDMATRIX and USERNAME
      io.sockets.in(game.id).emit('joined',JSON.stringify(game));


      //PUBSUB ------

      pubSub.subscribe("starts_game", (data) => {
        io.sockets.in(game.id).emit('starts_game',data);
        console.log("gameID="+game.id+"starts_game ->"+JSON.stringify(data))
      });

      pubSub.subscribe("new_number", (data) => {
        if (data != false) io.sockets.in(game.id).emit('new_number',data);
        console.log("gameID="+game.id+" new_number ->"+data.id+" "+data.num)
      });

      pubSub.subscribe("end_game", (data) => {
        io.sockets.in(game.id).emit('end_game',data);
      });

    });

   
    
});

http.listen(666, () => {
  console.log('listening on *:666');
});

module.exports = io;