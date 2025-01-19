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
}`;
}

function createItineraryPrompt(preferences: RecommendationRequest, destination: any): string {
  return `As a travel expert with deep knowledge of international travel requirements, create a detailed ${preferences.duration}-day itinerary for ${destination.city}, ${destination.country}, including comprehensive travel requirements. 
  Assume the traveler is a citizen of the country where ${preferences.startingPoint} is located.

Travel Context:
- ${preferences.travelers} traveler(s) from ${preferences.startingPoint}
- Interests: ${preferences.tripType.join(', ')}
- When: ${preferences.specificDates.start || preferences.month}
- Budget: $${preferences.budgetPerPerson}/person

Focus on providing:

1. Accurate visa and entry requirements for citizens from ${preferences.startingPoint} traveling to ${destination.country}
2. Current health and vaccination requirements
3. Local currency information and financial considerations
4. Customs regulations and cultural considerations
5. Detailed daily activities and practical tips
6. Local transportation and accommodation recommendations
7. Safety considerations and emergency information
8. Seasonal considerations and weather advice

For travel requirements, be specific about:
- Exact visa types and processes
- Required documentation
- Processing times and fees
- Health insurance requirements
- Vaccination requirements
- Currency restrictions
- Prohibited items
- Local laws and customs`;
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
Always respond in this exact JSON format:
{
  "tripHighlights": {
    "overview": "Engaging summary of the itinerary",
    "mainAttractions": ["Must-see 1", "Must-see 2", "Must-see 3"]
  },
  "travelRequirements": {
    "visas": [
      "Detailed visa requirements specific to travelers from starting point",
      "Processing times and fees",
      "Required documentation"
    ],
    "vaccinations": [
      "Required vaccinations",
      "Recommended vaccinations",
      "Health insurance requirements"
    ],
    "currencyTips": [
      "Local currency details",
      "Exchange rate tips",
      "Payment methods accepted",
      "Banking information"
    ],
    "customs": [
      "Import restrictions",
      "Prohibited items",
      "Duty-free allowances",
      "Cultural considerations"
    ],
    "entryRequirements": [
      "Passport requirements",
      "Required forms",
      "Proof of funds requirements"
    ],
    "healthAndSafety": [
      "Emergency numbers",
      "Medical facility information",
      "Local health considerations"
    ]
  },
  "locations": [
    {
      "name": "Location name",
      "coordinates": [number, number],
      "type": "Point of interest type"
    }
  ],
  "dailyItinerary": [
    {
      "day": number,
      "activities": [
        {
          "name": "Activity name",
          "description": "Rich description including historical/cultural context",
          "duration": "Time needed",
          "additionalInfo": "Practical details and tips"
        }
      ],
      "transportationType": "Local transport details",
      "accommodation": "Where to stay",
      "estimatedCosts": {
        "activities": number,
        "transport": number
      }
    }
  ],
  "budgetBreakdown": {
    "transportation": number,
    "accommodation": number,
    "activities": number,
    "food": number,
    "miscellaneous": number
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