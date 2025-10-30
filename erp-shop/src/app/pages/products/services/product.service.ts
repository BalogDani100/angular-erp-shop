import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, map, of, switchMap } from 'rxjs';
import { Product } from '../interfaces/product.model';
import { PagedProductsResponse } from '../interfaces/paged-products-response.model';
import { environment } from '../../../environments/environments';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly listUrl = `${environment.apiBaseUrl}/products`;
  private readonly detailPlural = `${environment.apiBaseUrl}/products`;
  private readonly detailSingular = `${environment.apiBaseUrl}/product`;

  constructor(private readonly http: HttpClient) {}

  getProducts(
    page: number,
    pageSize: number,
    search: string = ''
  ): Observable<PagedProductsResponse> {
    const params = new HttpParams()
      .set('page', page)
      .set('pageSize', pageSize)
      .set('search', search.trim());

    return this.http
      .get<PagedProductsResponse>(this.listUrl, { params })
      .pipe(map((res) => this.normalizePagedResponse(res)));
  }

  getProductById(id: string): Observable<Product> {
    return this.http.get<Product>(`${this.detailPlural}/${id}`).pipe(
      map((p) => this.normalizeProduct(p)),
      catchError(() =>
        this.http
          .get<Product>(`${this.detailSingular}/${id}`)
          .pipe(map((p) => this.normalizeProduct(p)))
      )
    );
  }

  private normalizePagedResponse(res: PagedProductsResponse): PagedProductsResponse {
    return {
      page: Number(res.page) || 1,
      pageSize: Number(res.pageSize) || 10,
      total: Number(res.total) || 0,
      products: (res.products ?? []).map((p) => this.normalizeProduct(p)),
    };
  }

  private normalizeProduct(p: Product): Product {
    const availableBool =
      (p.available as any) === true ||
      (typeof p.available === 'string' && p.available.toLowerCase() === 'true');

    let price: number | string = 0;
    if (typeof p.price === 'number') {
      price = p.price;
    } else if (typeof p.price === 'string') {
      const parsed = parseFloat(
        p.price === '{{$randomFloat}}' ? (Math.random() * 10000).toFixed(2) : p.price
      );
      price = !isNaN(parsed) ? parsed : 0;
    } else {
      price = 0;
    }

    return {
      ...p,
      available: availableBool,
      price,
    };
  }
}
