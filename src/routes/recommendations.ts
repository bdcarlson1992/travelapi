import express, { Request, Response } from 'express';
import { RecommendationRequest } from '../types';  // Importing the correct type
import { getDestinationRecommendations } from '../services/groq'; // Import only the required service

const router = express.Router();

router.post('/recommendations', async (req: Request<{}, {}, RecommendationRequest>, res: Response) => {
  try {
    const preferences: RecommendationRequest = req.body;
    console.log('Processing request for:', preferences.startingPoint);

    // Only get recommendations from Groq
    const recommendations = await getDestinationRecommendations(preferences);

    res.json({
      success: true,
      recommendations,
      query: preferences
    });

  } catch (error: unknown) {
    console.error('Detailed error:', error);

    // More robust error handling
    if (error instanceof Error) {
      res.status(500).json({
        success: false,
        error: error.message || 'Internal server error',
        details: error.stack
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'An unknown error occurred',
      });
    }
  }
});

export default router;
