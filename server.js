// server.js


// Add these at the top of server.js
require('dotenv').config();
const path = require('path');

// Modify the static files serving to handle production
app.use(express.static(path.join(__dirname, 'public')));

// Add a simple production check
const isProduction = process.env.NODE_ENV === 'production';

// WebSocket connection should use the correct protocol
wss.on('connection', (ws, req) => {
    // Existing connection code...
    
    // Add origin checking for security
    if (isProduction) {
        const origin = req.headers.origin;
        if (!isAllowedOrigin(origin)) {
            ws.close();
            return;
        }
    }
});

function isAllowedOrigin(origin) {
    // Add your allowed domains here
    const allowedOrigins = [
        'https://your-app-url.com',
        'http://localhost:3000'
    ];
    return allowedOrigins.includes(origin);
}

// Add a simple status endpoint
app.get('/status', (req, res) => {
    res.json({
        status: 'ok',
        clients: clients.size,
        messages: messageHistory.length
    });
});
const express = require('express');
const WebSocket = require('ws');
const http = require('http');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Store connected clients and messages (in-memory for now)
const clients = new Set();
const messageHistory = [];

// WebSocket connection
wss.on('connection', (ws) => {
    clients.add(ws);
    
    // Send message history to new client
    if (messageHistory.length > 0) {
        ws.send(JSON.stringify({ type: 'history', data: messageHistory }));
    }

    // Handle messages from client
    ws.on('message', (message) => {
        const messageData = {
            id: Date.now(),
            content: message.toString(),
            timestamp: new Date().toISOString()
        };
        
        messageHistory.push(messageData);
        
        // Broadcast to all clients
        clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({ type: 'message', data: messageData }));
            }
        });
    });

    // Handle client disconnection
    ws.on('close', () => {
        clients.delete(ws);
    });
});

// Serve static files (our HTML)
app.use(express.static('public'));

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
// Broadcast to all clients

});
