import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import mongoose from 'mongoose';
import authRouter, { ensureDemoUser } from './routes/auth.js';

const app = express();
const port = process.env.PORT || 5050;
const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/packzen';

app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose
  .connect(mongoUri)
  .then(async () => {
    console.log('----------------------------------------------------');
    console.log('✓ MongoDB connected successfully!');
    console.log(`✓ URI: ${mongoUri}`);
    console.log('✓ MongoDB Compass: Connect to mongodb://127.0.0.1:27017');
    console.log('✓ Target Database: "packzen" | Collection: "users"');
    console.log('----------------------------------------------------');
    await ensureDemoUser();
  })
  .catch((err) => {
    console.error('✗ MongoDB connection error:', err.message);
    console.error('Ensure MongoDB is running or MongoDB Compass is open at mongodb://127.0.0.1:27017');
  });

// Auth Routes
app.use('/api/auth', authRouter);

// Mockups Data
const mockups = [
  { id: 1, slug: 'studio-box-mockup', title: 'Studio box mockup', category: 'box', premium: false },
  { id: 2, slug: 'natural-pouch-mockup', title: 'Natural pouch mockup', category: 'pouch', premium: true }
];

app.get('/', (_request, response) => {
  response.json({
    status: 'online',
    service: 'PackZen API',
    mongoConnected: mongoose.connection.readyState === 1,
    database: 'packzen'
  });
});

app.get('/api/mockups', (_request, response) => {
  response.json(mockups);
});

app.listen(port, () => {
  console.log(`PackZen API listening on http://localhost:${port}`);
});
