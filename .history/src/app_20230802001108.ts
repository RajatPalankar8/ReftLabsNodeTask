// app.js

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { resourceRouter } from './controllers/resource.controller';
import jwt from 'jsonwebtoken';
import { SocketUser } from './models/user.model'; 
const app = express();

import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io'; 
import { Resource } from './models/resource.model';

const SECRET_KEY = 'your_secret_key';

// Middleware
app.use(cors());
app.use(helmet());
app.use(compression());
app.use(express.json());
app.use(morgan('dev'));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));

// Connect to MongoDB
const MONGODB_URI = 'mongodb://127.0.0.1:27017/your_db_name';

mongoose
    .connect(MONGODB_URI, {})
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch((error) => {
        console.error('MongoDB connection error:', error);
    });


const users = [
    { id: 1, username: 'user1', password: 'password1' },
    { id: 2, username: 'user2', password: 'password2' },
];


// Login route to generate JWT token
app.post('/auth/login', (req, res) => {
    const { username, password } = req.body;

    // Find the user based on username and password (replace with your actual authentication logic)
    const user = users.find((u) => u.username === username && u.password === password);

    if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token with the user information and secret key
    
    const token = jwt.sign({ id: user.id, username: user.username }, SECRET_KEY, { expiresIn: '1h' });

    res.json({ token });
});


// Routes
app.use('/api/resource', resourceRouter);

// Error handling middleware
// app.use((err, req, res, next) => {
//   console.error(err.stack);
//   res.status(500).json({ message: 'Internal Server Error' });
// });

function authenticateSocket(socket: SocketIO.Socket, next: (err?: Error) => void) {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Unauthorized'));
    }
  
    jwt.verify(token, SECRET_KEY, (err, decoded) => {
      if (err) {
        return next(new Error('Forbidden'));
      }
  
      const user: SocketUser = decoded as SocketUser;
      socket.user = user;
      next();
    });
  }

// Create HTTP server
const httpServer = new HttpServer(app)
// Create Socket.IO server
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: '*', // Update this with your allowed origins
  },
});

// Socket.IO authentication middleware
io.use(authenticateSocket);

// Socket.IO connection handler
io.on('connection', (socket) => {
  console.log('A client connected:', socket.id);

  // Join a room based on user ID (optional, customize as needed)
  if (socket.user && socket.user.id) {
    socket.join(`user_${socket.user.id}`);
  }

  // Broadcast messages to clients
  // You can customize this based on your use case
  // ...

  // Disconnect handler (optional, customize as needed)
  socket.on('disconnect', () => {
    console.log('A client disconnected:', socket.id);
  });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
