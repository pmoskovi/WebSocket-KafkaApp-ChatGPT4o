# Prompt 6

> _Can you create another node.js app that subscribes to the same topic? As the messages arrive from Kafka, I want it to send the messages to the Mirror HTML5 app.
> 
> By the end of this, we'll have an HTML5 app where I draw. It connects to a Node.js websocket server, which publishes the messages to Kafka.
> 
> We'll have another Node.js websocket app subscribing to the same Kafka topic, consuming those messages, and sending them to the Mirror HTML5 app._

Certainly! Here's how you can create a complete solution that involves:
1. An HTML5 app where you draw.
2. A Node.js WebSocket server that sends drawing messages to a Kafka topic.
3. Another Node.js WebSocket server that subscribes to the Kafka topic and sends messages to the Mirror HTML5 app.

## Part 1: HTML5 Drawing App
The HTML5 drawing app remains the same as before, sending drawing events to the WebSocket server.

## Part 2: WebSocket Server with Kafka Producer
This is the existing WebSocket server script that publishes drawing messages to Kafka:

```
// websocket-producer-server.js
const WebSocket = require('ws');
const { Kafka } = require('kafkajs');

// Confluent Cloud configuration
const kafka = new Kafka({
  clientId: 'websocket-producer-server',
  brokers: ['your_bootstrap_servers'], // Replace with your Confluent Cloud bootstrap servers
  ssl: true,
  sasl: {
    mechanism: 'plain',
    username: 'your_api_key', // Replace with your Confluent Cloud API key
    password: 'your_api_secret', // Replace with your Confluent Cloud API secret
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
          topic: 'your_topic_name', // Replace with your topic name
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

## Part 3: WebSocket Server with Kafka Consumer
This is the new WebSocket server that consumes messages from Kafka and sends them to the Mirror HTML5 app:

```
// websocket-consumer-server.js
const WebSocket = require('ws');
const { Kafka } = require('kafkajs');

// Confluent Cloud configuration
const kafka = new Kafka({
  clientId: 'websocket-consumer-server',
  brokers: ['your_bootstrap_servers'], // Replace with your Confluent Cloud bootstrap servers
  ssl: true,
  sasl: {
    mechanism: 'plain',
    username: 'your_api_key', // Replace with your Confluent Cloud API key
    password: 'your_api_secret', // Replace with your Confluent Cloud API secret
  },
});

const consumer = kafka.consumer({ groupId: 'drawing-group' });

// Initialize WebSocket server
const server = new WebSocket.Server({ port: 8081 });

const clients = new Set();

const run = async () => {
  // Connect the Kafka consumer
  await consumer.connect();
  await consumer.subscribe({ topic: 'your_topic_name', fromBeginning: false }); // Replace with your topic name

  consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      const msgValue = message.value.toString();
      console.log(`Received message: ${msgValue}`);

      // Send the message to all connected WebSocket clients
      for (const client of clients) {
        if (client.readyState === WebSocket.OPEN) {
          client.send(msgValue);
        }
      }
    },
  });

  server.on('connection', ws => {
    clients.add(ws);
    console.log('New mirror client connected');

    ws.on('close', () => {
      clients.delete(ws);
      console.log('Mirror client disconnected');
    });
  });

  console.log('WebSocket consumer server is running on ws://localhost:8081');
};

run().catch(console.error);
```

## Part 4: Mirror HTML5 App
This is the updated Mirror HTML5 app that listens for messages from the new WebSocket server:

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
      const reader = new FileReader();
      reader.onload = () => {
        const drawingEvent = JSON.parse(reader.result);
        console.log('Received from server:', drawingEvent);

        // Draw on the canvas using the received coordinates
        draw(drawingEvent.x, drawingEvent.y);
      };
      reader.readAsText(event.data);
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

## Summary:
1. **HTML5 Drawing App**: Connects to the WebSocket server on port 8080 and sends drawing events.
2. **WebSocket Producer Server**: Listens for drawing events from the HTML5 app and publishes them to the Kafka topic.
3. **WebSocket Consumer Server**: Subscribes to the Kafka topic and forwards received messages to connected Mirror HTML5 apps via WebSocket on port 8081.
4. **Mirror HTML5 App**: Connects to the WebSocket server on port 8081 and mirrors the drawing events received from Kafka.

This setup allows you to draw in one HTML5 app, publish the drawing events to Kafka via a WebSocket server, and then mirror those events in another HTML5 app using another WebSocket server.