# Prompt 6

_Can you create another node.js app that subscribes to the same topic? As the messages arrive from Kafka, I want it to send the messages to the Mirror HTML5 app.

By the end of this, we'll have an HTML5 app where I draw. It connects to a Node.js websocket server, which publishes the messages to Kafka. 

We'll have another Node.js websocket app subscribing to the same Kafka topic, consuming those messages, and sending them to the Mirror HTML5 app._