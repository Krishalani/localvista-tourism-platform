export type AttractionCategory = string;

/** Lightweight catalogue / plan-card payload from GET /api/attractions. */
export interface AttractionSummary {
  id: number;
  name: string;
  category: AttractionCategory;
  shortDescription: string;
  openingHours: string;
  bestVisitMonths: number[];
  distanceKm: number;
  /** Ordered image URLs from the API (SortOrder ascending). */
  imageUrls: string[];
  latitude: number;
  longitude: number;
}

/** Full detail payload from GET /api/attractions/{id}. */
export interface AttractionDetail extends AttractionSummary {
  description: string;
  travelTips: string;
  contactPhone?: string | null;
  contactEmail?: string | null;
  websiteUrl?: string | null;
  address?: string | null;
}

/** @deprecated Prefer AttractionSummary or AttractionDetail. Kept as alias for shared card typing. */
export type Attraction = AttractionSummary;

export type AttractionFormModel = Omit<AttractionDetail, 'id'> & { id?: number };

/** First image for cards / thumbnails. */
export function primaryImageUrl(attraction: Pick<AttractionSummary, 'imageUrls'>): string {
  return (
    attraction.imageUrls?.find((url) => !!url?.trim()) ??
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1200&q=80'
  );
}

export function hasContactDetails(
  attraction: Pick<
    AttractionDetail,
    'contactPhone' | 'contactEmail' | 'websiteUrl' | 'address'
  >,
): boolean {
  return !!(
    attraction.contactPhone?.trim() ||
    attraction.contactEmail?.trim() ||
    attraction.websiteUrl?.trim() ||
    attraction.address?.trim()
  );
}
