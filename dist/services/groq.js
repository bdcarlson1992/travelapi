"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.groq = void 0;
exports.getDestinationRecommendations = getDestinationRecommendations;
exports.getDetailedItinerary = getDetailedItinerary;
const groq_sdk_1 = __importDefault(require("groq-sdk"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// Check if the environment variable is defined
const API_KEY = process.env.GROQ_API_KEY;
if (!API_KEY) {
    throw new Error('Missing GROQ_API_KEY in environment variables');
}
// Initialize the Groq client
const groq = new groq_sdk_1.default({
    apiKey: API_KEY
});
exports.groq = groq;
// Prompt creation for destinations
function createTravelPrompt(preferences) {
    const shortTrip = preferences.duration <= 3;
    const mediumTrip = preferences.duration > 3 && preferences.duration <= 7;
    return `You are a travel expert considering flight logistics and realistic travel times. Based on these preferences, recommend 5 destinations:

Travel Parameters:
- Starting from: ${preferences.startingPoint}
- Available time: ${preferences.duration} days
- Trip types desired: ${preferences.tripType.join(', ')}
- Number of travelers: ${preferences.travelers}
- When: ${preferences.specificDates.start || preferences.month}
- Budget per person: $${preferences.budgetPerPerson}
- ${preferences.isInternational ? 'International destinations allowed' : 'Domestic destinations only'}

Important Travel Time Considerations:
${shortTrip ?
        '- This is a very short trip. Only recommend destinations that are either: ' +
            '\n a) Within a 3-hour direct flight from ' + preferences.startingPoint +
            '\n b) Or accessible by a short drive/train ride' +
            '\n - Factor in airport transit times and check-in/security times in recommendations'
        :
            mediumTrip ?
                '- This is a medium-length trip. Only recommend destinations that are: ' +
                    '\n a) Within a 6-hour direct flight from ' + preferences.startingPoint +
                    '\n b) Or reachable within half a day of total travel time' +
                    '\n - Consider time zones and jet lag in your recommendations'
                :
                    '- For this longer trip, destinations can be further away, but still consider: ' +
                        '\n a) Total travel time including connections' +
                        '\n b) Time zones and jet lag recovery' +
                        '\n c) Ensuring enough time to experience the destination'}`;
}
// Prompt creation for itinerary
function createItineraryPrompt(preferences, destination) {
    return `Create a detailed travel itinerary for ${preferences.duration} days in ${destination.city}, ${destination.country}.

Travel Context:
- Group of ${preferences.travelers} traveler(s)
- Interests: ${preferences.tripType.join(', ')}
- Travel dates: ${preferences.specificDates.start || preferences.month}
- Budget per person: $${preferences.budgetPerPerson}
- Starting from: ${preferences.startingPoint}

Please provide:
1. Travel Requirements:
   - Required visas and permits
   - Vaccination requirements
   - Important local customs and etiquette
   - Currency and payment recommendations

2. Transportation:
   - Best way to reach ${destination.city} from ${preferences.startingPoint}
   - Local transportation options and recommendations
   - Estimated travel times between locations

3. Budget Breakdown:
   - Transportation costs (flights, local transport)
   - Accommodation costs
   - Food and dining expenses
   - Activity and entrance fees
   - Miscellaneous expenses

4. Day-by-Day Itinerary:
   Consider weather, opening hours, local events, and logical geographic flow between activities.
   Factor in travel time between locations and potential jet lag.
   Include meal recommendations at local establishments within budget.

If the trip duration is over 5 days, suggest nearby destinations that could be combined into a multi-city itinerary.
Always keep recommendations within the specified budget and consider the traveler's interests.`;
}
// Fetch destination recommendations
function getDestinationRecommendations(preferences) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        try {
            const prompt = createTravelPrompt(preferences);
            console.log('Sending prompt to Groq:', prompt);
            const completion = yield groq.chat.completions.create({
                messages: [
                    {
                        role: "system",
                        content: `You are a travel expert that provides detailed, personalized destination recommendations. 
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
      "matchReason": "Detailed explanation why this matches their preferences",
      "activities": ["Activity 1", "Activity 2", "Activity 3"],
      "bestAreas": ["Area 1", "Area 2"],
      "seasonalConsiderations": "Weather and timing considerations"
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
            return (_b = (_a = completion.choices[0]) === null || _a === void 0 ? void 0 : _a.message) === null || _b === void 0 ? void 0 : _b.content;
        }
        catch (error) {
            console.error('Groq API error:', error);
            throw error;
        }
    });
}
// Fetch detailed itinerary
function getDetailedItinerary(preferences, destination) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        try {
            const prompt = createItineraryPrompt(preferences, destination);
            console.log('Sending itinerary prompt to Groq:', prompt);
            const completion = yield groq.chat.completions.create({
                messages: [
                    {
                        role: "system",
                        content: `You are a travel expert creating detailed itineraries. 
Always respond in this exact JSON format:
{
  "travelRequirements": {
    "visas": ["requirement 1", "requirement 2"],
    "vaccinations": ["requirement 1", "requirement 2"],
    "customs": ["custom 1", "custom 2"],
    "currencyTips": ["tip 1", "tip 2"]
  },
  "transportation": {
    "arrival": {
      "method": "string",
      "duration": "string",
      "cost": number,
      "details": "string"
    },
    "local": {
      "options": ["option 1", "option 2"],
      "recommendations": "string",
      "estimatedCosts": number
    }
  },
  "budgetBreakdown": {
    "transportation": number,
    "accommodation": number,
    "food": number,
    "activities": number,
    "miscellaneous": number
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
      "day": number,
      "activities": ["activity 1", "activity 2"],
      "meals": {
        "breakfast": "string",
        "lunch": "string",
        "dinner": "string"
      },
      "accommodation": "string",
      "transportationType": "string",
      "estimatedCosts": {
        "activities": number,
        "meals": number,
        "transport": number
      }
    }
  ],
  "nearbyDestinations": [
    {
      "city": "string",
      "distance": "string",
      "travelTime": "string",
      "recommendedDays": number
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
            return (_b = (_a = completion.choices[0]) === null || _a === void 0 ? void 0 : _a.message) === null || _b === void 0 ? void 0 : _b.content;
        }
        catch (error) {
            console.error('Groq API error:', error);
            throw error;
        }
    });
}
