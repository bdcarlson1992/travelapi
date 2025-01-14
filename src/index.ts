import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import { getDestinationRecommendations } from './services/groq';
import itineraryRouter from './routes/itinerary';
import { RecommendationRequest } from './types';

dotenv.config();

console.log('GROQ API Key present:', !!process.env.GROQ_API_KEY);

const app = express();

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

app.use('/api/itinerary', itineraryRouter);

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

export default app;