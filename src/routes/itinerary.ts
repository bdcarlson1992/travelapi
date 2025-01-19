import { Router, Request, Response } from 'express';
import { RecommendationRequest } from '../types';
import { getDetailedItinerary } from '../services/groq';

const router = Router();

interface ItineraryRequestBody {
  preferences: RecommendationRequest;
  destination: any;
}

// Helper function to clean and validate JSON
const cleanAndValidateJSON = (jsonString: string) => {
  try {
    // First, clean the string of any potential issues
    const cleanedString = jsonString
      .replace(/\\n/g, ' ')           // Replace newlines with spaces
      .replace(/\\"/g, '"')           // Fix escaped quotes
      .replace(/\s+/g, ' ')           // Normalize whitespace
      .replace(/\/\/.*/g, '')         // Remove single-line comments
      .replace(/\/\*[\s\S]*?\*\//g, '') // Remove multi-line comments
      .trim();

    // Try to parse the cleaned string
    return JSON.parse(cleanedString);
  } catch (error) {
    console.error('JSON Cleaning/Parsing Error:', error);
    throw new Error(`JSON parsing failed: ${error.message}`);
  }
};

router.post('/', async (req: Request<{}, {}, ItineraryRequestBody>, res: Response) => {
  console.log('Received itinerary request for:', {
    startingPoint: req.body.preferences.startingPoint,
    destination: `${req.body.destination.city}, ${req.body.destination.country}`
  });

  try {
    const { preferences, destination } = req.body;

    if (!preferences || !destination) {
      return res.status(400).json({
        success: false,
        error: 'Missing preferences or destination'
      });
    }

    console.log('Calling GROQ service...');
    const rawItinerary = await getDetailedItinerary(preferences, destination);
    console.log('Raw GROQ response:', rawItinerary);

    if (!rawItinerary) {
      return res.status(500).json({
        success: false,
        error: 'No itinerary data received from GROQ'
      });
    }

    try {
      // Clean and parse the itinerary
      const parsedItinerary = cleanAndValidateJSON(rawItinerary);
      console.log('Successfully parsed itinerary');

      // Validate the required fields are present
      if (!parsedItinerary.dailyItinerary || !Array.isArray(parsedItinerary.dailyItinerary)) {
        throw new Error('Invalid itinerary format - missing or invalid dailyItinerary');
      }

      return res.json({
        success: true,
        itinerary: parsedItinerary
      });
    } catch (parseError) {
      console.error('Parsing Error Details:', parseError);
      console.error('Raw itinerary that failed to parse:', rawItinerary);
      
      return res.status(500).json({
        success: false,
        error: `Failed to parse itinerary: ${parseError.message}`,
        rawData: rawItinerary // This helps with debugging
      });
    }
  } catch (error) {
    console.error('General Error:', error);
    
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'An unknown error occurred'
    });
  }
});

export default router;