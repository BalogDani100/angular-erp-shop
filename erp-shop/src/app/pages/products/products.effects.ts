import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { ProductService } from '../../pages/products/services/product.service';
import { ProductsActions } from './products.actions';
import { catchError, map, of, switchMap, withLatestFrom } from 'rxjs';
import { selectAllProducts } from './products.selectors';

@Injectable()
export class ProductsEffects {
  private actions$ = inject(Actions);
  private store = inject(Store);
  private productService = inject(ProductService);

  loadProducts$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProductsActions.loadProducts),
      withLatestFrom(this.store.select(selectAllProducts)),
      switchMap(([{ page, pageSize, search }, existing]) => {
        if (existing.length > 0) {
          return of(ProductsActions.loadProductsFromCache());
        }
        return this.productService.getProducts(page, pageSize, search).pipe(
          map((response) => ProductsActions.loadProductsSuccess({ response })),
          catchError(() =>
            of(ProductsActions.loadProductsFailure({ error: 'Failed to load products.' }))
          )
        );
      })
    )
  );

  loadProductById$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProductsActions.loadProductById),
      switchMap(({ id }) =>
        this.productService.getProductById(id).pipe(
          map((product) => ProductsActions.loadProductByIdSuccess({ product })),
          catchError(() =>
            of(
              ProductsActions.loadProductByIdFailure({
                error: 'Product not found.',
              })
            )
          )
        )
      )
    )
  );
}
