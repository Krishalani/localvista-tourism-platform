import { Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Attraction } from '../models/attraction.model';
import { AttractionService } from './attraction.service';

/** Browser-session only — cleared when the tab/window session ends (not a saved account plan). */
const STORAGE_KEY = 'localvista.itinerary.ids';

@Injectable({ providedIn: 'root' })
export class ItineraryService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly attractionService = inject(AttractionService);
  private readonly idsSignal = signal<number[]>(this.readIds());

  readonly ids = this.idsSignal.asReadonly();
  readonly count = computed(() => this.idsSignal().length);

  readonly items = computed(() => {
    const ids = this.idsSignal();
    return ids
      .map((id) => this.attractionService.getById(id))
      .filter((a): a is Attraction => !!a);
  });

  has(id: number): boolean {
    return this.idsSignal().includes(id);
  }

  /** Add once only. Returns false if already present. */
  add(id: number): boolean {
    if (this.has(id)) {
      return false;
    }
    this.idsSignal.update((ids) => {
      const next = [...ids, id];
      this.persist(next);
      return next;
    });
    return true;
  }

  remove(id: number): void {
    this.idsSignal.update((ids) => {
      const next = ids.filter((x) => x !== id);
      this.persist(next);
      return next;
    });
  }

  /** Reorder: move stop toward the start of the day. */
  moveUp(id: number): void {
    this.idsSignal.update((ids) => {
      const index = ids.indexOf(id);
      if (index <= 0) {
        return ids;
      }
      const next = [...ids];
      [next[index - 1], next[index]] = [next[index], next[index - 1]];
      this.persist(next);
      return next;
    });
  }

  /** Reorder: move stop toward the end of the day. */
  moveDown(id: number): void {
    this.idsSignal.update((ids) => {
      const index = ids.indexOf(id);
      if (index < 0 || index >= ids.length - 1) {
        return ids;
      }
      const next = [...ids];
      [next[index], next[index + 1]] = [next[index + 1], next[index]];
      this.persist(next);
      return next;
    });
  }

  clear(): void {
    this.idsSignal.set([]);
    this.persist([]);
  }

  private readIds(): number[] {
    if (!isPlatformBrowser(this.platformId)) {
      return [];
    }
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (!raw) {
        // Migrate away from older localStorage plans so they do not look like saved accounts.
        localStorage.removeItem(STORAGE_KEY);
        return [];
      }
      const parsed = JSON.parse(raw) as unknown;
      if (!Array.isArray(parsed)) {
        return [];
      }
      return parsed.filter((v): v is number => typeof v === 'number');
    } catch {
      return [];
    }
  }

  private persist(ids: number[]): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
    localStorage.removeItem(STORAGE_KEY);
  }
}
