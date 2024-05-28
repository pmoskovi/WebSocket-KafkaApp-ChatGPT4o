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
  clientId: 'websocket-consumer-server',
  brokers: [bootstrapServers],
  ssl: true,
  sasl: {
    mechanism: 'plain',
    username: apiKey,
    password: apiSecret,
  },
});

const consumer = kafka.consumer({ groupId: 'drawing-group' });

// Initialize WebSocket server
const server = new WebSocket.Server({ port: 8081 });

const clients = new Set();

const run = async () => {
  // Connect the Kafka consumer
  await consumer.connect();
  await consumer.subscribe({ topic: topicName, fromBeginning: false });

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