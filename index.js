const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

// Configuration
const maxConnections = 2;
let currentConnections = 0;

// Express App for HTTP server and Health Check
const app = express();
const server = http.createServer(app);

// Socket.IO Server
const io = new Server(server);

// Handle Socket.IO connections
io.on('connection', (socket) => {
    if (currentConnections >= maxConnections) {
        console.log('Too many connections. Disconnecting client.');
        socket.emit('error', 'Server is full');
        socket.disconnect(true);
        return;
    }

    currentConnections++;
    console.log(`Client connected. Current connections: ${currentConnections}`);

    socket.on('message', (message) => {
        console.log(`Received: ${message}`);
        socket.emit('echo', `Echo: ${message}`);
    });

    socket.on('disconnect', () => {
        currentConnections--;
        console.log(`Client disconnected. Current connections: ${currentConnections}`);
    });
});

// Health Check Endpoint
app.get('/health', (req, res) => {
    if (currentConnections >= maxConnections) {
        res.status(503).send('Overloaded');
    } else {
        res.status(200).send('Healthy');
    }
});

// Start HTTP and WebSocket server
server.listen(8080, () => {
    console.log('Server is running on http://localhost:8080');
});
