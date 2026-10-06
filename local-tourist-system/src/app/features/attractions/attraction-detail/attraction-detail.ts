import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { AttractionService } from '../../../core/services/attraction.service';
import { ItineraryService } from '../../../core/services/itinerary.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

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
  private readonly sanitizer = inject(DomSanitizer);
  protected readonly itinerary = inject(ItineraryService);

  private readonly id = toSignal(
    this.route.paramMap.pipe(map((p) => Number(p.get('id')))),
    { initialValue: Number(this.route.snapshot.paramMap.get('id')) },
  );

  protected readonly message = signal('');

  protected readonly attraction = computed(() => {
    const id = this.id();
    if (!Number.isFinite(id)) {
      return undefined;
    }
    return this.attractionService.getById(id);
  });

  protected readonly mapUrl = computed((): SafeResourceUrl | null => {
    const a = this.attraction();
    if (!a) {
      return null;
    }
    const url = `https://maps.google.com/maps?q=${a.latitude},${a.longitude}&z=14&output=embed`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  });

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
