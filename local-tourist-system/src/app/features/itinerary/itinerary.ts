import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Attraction, primaryImageUrl } from '../../core/models/attraction.model';
import { AttractionService } from '../../core/services/attraction.service';
import { ItineraryService } from '../../core/services/itinerary.service';

type NearbyAttraction = Attraction & { nearbyDistanceKm: number };

@Component({
  selector: 'app-itinerary',
  imports: [RouterLink],
  templateUrl: './itinerary.html',
  styleUrl: './itinerary.css',
})
export class ItineraryPage {
  protected readonly itinerary = inject(ItineraryService);
  private readonly attractionService = inject(AttractionService);
  protected readonly primaryImageUrl = primaryImageUrl;
  private readonly allAttractions = signal<Attraction[]>([]);

  protected readonly nearbyPlaces = computed<NearbyAttraction[]>(() => {
    const stops = this.itinerary.items();
    if (!stops.length) {
      return [];
    }
    const plannedIds = new Set(stops.map((stop) => stop.id));

    return this.allAttractions()
      .filter((place) => !plannedIds.has(place.id))
      .map((place) => ({
        ...place,
        nearbyDistanceKm: Math.min(
          ...stops.map((stop) => this.distanceBetweenKm(
            stop.latitude,
            stop.longitude,
            place.latitude,
            place.longitude,
          )),
        ),
      }))
      .sort((a, b) => a.nearbyDistanceKm - b.nearbyDistanceKm)
      .slice(0, 4);
  });

  constructor() {
    void this.attractionService
      .query()
      .then((places) => this.allAttractions.set(places))
      .catch(() => this.allAttractions.set([]));
  }

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

  moveUp(id: number): void {
    this.itinerary.moveUp(id);
  }

  moveDown(id: number): void {
    this.itinerary.moveDown(id);
  }

  clear(): void {
    this.itinerary.clear();
  }

  addNearby(id: number, event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.itinerary.add(id);
  }

  private distanceBetweenKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const toRadians = (degrees: number) => degrees * Math.PI / 180;
    const latitudeDelta = toRadians(lat2 - lat1);
    const longitudeDelta = toRadians(lon2 - lon1);
    const haversine = Math.sin(latitudeDelta / 2) ** 2 +
      Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
      Math.sin(longitudeDelta / 2) ** 2;

    return 6371 * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
  }
}
