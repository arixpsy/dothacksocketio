const socket = {};
const { Server } = require("socket.io");

const users = {};

socket.init = (server) => {
  const io = new Server(server);

  io.use((socket, next) => {
    const displayName = socket.handshake.auth.displayName;
    if (!displayName) {
      return next(new Error("invalid handshake.auth"));
    }
    socket.displayName = displayName;
    next();
  });

  io.on("connection", (socket) => {
    console.log(`a user connected: ${socket.displayName} > ${socket.id}`);
    const newUser = { socketId: socket.id, displayName: socket.displayName };

    // new user > send all existing users
    for (let [id, socket] of io.of(`/`).sockets) {
      users[socket.id] = {
        socketId: socket.id,
        displayName: socket.displayName,
      };
    }
    io.to(socket.id).emit("ALL_USERS", users);

    // exisiting users > send new user
    socket.broadcast.emit("NEW_USER_CONNECTED", newUser);

    // new message > send message to all users
    socket.on("USER_NEW_MESSAGE", function (messageObj) {
      socket.broadcast.emit("USER_NEW_MESSAGE_FROM_SERVER", messageObj);
    });

    // user disconnect > remove from storage > inform other existing users
    socket.on("disconnect", function () {
      console.log("A user disconnected: " + socket.id);
      delete users[socket.id];
      socket.broadcast.emit("USER_DISCONNECTED", socket.id);
    });
  });
};

module.exports = socket;
