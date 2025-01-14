import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { getDestinationRecommendations } from './services/groq';
import itineraryRouter from './routes/itinerary';
import { RecommendationRequest } from './types';

dotenv.config();

console.log('GROQ API Key present:', !!process.env.GROQ_API_KEY);

const app = express();

// Single source of truth for allowed origins
const allowedOrigins = [
  'https://travel-frontend-7dupsowm4-brians-projects-df69fd22.vercel.app', // Latest production frontend
  'http://localhost:5173' // Local development
];

// Enable pre-flight for all routes
app.options('*', cors()); // Enable pre-flight for all routes

app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type']
}));

// Body parser middleware
app.use(express.json());

// Route: Recommendations API
app.post(
  '/api/recommendations',
  async (req: Request<{}, {}, RecommendationRequest>, res: Response) => {
    try {
      console.log('Received request with body:', JSON.stringify(req.body, null, 2));
      const recommendations = await getDestinationRecommendations(req.body);
      res.json({ success: true, recommendations });
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, error: error.message });
      } else {
        console.error('Unknown error:', error);
        res.status(500).json({ success: false, error: 'An unknown error occurred' });
      }
    }
  }
);

// Mount itinerary routes
app.use('/api/itinerary', itineraryRouter);

// Set the PORT
const PORT = process.env.PORT || 3001;

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// Error handler middleware
app.use((err: any, req: Request, res: Response, next: any) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    error: 'Internal Server Error' 
  });
});

export default app;
