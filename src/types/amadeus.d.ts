declare module 'amadeus' {
    export default class Amadeus {
      constructor(options: {
        clientId: string;
        clientSecret: string;
      });
  
      shopping: {
        flightDestinations: {
          get(params: {
            origin: string;
            oneWay?: boolean;
            nonStop?: boolean;
            maxPrice?: number;
          }): Promise<{
            data: Array<{
              destination: string;
              price: {
                total: string;
              };
              departureDate: string;
              returnDate: string;
              airline: string;
            }>;
          }>;
        };
      };
    }
  }
  