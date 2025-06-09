
// // const express = require('express');
// // const http = require('http');
// // const {Server}= require('socket.io');
// // const path = require('path');
// // const cors=require('cors');


// // const app = express();

// // const server = http.createServer(app);


// // const io = new Server(server, {
// //   cors: {
// //     origin: 'http://localhost:5173',
// //     methods: ['GET', 'POST'],
// //     credentials: true
// //   }
// // });

// // app.use(cors({
// //   origin: 'http://localhost:5173', // Allow all origins
// //   credentials: true , // Allow credentials 
// //   transports: ['websocket', 'polling'] 
// // }));
// // let broadcasterSocketId = null;

// // app.use(express.static(path.join(__dirname, 'public')));

// // app.get('/', (req, res) => {
// //   res.sendFile(path.join(__dirname, 'public', 'broadcaster.html'));
// // });

// // app.get('/viewer', (req, res) => {
// //   res.sendFile(path.join(__dirname, 'public', 'viewer.html'));
// // });

// // io.on('connection', (socket) => {
// //   console.log('New client connected:', socket.id);

// //   socket.on('broadcaster', () => {
// //     broadcasterSocketId = socket.id;
// //     console.log('Broadcaster ready:', broadcasterSocketId);
// //   });

// //   socket.on('viewer', () => {
// //     if (broadcasterSocketId) {
// //       io.to(broadcasterSocketId).emit('viewer:request', socket.id);
// //     }
// //   });

// //   socket.on('signal', ({ target, signal }) => {
// //     io.to(target).emit('signal', { signal, sender: socket.id });
// //   });

// //   socket.on('chat:message', (msg) => {
// //     if (broadcasterSocketId) {
// //       io.to(broadcasterSocketId).emit('chat:message', msg);
// //     }
// //   });

// //   socket.on('disconnect', () => {
// //     console.log('Disconnected:', socket.id);
// //   });
// // });

// // server.listen(3000, () => {
// //   console.log('Server running on http://localhost:3000');
// // });
// const express = require('express');
// const http = require('http');
// const { Server } = require('socket.io');
// const path = require('path');

// const app = express();
// const server = http.createServer(app);
// const io = new Server(server);

// let broadcasterSocketId = null;

// app.use(express.static(path.join(__dirname, 'public')));

// // Serve broadcaster page
// app.get('/', (req, res) => {
//   res.sendFile(path.join(__dirname, 'public', 'broadcaster.html'));
// });

// // Serve viewer page
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
//       console.log(`Message from ${socket.id} to broadcaster:`, msg);
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
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(express.static('public'));

app.get('/broadcaster', (req, res) => {
  res.sendFile(path.join(__dirname, 'broadcaster.html'));
});

app.get('/viewer', (req, res) => {
  res.sendFile(path.join(__dirname, 'viewer.html'));
});

app.get('/', (req, res) => {
  res.send(`
    <h1>WebRTC Stream</h1>
    <a href="/broadcaster">Broadcaster</a><br>
    <a href="/viewer">Viewer</a>
  `);
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('broadcaster', () => {
    console.log('Broadcaster registered:', socket.id);
    socket.broadcast.emit('broadcaster-available', socket.id);
  });

  // Handle viewer connection
  socket.on('viewer', () => {
    console.log('Viewer connected:', socket.id);
    
    socket.broadcast.emit('viewer', socket.id);
  });

  socket.on('signal', (data) => {
    console.log('Relaying signal from', socket.id, 'to', data.target);
    io.to(data.target).emit('signal', {
      signal: data.signal,
      sender: socket.id
    });
  });

  socket.on('chat:message', (data) => {
    console.log('Chat message from', socket.id, ':', data);
  
    socket.broadcast.emit('chat:message', {
      message: data.message || data,
      sender: socket.id
    });
  });


  socket.on('end-broadcast', () => {
    console.log('Broadcast ended by:', socket.id);
    socket.broadcast.emit('broadcast:ended');
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    socket.broadcast.emit('viewer:disconnect', socket.id);
  });
});

const PORT=3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Broadcaster: http://localhost:${PORT}/broadcaster`);
  console.log(`Viewer: http://localhost:${PORT}/viewer`);
});