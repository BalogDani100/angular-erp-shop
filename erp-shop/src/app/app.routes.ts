import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { ProductsComponent } from './pages/products/products.component';
import { DetailedProductComponent } from './pages/detailed-product/detailed-product.component';
import { LoginComponent } from './pages/login/login.component';

export const appRoutes: Routes = [
  { path: '', component: HomeComponent, pathMatch: 'full' },
  { path: 'products', component: ProductsComponent },
  { path: 'products/:id', component: DetailedProductComponent },
  { path: 'login', component: LoginComponent },
  { path: '**', redirectTo: '' },
];
