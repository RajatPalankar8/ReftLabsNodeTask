// app.js

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { TodoRouter } from './controllers/todo.controller';
import jwt from 'jsonwebtoken';
import { createServer } from 'http'; // Import the 'http' module to create a server
import { Server } from 'socket.io';
const app = express();
import { authenticateJWT } from '../src/middlewares/auth.middleware';
const SECRET_KEY = 'your_secret_key';

// Create an HTTP server using the Express app
const server = createServer(app);
const WebSocket = require('ws');


const wss = new WebSocket.Server({ server:server });

wss.on('connection',function connection(ws: { send: (arg0: string) => void; on: (arg0: string, arg1: (message: any) => void) => void; }) {
  console.log('A new client Connected!');
  ws.send('Welcome New Client!');

  ws.on('message', function incoming(message) {
    console.log('received: %s', message);

    wss.clients.forEach(function each(client: { readyState?: any; send: any; on?: (arg0: string, arg1: (message: any) => void) => void; }) {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
    
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
const MONGODB_URI = 'mongodb://127.0.0.1:27017/RaftLabsTask';

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
