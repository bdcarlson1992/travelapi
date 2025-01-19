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
const express_1 = require("express");
const groq_1 = require("../services/groq");
const router = (0, express_1.Router)();
const cleanAndValidateJSON = (jsonString) => {
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
        return JSON.parse(cleanedString);
    }
    catch (error) {
        if (error instanceof Error) {
            console.error('JSON parsing error:', error.message);
            throw new Error(`JSON parsing failed: ${error.message}`);
        }
        throw new Error('JSON parsing failed: Unknown error');
    }
};
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        const rawItinerary = yield (0, groq_1.getDetailedItinerary)(preferences, destination);
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
        }
        catch (parseError) {
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
    }
    catch (error) {
        console.error('General Error:', error);
        const errorMessage = error instanceof Error
            ? error.message
            : 'An unknown error occurred';
        return res.status(500).json({
            success: false,
            error: errorMessage
        });
    }
}));
exports.default = router;
