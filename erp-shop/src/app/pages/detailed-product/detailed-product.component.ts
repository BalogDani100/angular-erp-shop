import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { of, switchMap, catchError } from 'rxjs';
import { Product } from '../products/interfaces/product.model';
import { ProductService } from '../products/services/product.service';
import { selectProductById } from '../products/products.selectors';
import { ProductsActions } from '../products/products.actions';

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
  private productService = inject(ProductService);

  loading = signal(true);
  error = signal<string | null>(null);
  product = signal<Product | null>(null);

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
              return this.productService.getProductById(id).pipe(
                catchError(() => {
                  this.error.set('Product not found.');
                  this.loading.set(false);
                  return of(null);
                })
              );
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
    console.log('Add to cart (mock)', this.product());
    alert('Added to cart (mock)');
  }
}
