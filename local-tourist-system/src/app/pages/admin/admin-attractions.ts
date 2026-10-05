import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AttractionService } from '../../core/attraction.service';
import { ItineraryService } from '../../core/itinerary.service';
import { LOADING, Loadable, toLoadable } from '../../core/loadable';
import { Attraction } from '../../core/models';

@Component({
  selector: 'app-admin-attractions',
  imports: [RouterLink],
  templateUrl: './admin-attractions.html',
})
export class AdminAttractions {
  private readonly api = inject(AttractionService);
  private readonly itinerary = inject(ItineraryService);

  protected readonly result = signal<Loadable<Attraction[]>>(LOADING);
  protected readonly search = signal('');
  protected readonly visible = computed(() => {
    const result = this.result();
    const term = this.search().trim().toLowerCase();
    return result.status === 'ready'
      ? result.data.filter((a) => a.name.toLowerCase().includes(term))
      : [];
  });

  /** The record waiting for delete confirmation (FR-21), if any. */
  protected readonly pendingDelete = signal<Attraction | null>(null);
  protected readonly deleting = signal(false);
  protected readonly notice = signal(history.state?.notice ?? '');
  protected readonly error = signal('');

  constructor() {
    this.load();
  }

  protected askDelete(attraction: Attraction): void {
    this.error.set('');
    this.pendingDelete.set(attraction);
  }

  protected cancelDelete(): void {
    this.pendingDelete.set(null);
  }

  protected confirmDelete(): void {
    const attraction = this.pendingDelete();
    if (!attraction) {
      return;
    }

    this.deleting.set(true);
    this.api.delete(attraction.id).subscribe({
      next: () => {
        this.itinerary.remove(attraction.id);
        this.deleting.set(false);
        this.pendingDelete.set(null);
        this.notice.set(`"${attraction.name}" was deleted.`);
        this.load();
      },
      error: () => {
        this.deleting.set(false);
        this.pendingDelete.set(null);
        this.error.set(`"${attraction.name}" could not be deleted. Please try again.`);
      },
    });
  }

  private load(): void {
    toLoadable(this.api.search('', [])).subscribe((result) => this.result.set(result));
  }
}
