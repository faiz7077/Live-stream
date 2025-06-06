
// const express = require('express');
// const http = require('http');
// const {Server}= require('socket.io');
// const path = require('path');
// const cors=require('cors');


// const app = express();

// const server = http.createServer(app);


// const io = new Server(server, {
//   cors: {
//     origin: 'http://localhost:5173',
//     methods: ['GET', 'POST'],
//     credentials: true
//   }
// });

// app.use(cors({
//   origin: 'http://localhost:5173', // Allow all origins
//   credentials: true , // Allow credentials 
//   transports: ['websocket', 'polling'] 
// }));
// let broadcasterSocketId = null;

// app.use(express.static(path.join(__dirname, 'public')));

// app.get('/', (req, res) => {
//   res.sendFile(path.join(__dirname, 'public', 'broadcaster.html'));
// });

// app.get('/viewer', (req, res) => {
//   res.sendFile(path.join(__dirname, 'public', 'viewer.html'));
// });

// io.on('connection', (socket) => {
//   console.log('New client connected:', socket.id);

//   socket.on('broadcaster', () => {
//     broadcasterSocketId = socket.id;
//     console.log('Broadcaster ready:', broadcasterSocketId);
//   });

//   socket.on('viewer', () => {
//     if (broadcasterSocketId) {
//       io.to(broadcasterSocketId).emit('viewer:request', socket.id);
//     }
//   });

//   socket.on('signal', ({ target, signal }) => {
//     io.to(target).emit('signal', { signal, sender: socket.id });
//   });

//   socket.on('chat:message', (msg) => {
//     if (broadcasterSocketId) {
//       io.to(broadcasterSocketId).emit('chat:message', msg);
//     }
//   });

//   socket.on('disconnect', () => {
//     console.log('Disconnected:', socket.id);
//   });
// });

// server.listen(3000, () => {
//   console.log('Server running on http://localhost:3000');
// });
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
  socket.on('chat:message', (msg) => {
    if (broadcasterSocketId) {
      io.to(broadcasterSocketId).emit('chat:message', msg);
      console.log(`Message from ${socket.id} to broadcaster:`, msg);
    }
  });

  socket.on('disconnect', () => {
    console.log('Disconnected:', socket.id);
  });
});

server.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});