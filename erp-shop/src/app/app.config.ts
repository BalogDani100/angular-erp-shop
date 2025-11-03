import { ApplicationConfig } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { appRoutes } from './app.routes';
import { productsReducer } from './pages/products/store/products.reducer';
import { ordersReducer } from './pages/order/store/order.reducer';
import { ProductsEffects } from './pages/products/store/products.effects';
import { OrdersEffects } from './pages/order/store/order.effects';
import { authInterceptor } from './guards/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(appRoutes),
    provideStore({
      products: productsReducer,
      orders: ordersReducer,
    }),
    provideEffects([ProductsEffects, OrdersEffects]),
    provideStoreDevtools(),
    provideHttpClient(withInterceptors([authInterceptor])),
  ],
};
