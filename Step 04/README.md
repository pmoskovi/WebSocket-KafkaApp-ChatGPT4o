# Prompt 4

> _The Mirror HTML5 application doesn't draw. On the console it displays the following error message: 
> 
> Uncaught SyntaxError: Unexpected token 'o', "[object Blob]" is not valid JSON at JSON.parse (<anonymous>) at ws.onmessage (indexConsumer.html:30:33) 
> 
> Before this error message, it shows:
> Received from server: Blob
> 
> Can you try to fix this?_

The error occurs because WebSocket messages are being received as Blob objects instead of strings. To fix this, you need to read the Blob object as a text before parsing it as JSON.

Here's the updated version of the Mirror HTML5 application:

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
    const ws = new WebSocket('ws://localhost:8080');

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

## Explanation:
1. Reading the Blob Object:

    - The onmessage event now uses a FileReader to read the Blob as text.
    - Once the Blob is read as text, it is parsed as JSON and the drawing event is handled.

2. Drawing Function:

    - The draw function remains the same, drawing the received coordinates on the canvas.

## Summary:
This updated code reads the WebSocket message as a Blob and converts it to text before parsing it as JSON. This should fix the issue and allow the mirror application to draw the received coordinates on its canvas.