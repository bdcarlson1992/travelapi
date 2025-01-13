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
exports.getDestinationRecommendations = getDestinationRecommendations;
const openai_1 = __importDefault(require("openai"));
// Initialize the OpenAI client
const openai = new openai_1.default({
    apiKey: process.env.OPENAI_API_KEY, // Ensure you have OPENAI_API_KEY set in your environment
});
// Function to get destination recommendations based on travel preferences
function getDestinationRecommendations(preferences) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        const prompt = createPrompt(preferences);
        try {
            const completion = yield openai.chat.completions.create({
                model: "gpt-4", // Using GPT-4 for better quality responses
                messages: [
                    {
                        role: "system",
                        content: "You are a travel expert that provides detailed, personalized destination recommendations based on user preferences. For each recommendation, provide the city, country, detailed explanation why it matches their preferences, and top activities/experiences."
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                temperature: 0.7,
            });
            // Ensure the response is valid
            const responseContent = (_b = (_a = completion.choices[0]) === null || _a === void 0 ? void 0 : _a.message) === null || _b === void 0 ? void 0 : _b.content;
            if (!responseContent) {
                throw new Error("No content received from OpenAI API.");
            }
            // Parse the response and return it
            return parseResponse(responseContent);
        }
        catch (error) {
            console.error('OpenAI API error:', error);
            throw new Error('Failed to get recommendations from OpenAI');
        }
    });
}
// Function to create the prompt for the OpenAI API based on user preferences
function createPrompt(preferences) {
    return `Please recommend 5 destinations based on these travel preferences:
  - Departing from: ${preferences.startingPoint}
  - Trip types: ${preferences.tripType.join(', ')}
  - Number of travelers: ${preferences.travelers}
  - Dates: ${preferences.specificDates.start} to ${preferences.specificDates.end}
  - Duration: ${preferences.duration} days
  - Budget per person: $${preferences.budgetPerPerson}
  - ${preferences.isInternational ? 'Open to international destinations' : 'Domestic destinations only'}

  For each destination, provide:
  1. City and Country
  2. Why it's perfect for this trip (considering trip type, season, and budget)
  3. Top 3-5 must-do activities or experiences
  4. Best areas to stay
  5. Any special considerations for their travel dates

  Please format each destination consistently for easy parsing.`;
}
// Function to parse the response from OpenAI into structured data
function parseResponse(response) {
    const destinations = [];
    // Split the response into destination blocks assuming they are separated by new lines
    const destinationBlocks = response.split("\n\n");
    destinationBlocks.forEach((block) => {
        var _a;
        const lines = block.split("\n").map(line => line.trim());
        // Regex to capture city, country, and other information
        const cityCountryMatch = (_a = lines[0]) === null || _a === void 0 ? void 0 : _a.match(/([A-Za-z\s]+),\s([A-Za-z\s]+)/);
        if (cityCountryMatch) {
            const city = cityCountryMatch[1];
            const country = cityCountryMatch[2];
            const matchReason = lines[1] || '';
            const activities = lines.slice(2, 7); // Example: the next 5 lines could be activities
            const areasToStay = lines.slice(7, 10); // Example: next 3 lines could be areas to stay
            const specialConsiderations = lines.slice(10).join(" "); // Any remaining lines for special considerations
            destinations.push({
                city,
                country,
                matchReason,
                activities,
                areasToStay,
                specialConsiderations,
            });
        }
    });
    return destinations;
}
