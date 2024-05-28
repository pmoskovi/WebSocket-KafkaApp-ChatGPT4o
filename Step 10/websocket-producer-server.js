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