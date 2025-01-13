import { Router, Request, Response, RequestHandler } from 'express';
import { RecommendationRequest } from '../types';
import { getDetailedItinerary } from '../services/groq';

const router = Router();

// Define the structure of the request body for the itinerary
interface ItineraryRequestBody {
  preferences: RecommendationRequest;
  destination: string;
}

// Define route handler with generic RequestHandler type
const handleItineraryRequest: RequestHandler<{}, any, ItineraryRequestBody, {}> = async (req, res): Promise<void> => {
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
};

// Use the route handler for POST /itinerary
router.post('/itinerary', handleItineraryRequest);

export default router;
