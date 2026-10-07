import { Component, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { Attraction, primaryImageUrl } from '../../../core/models/attraction.model';
import { AttractionService } from '../../../core/services/attraction.service';
import { ItineraryService } from '../../../core/services/itinerary.service';
import { MapPreviewService } from '../../../core/services/map-preview.service';

@Component({
  selector: 'app-attraction-detail',
  imports: [RouterLink],
  templateUrl: './attraction-detail.html',
  styleUrl: './attraction-detail.css',
})
export class AttractionDetail {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly attractionService = inject(AttractionService);
  private readonly mapPreview = inject(MapPreviewService);
  protected readonly itinerary = inject(ItineraryService);

  private readonly id = toSignal(
    this.route.paramMap.pipe(map((p) => Number(p.get('id')))),
    { initialValue: Number(this.route.snapshot.paramMap.get('id')) },
  );

  protected readonly message = signal('');
  protected readonly activeImageIndex = signal(0);
  protected readonly attraction = signal<Attraction | undefined>(undefined);

  protected readonly activeImage = computed(() => {
    const a = this.attraction();
    if (!a) {
      return '';
    }
    const urls = a.imageUrls.filter((url) => !!url.trim());
    if (urls.length === 0) {
      return primaryImageUrl(a);
    }
    const index = Math.min(this.activeImageIndex(), urls.length - 1);
    return urls[index];
  });

  protected readonly mapUrl = computed(() => {
    const a = this.attraction();
    if (!a) {
      return null;
    }
    return this.mapPreview.embedUrl(a.latitude, a.longitude);
  });

  constructor() {
    effect(() => {
      const id = this.id();
      if (!Number.isFinite(id)) {
        this.attraction.set(undefined);
        return;
      }
      void this.attractionService.getById(id).then((item) => {
        this.attraction.set(item);
        this.activeImageIndex.set(0);
      });
    });
  }

  selectImage(index: number): void {
    this.activeImageIndex.set(index);
  }

  goBack(): void {
    void this.router.navigate(['/'], {
      queryParamsHandling: 'preserve',
    });
  }

  addToPlan(): void {
    const a = this.attraction();
    if (!a) {
      return;
    }
    const added = this.itinerary.add(a.id);
    this.message.set(
      added ? 'Added to your one-day plan.' : 'Already in your one-day plan.',
    );
  }

  removeFromPlan(): void {
    const a = this.attraction();
    if (!a) {
      return;
    }
    this.itinerary.remove(a.id);
    this.message.set('Removed from your one-day plan.');
  }
}
