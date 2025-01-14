import { Router, Request, Response } from 'express';
import { RecommendationRequest } from '../types';
import { getDetailedItinerary } from '../services/groq';

const router = Router();

// Define the structure of the request body for the itinerary
interface ItineraryRequestBody {
  preferences: RecommendationRequest;
  destination: any; // Updated as per your request
}

// Define the route with proper type for the request body
router.post('/', async (req: Request<{}, {}, ItineraryRequestBody>, res: Response) => {
  console.log('Received itinerary request:', {
    body: req.body,
    preferences: req.body.preferences,
    destination: req.body.destination
  });

  try {
    const { preferences, destination } = req.body;

    if (!preferences || !destination) {
      res.status(400).json({
        success: false,
        error: 'Missing preferences or destination'
      });
      return;  // Exit early if data is missing
    }

    const itinerary = await getDetailedItinerary(preferences, destination);
    console.log('Generated itinerary:', itinerary);

    res.json({
      success: true,
      itinerary: itinerary ? JSON.parse(itinerary) : null
    });
  } catch (error: unknown) {
    console.error('Error generating itinerary:', error);

    if (error instanceof Error) {
      res.status(500).json({
        success: false,
        error: error.message || 'An error occurred'
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'An unknown error occurred'
      });
    }
  }
});

export default router;
