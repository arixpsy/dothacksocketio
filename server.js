const express = require('express');
const app = express();
const port = process.env.PORT || 3000
const http = require('http');
const server = http.createServer(app);
const socket = require('./app/backend/socket')

app.use(express.static(__dirname + '/app/frontend'))

app.get("/", (req, res) => {
  res.sendFile(__dirname + '/app/frontend/index.html');
});

server.listen(port, () => {
  console.log("Application started and Listening on port 3000");
});

socket.init(server)