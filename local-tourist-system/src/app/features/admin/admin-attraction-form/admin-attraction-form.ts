import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
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
export class AdminAttractionForm implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly attractionService = inject(AttractionService);

  protected readonly categories = this.attractionService.categories;
  protected readonly isEdit = signal(false);
  protected readonly error = signal('');
  protected readonly editId = signal<number | null>(null);
  protected readonly loading = signal(false);

  protected model: AttractionFormModel = this.blank();
  protected draftImageUrl = '';

  ngOnInit(): void {
    void this.bootstrap();
  }

  addImageUrl(): void {
    const url = this.draftImageUrl.trim();
    if (!url) {
      return;
    }
    this.model.imageUrls = [...this.model.imageUrls, url];
    this.draftImageUrl = '';
  }

  removeImageUrl(index: number): void {
    this.model.imageUrls = this.model.imageUrls.filter((_, i) => i !== index);
  }

  updateImageUrl(index: number, value: string): void {
    this.model.imageUrls = this.model.imageUrls.map((url, i) =>
      i === index ? value : url,
    );
  }

  async submit(): Promise<void> {
    this.error.set('');

    if (!this.model.name.trim() || !this.model.category || !this.model.description.trim()) {
      this.error.set('Name, category, and description are required.');
      return;
    }

    if (this.draftImageUrl.trim()) {
      this.addImageUrl();
    }

    if (this.model.imageUrls.every((url) => !url.trim())) {
      this.error.set('Add at least one image URL.');
      return;
    }

    this.loading.set(true);
    try {
      if (this.isEdit()) {
        const id = this.editId();
        if (id == null) {
          return;
        }
        await this.attractionService.update(id, this.model);
      } else {
        await this.attractionService.add(this.model);
      }
      void this.router.navigateByUrl('/admin');
    } catch {
      this.error.set('Save failed. Check validation and admin sign-in, then try again.');
    } finally {
      this.loading.set(false);
    }
  }

  onCategoryChange(value: string): void {
    this.model.category = value as AttractionCategory;
  }

  private async bootstrap(): Promise<void> {
    await this.attractionService.loadCategories();

    const idParam = this.route.snapshot.paramMap.get('id');
    if (!idParam) {
      const cats = this.attractionService.categories();
      if (cats.length) {
        this.model.category = cats[0];
      }
      return;
    }

    const id = Number(idParam);
    const existing = await this.attractionService.getById(id);
    if (!existing) {
      this.error.set('Attraction not found.');
      return;
    }

    this.isEdit.set(true);
    this.editId.set(id);
    this.model = {
      ...existing,
      imageUrls: [...existing.imageUrls],
    };
  }

  private blank(): AttractionFormModel {
    return {
      name: '',
      category: 'Nature',
      description: '',
      openingHours: '',
      travelTips: '',
      distanceKm: 0,
      imageUrls: [],
      latitude: 7.2905,
      longitude: 80.6337,
    };
  }
}
