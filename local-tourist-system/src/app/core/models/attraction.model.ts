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
  imageUrl: string;
  latitude: number;
  longitude: number;
}

export type AttractionFormModel = Omit<Attraction, 'id'> & { id?: number };
