// app.js

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { TodoRouter } from './controllers/resource.controller';
import jwt from 'jsonwebtoken';
import { createServer } from 'http'; // Import the 'http' module to create a server
import { Server } from 'socket.io';
const app = express();

const SECRET_KEY = 'your_secret_key';

// Create an HTTP server using the Express app
const server = createServer(app);

// Create a WebSocket server
const io = new Server(server);


io.on('connection', (socket) => {
  console.log('A client connected:', socket.id);

  // Handle WebSocket events here

  // Example: Sending a message from the server to the client
  socket.emit('message', 'Welcome to the WebSocket server!');

  // Example: Receiving a message from the client
  socket.on('clientMessage', (data) => {
    console.log('Received message from client:', data);
  });

  // Disconnect event
  socket.on('disconnect', () => {
    console.log('A client disconnected:', socket.id);
  });
});

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
app.post('/login', (req, res) => {
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
app.use('/api', TodoRouter);


const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
