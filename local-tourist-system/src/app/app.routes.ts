import { Routes } from '@angular/router';
import { adminGuard } from './core/auth.guard';
import { Catalogue } from './pages/catalogue/catalogue';

export const routes: Routes = [
  { path: '', component: Catalogue, title: 'Attractions around Kandy' },
  {
    path: 'attractions/:id',
    loadComponent: () => import('./pages/attraction-detail/attraction-detail').then((m) => m.AttractionDetail),
    title: 'Attraction details',
  },
  {
    path: 'my-itinerary',
    loadComponent: () => import('./pages/itinerary/itinerary').then((m) => m.Itinerary),
    title: 'My one-day plan',
  },
  {
    path: 'credits',
    loadComponent: () => import('./pages/credits/credits').then((m) => m.Credits),
    title: 'Photo credits',
  },
  {
    path: 'admin/login',
    loadComponent: () => import('./pages/admin/admin-login').then((m) => m.AdminLogin),
    title: 'Administrator login',
  },
  {
    path: 'admin',
    canActivate: [adminGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/admin/admin-dashboard').then((m) => m.AdminDashboard),
        title: 'Administrator dashboard',
      },
      {
        path: 'attractions',
        loadComponent: () => import('./pages/admin/admin-attractions').then((m) => m.AdminAttractions),
        title: 'Manage attractions',
      },
      {
        path: 'attractions/new',
        loadComponent: () => import('./pages/admin/admin-attraction-form').then((m) => m.AdminAttractionForm),
        title: 'Add attraction',
      },
      {
        path: 'attractions/:id/edit',
        loadComponent: () => import('./pages/admin/admin-attraction-form').then((m) => m.AdminAttractionForm),
        title: 'Edit attraction',
      },
    ],
  },
  {
    path: '**',
    loadComponent: () => import('./pages/not-found/not-found').then((m) => m.NotFound),
    title: 'Page not found',
  },
];
