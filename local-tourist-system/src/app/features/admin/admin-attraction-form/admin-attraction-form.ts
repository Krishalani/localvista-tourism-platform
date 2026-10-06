import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  ATTRACTION_CATEGORIES,
  AttractionCategory,
  AttractionFormModel,
} from '../../../core/models/attraction.model';
import { AttractionService } from '../../../core/services/attraction.service';

@Component({
  selector: 'app-admin-attraction-form',
  imports: [FormsModule, RouterLink],
  templateUrl: './admin-attraction-form.html',
  styleUrl: './admin-attraction-form.css',
})
export class AdminAttractionForm {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly attractionService = inject(AttractionService);

  protected readonly categories = ATTRACTION_CATEGORIES;
  protected readonly isEdit = signal(false);
  protected readonly error = signal('');
  protected readonly editId = signal<number | null>(null);

  protected model: AttractionFormModel = this.blank();

  constructor() {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      const id = Number(idParam);
      const existing = this.attractionService.getById(id);
      if (!existing) {
        this.error.set('Attraction not found.');
        return;
      }
      this.isEdit.set(true);
      this.editId.set(id);
      this.model = { ...existing };
    }
  }

  submit(): void {
    this.error.set('');

    if (!this.model.name.trim() || !this.model.category || !this.model.description.trim()) {
      this.error.set('Name, category, and description are required.');
      return;
    }

    if (this.isEdit()) {
      const id = this.editId();
      if (id == null) {
        return;
      }
      this.attractionService.update(id, this.model);
    } else {
      this.attractionService.add(this.model);
    }

    void this.router.navigateByUrl('/admin');
  }

  private blank(): AttractionFormModel {
    return {
      name: '',
      category: 'Nature',
      description: '',
      openingHours: '',
      travelTips: '',
      distanceKm: 0,
      imageUrl:
        'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1200&q=80',
      latitude: 7.2905,
      longitude: 80.6337,
    };
  }

  onCategoryChange(value: string): void {
    this.model.category = value as AttractionCategory;
  }
}
