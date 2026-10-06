export type AttractionCategory =
  | 'Religious & Heritage'
  | 'Nature'
  | 'Adventure'
  | 'Museum'
  | 'Viewpoint'
  | 'Recreation'
  | 'Eco Tourism';

export const ATTRACTION_CATEGORIES: AttractionCategory[] = [
  'Religious & Heritage',
  'Nature',
  'Adventure',
  'Museum',
  'Viewpoint',
  'Recreation',
  'Eco Tourism',
];

export interface Attraction {
  id: number;
  name: string;
  category: AttractionCategory;
  description: string;
  openingHours: string;
  travelTips: string;
  distanceKm: number;
  /** One or more image URLs (mock storage — future API will persist these). */
  imageUrls: string[];
  latitude: number;
  longitude: number;
}

export type AttractionFormModel = Omit<Attraction, 'id'> & { id?: number };

/** First image for cards / thumbnails. */
export function primaryImageUrl(attraction: Pick<Attraction, 'imageUrls'>): string {
  return (
    attraction.imageUrls.find((url) => !!url.trim()) ??
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1200&q=80'
  );
}
