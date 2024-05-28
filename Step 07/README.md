# Prompt 7

> _The Mirroring app shows the following error in the console:_
> 
> _indexConsumer.html:37 Uncaught TypeError: Failed to execute 'readAsText' on 'FileReader': parameter 1 is not of type 'Blob'. at ws.onmessage (indexConsumer.html:37:14)_
> 
> _Can you help?_

The error occurs because the `onmessage` event handler in the mirror app is attempting to use a 'FileReader' on a message that is already a string, not a `Blob`. WebSocket messages received by kafkajs are typically strings.
Here's the corrected code for the Mirror HTML5 app:

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

      // Draw on the canvas using the received coordinates
      draw(drawingEvent.x, drawingEvent.y);
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

## Explanation:
1. Reading the Message: Directly parse the message using JSON.parse(event.data) as the data is already a string.
2. Drawing Function: Remains unchanged, drawing the received coordinates on the canvas.

## Summary:
With this correction, the Mirror HTML5 app will correctly parse the incoming WebSocket messages as JSON and use the coordinates to draw on the canvas.