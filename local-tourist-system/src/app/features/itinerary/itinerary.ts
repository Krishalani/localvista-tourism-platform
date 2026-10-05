import { Component, inject } from '@angular/core';
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

  remove(id: number): void {
    this.itinerary.remove(id);
  }

  clear(): void {
    this.itinerary.clear();
  }
}
