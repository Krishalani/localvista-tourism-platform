import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AttractionFeedbackSummary } from '../../../core/models/feedback.model';
import { FeedbackService } from '../../../core/services/feedback.service';

@Component({
  selector: 'app-admin-feedback',
  imports: [RouterLink],
  templateUrl: './admin-feedback.html',
  styleUrl: './admin-feedback.css',
})
export class AdminFeedback implements OnInit {
  private readonly feedbackService = inject(FeedbackService);

  protected readonly groups = signal<AttractionFeedbackSummary[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal('');
  protected readonly reviewCount = computed(() =>
    this.groups().reduce((total, group) => total + group.reviewCount, 0),
  );
  protected readonly averageRating = computed(() => {
    const count = this.reviewCount();
    if (!count) {
      return 0;
    }
    return this.groups().reduce(
      (total, group) => total + group.averageRating * group.reviewCount,
      0,
    ) / count;
  });
  protected readonly ratingOptions = [1, 2, 3, 4, 5];

  ngOnInit(): void {
    void this.load();
  }

  formatDate(value: string): string {
    return new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(new Date(value));
  }

  private async load(): Promise<void> {
    this.loading.set(true);
    this.error.set('');
    try {
      this.groups.set(await this.feedbackService.getAdminFeedback());
    } catch {
      this.error.set('Could not load feedback. Confirm you are signed in as an administrator.');
    } finally {
      this.loading.set(false);
    }
  }
}
