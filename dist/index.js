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
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const groq_1 = require("./services/groq");
const itinerary_1 = __importDefault(require("./routes/itinerary"));
dotenv_1.default.config();
// Check if the GROQ API Key is present
console.log('GROQ API Key present:', !!process.env.GROQ_API_KEY);
const app = (0, express_1.default)();
// CORS configuration - Allow frontend to make requests
app.use((0, cors_1.default)({
    origin: 'http://localhost:5173', // Adjust to match your frontend URL
    methods: ['GET', 'POST'],
    credentials: true // Allows cookies and authentication headers
}));
// Body parser middleware to handle JSON requests
app.use(express_1.default.json());
// Direct route for getting recommendations
app.post('/api/recommendations', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log('Received request with body:', JSON.stringify(req.body, null, 2));
        // Get recommendations from Groq API based on request body
        const recommendations = yield (0, groq_1.getDestinationRecommendations)(req.body);
        res.json({ success: true, recommendations });
    }
    catch (error) {
        // Error handling
        if (error instanceof Error) {
            console.error('Error:', error);
            res.status(500).json({ success: false, error: error.message });
        }
        else {
            console.error('Unknown error:', error);
            res.status(500).json({ success: false, error: 'An unknown error occurred' });
        }
    }
}));
// Mount itinerary routes under '/api/itinerary' or any other desired path
app.use('/api/itinerary', itinerary_1.default);
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
