import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { AttractionService } from '../../core/attraction.service';
import { AuthService } from '../../core/auth.service';
import { LOADING, Loadable, toLoadable } from '../../core/loadable';
import { Attraction } from '../../core/models';

@Component({
  selector: 'app-admin-dashboard',
  imports: [RouterLink],
  template: `
    <header class="page-header">
      <div>
        <h1>Administrator dashboard</h1>
        <p>Signed in as {{ auth.username() }}.</p>
      </div>
    </header>

    @let current = attractions();
    @if (current.status === 'error') {
      <p class="message message--error" role="alert">The catalogue summary could not be loaded.</p>
    } @else if (current.status === 'ready') {
      <ul class="stat-grid">
        <li class="stat">
          <span class="stat__value">{{ current.data.length }}</span>
          <span class="stat__label">Attractions in the catalogue</span>
        </li>
        <li class="stat">
          <span class="stat__value">{{ missingDetails() }}</span>
          <span class="stat__label">Missing a photo or map location</span>
        </li>
      </ul>
    }

    <div class="dashboard-actions">
      <a class="button" routerLink="/admin/attractions">Manage attractions</a>
      <a class="button button--ghost" routerLink="/admin/attractions/new">Add an attraction</a>
    </div>
  `,
})
export class AdminDashboard {
  protected readonly auth = inject(AuthService);

  protected readonly attractions = toSignal(toLoadable(inject(AttractionService).search('', [])), {
    initialValue: LOADING as Loadable<Attraction[]>,
  });

  protected readonly missingDetails = computed(() => {
    const current = this.attractions();
    return current.status === 'ready'
      ? current.data.filter((a) => !a.imageUrl || a.latitude === null || a.longitude === null).length
      : 0;
  });
}
