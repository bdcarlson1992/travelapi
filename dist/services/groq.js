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
const API_KEY = process.env.GROQ_API_KEY;
if (!API_KEY) {
    throw new Error('Missing GROQ_API_KEY in environment variables');
}
const groq = new groq_sdk_1.default({
    apiKey: API_KEY
});
exports.groq = groq;
function createTravelPrompt(preferences) {
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
                        '  c) Allow time for deeper exploration'}

Remember to provide all numeric values as proper numbers without currency symbols or ranges.`;
}
function createItineraryPrompt(preferences, destination) {
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
            return (_b = (_a = completion.choices[0]) === null || _a === void 0 ? void 0 : _a.message) === null || _b === void 0 ? void 0 : _b.content;
        }
        catch (error) {
            console.error('Groq API error:', error);
            throw error;
        }
    });
}
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
            return (_b = (_a = completion.choices[0]) === null || _a === void 0 ? void 0 : _a.message) === null || _b === void 0 ? void 0 : _b.content;
        }
        catch (error) {
            console.error('Groq API error:', error);
            throw error;
        }
    });
}
