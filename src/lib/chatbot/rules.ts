import placesData from "@/data/dalat.json";
import { normalizeText } from "./text";
import type { Geo, Intent, ItinerarySlots, Place, Slots } from "./types";

const allPlaces = placesData as Place[];
const DALAT_CENTER: Geo = { lat: 11.9416, lng: 108.4583 };

// Ranking weights (tweak these to tune ranking behavior)
const BASE_RATING_MULTIPLIER = 10;
const WEIGHTS = {
  cafe: 120,
  cafe_view: 35,
  cafe_checkin: 12,
  cafe_sight: 4,
  cafe_food: 2,

  stay: 140,
  stay_homestay: 50,
  stay_hotel: 35,
  stay_luxury: 12,
  stay_checkin: 8,

  food: 130,
  food_pho: 40,
  food_breakfast: 25,
  food_night: 10,
  food_cafe: 3,

  nuong: 130,
  nuong_lau: 20,
  nuong_buffet: 12,
  nuong_night: 8,

  sight: 110,
  sight_history: 40,
  sight_landmark: 35,
  sight_nature: 30,
  sight_checkin: 12,
  sight_cafe_penalty: -12,
  sight_food_penalty: -20,

  theme_cafe: 40,
  theme_songao_checkin: 20,
  theme_amthuc: 40,
  theme_thiennhien: 30,
  theme_lichsu: 30,
  theme_thamquan: 25,

  slot_dish: 25,
  boost_view: 35,
  boost_budget_cheap: 35,
  boost_center: 35,
};

