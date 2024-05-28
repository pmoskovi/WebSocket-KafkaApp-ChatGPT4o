# Prompt 1
> _I'd like to connect my HTML5 app (running JavaScript in the browser) with my Node.js app using websocket. Can you help?_

Certainly! You can use the ws library in Node.js to create a WebSocket server and the built-in WebSocket API in JavaScript to connect from your HTML5 app. Here's how you can set this up:

# 1. Set Up the WebSocket Server in Node.js
First, you need to install the ws library:

Next steps: play back the drawing, speed up, slow down.

```
npm install ws
```

Then, create a Node.js script for the WebSocket server:

```
// websocket-server.js
const WebSocket = require('ws');

const server = new WebSocket.Server({ port: 8080 });

server.on('connection', ws => {
  console.log('New client connected');

  ws.on('message', message => {
    console.log(`Received: ${message}`);
    // Echo the received message back to the client
    ws.send(`You said: ${message}`);
  });

   ws.on('close', () => {
    console.log('Client disconnected');
  });

  ws.send('Welcome to the WebSocket server!');
});

console.log('WebSocket server is running on ws://localhost:8080');
```

Run the WebSocket server:

```
node websocket-server.js
```

# 2. Connect to the WebSocket Server from Your HTML5 App

Create an HTML file and include the JavaScript code to connect to the WebSocket server:

```
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>WebSocket Client</title>
</head>
<body>
  <h1>WebSocket Client</h1>
  <input type="text" id="messageInput" placeholder="Type a message">
  <button id="sendButton">Send</button>
  <div id="messages"></div>

  <script>
    const ws = new WebSocket('ws://localhost:8080');

    ws.onopen = () => {
      console.log('Connected to WebSocket server');
      document.getElementById('messages').innerHTML += '<p>Connected to WebSocket server</p>';
    };

    ws.onmessage = (event) => {
      console.log('Received from server:', event.data);
      document.getElementById('messages').innerHTML += `<p>${event.data}</p>`;
    };

    ws.onclose = () => {
      console.log('Disconnected from WebSocket server');
      document.getElementById('messages').innerHTML += '<p>Disconnected from WebSocket server</p>';
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      document.getElementById('messages').innerHTML += `<p>WebSocket error: ${error}</p>`;
    };

    document.getElementById('sendButton').addEventListener('click', () => {
      const message = document.getElementById('messageInput').value;
      ws.send(message);
      document.getElementById('messages').innerHTML += `<p>You: ${message}</p>`;
    });
  </script>
</body>
</html>
```

# Summary

## WebSocket Server in Node.js:

Install the ws library.
Create a WebSocket server that listens for connections, receives messages, and sends responses.

## WebSocket Client in HTML5:
Use the built-in WebSocket API to connect to the server. Handle open, message, close, and error events. Send messages from the client to the server and display messages in the browser.

By following these steps, you can establish a WebSocket connection between your HTML5 app and your Node.js app, enabling real-time communication.

