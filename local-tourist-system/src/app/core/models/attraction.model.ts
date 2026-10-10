export type AttractionCategory = string;

export interface Attraction {
  id: number;
  name: string;
  category: AttractionCategory;
  description: string;
  openingHours: string;
  travelTips: string;
  bestVisitMonths: number[];
  distanceKm: number;
  /** Ordered image URLs from the API (SortOrder ascending). */
  imageUrls: string[];
  latitude: number;
  longitude: number;
}

export type AttractionFormModel = Omit<Attraction, 'id'> & { id?: number };

/** First image for cards / thumbnails. */
export function primaryImageUrl(attraction: Pick<Attraction, 'imageUrls'>): string {
  return (
    attraction.imageUrls?.find((url) => !!url?.trim()) ??
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1200&q=80'
  );
}
