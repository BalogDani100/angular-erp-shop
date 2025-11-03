import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ProductService } from './product.service';
import { environment } from '../../../environments/environments';
import { PagedProductsResponse } from '../interfaces/paged-products-response.model';
import { Product } from '../interfaces/product.model';

describe('ProductService', () => {
  let service: ProductService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ProductService],
    });
    service = TestBed.inject(ProductService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
  });

  it('getProducts() normalizes numeric fields and booleans', () => {
    const mockResponse: PagedProductsResponse = {
      page: '1' as any,
      pageSize: '12' as any,
      total: '2' as any,
      products: [
        {
          id: 'p1',
          name: 'Phone',
          price: '199.99',
          available: 'true',
          description: 'A',
          category: 'Electronics',
        } as any,
        {
          id: 'p2',
          name: 'Book',
          price: '{{$randomFloat}}',
          available: false,
          description: 'B',
          category: 'Books',
        } as any,
      ],
    };

    let received: PagedProductsResponse | undefined;
    service.getProducts(1, 12, '').subscribe((res) => (received = res));

    const req = http.expectOne(
      (r) =>
        r.method === 'GET' &&
        r.url === `${environment.apiBaseUrl}/products` &&
        r.params.get('page') === '1' &&
        r.params.get('pageSize') === '12' &&
        r.params.get('search') === ''
    );
    req.flush(mockResponse);

    expect(received).toBeTruthy();
    expect(received!.page).toBe(1);
    expect(received!.pageSize).toBe(12);
    expect(received!.total).toBe(2);
    expect(received!.products.length).toBe(2);
    expect(typeof received!.products[0].price).toBe('number');
    expect(received!.products[0].available).toBeTrue();
    expect(typeof received!.products[1].price).toBe('number');
  });

  it('getProductById() falls back from /products/{id} to /product/{id} and normalizes', () => {
    const id = '42';
    let received: Product | undefined;

    service.getProductById(id).subscribe((p) => (received = p));

    const req1 = http.expectOne(`${environment.apiBaseUrl}/products/${id}`);
    req1.flush('not found', { status: 404, statusText: 'Not Found' });

    const req2 = http.expectOne(`${environment.apiBaseUrl}/product/${id}`);
    req2.flush({
      id,
      name: 'Fallback item',
      price: '123.45',
      available: 'true',
      description: 'X',
      category: 'Tools',
    } as any);

    expect(received).toBeTruthy();
    expect(received!.id).toBe(id);
    expect(typeof received!.price).toBe('number');
    expect(received!.available).toBeTrue();
  });
});
