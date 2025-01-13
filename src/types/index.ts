export interface RecommendationRequest {
  startingPoint: string;
  tripType: string[];
  travelers: number;
  month: string;
  specificDates: {
    start: string;
    end: string;
  };
  duration: number;
  budgetPerPerson: number;
  isInternational: boolean;
}
