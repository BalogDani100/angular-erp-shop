import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { Product } from '../interfaces/product.model';
import { PagedProductsResponse } from '../interfaces/paged-products-response.model';

export const ProductsActions = createActionGroup({
  source: 'Products',
  events: {
    'Load Products': props<{ page: number; pageSize: number; search: string }>(),
    'Load Products Success': props<{ response: PagedProductsResponse }>(),
    'Load Products Failure': props<{ error: string }>(),

    'Load Products From Cache': props<{ response: PagedProductsResponse }>(),

    'Load Product By Id': props<{ id: string }>(),
    'Load Product By Id Success': props<{ product: Product }>(),
    'Load Product By Id Failure': props<{ error: string }>(),
  },
});
