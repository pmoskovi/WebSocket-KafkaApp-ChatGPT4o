# Prompt 2

> _Now, I'd like to take this to the next level. I'd like to use the demo application from here as inspiration: https://codepen.io/javascriptacademy-stash/pen/porpeoJ. This will be the HTML5 application running in the browser. I want every drawing event to be sent over websocket to the server. Can you do this?_


Certainly! To achieve this, you'll need to modify the demo application to send drawing events over a WebSocket connection to your Node.js server. Here's how you can do it:

# 1. Set Up the WebSocket Server in Node.js

First, if you haven't already, install the ws library:

```
npm install ws
```

Create a Node.js script for the WebSocket server:

```
// websocket-server.js
const WebSocket = require('ws');

const server = new WebSocket.Server({ port: 8080 });

server.on('connection', ws => {
  console.log('New client connected');

  ws.on('message', message => {
    console.log(`Received: ${message}`);
    // You can handle the drawing events here
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

console.log('WebSocket server is running on ws://localhost:8080');
```

Run the WebSocket server:

```
node websocket-server.js
```

# 2. Modify the HTML5 Application to Send Drawing Events

Here is the modified version of the HTML5 application from the provided CodePen link, with WebSocket integration:

```
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Drawing Application with WebSocket</title>
  <style>
    canvas {
      border: 1px solid black;
    }
  </style>
</head>
<body>
  <h1>Drawing Application with WebSocket</h1>
  <canvas id="canvas" width="800" height="600"></canvas>

  <script>
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    let painting = false;

    // Initialize WebSocket connection
    const ws = new WebSocket('ws://localhost:8080');

    ws.onopen = () => {
      console.log('Connected to WebSocket server');
    };

    ws.onmessage = (event) => {
      console.log('Received from server:', event.data);
      // Handle drawing events from the server (if needed)
    };

    ws.onclose = () => {
      console.log('Disconnected from WebSocket server');
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    const startPosition = (e) => {
      painting = true;
      draw(e);
    };

    const endPosition = () => {
      painting = false;
      ctx.beginPath();
    };

    const draw = (e) => {
      if (!painting) return;

      ctx.lineWidth = 5;
      ctx.lineCap = 'round';

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      ctx.lineTo(x, y);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x, y);

      // Send drawing event to WebSocket server
      const drawingEvent = { x, y };
      ws.send(JSON.stringify(drawingEvent));
    };

    canvas.addEventListener('mousedown', startPosition);
    canvas.addEventListener('mouseup', endPosition);
    canvas.addEventListener('mousemove', draw);
  </script>
</body>
</html>
```

## Explanation:
1. WebSocket Server in Node.js:
    - The WebSocket server is set up to listen for connections and receive messages from the client.
    - You can extend the server to handle the drawing events as needed.

2. HTML5 Application:
    - The canvas element is used for drawing.
    - WebSocket connection is established with the server.
    - On each drawing event (mousemove while the mouse button is pressed), a message containing the drawing coordinates is sent to the WebSocket server.

## Summary:
By following these steps, the drawing events from the HTML5 application running in the browser are sent to the Node.js server over WebSocket. You can further extend the server to process these events, broadcast them to other clients, or perform any other desired actions.