import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AttractionService } from '../../../core/services/attraction.service';

@Component({
  selector: 'app-admin-attractions',
  imports: [RouterLink],
  templateUrl: './admin-attractions.html',
  styleUrl: './admin-attractions.css',
})
export class AdminAttractions {
  protected readonly attractionService = inject(AttractionService);
  protected readonly pendingDeleteId = signal<number | null>(null);
  protected readonly flash = signal('');

  askDelete(id: number): void {
    this.pendingDeleteId.set(id);
  }

  cancelDelete(): void {
    this.pendingDeleteId.set(null);
  }

  confirmDelete(): void {
    const id = this.pendingDeleteId();
    if (id == null) {
      return;
    }
    this.attractionService.delete(id);
    this.pendingDeleteId.set(null);
    this.flash.set('Attraction deleted.');
  }
}
