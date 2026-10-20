import { Component, PLATFORM_ID, computed, inject, signal } from '@angular/core';
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
import { FeedbackService } from '../../../core/services/feedback.service';

@Component({
  selector: 'app-attraction-list',
  imports: [FormsModule, RouterLink],
  templateUrl: './attraction-list.html',
  styleUrl: './attraction-list.css',
})
export class AttractionList {
  private reloadVersion = 0;
  private readonly platformId = inject(PLATFORM_ID);
  private readonly attractionService = inject(AttractionService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly feedbackService = inject(FeedbackService);
  protected readonly itinerary = inject(ItineraryService);
  protected readonly primaryImageUrl = primaryImageUrl;

  protected readonly search = signal('');
  protected readonly isCataloguePage = signal(false);
  protected readonly maxDistanceKm = signal<number | null>(null);
  protected readonly selectedCategories = signal<AttractionCategory[]>([]);
  protected readonly results = signal<Attraction[]>([]);
  protected readonly allPlaces = signal<Attraction[]>([]);
  protected readonly currentMonth = new Date().getMonth() + 1;
  protected readonly currentMonthName = new Intl.DateTimeFormat('en', { month: 'long' }).format(new Date());
  protected readonly monthNames = Array.from({ length: 12 }, (_, index) =>
    new Intl.DateTimeFormat('en', { month: 'long' }).format(new Date(2024, index, 1)),
  );
  protected readonly visibleCount = signal(9);
  protected readonly visibleResults = computed(() => this.results().slice(0, this.visibleCount()));
  protected readonly spotlight = signal<Attraction[]>([]);
  protected readonly homeSearchResults = computed(() => {
    const terms = this.search().trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
    if (!terms.length) return [];
    return this.allPlaces().filter((place) => {
      const searchableText = [
        place.name,
        place.category,
        place.shortDescription,
        place.openingHours,
        `${place.distanceKm} km`,
        `distance ${place.distanceKm} km from kandy`,
        `within ${place.distanceKm} km`,
      ].join(' ').toLocaleLowerCase();
      return terms.every((term) => searchableText.includes(term));
    }).slice(0, 6);
  });
  protected readonly ratings = signal<Record<number, { average: number; count: number }>>({});
  protected readonly topRated = computed(() => [...this.allPlaces()]
    .sort((a, b) => (this.ratings()[b.id]?.average ?? 0) - (this.ratings()[a.id]?.average ?? 0)
      || (this.ratings()[b.id]?.count ?? 0) - (this.ratings()[a.id]?.count ?? 0))
    .slice(0, 6));
  protected readonly featuredPlace = computed(() =>
    this.allPlaces().find((item) => item.bestVisitMonths?.includes(this.currentMonth)) ??
    this.allPlaces()[0] ?? this.spotlight()[0],
  );
  protected readonly isSeasonalFeature = computed(() =>
    this.featuredPlace()?.bestVisitMonths?.includes(this.currentMonth) ?? false,
  );
  protected readonly total = signal(0);
  protected readonly categories = this.attractionService.categories;
  protected readonly loading = this.attractionService.loading;
  protected readonly error = this.attractionService.error;

  constructor() {
    this.isCataloguePage.set(this.route.snapshot.routeConfig?.path === 'attractions');
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    void this.attractionService.loadCategories();

    this.route.queryParamMap.subscribe((params) => {
      this.search.set(params.get('q') ?? '');
      const maxDistance = params.get('maxDistanceKm');
      this.maxDistanceKm.set(maxDistance === null ? null : Number(maxDistance));
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
    if (this.isCataloguePage()) {
      this.syncUrl();
    }
  }

  onDistanceChange(value: string): void {
    this.maxDistanceKm.set(value ? Number(value) : null);
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

  categoryIcon(index: number): string {
    return ['◇', '∿', '✿', '⚝', '⌂', '✦'][index % 6];
  }

  ratingFor(id: number): { average: number; count: number } {
    return this.ratings()[id] ?? { average: 0, count: 0 };
  }

  formatBestMonths(months: number[]): string {
    return months
      .filter((month) => month >= 1 && month <= 12)
      .map((month) => this.monthNames[month - 1])
      .join(', ');
  }

  goToCatalogue(): void {
    void this.router.navigate(['/attractions'], {
      queryParams: {
        q: this.search().trim() || null,
        categories: this.selectedCategories().length ? this.selectedCategories().join(',') : null,
        maxDistanceKm: this.maxDistanceKm(),
      },
    });
  }

  clearFilters(): void {
    this.search.set('');
    this.selectedCategories.set([]);
    this.maxDistanceKm.set(null);
    this.syncUrl();
  }

  addToPlan(id: number, event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.itinerary.add(id);
  }

  showMore(): void {
    this.visibleCount.update((count) => Math.min(count + 9, this.results().length));
  }

  private async reload(): Promise<void> {
    const version = ++this.reloadVersion;
    const [filtered, all] = await Promise.all([
      this.attractionService.load({
        search: this.search(),
        categories: this.selectedCategories(),
        maxDistanceKm: this.maxDistanceKm(),
      }),
      this.attractionService.query({}).catch(() => []),
    ]);

    // Ignore older network responses if the user changed filters while they were loading.
    if (version !== this.reloadVersion) {
      return;
    }

    this.results.set(filtered);
    this.visibleCount.set(9);
    this.total.set(all.length);
    this.allPlaces.set(all);
    // Spotlight from live API results only (no hardcoded attraction ids).
    this.spotlight.set(all.slice(0, 6));
    const ratingEntries = await Promise.all(all.map(async (place) => {
      try {
        const summary = await this.feedbackService.getForAttraction(place.id);
        return [place.id, { average: summary.averageRating, count: summary.reviewCount }] as const;
      } catch {
        return [place.id, { average: 0, count: 0 }] as const;
      }
    }));
    if (version === this.reloadVersion) {
      this.ratings.set(Object.fromEntries(ratingEntries));
    }
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
        maxDistanceKm: this.maxDistanceKm(),
      },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }
}
