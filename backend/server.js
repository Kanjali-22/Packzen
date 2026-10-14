import 'dotenv/config';
import cors from 'cors';
import express from 'express';

const app = express();
const port = process.env.PORT || 5050;

app.use(cors());
app.use(express.json());

const mockups = [
  { id: 1, slug: 'studio-box-mockup', title: 'Studio box mockup', category: 'box', premium: false },
  { id: 2, slug: 'natural-pouch-mockup', title: 'Natural pouch mockup', category: 'pouch', premium: true }
];

app.get('/', (_request, response) => {
  response.send('PackZen API running');
});

app.get('/api/mockups', (_request, response) => {
  response.json(mockups);
});

app.listen(port, () => {
  console.log(`PackZen API listening on http://localhost:${port}`);
});
