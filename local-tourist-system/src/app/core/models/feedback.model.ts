export interface FeedbackCreate {
  displayName: string;
  rating: number;
  comment: string;
}

export interface AttractionFeedback {
  id: number;
  attractionId: number;
  attractionName: string;
  category: string;
  displayName: string;
  rating: number;
  comment: string;
  createdAtUtc: string;
}

export interface FeedbackSummary {
  averageRating: number;
  reviewCount: number;
  reviews: AttractionFeedback[];
}

export interface AttractionFeedbackSummary extends FeedbackSummary {
  attractionId: number;
  attractionName: string;
  category: string;
}
