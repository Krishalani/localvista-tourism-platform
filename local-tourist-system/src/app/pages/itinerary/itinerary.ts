import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FallbackImage } from '../../core/fallback-image';
import { ItineraryService } from '../../core/itinerary.service';

@Component({
  selector: 'app-itinerary',
  imports: [RouterLink, FallbackImage],
  templateUrl: './itinerary.html',
})
export class Itinerary {
  protected readonly itinerary = inject(ItineraryService);

  /** Google Maps route from Kandy through every stop that has a map location, in plan order. */
  protected readonly routeUrl = computed(() => {
    const points = this.itinerary
      .items()
      .filter((a) => a.latitude !== null && a.longitude !== null)
      .map((a) => `${a.latitude},${a.longitude}`);
    if (points.length === 0) {
      return null;
    }
    const destination = points[points.length - 1];
    const waypoints = points.slice(0, -1).join('|');
    return (
      `https://www.google.com/maps/dir/?api=1&origin=Kandy,+Sri+Lanka&destination=${destination}` +
      (waypoints ? `&waypoints=${encodeURIComponent(waypoints)}` : '')
    );
  });

  protected clear(): void {
    if (confirm('Remove all attractions from your one-day plan?')) {
      this.itinerary.clear();
    }
  }

  protected print(): void {
    window.print();
  }
}
