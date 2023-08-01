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
const app = express();

import { Server as HttpServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { Resource } from './models/resource.model';

// Create HTTP server
const httpServer = new HttpServer(app);

// Create Socket.IO server
const io = new SocketIOServer(httpServer, {
    cors: {
        origin: '*', // Update this with your allowed origins
    },
});

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

// const PORT = 3000;
// app.listen(PORT, () => {
//   console.log(`Server is running on http://localhost:${PORT}`);
// });

// Socket.IO authentication middleware
io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
        return next(new Error('Unauthorized'));
    }

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) {
            return next(new Error('Forbidden'));
        }
        (req as any).user = user;
        socket.user = user;
        next();
    });
});

// Socket.IO connection handler
io.on('connection', (socket) => {
    console.log('A client connected:', socket.id);

    // Join a room based on user ID (optional, customize as needed)
    if (socket.user && socket.user.id) {
        socket.join(`user_${socket.user.id}`);
    }

    // Broadcast messages to clients
    // You can customize this based on your use case
    Resource.watch().on('change', (change) => {
        const { operationType, fullDocument } = change;
        if (operationType === 'insert') {
            io.to(`user_${fullDocument.userId}`).emit('resource_created', fullDocument);
        } else if (operationType === 'update') {
            io.to(`user_${fullDocument.userId}`).emit('resource_updated', fullDocument);
        } else if (operationType === 'delete') {
            io.to(`user_${fullDocument.userId}`).emit('resource_deleted', fullDocument);
        }
    });

    // Disconnect handler (optional, customize as needed)
    socket.on('disconnect', () => {
        console.log('A client disconnected:', socket.id);
    });
});
const PORT = 3000;
// Start HTTP server
httpServer.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});