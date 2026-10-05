import { Component, computed, inject, input, numberAttribute, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { switchMap } from 'rxjs';
import { GOOGLE_MAPS_EMBED_KEY } from '../../core/api.config';
import { AttractionService } from '../../core/attraction.service';
import { FallbackImage } from '../../core/fallback-image';
import { ItineraryService } from '../../core/itinerary.service';
import { LOADING, Loadable, toLoadable } from '../../core/loadable';
import { Attraction } from '../../core/models';

@Component({
  selector: 'app-attraction-detail',
  imports: [RouterLink, FallbackImage],
  templateUrl: './attraction-detail.html',
})
export class AttractionDetail {
  private readonly api = inject(AttractionService);
  private readonly sanitizer = inject(DomSanitizer);
  protected readonly itinerary = inject(ItineraryService);

  /** Route parameter, bound by the router. */
  readonly id = input.required({ transform: numberAttribute });

  protected readonly result = toSignal(
    toObservable(this.id).pipe(switchMap((id) => toLoadable(this.api.getById(id)))),
    { initialValue: LOADING as Loadable<Attraction> },
  );

  protected readonly attraction = computed(() => {
    const result = this.result();
    return result.status === 'ready' ? result.data : null;
  });

  protected readonly hasLocation = computed(() => {
    const attraction = this.attraction();
    return attraction !== null && attraction.latitude !== null && attraction.longitude !== null;
  });

  /** Embedded Google Map centred on the attraction (FR-08). */
  protected readonly mapUrl = computed<SafeResourceUrl | null>(() => {
    const attraction = this.attraction();
    if (!attraction || !this.hasLocation()) {
      return null;
    }
    const position = `${attraction.latitude},${attraction.longitude}`;
    const url = GOOGLE_MAPS_EMBED_KEY
      ? `https://www.google.com/maps/embed/v1/place?key=${GOOGLE_MAPS_EMBED_KEY}&q=${position}&zoom=14`
      : `https://www.google.com/maps?q=${position}&z=14&output=embed`;
    // Safe to trust: the URL is built from a fixed Google host and numeric coordinates only.
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  });

  protected readonly directionsUrl = computed(() => {
    const attraction = this.attraction();
    return attraction && this.hasLocation()
      ? `https://www.google.com/maps/dir/?api=1&origin=Kandy,+Sri+Lanka&destination=${attraction.latitude},${attraction.longitude}`
      : null;
  });

  protected readonly mapFailed = signal(false);
  protected readonly notice = signal('');

  protected addToPlan(attraction: Attraction): void {
    const added = this.itinerary.add(attraction);
    this.notice.set(added ? 'Added to your one-day plan.' : 'This attraction is already in your one-day plan.');
  }

  protected removeFromPlan(attraction: Attraction): void {
    this.itinerary.remove(attraction.id);
    this.notice.set('Removed from your one-day plan.');
  }
}
