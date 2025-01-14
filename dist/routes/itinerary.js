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
// Define the route with proper type for the request body
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('Received itinerary request:', {
        body: req.body,
        preferences: req.body.preferences,
        destination: req.body.destination
    });
    try {
        const { preferences, destination } = req.body;
        if (!preferences || !destination) {
            res.status(400).json({
                success: false,
                error: 'Missing preferences or destination'
            });
            return; // Exit early if data is missing
        }
        const itinerary = yield (0, groq_1.getDetailedItinerary)(preferences, destination);
        console.log('Generated itinerary:', itinerary);
        res.json({
            success: true,
            itinerary: itinerary ? JSON.parse(itinerary) : null
        });
    }
    catch (error) {
        console.error('Error generating itinerary:', error);
        if (error instanceof Error) {
            res.status(500).json({
                success: false,
                error: error.message || 'An error occurred'
            });
        }
        else {
            res.status(500).json({
                success: false,
                error: 'An unknown error occurred'
            });
        }
    }
}));
exports.default = router;
