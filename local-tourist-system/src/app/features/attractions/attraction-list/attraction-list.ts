import { Component, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  Attraction,
  AttractionCategory,
  primaryImageUrl,
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
  private readonly platformId = inject(PLATFORM_ID);
  private readonly attractionService = inject(AttractionService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  protected readonly itinerary = inject(ItineraryService);
  protected readonly primaryImageUrl = primaryImageUrl;

  protected readonly search = signal('');
  protected readonly selectedCategories = signal<AttractionCategory[]>([]);
  protected readonly results = signal<Attraction[]>([]);
  protected readonly spotlight = signal<Attraction[]>([]);
  protected readonly total = signal(0);
  protected readonly categories = this.attractionService.categories;
  protected readonly loading = this.attractionService.loading;
  protected readonly error = this.attractionService.error;

  constructor() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    void this.attractionService.loadCategories();

    this.route.queryParamMap.subscribe((params) => {
      this.search.set(params.get('q') ?? '');
      const raw = params.get('categories') ?? '';
      const selected = raw
        .split(',')
        .map((c) => c.trim())
        .filter((c): c is AttractionCategory => c.length > 0);
      this.selectedCategories.set(selected);
      void this.reload();
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

  goToCatalogue(): void {
    document.getElementById('catalogue')?.scrollIntoView({ behavior: 'smooth' });
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

  private async reload(): Promise<void> {
    const [filtered, all] = await Promise.all([
      this.attractionService.load({
        search: this.search(),
        categories: this.selectedCategories(),
      }),
      this.attractionService.query({}),
    ]);

    this.results.set(filtered);
    this.total.set(all.length);
    // Spotlight from live API results only (no hardcoded attraction ids).
    this.spotlight.set(all.slice(0, 5));
    void this.itinerary.refreshItems();
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
