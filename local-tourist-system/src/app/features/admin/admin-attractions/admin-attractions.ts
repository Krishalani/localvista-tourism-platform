import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Attraction } from '../../../core/models/attraction.model';
import { AttractionService } from '../../../core/services/attraction.service';

@Component({
  selector: 'app-admin-attractions',
  imports: [RouterLink],
  templateUrl: './admin-attractions.html',
  styleUrl: './admin-attractions.css',
})
export class AdminAttractions implements OnInit {
  private readonly attractionService = inject(AttractionService);

  protected readonly attractions = signal<Attraction[]>([]);
  protected readonly categoryCount = computed(
    () => new Set(this.attractions().map((item) => item.category)).size,
  );
  protected readonly categorySummary = computed(() => {
    const counts = new Map<string, number>();
    for (const item of this.attractions()) {
      counts.set(item.category, (counts.get(item.category) ?? 0) + 1);
    }
    return [...counts.entries()].sort(([a], [b]) => a.localeCompare(b));
  });
  protected readonly pendingDeleteId = signal<number | null>(null);
  protected readonly flash = signal('');
  protected readonly error = signal('');
  protected readonly loading = signal(false);

  ngOnInit(): void {
    void this.reload();
  }

  askDelete(id: number): void {
    this.pendingDeleteId.set(id);
  }

  cancelDelete(): void {
    this.pendingDeleteId.set(null);
  }

  async confirmDelete(): Promise<void> {
    const id = this.pendingDeleteId();
    if (id == null) {
      return;
    }

    try {
      await this.attractionService.delete(id);
      this.pendingDeleteId.set(null);
      this.flash.set('Attraction deleted.');
      await this.reload();
    } catch {
      this.error.set('Delete failed. Sign in as admin and try again.');
      this.pendingDeleteId.set(null);
    }
  }

  private async reload(): Promise<void> {
    this.loading.set(true);
    this.error.set('');
    try {
      this.attractions.set(await this.attractionService.load({}));
    } catch {
      this.error.set('Unable to load catalogue.');
    } finally {
      this.loading.set(false);
    }
  }
}
