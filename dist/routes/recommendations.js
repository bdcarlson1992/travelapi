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
const express_1 = __importDefault(require("express"));
const groq_1 = require("../services/groq"); // Import only the required service
const router = express_1.default.Router();
router.post('/recommendations', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const preferences = req.body;
        console.log('Processing request for:', preferences.startingPoint);
        // Only get recommendations from Groq
        const recommendations = yield (0, groq_1.getDestinationRecommendations)(preferences);
        res.json({
            success: true,
            recommendations,
            query: preferences
        });
    }
    catch (error) {
        console.error('Detailed error:', error);
        // More robust error handling
        if (error instanceof Error) {
            res.status(500).json({
                success: false,
                error: error.message || 'Internal server error',
                details: error.stack
            });
        }
        else {
            res.status(500).json({
                success: false,
                error: 'An unknown error occurred',
            });
        }
    }
}));
exports.default = router;
