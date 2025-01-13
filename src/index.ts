import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { getDestinationRecommendations } from './services/groq';
import itineraryRouter from './routes/itinerary';
import { RecommendationRequest } from './types';  // Importing the type for consistency

dotenv.config();

// Check if the GROQ API Key is present
console.log('GROQ API Key present:', !!process.env.GROQ_API_KEY);

const app = express();

// CORS configuration - Allow frontend to make requests
app.use(cors({
  origin: 'http://localhost:5173', // Adjust to match your frontend URL
  methods: ['GET', 'POST'],
  credentials: true // Allows cookies and authentication headers
}));

// Body parser middleware to handle JSON requests
app.use(express.json());

// Direct route for getting recommendations
app.post('/api/recommendations', async (req: Request<{}, {}, RecommendationRequest>, res: Response) => {
  try {
    console.log('Received request with body:', JSON.stringify(req.body, null, 2));

    // Get recommendations from Groq API based on request body
    const recommendations = await getDestinationRecommendations(req.body);
    res.json({ success: true, recommendations });
  } catch (error: unknown) {
    // Error handling
    if (error instanceof Error) {
      console.error('Error:', error);
      res.status(500).json({ success: false, error: error.message });
    } else {
      console.error('Unknown error:', error);
      res.status(500).json({ success: false, error: 'An unknown error occurred' });
    }
  }
});

// Mount itinerary routes under '/api/itinerary' or any other desired path
app.use('/api/itinerary', itineraryRouter);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
