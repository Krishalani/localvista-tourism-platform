import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  ATTRACTION_CATEGORIES,
  AttractionCategory,
} from '../../../core/models/attraction.model';
import { AttractionService } from '../../../core/services/attraction.service';
import { ItineraryService } from '../../../core/services/itinerary.service';

@Component({
  selector: 'app-attraction-list',
  imports: [FormsModule, RouterLink],
  templateUrl: './attraction-list.html',
  styleUrl: './attraction-list.css',
})
export class AttractionList {
  private readonly attractionService = inject(AttractionService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  protected readonly itinerary = inject(ItineraryService);

  protected readonly categories = ATTRACTION_CATEGORIES;
  protected readonly search = signal('');
  protected readonly selectedCategories = signal<AttractionCategory[]>([]);

  protected readonly results = computed(() =>
    this.attractionService.search({
      search: this.search(),
      categories: this.selectedCategories(),
    }),
  );

  /** Featured hero image — Temple of the Tooth when present. */
  protected readonly featured = computed(
    () =>
      this.attractionService.getById(9) ??
      this.attractionService.getAll()[0],
  );

  constructor() {
    this.route.queryParamMap.subscribe((params) => {
      this.search.set(params.get('q') ?? '');
      const raw = params.get('categories') ?? '';
      const selected = raw
        .split(',')
        .map((c) => c.trim())
        .filter((c): c is AttractionCategory =>
          (ATTRACTION_CATEGORIES as string[]).includes(c),
        );
      this.selectedCategories.set(selected);
    });
  }

  onSearchInput(value: string): void {
    this.search.set(value);
    this.syncUrl();
  }

  toggleCategory(category: AttractionCategory): void {
    this.selectedCategories.update((current) =>
      current.includes(category)
        ? current.filter((c) => c !== category)
        : [...current, category],
    );
    this.syncUrl();
  }

  isSelected(category: AttractionCategory): boolean {
    return this.selectedCategories().includes(category);
  }

  clearFilters(): void {
    this.search.set('');
    this.selectedCategories.set([]);
    this.syncUrl();
  }

  addToPlan(id: number, event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.itinerary.add(id);
  }

  private syncUrl(): void {
    const q = this.search().trim();
    const cats = this.selectedCategories();
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        q: q || null,
        categories: cats.length ? cats.join(',') : null,
      },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }
}
