import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { getDestinationRecommendations } from './services/groq';
import itineraryRouter from './routes/itinerary';
import { RecommendationRequest } from './types';

dotenv.config();

console.log('GROQ API Key present:', !!process.env.GROQ_API_KEY);

const app = express();

// CORS configuration
app.use(cors({
  origin: (origin, callback) => {
    console.log('Request origin:', origin); // Debug log
    
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      callback(null, true);
      return;
    }
    
    // Define allowed domains
    const allowedDomains = [
      'https://travel-frontend-self.vercel.app', // Your main frontend domain
      'http://localhost:5173',                   // Local development
      /https:\/\/.*\.vercel\.app$/              // All vercel.app preview deployments
    ];

    // Check if the origin is allowed
    const isAllowed = allowedDomains.some(domain => {
      if (domain instanceof RegExp) {
        return domain.test(origin);
      }
      return domain === origin;
    });

    if (isAllowed) {
      console.log('Allowing origin:', origin);
      callback(null, true);
      return;
    }
    
    console.log('Blocked origin:', origin);
    callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Debug middleware to log all requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Body parser middleware
app.use(express.json());

// Route: Recommendations API
app.post(
  '/api/recommendations',
  async (req: Request<{}, {}, RecommendationRequest>, res: Response) => {
    try {
      console.log('Received request with body:', JSON.stringify(req.body, null, 2));
      const recommendations = await getDestinationRecommendations(req.body);
      res.json({ success: true, recommendations });
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, error: error.message });
      } else {
        console.error('Unknown error:', error);
        res.status(500).json({ success: false, error: 'An unknown error occurred' });
      }
    }
  }
);

app.use('/api/itinerary', itineraryRouter);

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: Function) => {
  console.error('Global error handler:', err);
  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === 'development' ? err.message : 'An internal server error occurred'
  });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('CORS configuration active for:');
  console.log('- travel-frontend-self.vercel.app');
  console.log('- localhost:5173');
  console.log('- All vercel.app preview deployments');
});

export default app;