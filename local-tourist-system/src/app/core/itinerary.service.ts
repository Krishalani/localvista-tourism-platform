import { Injectable, computed, signal } from '@angular/core';
import { Attraction } from './models';
import { readSession, writeSession } from './session-store';

const STORAGE_KEY = 'one-day-plan';

/** The tourist's one-day visit plan (FR-10 to FR-13), kept for the current browser session. */
@Injectable({ providedIn: 'root' })
export class ItineraryService {
  private readonly stops = signal<Attraction[]>(readSession<Attraction[]>(STORAGE_KEY) ?? []);

  readonly items = this.stops.asReadonly();
  readonly count = computed(() => this.stops().length);

  contains(attractionId: number): boolean {
    return this.stops().some((a) => a.id === attractionId);
  }

  /** Adds the attraction to the end of the plan. Returns false when it is already there (FR-13). */
  add(attraction: Attraction): boolean {
    if (this.contains(attraction.id)) {
      return false;
    }
    this.save([...this.stops(), attraction]);
    return true;
  }

  remove(attractionId: number): void {
    this.save(this.stops().filter((a) => a.id !== attractionId));
  }

  /** Moves a stop one place earlier (-1) or later (+1) in the visiting order. */
  move(attractionId: number, direction: -1 | 1): void {
    const stops = [...this.stops()];
    const from = stops.findIndex((a) => a.id === attractionId);
    const to = from + direction;
    if (from < 0 || to < 0 || to >= stops.length) {
      return;
    }
    [stops[from], stops[to]] = [stops[to], stops[from]];
    this.save(stops);
  }

  clear(): void {
    this.save([]);
  }

  private save(stops: Attraction[]): void {
    this.stops.set(stops);
    writeSession(STORAGE_KEY, stops.length ? stops : null);
  }
}
