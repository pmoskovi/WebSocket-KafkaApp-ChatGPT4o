# Prompt 11

> _While the reset message arrives to the Mirror app, the drawing is not cleared._

Let's ensure that the reset message is properly handled and clears the canvas in the Mirror HTML5 app. The issue might be with how the canvas context is being reset. Let's review and improve the handling of the reset signal.

## 1. Modify the HTML5 Drawing App
Ensure the HTML5 Drawing App properly sends the reset signal:

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
  <button id="resetButton">RESET</button>

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
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      draw(x, y);
      ws.send(JSON.stringify({ type: 'start', x, y }));
    };

    const endPosition = () => {
      painting = false;
      ctx.beginPath();
      ws.send(JSON.stringify({ type: 'end' }));
    };

    const draw = (x, y) => {
      if (!painting) return;

      ctx.lineWidth = 5;
      ctx.lineCap = 'round';

      ctx.lineTo(x, y);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x, y);

      // Send drawing event to WebSocket server
      if (painting) {
        ws.send(JSON.stringify({ type: 'draw', x, y }));
      }
    };

    const resetCanvas = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ws.send(JSON.stringify({ type: 'reset' }));
    };

    canvas.addEventListener('mousedown', startPosition);
    canvas.addEventListener('mouseup', endPosition);
    canvas.addEventListener('mousemove', (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      draw(x, y);
    });

    document.getElementById('resetButton').addEventListener('click', resetCanvas);
  </script>
</body>
</html>
```

## 2. Update the Mirror HTML5 App to Properly Handle the Reset Signal
Make sure the reset signal is handled correctly to clear the canvas in the Mirror HTML5 app:

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
    const ws = new WebSocket('ws://localhost:8081');

    ws.onopen = () => {
      console.log('Connected to WebSocket server');
    };

    ws.onmessage = (event) => {
      console.log('Received from server:', event.data);
      const drawingEvent = JSON.parse(event.data);

      if (drawingEvent.type === 'start') {
        ctx.beginPath();
        draw(drawingEvent.x, drawingEvent.y);
      } else if (drawingEvent.type === 'draw') {
        draw(drawingEvent.x, drawingEvent.y);
      } else if (drawingEvent.type === 'end') {
        ctx.beginPath();
      } else if (drawingEvent.type === 'reset') {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
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

## 3. Ensure the WebSocket Producer Server Forwards the Reset Signal
Ensure the WebSocket producer server forwards the reset signal to Kafka:

```
require('dotenv').config();
const WebSocket = require('ws');
const { Kafka } = require('kafkajs');

// Load environment variables
const bootstrapServers = process.env.KAFKA_BOOTSTRAP_SERVERS;
const apiKey = process.env.KAFKA_API_KEY;
const apiSecret = process.env.KAFKA_API_SECRET;
const topicName = process.env.KAFKA_TOPIC_NAME;

// Confluent Cloud configuration
const kafka = new Kafka({
  clientId: 'websocket-producer-server',
  brokers: [bootstrapServers],
  ssl: true,
  sasl: {
    mechanism: 'plain',
    username: apiKey,
    password: apiSecret,
  },
});

const producer = kafka.producer();

// Initialize WebSocket server
const server = new WebSocket.Server({ port: 8080 });

const run = async () => {
  // Connect the Kafka producer
  await producer.connect();

  server.on('connection', ws => {
    console.log('New client connected');

    ws.on('message', async message => {
      console.log(`Received: ${message}`);

      // Publish the message to the Kafka topic
      try {
        await producer.send({
          topic: topicName,
          messages: [
            { value: message },
          ],
        });
        console.log('Message published to Kafka');
      } catch (err) {
        console.error('Error publishing message to Kafka', err);
      }
    });

    ws.on('close', () => {
      console.log('Client disconnected');
    });
  });

  console.log('WebSocket producer server is running on ws://localhost:8080');
};

run().catch(console.error);
```

## Summary

**1. HTML5 Drawing App**: Added a RESET button that clears the canvas and sends a reset message to the WebSocket server.
**2. WebSocket Producer Server**: Forwards the reset message to Kafka.
**3. Mirror HTML5 App**: Properly handles the reset message by clearing the canvas when received.

This setup ensures that both the producer and consumer canvases are cleared when the RESET button is clicked, and the message is properly handled across all components.