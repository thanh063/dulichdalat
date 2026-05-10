export interface PlaceDetails {
  rating?: number;
  user_ratings_total?: number;
  isOpen?: boolean;
}

const API_KEY = process.env.MAPS_API_KEY || process.env.NEXT_PUBLIC_MAPS_API_KEY;
const PLACES_API_URL = 'https://places.googleapis.com/v1/places';

async function findPlaceId(placeName: string, address: string): Promise<string | null> {
  if (!API_KEY) return null;
  const query = `${placeName}, ${address || ''}, Đà Lạt`;
  try {
    const response = await fetch(`${PLACES_API_URL}:searchText`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': API_KEY,
        'X-Goog-FieldMask': 'places.id',
      },
      body: JSON.stringify({ textQuery: query, maxResultCount: 1 }),
    });
    const data = await response.json();
    return data.places?.[0]?.id || null;
  } catch {
    return null;
  }
}

export async function getPlaceDetails(placeName: string, address: string): Promise<PlaceDetails> {
  const placeId = await findPlaceId(placeName, address);
  if (!placeId) return {};

  try {
    const fieldMask = 'rating,userRatingsTotal,regularOpeningHours';
    const response = await fetch(`${PLACES_API_URL}/${placeId}?fields=${fieldMask}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': API_KEY!,
      },
    });
    const data = await response.json();

    const isOpen = data.regularOpeningHours?.openNow;

    return {
      rating: data.rating,
      user_ratings_total: data.userRatingsTotal,
      isOpen: isOpen,
    };
  } catch {
    return {};
  }
}
