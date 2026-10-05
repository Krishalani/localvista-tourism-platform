export interface Category {
  id: number;
  name: string;
}

export interface Attraction {
  id: number;
  name: string;
  categoryId: number;
  categoryName: string;
  description: string;
  openingHours: string | null;
  travelTips: string | null;
  distanceFromKandyKm: number | null;
  imageUrl: string | null;
  latitude: number | null;
  longitude: number | null;
}

/** Body sent when an administrator creates or updates an attraction. */
export type AttractionSave = Omit<Attraction, 'id' | 'categoryName'>;

export interface LoginResponse {
  token: string;
  expiresAtUtc: string;
  username: string;
}

/** Shape of the validation errors returned by the API (RFC 7807 problem details). */
export interface ApiProblem {
  detail?: string;
  errors?: Record<string, string[]>;
}
