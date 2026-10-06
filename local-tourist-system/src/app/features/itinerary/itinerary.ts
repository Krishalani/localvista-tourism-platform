import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ItineraryService } from '../../core/services/itinerary.service';

@Component({
  selector: 'app-itinerary',
  imports: [RouterLink],
  templateUrl: './itinerary.html',
  styleUrl: './itinerary.css',
})
export class ItineraryPage {
  protected readonly itinerary = inject(ItineraryService);

  protected readonly totalDistanceKm = computed(() =>
    Number(
      this.itinerary
        .items()
        .reduce((sum, item) => sum + item.distanceKm, 0)
        .toFixed(1),
    ),
  );

  protected readonly categories = computed(() => {
    const set = new Set(this.itinerary.items().map((item) => item.category));
    return [...set];
  });

  remove(id: number): void {
    this.itinerary.remove(id);
  }

  clear(): void {
    this.itinerary.clear();
  }
}
