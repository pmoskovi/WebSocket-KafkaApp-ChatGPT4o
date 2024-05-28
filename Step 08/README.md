# Prompt 8

> _The mirroring app has one more minor problem. The problem occurs when I lift my mouse (don't press the mouse button, that is I am not drawing). It connects the last point from the previous drawing with the first point of the new line that I'm drawing. It connects them with a straight line. Can you help me by not drawing a line between these points?_

To avoid drawing a line between the last point of the previous drawing and the first point of a new drawing session, we need to reset the path whenever the mouse button is lifted. This can be achieved by sending additional information to indicate when a drawing session starts or ends.
Here's how to modify the HTML5 drawing app and the Mirror HTML5 app to handle this scenario:

## 1. Modify the HTML5 Drawing App to Send Start and End Signals
Update the drawing app to send a message indicating when the drawing starts and ends:

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

      canvas.addEventListener('mousedown', startPosition);
      canvas.addEventListener('mouseup', endPosition);
      canvas.addEventListener('mousemove', (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      draw(x, y);
    });
  </script>
</body>
</html>
```

2. Modify the Mirror HTML5 App to Handle Start and End Signals
Update the mirror app to reset the path whenever it receives a `start` or `end` signal:

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

## Explanation:
**1. HTML5 Drawing App:**
    - Sends start and end messages to indicate the beginning and end of a drawing session.
    - Draws locally on the canvas.

**2. Mirror HTML5 App:**
    - Receives start, draw, and end messages.
    - Resets the path on receiving start and end messages to avoid connecting lines between separate drawing sessions.

This setup ensures that the Mirror HTML5 app correctly handles separate drawing sessions without connecting lines between them.

