import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { of, switchMap, catchError } from 'rxjs';
import { Product } from '../products/interfaces/product.model';
import { selectProductById } from '../products/products.selectors';
import { ProductsActions } from '../products/products.actions';
import { LoginService } from '../login/services/login.service';

@Component({
  selector: 'app-detailed-product',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './detailed-product.component.html',
  styleUrls: ['./detailed-product.component.css'],
})
export class DetailedProductComponent {
  private route = inject(ActivatedRoute);
  private store = inject(Store);
  private router = inject(Router);
  private loginService = inject(LoginService);

  loading = signal(true);
  error = signal<string | null>(null);
  product = signal<Product | null>(null);
  addedToCart = signal(false);

  user = this.loginService.user;
  isLoggedIn = this.loginService.isLoggedIn;

  imageSrc = computed(() =>
    this.product() && this.product()!.imageUrl
      ? this.product()!.imageUrl
      : 'https://picsum.photos/seed/placeholder/800/500'
  );

  constructor() {
    this.route.paramMap
      .pipe(
        switchMap((params) => {
          const id = params.get('id');
          if (!id) {
            this.error.set('Invalid product ID.');
            this.loading.set(false);
            return of(null);
          }

          const selector = selectProductById(id);
          return this.store.select(selector).pipe(
            switchMap((product) => {
              if (product) {
                this.loading.set(false);
                return of(product);
              }
              this.store.dispatch(ProductsActions.loadProductById({ id }));
              return this.store.select(selector).pipe(catchError(() => of(null)));
            })
          );
        }),
        catchError(() => {
          this.error.set('Unexpected error occurred.');
          this.loading.set(false);
          return of(null);
        })
      )
      .subscribe((p) => {
        if (p) this.product.set(p);
        this.loading.set(false);
      });
  }

  formatPrice(p: Product): string {
    const value = typeof p.price === 'number' ? p.price : parseFloat(p.price as any);
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value);
  }

  addToCart(): void {
    const p = this.product();
    if (!p) return;

    if (!this.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

    const user = this.user();
    if (!user) return;

    const cartKey = `cart_${user.id}`;
    const existingCart = JSON.parse(localStorage.getItem(cartKey) || '[]');

    const existingIndex = existingCart.findIndex((item: any) => item.productId === p.id);

    if (existingIndex !== -1) {
      existingCart[existingIndex].quantity = (existingCart[existingIndex].quantity || 1) + 1;
    } else {
      existingCart.push({
        productId: p.id,
        name: p.name,
        price: p.price,
        quantity: 1,
      });
    }

    localStorage.setItem(cartKey, JSON.stringify(existingCart));
    window.dispatchEvent(new Event('storage'));

    this.addedToCart.set(true);
    setTimeout(() => this.addedToCart.set(false), 2500);
  }
}
