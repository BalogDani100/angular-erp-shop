import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ProductsState } from './products.reducer';

export const selectProductsState = createFeatureSelector<ProductsState>('products');

export const selectLoading = createSelector(selectProductsState, (state) => state.loading);

export const selectError = createSelector(selectProductsState, (state) => state.error);

export const selectAllProducts = createSelector(
  selectProductsState,
  (state) => state.response?.products ?? []
);

export const selectTotalProducts = createSelector(
  selectProductsState,
  (state) => state.response?.total ?? 0
);

export const selectPage = createSelector(selectProductsState, (state) => state.page);

export const selectPageSize = createSelector(selectProductsState, (state) => state.pageSize);

export const selectSearch = createSelector(selectProductsState, (state) => state.search);

export const selectProductById = (id: string) =>
  createSelector(selectAllProducts, (products) => products.find((p) => p.id === id));
