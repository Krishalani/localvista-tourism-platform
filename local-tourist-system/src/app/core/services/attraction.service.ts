import { Injectable, computed, signal } from '@angular/core';
import { MOCK_ATTRACTIONS } from '../data/mock-attractions';
import {
  Attraction,
  AttractionCategory,
  AttractionFormModel,
} from '../models/attraction.model';

export interface AttractionQuery {
  search?: string;
  categories?: AttractionCategory[];
}

@Injectable({ providedIn: 'root' })
export class AttractionService {
  private readonly attractionsSignal = signal<Attraction[]>(
    structuredClone(MOCK_ATTRACTIONS),
  );
  private nextId =
    Math.max(...MOCK_ATTRACTIONS.map((a) => a.id), 0) + 1;

  readonly attractions = this.attractionsSignal.asReadonly();
  readonly count = computed(() => this.attractionsSignal().length);

  getAll(): Attraction[] {
    return this.attractionsSignal();
  }

  getById(id: number): Attraction | undefined {
    return this.attractionsSignal().find((a) => a.id === id);
  }

  search(query: AttractionQuery): Attraction[] {
    const term = query.search?.trim().toLowerCase() ?? '';
    const categories = query.categories ?? [];

    return this.attractionsSignal().filter((attraction) => {
      const matchesSearch =
        !term || attraction.name.toLowerCase().includes(term);
      const matchesCategory =
        categories.length === 0 || categories.includes(attraction.category);
      return matchesSearch && matchesCategory;
    });
  }

  add(form: AttractionFormModel): Attraction {
    const created: Attraction = {
      id: this.nextId++,
      name: form.name.trim(),
      category: form.category,
      description: form.description.trim(),
      openingHours: form.openingHours.trim(),
      travelTips: form.travelTips.trim(),
      distanceKm: Number(form.distanceKm),
      imageUrl: form.imageUrl.trim(),
      latitude: Number(form.latitude),
      longitude: Number(form.longitude),
    };
    this.attractionsSignal.update((list) => [...list, created]);
    return created;
  }

  update(id: number, form: AttractionFormModel): Attraction | undefined {
    let updated: Attraction | undefined;
    this.attractionsSignal.update((list) =>
      list.map((item) => {
        if (item.id !== id) {
          return item;
        }
        updated = {
          ...item,
          name: form.name.trim(),
          category: form.category,
          description: form.description.trim(),
          openingHours: form.openingHours.trim(),
          travelTips: form.travelTips.trim(),
          distanceKm: Number(form.distanceKm),
          imageUrl: form.imageUrl.trim(),
          latitude: Number(form.latitude),
          longitude: Number(form.longitude),
        };
        return updated;
      }),
    );
    return updated;
  }

  delete(id: number): boolean {
    const before = this.attractionsSignal().length;
    this.attractionsSignal.update((list) => list.filter((a) => a.id !== id));
    return this.attractionsSignal().length < before;
  }
}
