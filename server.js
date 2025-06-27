const express = require('express');
const WebSocket = require('ws');
const http = require('http');
const path = require('path');

const app = express();
const server = http.createServer(app);

// WebSocket Server with proper configuration
const wss = new WebSocket.Server({
  server,
  clientTracking: true, // Ensure proper client tracking
  perMessageDeflate: false // Disable compression for simplicity
});

let messageHistory = [];

wss.on('connection', (ws) => {
  console.log('New client connected');
  
  // Send history to new client
  if (messageHistory.length > 0) {
    ws.send(JSON.stringify({
      type: 'history',
      data: messageHistory
    }));
  }

  ws.on('message', (message) => {
    try {
      console.log('Received:', message.toString());
      const msgData = {
        id: Date.now(),
        content: message.toString(),
        timestamp: new Date().toISOString(),
        sender: ws._socket.remoteAddress // For debugging
      };
      
      messageHistory.push(msgData);
      
      // Broadcast to all clients
      wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({
            type: 'message',
            data: msgData
          }));
        }
      });
    } catch (err) {
      console.error('Message processing error:', err);
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => { // Listen on all network interfaces
  console.log(`Server running on port ${PORT}`);
  console.log(`Access at: http://localhost:${PORT}`);
});
