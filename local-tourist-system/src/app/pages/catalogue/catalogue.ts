import { Component, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { catchError, debounce, of, switchMap, timer } from 'rxjs';
import { AttractionService } from '../../core/attraction.service';
import { CatalogueState } from '../../core/catalogue-state';
import { FallbackImage } from '../../core/fallback-image';
import { ItineraryService } from '../../core/itinerary.service';
import { LOADING, Loadable, toLoadable } from '../../core/loadable';
import { Attraction, Category } from '../../core/models';

@Component({
  selector: 'app-catalogue',
  imports: [RouterLink, FallbackImage],
  templateUrl: './catalogue.html',
})
export class Catalogue {
  private readonly api = inject(AttractionService);
  protected readonly state = inject(CatalogueState);
  protected readonly itinerary = inject(ItineraryService);

  protected readonly categories = toSignal(
    this.api.getCategories().pipe(catchError(() => of<Category[]>([]))),
    { initialValue: [] as Category[] },
  );

  // Typing is debounced so the API is not called on every keystroke; category clicks apply at once.
  private typing = false;
  protected readonly result = toSignal(
    toObservable(this.state.filter).pipe(
      debounce(() => timer(this.typing ? 300 : 0)),
      switchMap((filter) => {
        this.typing = false;
        return toLoadable(this.api.search(filter.search, filter.categoryIds));
      }),
    ),
    { initialValue: LOADING as Loadable<Attraction[]> },
  );

  protected readonly notice = signal('');

  protected onSearch(text: string): void {
    this.typing = true;
    this.state.search.set(text);
  }

  protected addToPlan(attraction: Attraction): void {
    const added = this.itinerary.add(attraction);
    this.notice.set(
      added
        ? `${attraction.name} was added to your one-day plan.`
        : `${attraction.name} is already in your one-day plan.`,
    );
  }
}
