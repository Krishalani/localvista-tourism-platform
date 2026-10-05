import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from './api.config';
import { Attraction, AttractionSave, Category } from './models';

@Injectable({ providedIn: 'root' })
export class AttractionService {
  private readonly http = inject(HttpClient);

  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${API_BASE_URL}/categories`);
  }

  search(search: string, categoryIds: readonly number[]): Observable<Attraction[]> {
    let params = new HttpParams();
    if (search.trim()) {
      params = params.set('search', search.trim());
    }
    for (const id of categoryIds) {
      params = params.append('categoryIds', id);
    }
    return this.http.get<Attraction[]>(`${API_BASE_URL}/attractions`, { params });
  }

  getById(id: number): Observable<Attraction> {
    return this.http.get<Attraction>(`${API_BASE_URL}/attractions/${id}`);
  }

  create(attraction: AttractionSave): Observable<Attraction> {
    return this.http.post<Attraction>(`${API_BASE_URL}/admin/attractions`, attraction);
  }

  update(id: number, attraction: AttractionSave): Observable<Attraction> {
    return this.http.put<Attraction>(`${API_BASE_URL}/admin/attractions/${id}`, attraction);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${API_BASE_URL}/admin/attractions/${id}`);
  }
}
