export type Geo = {
  lat: number;
  lng: number;
};

export interface Place {
  slug: string;
  name: string;
  address: string;
  hours: string;
  verified: boolean;
  tags: string[];
  summary: string;
  geo?: Geo;
  imageUrl?: string;
  gmapsLink?: string;
  phone?: string;
  rating?: number;
  user_ratings_total?: number;
  isOpen?: boolean;
}

export interface ClientPayload {
  action: "go_node" | "open_link" | "open_booking" | "export_itinerary";
  value: string;
  type?: "room" | "table" | "txt" | string;
}

export interface FlowChoice {
  label: string;
  next?: string | null;
  link?: string;
  payload?: ClientPayload;
}

export interface FlowNode {
  text: string;
  choices: FlowChoice[];
}

export type Intent =
  | "nuong"
  | "cafe"
  | "sight"
  | "itinerary"
  | "specific_place"
  | "general_knowledge"
  | "context_followup"
  | "unknown"
  | "stay"
  | "transport"
  | "food"
  | "booking"
  | "recall_itinerary";

export interface Slots {
  near_place?: string;
  area?: string;
  theme?: string;
  days?: number;
  nights?: number;
  groupSize?: number;
  budget?: string;
  traveler_type?: string;
  pace?: string;
  dish?: string;
  name?: string;
  vehicle_type?: string;
  stay_type?: string;
  price_range?: string;
}

export interface NLUResult {
  intent: Intent;
  slots: Slots;
}

export interface ItinerarySlots {
  days?: number;
  nights?: number;
  groupSize?: number;
  budget?: string;
  theme?: string;
  traveler_type?: string;
  pace?: string;
}

export interface BotChoice {
  label: string;
  payload: ClientPayload;
}

export interface BotResponse {
  response: string;
  choices: BotChoice[];
}

export interface SessionContext {
  lastIntent?: Intent;
  lastPickedPlace?: Place;
  lastBotQuestion?: string;
  itinerarySlots?: ItinerarySlots;
  savedItinerary?: string;
  savedItinerarySlots?: ItinerarySlots;
}
