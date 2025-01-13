import Amadeus from 'amadeus';
import dotenv from 'dotenv';

dotenv.config();

console.log('Initializing Amadeus client...');

// Check if the environment variables are defined, and assert types
const clientId = process.env.AMADEUS_API_KEY;
const clientSecret = process.env.AMADEUS_API_SECRET;

// Perform checks or assertions to ensure the values are not undefined or null
if (!clientId || !clientSecret) {
  throw new Error('Missing AMADEUS_API_KEY or AMADEUS_API_SECRET in environment variables');
}

const amadeus = new Amadeus({
  clientId,
  clientSecret
});

export async function searchDestinations(origin: string, maxPrice: number) {
  console.log(`Searching flights from ${origin} with max price ${maxPrice}`);
  
  try {
    console.log('Making Amadeus API call...');
    const response = await amadeus.shopping.flightDestinations.get({
      origin,
      oneWay: false,
      nonStop: false,
      maxPrice: maxPrice
    });
    
    return response.data.map((dest: any) => ({
      destination: dest.destination,
      price: dest.price.total,
      departureDate: dest.departureDate,
      returnDate: dest.returnDate,
      airline: dest.airline
    }));
  } catch (error) {
    console.error('Amadeus API error:', error);
    throw error;
  }
}
