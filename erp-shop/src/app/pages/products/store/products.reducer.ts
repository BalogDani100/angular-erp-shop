import { createReducer, on } from '@ngrx/store';
import { ProductsActions } from './products.actions';
import { PagedProductsResponse } from '../interfaces/paged-products-response.model';
import { Product } from '../interfaces/product.model';

export interface ProductsState {
  loading: boolean;
  error: string | null;
  response: PagedProductsResponse | null;
  list: Product[];
  page: number;
  pageSize: number;
  search: string;
  cache: Record<string, PagedProductsResponse | undefined>;
}

export const initialState: ProductsState = {
  loading: false,
  error: null,
  response: null,
  list: [],
  page: 1,
  pageSize: 12,
  search: '',
  cache: {},
};

function keyOf(page: number, pageSize: number, search: string) {
  return `${page}|${pageSize}|${search}`;
}

function mergeUnique(existing: Product[], incoming: Product[]): Product[] {
  const byId = new Map<string, Product>();
  for (const p of existing) byId.set(p.id, p);
  for (const p of incoming) byId.set(p.id, p);
  return Array.from(byId.values());
}

export const productsReducer = createReducer(
  initialState,

  on(ProductsActions.loadProducts, (state, { page, pageSize, search }) => {
    const resetList = search !== state.search || page === 1 || pageSize !== state.pageSize;
    return {
      ...state,
      loading: true,
      error: null,
      page,
      pageSize,
      search,
      list: resetList ? [] : state.list,
    };
  }),

  on(ProductsActions.loadProductsSuccess, (state, { response }) => {
    const k = keyOf(state.page, state.pageSize, state.search);
    const nextList =
      state.page === 1 ? response.products ?? [] : mergeUnique(state.list, response.products ?? []);
    return {
      ...state,
      loading: false,
      error: null,
      response,
      list: nextList,
      cache: { ...state.cache, [k]: response },
    };
  }),

  on(ProductsActions.loadProductsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  on(ProductsActions.loadProductsFromCache, (state, { response }) => {
    const nextList =
      state.page === 1 ? response.products ?? [] : mergeUnique(state.list, response.products ?? []);
    return {
      ...state,
      loading: false,
      error: null,
      response,
      list: nextList,
    };
  }),

  on(ProductsActions.loadProductByIdSuccess, (state, { product }) => {
    const nextList = mergeUnique(state.list, [product]);
    const nextResponse = state.response
      ? {
          ...state.response,
          products: mergeUnique(state.response.products ?? [], [product]),
        }
      : {
          page: 1,
          pageSize: 1,
          total: 1,
          products: [product],
        };
    return { ...state, list: nextList, response: nextResponse };
  }),

  on(ProductsActions.loadProductByIdFailure, (state, { error }) => ({
    ...state,
    error,
  }))
);
