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
exports.searchDestinations = searchDestinations;
const amadeus_1 = __importDefault(require("amadeus"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
console.log('Initializing Amadeus client...');
// Check if the environment variables are defined, and assert types
const clientId = process.env.AMADEUS_API_KEY;
const clientSecret = process.env.AMADEUS_API_SECRET;
// Perform checks or assertions to ensure the values are not undefined or null
if (!clientId || !clientSecret) {
    throw new Error('Missing AMADEUS_API_KEY or AMADEUS_API_SECRET in environment variables');
}
const amadeus = new amadeus_1.default({
    clientId,
    clientSecret
});
function searchDestinations(origin, maxPrice) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(`Searching flights from ${origin} with max price ${maxPrice}`);
        try {
            console.log('Making Amadeus API call...');
            const response = yield amadeus.shopping.flightDestinations.get({
                origin,
                oneWay: false,
                nonStop: false,
                maxPrice: maxPrice
            });
            return response.data.map((dest) => ({
                destination: dest.destination,
                price: dest.price.total,
                departureDate: dest.departureDate,
                returnDate: dest.returnDate,
                airline: dest.airline
            }));
        }
        catch (error) {
            console.error('Amadeus API error:', error);
            throw error;
        }
    });
}
