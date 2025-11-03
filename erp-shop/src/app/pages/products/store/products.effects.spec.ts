import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable, of, Subject, throwError } from 'rxjs';
import { ProductsEffects } from './products.effects';
import { ProductsActions } from './products.actions';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { ProductService } from '../services/product.service';
import { PagedProductsResponse } from '../interfaces/paged-products-response.model';

const product = {
  id: 'p1',
  name: 'Item',
  description: 'Test item',
  category: 'Misc',
  price: 10,
  available: true,
  imageUrl: '',
};

describe('ProductsEffects', () => {
  let actions$: Observable<any>;
  let effects: ProductsEffects;
  let store: MockStore;
  let productService: jasmine.SpyObj<ProductService>;

  const mockResponse: PagedProductsResponse = {
    page: 1,
    pageSize: 12,
    total: 1,
    products: [product],
  };

  const baseProductsState = {
    loading: false,
    error: null as string | null,
    response: null as PagedProductsResponse | null,
    list: [] as any[],
    page: 1,
    pageSize: 12,
    search: '',
    cache: {} as Record<string, any>,
  };

  const initialState = {
    products: { ...baseProductsState },
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ProductsEffects,
        provideMockActions(() => actions$),
        provideMockStore({ initialState }),
        {
          provide: ProductService,
          useValue: jasmine.createSpyObj<ProductService>('ProductService', [
            'getProducts',
            'getProductById',
          ]),
        },
      ],
    });

    effects = TestBed.inject(ProductsEffects);
    store = TestBed.inject(MockStore);
    productService = TestBed.inject(ProductService) as jasmine.SpyObj<ProductService>;
  });

  it('should dispatch loadProductsSuccess on successful fetch', (done) => {
    store.setState({ products: { ...baseProductsState, cache: {} } });
    productService.getProducts.and.returnValue(of(mockResponse));

    const actionsSubject = new Subject<any>();
    actions$ = actionsSubject.asObservable();

    effects.loadProducts$.subscribe((out) => {
      expect(out).toEqual(ProductsActions.loadProductsSuccess({ response: mockResponse }));
      done();
    });

    actionsSubject.next(ProductsActions.loadProducts({ page: 1, pageSize: 12, search: '' }));
  });

  it('should emit Load Products From Cache when cache has the requested page', (done) => {
    const key = '1|12|';
    const cachedProducts = [product];

    store.setState({
      products: {
        ...baseProductsState,
        cache: {
          [key]: {
            page: 1,
            pageSize: 12,
            total: 1,
            products: cachedProducts,
          },
        },
      },
    });

    const actionsSubject = new Subject<any>();
    actions$ = actionsSubject.asObservable();

    effects.loadProducts$.subscribe((out) => {
      expect(out.type).toBe(ProductsActions.loadProductsFromCache.type);
      done();
    });

    actionsSubject.next(ProductsActions.loadProducts({ page: 1, pageSize: 12, search: '' }));
  });

  it('should dispatch loadProductsFailure on error', (done) => {
    store.setState({ products: { ...baseProductsState, cache: {} } });
    productService.getProducts.and.returnValue(throwError(() => new Error('boom')));

    const actionsSubject = new Subject<any>();
    actions$ = actionsSubject.asObservable();

    effects.loadProducts$.subscribe((out) => {
      expect(out.type).toBe(ProductsActions.loadProductsFailure.type);
      done();
    });

    actionsSubject.next(ProductsActions.loadProducts({ page: 2, pageSize: 12, search: 'x' }));
  });
});
