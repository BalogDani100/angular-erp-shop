import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home';

export const appRoutes: Routes = [
  { path: '', component: HomeComponent, pathMatch: 'full' },
  { path: '**', redirectTo: '' },
];
