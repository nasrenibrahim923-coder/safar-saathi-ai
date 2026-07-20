export type Interest = "Nature" | "History" | "Food" | "Adventure" | "Religious Sites" | "Beaches";
export type GroupSize = "Solo" | "Couple" | "Friends group" | "Family";

export interface TripInput {
  startCity: string;
  destination: string;
  days: number;
  budgetPKR: number;
  interests: Interest[];
  groupSize: GroupSize;
}

export interface DayPlan {
  day: number;
  title: string;
  places: { name: string; description: string }[];
  activities: string[];
  transport: { description: string; costPKR: number };
  food: { description: string; costPKR: number };
  stay: { description: string; costPKR: number };
  totalCostPKR: number;
}

export interface Itinerary {
  destinationResolved: string;
  summary: string;
  bestTimeToVisit: string;
  totalEstimatedCostPKR: number;
  budgetTips: string[];
  packingChecklist: string[];
  days: DayPlan[];
}

export interface SavedTrip {
  id: string;
  createdAt: number;
  input: TripInput;
  itinerary: Itinerary;
}

export const PAKISTANI_CITIES = [
  "Karachi", "Lahore", "Islamabad", "Rawalpindi", "Faisalabad", "Multan",
  "Peshawar", "Quetta", "Hyderabad", "Sialkot", "Gujranwala", "Bahawalpur",
];

export const DESTINATIONS = [
  "Surprise Me",
  "Hunza Valley", "Skardu", "Naran & Kaghan", "Swat Valley", "Fairy Meadows",
  "Murree & Galiyat", "Neelum Valley", "Chitral", "Gwadar", "Karachi Coast",
  "Lahore (Cultural)", "Multan", "Islamabad & Margalla", "Peshawar & Khyber",
];

export const INTERESTS: Interest[] = ["Nature", "History", "Food", "Adventure", "Religious Sites", "Beaches"];
export const GROUP_SIZES: GroupSize[] = ["Solo", "Couple", "Friends group", "Family"];