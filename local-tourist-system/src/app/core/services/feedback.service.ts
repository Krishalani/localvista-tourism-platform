import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  AttractionFeedback,
  AttractionFeedbackSummary,
  FeedbackCreate,
  FeedbackSummary,
} from '../models/feedback.model';

@Injectable({ providedIn: 'root' })
export class FeedbackService {
  private readonly http = inject(HttpClient);

  getForAttraction(attractionId: number): Promise<FeedbackSummary> {
    return firstValueFrom(
      this.http.get<FeedbackSummary>(`${environment.apiBaseUrl}/attractions/${attractionId}/feedback`),
    );
  }

  submit(attractionId: number, feedback: FeedbackCreate): Promise<AttractionFeedback> {
    return firstValueFrom(
      this.http.post<AttractionFeedback>(
        `${environment.apiBaseUrl}/attractions/${attractionId}/feedback`,
        feedback,
      ),
    );
  }

  getAdminFeedback(): Promise<AttractionFeedbackSummary[]> {
    return firstValueFrom(
      this.http.get<AttractionFeedbackSummary[]>(`${environment.apiBaseUrl}/admin/feedback`),
    );
  }
}