function distanceKm(origin: Geo, target: Geo) {
  const earthRadius = 6371;
  const dLat = ((target.lat - origin.lat) * Math.PI) / 180;
  const dLng = ((target.lng - origin.lng) * Math.PI) / 180;
  const lat1 = (origin.lat * Math.PI) / 180;
  const lat2 = (target.lat * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLng / 2) * Math.sin(dLng / 2) * Math.cos(lat1) * Math.cos(lat2);

  return 2 * earthRadius * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function uniquePlaces(items: Place[]) {
  const seen = new Set<string>();

  return items.filter((place) => {
    if (seen.has(place.slug)) {
      return false;
    }

    seen.add(place.slug);
    return true;
  });
}

function scoreIntentMatch(place: Place, intent: Intent, slots: Slots) {
  const normalizedText = normalizeText(`${place.name} ${place.summary} ${place.tags.join(" ")}`);
  let score = typeof place.rating === "number" ? place.rating * BASE_RATING_MULTIPLIER : 0;

  if (intent === "cafe") {
    if (place.tags.includes("cafe")) score += WEIGHTS.cafe;
    if (place.tags.includes("view-doi") || place.tags.includes("scenic") || place.tags.includes("romantic")) score += WEIGHTS.cafe_view;
    if (place.tags.includes("check-in")) score += WEIGHTS.cafe_checkin;
    if (place.tags.includes("sight")) score += WEIGHTS.cafe_sight;
    if (place.tags.includes("food")) score += WEIGHTS.cafe_food;
  }

  if (intent === "stay") {
    if (place.tags.includes("stay")) score += WEIGHTS.stay;
    if (place.tags.includes("homestay")) score += WEIGHTS.stay_homestay;
    if (place.tags.includes("hotel")) score += WEIGHTS.stay_hotel;
    if (place.tags.includes("luxury")) score += WEIGHTS.stay_luxury;
    if (place.tags.includes("check-in")) score += WEIGHTS.stay_checkin;
  }

  if (intent === "food") {
    if (place.tags.includes("food")) score += WEIGHTS.food;
    if (place.tags.includes("pho") || place.tags.includes("bun") || place.tags.includes("com")) score += WEIGHTS.food_pho;
    if (place.tags.includes("breakfast")) score += WEIGHTS.food_breakfast;
    if (place.tags.includes("night")) score += WEIGHTS.food_night;
    if (place.tags.includes("cafe")) score += WEIGHTS.food_cafe;
  }

  if (intent === "nuong") {
    if (place.tags.includes("nuong")) score += WEIGHTS.nuong;
    if (place.tags.includes("lau")) score += WEIGHTS.nuong_lau;
    if (place.tags.includes("buffet")) score += WEIGHTS.nuong_buffet;
    if (place.tags.includes("night")) score += WEIGHTS.nuong_night;
  }

  if (intent === "sight") {
    if (place.tags.includes("sight")) score += WEIGHTS.sight;
    if (place.tags.includes("history")) score += WEIGHTS.sight_history;
    if (place.tags.includes("landmark")) score += WEIGHTS.sight_landmark;
    if (place.tags.includes("nature") || place.tags.includes("scenic")) score += WEIGHTS.sight_nature;
    if (place.tags.includes("check-in")) score += WEIGHTS.sight_checkin;
    if (place.tags.includes("cafe")) score += WEIGHTS.sight_cafe_penalty;
    if (place.tags.includes("food") || place.tags.includes("nuong")) score += WEIGHTS.sight_food_penalty;
  }

  if (slots.theme) {
    const theme = normalizeText(slots.theme);
    if (theme.includes("cafe") && place.tags.includes("cafe")) score += WEIGHTS.theme_cafe;
    if (theme.includes("song ao") && place.tags.includes("check-in")) score += WEIGHTS.theme_songao_checkin;
    if (theme.includes("am thuc") && place.tags.includes("food")) score += WEIGHTS.theme_amthuc;
    if (theme.includes("thien nhien") && (place.tags.includes("nature") || place.tags.includes("scenic"))) score += WEIGHTS.theme_thiennhien;
    if (theme.includes("lich su") && place.tags.includes("history")) score += WEIGHTS.theme_lichsu;
    if (theme.includes("tham quan") && place.tags.includes("sight")) score += WEIGHTS.theme_thamquan;
  }

  // Boosts for view/cheap/center preferences
  if (slots.theme) {
    const theme = normalizeText(slots.theme);
    if ((theme.includes("view") || theme.includes("view dep") || theme.includes("song ao") || theme.includes("song ảo")) && (place.tags.includes("view-doi") || place.tags.includes("scenic") || place.tags.includes("check-in") || place.tags.includes("romantic"))) {
      score += WEIGHTS.boost_view;
    }
  }

  if (slots.budget) {
    const budget = normalizeText(String(slots.budget));
    if ((budget.includes("tiet kiem") || budget.includes("gia re") || budget.includes("re")) && place.tags.includes("gia_re")) {
      score += WEIGHTS.boost_budget_cheap;
    }
  }

  // "Gần trung tâm" boost based on distance to DALAT_CENTER when requested
  try {
    if (slots.area) {
      const area = normalizeText(String(slots.area));
      if (area.includes("trung tam") || area.includes("gan trung tam") || area.includes("gần trung tâm") || area.includes("gan trung tam")) {
        if (place.geo) {
          const dist = distanceKm(DALAT_CENTER, place.geo as Geo);
          if (dist <= 2.5) {
            score += WEIGHTS.boost_center;
          }
        }
      }
    }
  } catch (_e) {
    // ignore geo errors
  }

  if (slots.dish) {
    const dish = normalizeText(slots.dish);
    if (normalizedText.includes(dish)) score += 20;
  }

  return score;
}

function filterByIntent(intent: Intent, places: Place[]) {
  const tagGroups: Partial<Record<Intent, string[]>> = {
    nuong: ["nuong", "food", "lau", "buffet"],
    cafe: ["cafe"],
    sight: ["sight", "history", "landmark", "nature", "scenic", "check-in"],
    food: ["food", "pho", "bun", "com", "breakfast"],
    stay: ["stay", "homestay", "hotel"],
    transport: ["transport", "bike_rental"],
  };

  const tags = tagGroups[intent] ?? [];
  const filtered = places.filter((place) => tags.some((tag) => place.tags.includes(tag)));
  return filtered.length > 0 ? filtered : places;
}

export function findPlace(query: string) {
  const normalizedQuery = normalizeText(query);

  return allPlaces.find((place) => {
    const normalizedPlace = normalizeText(`${place.name} ${place.address} ${place.summary}`);
    return normalizedPlace.includes(normalizedQuery) || normalizedQuery.includes(normalizedPlace);
  });
}

export function recommend(intent: Intent, slots: Slots, origin?: Geo): Place[] {
  let results = [...allPlaces];

  results = filterByIntent(intent, results);

  if (slots.theme) {
    const theme = normalizeText(slots.theme);

    if (theme.includes("cafe") || theme.includes("song ao")) {
      results = results.filter((place) => place.tags.includes("cafe") || place.tags.includes("check-in"));
    } else if (theme.includes("thien nhien") || theme.includes("nature")) {
      results = results.filter((place) => place.tags.includes("nature") || place.tags.includes("scenic") || place.tags.includes("sight"));
    } else if (theme.includes("am thuc") || theme.includes("an uong")) {
      results = results.filter((place) => place.tags.includes("food") || place.tags.includes("nuong") || place.tags.includes("pho") || place.tags.includes("bun") || place.tags.includes("com") || place.tags.includes("breakfast"));
    } else if (theme.includes("lich su") || theme.includes("history") || theme.includes("tham quan")) {
      results = results.filter((place) => place.tags.includes("history") || place.tags.includes("landmark") || place.tags.includes("sight"));
    }
  }

  if (slots.dish) {
    const dish = normalizeText(slots.dish);
    results = results.filter((place) => normalizeText(`${place.name} ${place.summary} ${place.tags.join(" ")}`).includes(dish));
  }

  if (slots.area && origin) {
    const area = normalizeText(slots.area);
    results = results.filter((place) => {
      if (!place.geo) {
        return false;
      }

      const dist = distanceKm(origin, place.geo);

      if (area.includes("gan")) {
        return dist <= 3;
      }

      if (area.includes("ngoai thanh")) {
        return dist >= 8;
      }

      return true;
    });
  }

  if (slots.near_place) {
    const nearPlace = findPlace(slots.near_place);
    if (nearPlace?.geo) {
      results.sort((left, right) => {
        if (!left.geo) {
          return 1;
        }

        if (!right.geo) {
          return -1;
        }

        return distanceKm(nearPlace.geo as Geo, left.geo) - distanceKm(nearPlace.geo as Geo, right.geo);
      });
    }
  }

  results = [...results].sort((left, right) => scoreIntentMatch(right, intent, slots) - scoreIntentMatch(left, intent, slots));

  if (origin) {
    results.sort((left, right) => {
      if (!left.geo) {
        return 1;
      }

      if (!right.geo) {
        return -1;
      }

      return distanceKm(origin, left.geo) - distanceKm(origin, right.geo);
    });
  }

  return uniquePlaces(results).slice(0, 4);
}

export function itineraryFlexible(slots: ItinerarySlots): Place[] {
  let sightPlaces = allPlaces.filter((place) =>
    place.tags.includes("sight") ||
    place.tags.includes("history") ||
    place.tags.includes("nature") ||
    place.tags.includes("check-in") ||
    place.tags.includes("landmark"),
  );

  const foodPlaces = allPlaces.filter((place) =>
    place.tags.includes("food") || place.tags.includes("nuong") || place.tags.includes("cafe"),
  );

  if (slots.theme) {
    const theme = normalizeText(slots.theme);

    if (theme.includes("cafe") || theme.includes("song ao")) {
      sightPlaces = sightPlaces.filter((place) => place.tags.includes("check-in") || place.tags.includes("cafe"));
    } else if (theme.includes("thien nhien") || theme.includes("nature")) {
      sightPlaces = sightPlaces.filter((place) => place.tags.includes("nature") || place.tags.includes("scenic") || place.tags.includes("sight"));
    } else if (theme.includes("lich su") || theme.includes("history")) {
      sightPlaces = sightPlaces.filter((place) => place.tags.includes("history") || place.tags.includes("landmark") || place.tags.includes("architecture"));
    }
  }

  if (slots.groupSize && slots.groupSize >= 6) {
    sightPlaces = sightPlaces.filter((place) => place.tags.includes("spacious") || place.tags.includes("large-group") || place.tags.includes("check-in"));
  }

  const pace = normalizeText(slots.pace ?? "");
  const sightLimit = pace.includes("thong tha") ? 4 : pace.includes("nhieu noi") ? 8 : 6;
  const foodLimit = slots.days ? Math.max(2, Math.ceil(slots.days * 1.5)) : 4;

  return uniquePlaces([...sightPlaces.slice(0, sightLimit), ...foodPlaces.slice(0, foodLimit)]);
}
