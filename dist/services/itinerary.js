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
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateItinerary = generateItinerary;
const groq_1 = require("./groq");
// Create the itinerary prompt for Groq API
function createItineraryPrompt(preferences, destination) {
    return `Create a detailed travel itinerary for:
    - ${preferences.duration} days in ${destination}
    - Starting from: ${preferences.startingPoint}
    - Budget: $${preferences.budgetPerPerson}/person
    - Group size: ${preferences.travelers}
    - Interests: ${preferences.tripType.join(', ')}
    
    Include: Day-by-day activities, transportation, accommodation recommendations.`;
}
// Generate the itinerary from Groq API
function generateItinerary(preferences, destination) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        const prompt = createItineraryPrompt(preferences, destination);
        try {
            // Make the API call to Groq (or the appropriate service)
            const completion = yield groq_1.groq.chat.completions.create({
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
                model: "mixtral-8x7b-32768" // Ensure this model is correct for your use case
            });
            // Extract the message content from the completion response
            const itineraryContent = (_b = (_a = completion.choices[0]) === null || _a === void 0 ? void 0 : _a.message) === null || _b === void 0 ? void 0 : _b.content;
            // Check if the content is valid, otherwise throw an error
            if (!itineraryContent) {
                throw new Error("No itinerary data returned");
            }
            // Parse the response content into the structured itinerary object
            const itinerary = JSON.parse(itineraryContent);
            return itinerary;
        }
        catch (error) {
            // Log the error for debugging purposes
            console.error('Error generating itinerary:', error);
            // Handle errors gracefully and return null if an error occurs
            return null;
        }
    });
}
