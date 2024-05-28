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