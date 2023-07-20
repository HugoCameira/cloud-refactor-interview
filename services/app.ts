import express from 'express';

const app = express();
const port = 80;

app.get('/wrapped/*', (req, res) => {
  res.send('Hello from the wrapped path!');
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.sendStatus(200); // Respond with HTTP 200 OK status
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});