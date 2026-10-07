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
  private readonly itemsSignal = signal<Attraction[]>([]);

  readonly ids = this.idsSignal.asReadonly();
  readonly count = computed(() => this.idsSignal().length);
  readonly items = this.itemsSignal.asReadonly();

  constructor() {
    void this.refreshItems();
  }

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
    void this.refreshItems();
    return true;
  }

  remove(id: number): void {
    this.idsSignal.update((ids) => {
      const next = ids.filter((x) => x !== id);
      this.persist(next);
      return next;
    });
    void this.refreshItems();
  }

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
    void this.refreshItems();
  }

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
    void this.refreshItems();
  }

  clear(): void {
    this.idsSignal.set([]);
    this.persist([]);
    this.itemsSignal.set([]);
  }

  async refreshItems(): Promise<void> {
    const ids = this.idsSignal();
    const cached = this.attractionService.attractions();
    const resolved: Attraction[] = [];

    for (const id of ids) {
      const fromCache = cached.find((a) => a.id === id);
      if (fromCache) {
        resolved.push(fromCache);
        continue;
      }
      const fromApi = await this.attractionService.getById(id);
      if (fromApi) {
        resolved.push(fromApi);
      }
    }

    this.itemsSignal.set(resolved);
  }

  private readIds(): number[] {
    if (!isPlatformBrowser(this.platformId)) {
      return [];
    }
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (!raw) {
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
