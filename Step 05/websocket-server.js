const WebSocket = require('ws');
const { Kafka } = require('kafkajs');

// Confluent Cloud configuration
const kafka = new Kafka({
  clientId: 'websocket-server',
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

  console.log('WebSocket server is running on ws://localhost:8080');
};

run().catch(console.error);