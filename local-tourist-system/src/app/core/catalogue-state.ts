import { Injectable, computed, signal } from '@angular/core';

/**
 * Holds the tourist's current search text and category filter. It lives outside the catalogue
 * page so the filter is still applied when the tourist comes back from a detail page (FR-09).
 */
@Injectable({ providedIn: 'root' })
export class CatalogueState {
  readonly search = signal('');
  readonly categoryIds = signal<readonly number[]>([]);

  readonly filter = computed(() => ({ search: this.search(), categoryIds: this.categoryIds() }));
  readonly isFiltered = computed(() => this.search().trim() !== '' || this.categoryIds().length > 0);

  toggleCategory(id: number): void {
    const selected = this.categoryIds();
    this.categoryIds.set(selected.includes(id) ? selected.filter((c) => c !== id) : [...selected, id]);
  }

  reset(): void {
    this.search.set('');
    this.categoryIds.set([]);
  }
}
