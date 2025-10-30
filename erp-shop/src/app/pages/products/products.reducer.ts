import { createReducer, on } from '@ngrx/store';
import { ProductsActions } from './products.actions';
import { PagedProductsResponse } from '../../pages/products/interfaces/paged-products-response.model';

export interface ProductsState {
  loading: boolean;
  error: string | null;
  response: PagedProductsResponse | null;
  page: number;
  pageSize: number;
  search: string;
}

export const initialState: ProductsState = {
  loading: false,
  error: null,
  response: null,
  page: 1,
  pageSize: 12,
  search: '',
};

export const productsReducer = createReducer(
  initialState,

  on(ProductsActions.loadProducts, (state, { page, pageSize, search }) => ({
    ...state,
    loading: true,
    error: null,
    page,
    pageSize,
    search,
  })),

  on(ProductsActions.loadProductsSuccess, (state, { response }) => ({
    ...state,
    loading: false,
    error: null,
    response,
  })),

  on(ProductsActions.loadProductsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  on(ProductsActions.loadProductsFromCache, (state) => ({
    ...state,
    loading: false,
    error: null,
  }))
);
