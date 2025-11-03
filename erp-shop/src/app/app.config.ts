import { ApplicationConfig } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { appRoutes } from './app.routes';
import { productsReducer } from './pages/products/products.reducer';
import { ordersReducer } from './pages/order/order.reducer';
import { ProductsEffects } from './pages/products/products.effects';
import { OrdersEffects } from './pages/order/order.effects';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(),
    provideRouter(appRoutes),
    provideStore({
      products: productsReducer,
      orders: ordersReducer,
    }),
    provideEffects([ProductsEffects, OrdersEffects]),
    provideStoreDevtools(),
  ],
};
