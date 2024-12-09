const httpServer = require('http').createServer();
const io = require("socket.io")(httpServer, {
  cors: {
    origin: '*',
    methods: ["GET", "POST"],
    credentials: true
  }
});

const { createUtil } = require('./util');
const util = createUtil();

httpServer.listen(3000, () => {
  console.log('listening on *:3000');
});

io.on('connection', (socket) => {
  console.log(`Client with socket id ${socket.id} has connected!`);

  // ------------------------------------------------------
  // Disconnect
  // ------------------------------------------------------    
  // disconnection event is triggered when the client disconnects but is still on the rooms 
  socket.on("disconnecting", (reason) => {
    socket.rooms.forEach(room => {
      if (room == 'lobby') {
        lobby.leaveLobby(socket.id);
      }
    });
    util.getRoomGamesPlaying(socket).forEach(([roomName, room]) => {
      socket.leave(roomName);
      if (!gameEngine.gameEnded(room.game)) {
        room.game.status = 'interrupted';
        room.game.gameStatus = 3;
        io.to(roomName).emit('gameInterrupted', room.game);
      }
    });
  });

  // ------------------------------------------------------
  // User identity
  // ------------------------------------------------------    
  socket.on('login', (user) => {
    // Stores user information on the socket as "user" property
    socket.data.user = user;
    if (user && user.id) {
      socket.join('user_' + user.id);
      socket.join('lobby');
    }
  });

  socket.on('logout', () => {
    if (socket.data.user && socket.data.user.id) {
      socket.leave('user_' + socket.data.user.id);
      lobby.leaveLobby(socket.id);
      io.to('lobby').emit('lobbyChanged', lobby.getGames());
      socket.leave('lobby');
      util.getRoomGamesPlaying(socket).forEach(([roomName, room]) => {
        socket.leave(roomName);
        if (!gameEngine.gameEnded(room.game)) {
          room.game.status = 'interrupted';
          room.game.gameStatus = 3;
          io.to(roomName).emit('gameInterrupted', room.game);
        }
      });
    }
    socket.data.user = undefined;
  });

  // ------------------------------------------------------
  // Chat and Private Messages
  // ------------------------------------------------------    
  socket.on('chatMessage', (message) => {
    const payload = {
      user: socket.data.user,
      message: message,
    };
    io.sockets.emit('chatMessage', payload);
  });

  socket.on('privateMessage', (clientMessageObj, callback) => {
    const destinationRoomName = 'user_' + clientMessageObj?.destinationUser?.id;

    // Check if the destination user is online
    if (io.sockets.adapter.rooms.get(destinationRoomName)) {
      const payload = {
        user: socket.data.user,
        message: clientMessageObj.message,
      };
      // send the "privateMessage" to the destination user (using "his" room)
      io.to(destinationRoomName).emit('privateMessage', payload);
      if (callback) {
        callback({ success: true });
      }
    } else {
      if (callback) {
        callback({
          errorCode: 1,
          errorMessage: `User "${clientMessageObj?.destinationUser?.name}" is not online!`
        });
      }
    }
  });
});