// websocket-server.js
const WebSocket = require('ws');

const server = new WebSocket.Server({ port: 8080 });

const clients = new Set();

server.on('connection', ws => {
  clients.add(ws);
  console.log('New client connected');

  ws.on('message', message => {
    console.log(`Received: ${message}`);

    // Broadcast the message to all connected clients
    for (const client of clients) {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    }
  });

  ws.on('close', () => {
    clients.delete(ws);
    console.log('Client disconnected');
  });
});

console.log('WebSocket server is running on ws://localhost:8080');