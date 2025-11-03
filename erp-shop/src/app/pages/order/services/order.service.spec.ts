import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { OrderService } from './order.service';
import { environment } from '../../../environments/environments';
import { CreateOrderRequest } from '../interfaces/order-request';
import { CreateOrderResponse } from '../interfaces/order-response';

describe('OrderService', () => {
  let service: OrderService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [OrderService],
    });
    service = TestBed.inject(OrderService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('placeOrder() normalizes success response', () => {
    const reqBody: CreateOrderRequest = {
      customerId: 'u1',
      items: [{ productId: 'p1', quantity: 2 }],
    };

    const raw: Partial<CreateOrderResponse> = {
      orderId: '123',
      status: 'ok',
      total: '199' as any,
      timestamp: undefined as any,
    };

    let received!: CreateOrderResponse;
    service.placeOrder(reqBody).subscribe((r) => (received = r));

    const req = http.expectOne(`${environment.apiBaseUrl}/orders`);
    expect(req.request.method).toBe('POST');
    req.flush(raw);

    expect(received.orderId).toBe('123');
    expect(received.status).toBe('ok');
    expect(typeof received.total).toBe('number');
    expect(received.timestamp).toBeTruthy();
  });

  it('placeOrder() returns failed normalized response on error', () => {
    const reqBody: CreateOrderRequest = {
      customerId: 'u1',
      items: [{ productId: 'p1', quantity: 1 }],
    };

    let received!: CreateOrderResponse;
    service.placeOrder(reqBody).subscribe((r) => (received = r));

    const req = http.expectOne(`${environment.apiBaseUrl}/orders`);
    req.flush('boom', { status: 500, statusText: 'Server Error' });

    expect(received.status).toBe('failed');
    expect(received.total).toBe(0);
    expect(received.orderId).toBeTruthy();
  });
});
