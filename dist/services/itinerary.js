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
function createItineraryPrompt(preferences, destination) {
    return `Create a detailed travel itinerary for:
    - ${preferences.duration} days in ${destination}
    - Starting from: ${preferences.startingPoint}
    - Budget: $${preferences.budgetPerPerson}/person
    - Group size: ${preferences.travelers}
    - Interests: ${preferences.tripType.join(', ')}
    
    Include: Day-by-day activities, transportation, accommodation recommendations.`;
}
function generateItinerary(preferences, destination) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        const prompt = createItineraryPrompt(preferences, destination);
        try {
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
                model: "mixtral-8x7b-32768"
            });
            const itineraryContent = (_b = (_a = completion.choices[0]) === null || _a === void 0 ? void 0 : _a.message) === null || _b === void 0 ? void 0 : _b.content;
            if (!itineraryContent) {
                throw new Error("No itinerary data returned");
            }
            const parsedData = JSON.parse(itineraryContent);
            return parsedData;
        }
        catch (error) {
            console.error('Error generating itinerary:', error);
            return null;
        }
    });
}
