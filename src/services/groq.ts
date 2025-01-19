import Groq from "groq-sdk";
import dotenv from 'dotenv';
import { RecommendationRequest } from '../types';

dotenv.config();

const API_KEY = process.env.GROQ_API_KEY;
if (!API_KEY) {
  throw new Error('Missing GROQ_API_KEY in environment variables');
}

const groq = new Groq({
  apiKey: API_KEY
});

function createTravelPrompt(preferences: RecommendationRequest): string {
  const shortTrip = preferences.duration <= 3;
  const mediumTrip = preferences.duration > 3 && preferences.duration <= 7;

  return `As a Lonely Planet travel expert, recommend 5 destinations based on these parameters, focusing on practical insights and authentic experiences:

Travel Parameters:
- Starting from: ${preferences.startingPoint}
- Available time: ${preferences.duration} days
- Trip types desired: ${preferences.tripType.join(', ')}
- Number of travelers: ${preferences.travelers}
- When: ${preferences.specificDates.start || preferences.month}
- Budget per person: $${preferences.budgetPerPerson}
- ${preferences.isInternational ? 'International destinations allowed' : 'Domestic destinations only'}

Travel Time Considerations:
${shortTrip ? 
  '- Short trip focus: Recommend destinations either:\n' +
  '  a) Within a 3-hour direct flight from ' + preferences.startingPoint + '\n' +
  '  b) Or accessible by a short drive/train ride\n' +
  '- Factor in practical transit times and airport logistics'
  : 
  mediumTrip ?
  '- Medium trip focus: Recommend destinations:\n' +
  '  a) Within a 6-hour direct flight from ' + preferences.startingPoint + '\n' +
  '  b) Or reachable within half a day of travel\n' +
  '- Consider time zones and adjustment periods'
  :
  '- Extended trip possibilities:\n' +
  '  a) Can include more distant destinations\n' +
  '  b) Factor in jet lag recovery\n' +
  '  c) Allow time for deeper exploration'
}

Remember to provide all numeric values as proper numbers without currency symbols or ranges.`;
}

function createItineraryPrompt(preferences: RecommendationRequest, destination: any): string {
  return `Create a detailed ${preferences.duration}-day itinerary for ${destination.city}, ${destination.country}. 
The traveler is from ${preferences.startingPoint}.

Travel Context:
- ${preferences.travelers} traveler(s)
- Interests: ${preferences.tripType.join(', ')}
- When: ${preferences.specificDates.start || preferences.month}
- Budget: $${preferences.budgetPerPerson}/person

Include:
1. Entry requirements for ${preferences.startingPoint} citizens
2. Health/vaccination requirements
3. Local currency and money tips
4. Customs regulations
5. Daily activities with exact costs in numbers only
6. Transport recommendations with exact costs
7. Safety information
8. Seasonal considerations

IMPORTANT: For all costs, provide exact numbers without currency symbols or ranges. 
For example, use "transport": 15 instead of "transport": "15 EUR" or "transport": "10-20".

Ensure all financial values are:
- Whole numbers only
- No currency symbols
- No ranges (use averages instead)
- No text in cost fields`;
}

export async function getDestinationRecommendations(preferences: RecommendationRequest) {
  try {
    const prompt = createTravelPrompt(preferences);
    console.log('Sending prompt to Groq:', prompt);

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are a Lonely Planet travel expert providing destination recommendations. 
All numeric values must be proper numbers without currency symbols or ranges.
Always respond in this exact JSON format:
{
  "destinations": [
    {
      "city": "City Name",
      "country": "Country Name",
      "matchScore": 87,
      "ratings": {
        "atmosphere": 4.5,
        "value": 4.2,
        "climate": 3.8,
        "activities": 4.7
      },
      "matchReason": "Engaging explanation of why this destination is perfect",
      "activities": ["Must-do activity 1", "Must-do activity 2", "Must-do activity 3"],
      "seasonalConsiderations": "Time-specific advice and weather insights"
    }
  ]
}`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      model: "mixtral-8x7b-32768",
      temperature: 0.7,
    });

    return completion.choices[0]?.message?.content;
  } catch (error) {
    console.error('Groq API error:', error);
    throw error;
  }
}

export async function getDetailedItinerary(preferences: RecommendationRequest, destination: any) {
  try {
    const prompt = createItineraryPrompt(preferences, destination);
    console.log('Sending itinerary prompt to Groq:', prompt);

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are a Lonely Planet expert creating detailed itineraries. 
IMPORTANT: All cost values must be numbers only, without currency symbols or ranges.
Always respond in this exact JSON format:
{
  "tripHighlights": {
    "overview": "string",
    "mainAttractions": ["string"]
  },
  "travelRequirements": {
    "visas": ["string"],
    "vaccinations": ["string"],
    "currencyTips": ["string"],
    "customs": ["string"],
    "entryRequirements": ["string"],
    "healthAndSafety": ["string"]
  },
  "locations": [
    {
      "name": "string",
      "coordinates": [number, number],
      "type": "string"
    }
  ],
  "dailyItinerary": [
    {
      "day": 1,
      "activities": [
        {
          "name": "string",
          "description": "string",
          "duration": "string",
          "additionalInfo": "string"
        }
      ],
      "transportationType": "string",
      "accommodation": "string",
      "estimatedCosts": {
        "activities": 0,
        "transport": 0,
        "meals": 0
      }
    }
  ],
  "budgetBreakdown": {
    "transportation": 0,
    "accommodation": 0,
    "activities": 0,
    "food": 0,
    "miscellaneous": 0
  }
}`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      model: "mixtral-8x7b-32768",
      temperature: 0.7,
    });

    return completion.choices[0]?.message?.content;
  } catch (error) {
    console.error('Groq API error:', error);
    throw error;
  }
}

export { groq };