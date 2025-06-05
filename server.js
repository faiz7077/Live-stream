const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

let broadcasterSocketId = null;

app.use(express.static(path.join(__dirname, 'public')));

// Serve broadcaster page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'broadcaster.html'));
});

// Serve viewer page
app.get('/viewer', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'viewer.html'));
});

io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  socket.on('broadcaster', () => {
    broadcasterSocketId = socket.id;
    console.log('Broadcaster ready:', broadcasterSocketId);
  });

  socket.on('viewer', () => {
    if (broadcasterSocketId) {
      io.to(broadcasterSocketId).emit('viewer:request', socket.id);
    }
  });

  socket.on('signal', ({ target, signal }) => {
    io.to(target).emit('signal', { signal, sender: socket.id });
  });

  socket.on('disconnect', () => {
    console.log('Disconnected:', socket.id);
  });
});

server.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
