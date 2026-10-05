import { Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Attraction } from '../models/attraction.model';
import { AttractionService } from './attraction.service';

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

  /** FR-10 / FR-13 — add once only. Returns false if already present. */
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

  /** FR-11 */
  remove(id: number): void {
    this.idsSignal.update((ids) => {
      const next = ids.filter((x) => x !== id);
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
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
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
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  }
}
