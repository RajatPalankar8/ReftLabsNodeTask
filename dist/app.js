"use strict";
// app.js
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const morgan_1 = __importDefault(require("morgan"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const resource_controller_1 = require("./controllers/resource.controller");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const http_1 = require("http"); // Import the 'http' module to create a server
const socket_io_1 = require("socket.io");
const app = (0, express_1.default)();
const SECRET_KEY = 'your_secret_key';
// Create an HTTP server using the Express app
const server = (0, http_1.createServer)(app);
// Create a WebSocket server
const io = new socket_io_1.Server(server);
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
app.use((0, cors_1.default)());
app.use((0, helmet_1.default)());
app.use((0, compression_1.default)());
app.use(express_1.default.json());
app.use((0, morgan_1.default)('dev'));
app.use((0, express_rate_limit_1.default)({ windowMs: 15 * 60 * 1000, max: 100 }));
// Connect to MongoDB
const MONGODB_URI = 'mongodb://127.0.0.1:27017/your_db_name';
mongoose_1.default
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
    const token = jsonwebtoken_1.default.sign({ id: user.id, username: user.username }, SECRET_KEY, { expiresIn: '1h' });
    res.json({ token });
});
// Routes
app.use('/api', resource_controller_1.TodoRouter);
const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
