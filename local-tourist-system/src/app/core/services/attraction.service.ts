import { Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import {
  Attraction,
  AttractionCategory,
  AttractionFormModel,
} from '../models/attraction.model';
import { environment } from '../../../environments/environment';

export interface AttractionQuery {
  search?: string;
  categories?: AttractionCategory[];
}

@Injectable({ providedIn: 'root' })
export class AttractionService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly http = inject(HttpClient);
  private readonly attractionsSignal = signal<Attraction[]>([]);
  private readonly categoriesSignal = signal<AttractionCategory[]>([]);
  private readonly loadingSignal = signal(false);
  private readonly errorSignal = signal('');

  readonly attractions = this.attractionsSignal.asReadonly();
  readonly categories = this.categoriesSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();
  readonly count = computed(() => this.attractionsSignal().length);

  async loadCategories(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    try {
      const rows = await firstValueFrom(
        this.http.get<{ id: number; name: string }[]>(
          `${environment.apiBaseUrl}/categories`,
        ),
      );
      this.categoriesSignal.set(rows.map((r) => r.name as AttractionCategory));
      this.errorSignal.set('');
    } catch {
      this.categoriesSignal.set([]);
      this.errorSignal.set(
        'Cannot reach the API. Start the LocalVista API on http://localhost:5088, then refresh.',
      );
    }
  }

  async query(query: AttractionQuery = {}): Promise<Attraction[]> {
    if (!isPlatformBrowser(this.platformId)) {
      return [];
    }

    let params = new HttpParams();
    const search = query.search?.trim();
    if (search) {
      params = params.set('search', search);
    }
    for (const category of query.categories ?? []) {
      params = params.append('categories', category);
    }

    return firstValueFrom(
      this.http.get<Attraction[]>(`${environment.apiBaseUrl}/attractions`, {
        params,
      }),
    );
  }

  async load(query: AttractionQuery = {}): Promise<Attraction[]> {
    if (!isPlatformBrowser(this.platformId)) {
      return [];
    }

    this.loadingSignal.set(true);
    this.errorSignal.set('');
    try {
      const items = await this.query(query);
      this.attractionsSignal.set(items);
      return items;
    } catch {
      this.errorSignal.set(
        'Cannot reach the API. Start the LocalVista API on http://localhost:5088, then refresh.',
      );
      this.attractionsSignal.set([]);
      return [];
    } finally {
      this.loadingSignal.set(false);
    }
  }

  async getById(id: number): Promise<Attraction | undefined> {
    if (!isPlatformBrowser(this.platformId)) {
      return undefined;
    }

    try {
      return await firstValueFrom(
        this.http.get<Attraction>(`${environment.apiBaseUrl}/attractions/${id}`),
      );
    } catch {
      return undefined;
    }
  }

  async add(form: AttractionFormModel): Promise<Attraction> {
    return firstValueFrom(
      this.http.post<Attraction>(
        `${environment.apiBaseUrl}/attractions`,
        this.toWriteBody(form),
      ),
    );
  }

  async update(id: number, form: AttractionFormModel): Promise<Attraction> {
    return firstValueFrom(
      this.http.put<Attraction>(
        `${environment.apiBaseUrl}/attractions/${id}`,
        this.toWriteBody(form),
      ),
    );
  }

  async delete(id: number): Promise<void> {
    await firstValueFrom(
      this.http.delete(`${environment.apiBaseUrl}/attractions/${id}`),
    );
    this.attractionsSignal.update((list) => list.filter((a) => a.id !== id));
  }

  private toWriteBody(form: AttractionFormModel) {
    return {
      name: form.name.trim(),
      category: form.category,
      description: form.description.trim(),
      openingHours: form.openingHours?.trim() ?? '',
      travelTips: form.travelTips?.trim() ?? '',
      distanceKm: Number(form.distanceKm),
      imageUrls: (form.imageUrls ?? []).map((u) => u.trim()).filter(Boolean),
      latitude: Number(form.latitude),
      longitude: Number(form.longitude),
    };
  }
}
