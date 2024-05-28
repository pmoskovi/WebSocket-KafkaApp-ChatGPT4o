# Prompt 9

> _My two Node.js files contain secrets that I want to externalize. They use the same secrets: bootstrap server, cloud API key (username), cloud API secret (password), and topic name. The two Node.js files use the same secrets, so this would make my life a lot easier._

To externalize the secrets and configuration, you can use environment variables or a configuration file. Using environment variables is a common and secure practice for managing secrets.

# Step-by-Step Guide to Externalize Secrets:
**1. Create a Configuration File (.env)**: Create a `.env` file in the root directory of your project to store the secrets. Make sure to add this file to your `.gitignore` to avoid committing it to your version control system.

```
KAFKA_BOOTSTRAP_SERVERS=your_bootstrap_servers
KAFKA_API_KEY=your_api_key
KAFKA_API_SECRET=your_api_secret
KAFKA_TOPIC_NAME=your_topic_name
```

**2. Install dotenv Library**: Install the `dotenv` library to load environment variables from the `.env` file.

```
npm install dotenv
```

**3. Update Your Node.js Files to Use Environment Variables**: Update both the producer and consumer Node.js files to load the environment variables.

## Updated websocket-producer-server.js:

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

## Updated websocket-consumer-server.js:

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
```

## Summary:
1. **Create a `.env` file** to store your secrets.
2. **Install the dotenv library** to load environment variables from the .env file.
3. **Update your Node.js scripts** to use the environment variables for configuration.

This setup ensures your secrets are managed securely and consistently across both Node.js applications.