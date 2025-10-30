import { Product } from './product.model';

export interface PagedProductsResponse {
  page: number;
  pageSize: number;
  total: number;
  products: Product[];
}
