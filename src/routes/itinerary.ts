import { Router, Request, Response } from 'express';
import { RecommendationRequest } from '../types';
import { getDetailedItinerary } from '../services/groq';

const router = Router();

interface ItineraryRequestBody {
  preferences: RecommendationRequest;
  destination: {
    city: string;
    country: string;
    matchScore: number;
    activities: string[];
    matchReason: string;
  };
}

interface DayItinerary {
  day: number;
  activities: Array<{
    name: string;
    description: string;
    duration: string;
    additionalInfo?: string;
  }>;
  transportationType: string;
  accommodation: string;
  estimatedCosts: {
    activities: number;
    transport: number;
    meals: number;
    [key: string]: number;
  };
}

interface ParsedItinerary {
  dailyItinerary: DayItinerary[];
  budgetBreakdown: {
    [key: string]: number;
  };
  travelRequirements: {
    visas: string[];
    vaccinations: string[];
    currencyTips: string[];
    customs: string[];
  };
  locations: Array<{
    name: string;
    coordinates: [number, number];
    type: string;
  }>;
}

const cleanAndValidateJSON = (jsonString: string): ParsedItinerary => {
  try {
    // Clean the string by removing invalid syntax
    const cleanedString = jsonString
      .replace(/\\n/g, ' ')
      .replace(/\\"/g, '"')
      .replace(/\s+/g, ' ')
      .replace(/\/\/.*(?=\n|$)/g, '') // Remove single-line comments
      .replace(/\/\*[\s\S]*?\*\//g, '') // Remove multi-line comments
      .replace(/,(?=\s*[\]}])/g, '') // Remove trailing commas
      .trim();

    // Parse the cleaned string into JSON
    return JSON.parse(cleanedString) as ParsedItinerary;
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('JSON parsing error:', error.message);
      throw new Error(`JSON parsing failed: ${error.message}`);
    }
    throw new Error('JSON parsing failed: Unknown error');
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
      const parsedItinerary = cleanAndValidateJSON(rawItinerary);
      console.log('Successfully parsed itinerary');

      if (!parsedItinerary.dailyItinerary || !Array.isArray(parsedItinerary.dailyItinerary)) {
        throw new Error('Invalid itinerary format - missing or invalid dailyItinerary');
      }

      return res.json({
        success: true,
        itinerary: parsedItinerary
      });
    } catch (parseError: unknown) {
      console.error('Parsing Error Details:', parseError);
      console.error('Raw itinerary that failed to parse:', rawItinerary);

      const errorMessage = parseError instanceof Error
        ? parseError.message
        : 'Unknown parsing error occurred';

      return res.status(500).json({
        success: false,
        error: `Failed to parse itinerary: ${errorMessage}`,
        rawData: rawItinerary
      });
    }
  } catch (error: unknown) {
    console.error('General Error:', error);

    const errorMessage = error instanceof Error
      ? error.message
      : 'An unknown error occurred';

    return res.status(500).json({
      success: false,
      error: errorMessage
    });
  }
});

export default router;
