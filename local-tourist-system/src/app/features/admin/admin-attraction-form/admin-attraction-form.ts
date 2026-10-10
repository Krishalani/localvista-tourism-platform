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
  protected readonly visitMonths = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' },
  ];
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly attractionService = inject(AttractionService);

  protected readonly categories = this.attractionService.categories;
  protected readonly isEdit = signal(false);
  protected readonly error = signal('');
  protected readonly showValidation = signal(false);
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

  toggleBestVisitMonth(month: number, checked: boolean): void {
    const selected = new Set(this.model.bestVisitMonths ?? []);
    if (checked) {
      selected.add(month);
    } else {
      selected.delete(month);
    }
    this.model.bestVisitMonths = [...selected].sort((a, b) => a - b);
  }

  updateImageUrl(index: number, value: string): void {
    this.model.imageUrls = this.model.imageUrls.map((url, i) =>
      i === index ? value : url,
    );
  }

  async submit(): Promise<void> {
    this.error.set('');
    this.showValidation.set(true);

    if (this.draftImageUrl.trim()) {
      this.addImageUrl();
    }

    if (!this.isFormValid()) {
      this.focusFirstInvalid();
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

  protected fieldError(field: string): string {
    if (!this.showValidation()) {
      return '';
    }

    switch (field) {
      case 'name':
        return !this.model.name.trim()
          ? 'Name is required.'
          : this.model.name.trim().length > 200
            ? 'Name must be 200 characters or fewer.'
            : '';
      case 'category':
        return this.model.category.trim() ? '' : 'Select a category.';
      case 'description':
        return this.model.description.trim() ? '' : 'Description is required.';
      case 'openingHours':
        return !this.model.openingHours.trim()
          ? 'Opening hours are required.'
          : this.model.openingHours.trim().length > 200
            ? 'Opening hours must be 200 characters or fewer.'
            : '';
      case 'travelTips':
        return this.model.travelTips.trim() ? '' : 'Travel tips are required.';
      case 'distanceKm':
        return this.hasValue(this.model.distanceKm) &&
          Number.isFinite(Number(this.model.distanceKm)) &&
          Number(this.model.distanceKm) >= 0 && Number(this.model.distanceKm) <= 25
          ? ''
          : 'Enter a distance from 0 to 25 km.';
      case 'latitude':
        return this.hasValue(this.model.latitude) &&
          Number.isFinite(Number(this.model.latitude)) &&
          Number(this.model.latitude) >= -90 && Number(this.model.latitude) <= 90
          ? ''
          : 'Latitude must be between -90 and 90.';
      case 'longitude':
        return this.hasValue(this.model.longitude) &&
          Number.isFinite(Number(this.model.longitude)) &&
          Number(this.model.longitude) >= -180 && Number(this.model.longitude) <= 180
          ? ''
          : 'Longitude must be between -180 and 180.';
      case 'images':
        return this.model.imageUrls.some((url) => this.isValidImageUrl(url))
          ? ''
          : 'Add at least one valid image URL.';
      default:
        return '';
    }
  }

  protected imageError(index: number): string {
    if (!this.showValidation()) {
      return '';
    }
    const url = this.model.imageUrls[index]?.trim() ?? '';
    if (!url) {
      return 'Image URL is required.';
    }
    return this.isValidImageUrl(url) ? '' : 'Enter a valid http(s) or /images/ URL.';
  }

  protected isInvalid(field: string): boolean {
    return !!this.fieldError(field);
  }

  protected isImageInvalid(index: number): boolean {
    return !!this.imageError(index);
  }

  private isFormValid(): boolean {
    const scalarFields = [
      'name', 'category', 'description', 'openingHours', 'travelTips',
      'distanceKm', 'latitude', 'longitude',
    ];
    return scalarFields.every((field) => !this.fieldError(field)) &&
      !this.fieldError('images') &&
      this.model.imageUrls.every((_, index) => !this.imageError(index));
  }

  private isValidImageUrl(value: string): boolean {
    const url = value.trim();
    if (url.startsWith('/images/')) {
      return true;
    }
    try {
      const parsed = new URL(url);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
      return false;
    }
  }

  private hasValue(value: number | null | undefined): boolean {
    return value !== null && value !== undefined && String(value).trim() !== '';
  }

  private focusFirstInvalid(): void {
    setTimeout(() => {
      const first = document.querySelector<HTMLElement>('form [aria-invalid="true"]');
      first?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      first?.focus({ preventScroll: true });
    });
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
      bestVisitMonths: [],
      distanceKm: 0,
      imageUrls: [],
      latitude: 7.2905,
      longitude: 80.6337,
    };
  }
}
