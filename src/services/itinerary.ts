import { groq } from './groq';
import { RecommendationRequest } from '../types';  // Ensure this is the correct import for your types

// Define types for the itinerary response structure
interface ItineraryResponse {
  itinerary: {
    overview: {
      visaRequirements: string[];
      bestTimeToVisit: string;
      transportationTips: string;
    };
    days: Array<{
      day: number;
      activities: string[];
      meals: string[];
      accommodation: string;
      transportationType: string;
      estimatedCosts: Record<string, number>;
    }>;
  };
}

// Create the itinerary prompt for Groq API
function createItineraryPrompt(preferences: RecommendationRequest, destination: string): string {
  return `Create a detailed travel itinerary for:
    - ${preferences.duration} days in ${destination}
    - Starting from: ${preferences.startingPoint}
    - Budget: $${preferences.budgetPerPerson}/person
    - Group size: ${preferences.travelers}
    - Interests: ${preferences.tripType.join(', ')}
    
    Include: Day-by-day activities, transportation, accommodation recommendations.`;
}

// Generate the itinerary from Groq API
export async function generateItinerary(preferences: RecommendationRequest, destination: string): Promise<ItineraryResponse | null> {
  const prompt = createItineraryPrompt(preferences, destination);

  try {
    // Make the API call to Groq (or the appropriate service)
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
      model: "mixtral-8x7b-32768"  // Ensure this model is correct for your use case
    });

    // Extract the message content from the completion response
    const itineraryContent = completion.choices[0]?.message?.content;
    
    // Check if the content is valid, otherwise throw an error
    if (!itineraryContent) {
      throw new Error("No itinerary data returned");
    }

    // Parse the response content into the structured itinerary object
    const itinerary: ItineraryResponse = JSON.parse(itineraryContent);
    return itinerary;

  } catch (error: unknown) {
    // Log the error for debugging purposes
    console.error('Error generating itinerary:', error);

    // Handle errors gracefully and return null if an error occurs
    return null;
  }
}
