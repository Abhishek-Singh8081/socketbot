const http = require('http');
const { Server } = require('socket.io');
const express = require('express');
const path = require('path');
const chatbotController = require('./chatbotController');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://127.0.0.1:5500",  // your client URL
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Serve frontend
app.use(express.static(path.join(__dirname, 'public')));

// Handle socket connections
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  chatbotController(socket);
});

const PORT = 4000;
server.listen(PORT, () => {
  console.log(`Socket server running on http://localhost:${PORT}`);
});
