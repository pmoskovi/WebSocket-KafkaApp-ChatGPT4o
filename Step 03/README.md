# Prompt 3

> _Now let's create another client that is listening to these messages, and draws on a similar canvas, thus replicating (or mirroring) the drawing from the first HTML5 app._

To create another client that listens to the drawing messages and replicates them on a canvas, we will follow these steps:

1. Modify the WebSocket server to broadcast messages to all connected clients.
2. Create a second HTML5 application that receives drawing messages and mirrors the drawing on its canvas.

## 1. Modify the WebSocket Server
Update the WebSocket server to broadcast incoming messages to all connected clients:

```
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
```

## 2. Create the Second HTML5 Application

Here is the second HTML5 application that listens for drawing messages and mirrors the drawing on its canvas:

```
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Drawing Mirror Application</title>
  <style>
    canvas {
      border: 1px solid black;
    }
  </style>
</head>
<body>
  <h1>Drawing Mirror Application</h1>
  <canvas id="mirrorCanvas" width="800" height="600"></canvas>

  <script>
    const canvas = document.getElementById('mirrorCanvas');
    const ctx = canvas.getContext('2d');

    // Initialize WebSocket connection
    const ws = new WebSocket('ws://localhost:8080');

    ws.onopen = () => {
      console.log('Connected to WebSocket server');
    };

    ws.onmessage = (event) => {
      console.log('Received from server:', event.data);
      const drawingEvent = JSON.parse(event.data);

      // Draw on the canvas using the received coordinates
      draw(drawingEvent.x, drawingEvent.y);
    };

    ws.onclose = () => {
      console.log('Disconnected from WebSocket server');
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    const draw = (x, y) => {
      ctx.lineWidth = 5;
      ctx.lineCap = 'round';

      ctx.lineTo(x, y);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x, y);
    };
  </script>
</body>
</html>
```

## Explanation:
1. WebSocket Server:

    - Maintains a set of connected clients.
    - Broadcasts received messages to all connected clients except the sender.

2. Mirror HTML5 Application:

    - Connects to the WebSocket server.
    - Listens for drawing messages from the server.
    - Draws on the canvas using the received coordinates to replicate the drawing.

## Summary:
With these steps, the second HTML5 application mirrors the drawing from the first application by listening to drawing events sent via the WebSocket server and replicating them on its own canvas. You can run both applications in separate browser windows to see the mirroring in action.