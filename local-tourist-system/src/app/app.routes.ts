import { Routes } from '@angular/router';
import { adminGuard } from './core/guards/admin.guard';
import { Shell } from './layout/shell/shell';

export const routes: Routes = [
  {
    path: '',
    component: Shell,
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/attractions/attraction-list/attraction-list').then(
            (m) => m.AttractionList,
          ),
      },
      {
        path: 'attractions/:id',
        loadComponent: () =>
          import('./features/attractions/attraction-detail/attraction-detail').then(
            (m) => m.AttractionDetail,
          ),
      },
      {
        path: 'itinerary',
        loadComponent: () =>
          import('./features/itinerary/itinerary').then((m) => m.ItineraryPage),
      },
      {
        path: 'login',
        loadComponent: () =>
          import('./features/auth/login/login').then((m) => m.LoginPage),
      },
      {
        path: 'signup',
        loadComponent: () =>
          import('./features/auth/signup/signup').then((m) => m.SignupPage),
      },
      {
        path: 'admin/login',
        redirectTo: 'login',
        pathMatch: 'full',
      },
      {
        path: 'admin',
        canActivate: [adminGuard],
        loadComponent: () =>
          import('./features/admin/admin-attractions/admin-attractions').then(
            (m) => m.AdminAttractions,
          ),
      },
      {
        path: 'admin/attractions/new',
        canActivate: [adminGuard],
        loadComponent: () =>
          import('./features/admin/admin-attraction-form/admin-attraction-form').then(
            (m) => m.AdminAttractionForm,
          ),
      },
      {
        path: 'admin/attractions/:id/edit',
        canActivate: [adminGuard],
        loadComponent: () =>
          import('./features/admin/admin-attraction-form/admin-attraction-form').then(
            (m) => m.AdminAttractionForm,
          ),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
