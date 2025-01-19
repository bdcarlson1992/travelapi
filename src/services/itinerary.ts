import { groq } from './groq';
import { RecommendationRequest } from '../types';

interface DayItinerary {
  day: number;
  activities: string[];
  meals: string[];
  accommodation: string;
  transportationType: string;
  estimatedCosts: Record<string, number>;
}

interface ItineraryResponse {
  itinerary: {
    overview: {
      visaRequirements: string[];
      bestTimeToVisit: string;
      transportationTips: string;
    };
    days: DayItinerary[];
  };
}

function createItineraryPrompt(preferences: RecommendationRequest, destination: string): string {
  return `Create a detailed travel itinerary for:
    - ${preferences.duration} days in ${destination}
    - Starting from: ${preferences.startingPoint}
    - Budget: $${preferences.budgetPerPerson}/person
    - Group size: ${preferences.travelers}
    - Interests: ${preferences.tripType.join(', ')}
    
    Include: Day-by-day activities, transportation, accommodation recommendations.`;
}

export async function generateItinerary(preferences: RecommendationRequest, destination: string): Promise<ItineraryResponse | null> {
  const prompt = createItineraryPrompt(preferences, destination);

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `Return the itinerary in JSON format:
          {
            "itinerary": {
              "overview": { 
                "visaRequirements": [], 
                "bestTimeToVisit": "", 
                "transportationTips": "" 
              },
              "days": [
                {
                  "day": 1,
                  "activities": [],
                  "meals": [],
                  "accommodation": "",
                  "transportationType": "",
                  "estimatedCosts": {}
                }
              ]
            }
          }`
        },
        { role: "user", content: prompt }
      ],
      model: "mixtral-8x7b-32768"
    });

    const itineraryContent = completion.choices[0]?.message?.content;
    
    if (!itineraryContent) {
      throw new Error("No itinerary data returned");
    }

    const parsedData: ItineraryResponse = JSON.parse(itineraryContent);
    return parsedData;

  } catch (error: unknown) {
    console.error('Error generating itinerary:', error);
    return null;
  }
}