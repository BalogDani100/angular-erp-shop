import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable, of, Subject, throwError } from 'rxjs';
import { OrdersEffects } from './order.effects';
import { OrderActions } from './order.actions';
import { OrderService } from '../services/order.service';
import { CreateOrderRequest } from '../interfaces/order-request';
import { CreateOrderResponse } from '../interfaces/order-response';

describe('OrdersEffects', () => {
  let actions$: Observable<any>;
  let effects: OrdersEffects;
  let service: jasmine.SpyObj<OrderService>;

  const req: CreateOrderRequest = {
    customerId: 'u1',
    items: [{ productId: 'p1', quantity: 1 }],
  };

  const res: CreateOrderResponse = {
    orderId: 'A1',
    status: 'ok',
    total: 100,
    timestamp: new Date().toISOString(),
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        OrdersEffects,
        provideMockActions(() => actions$),
        {
          provide: OrderService,
          useValue: jasmine.createSpyObj<OrderService>('OrderService', ['placeOrder']),
        },
      ],
    });

    effects = TestBed.inject(OrdersEffects);
    service = TestBed.inject(OrderService) as jasmine.SpyObj<OrderService>;
  });

  it('placeOrder$ → success', (done) => {
    service.placeOrder.and.returnValue(of(res));
    const actionsSubject = new Subject<any>();
    actions$ = actionsSubject.asObservable();

    effects.placeOrder$.subscribe((out) => {
      expect(out).toEqual(OrderActions.placeOrderSuccess({ response: res }));
      done();
    });

    actionsSubject.next(OrderActions.placeOrder({ request: req }));
  });

  it('placeOrder$ → failure', (done) => {
    service.placeOrder.and.returnValue(throwError(() => new Error('x')));
    const actionsSubject = new Subject<any>();
    actions$ = actionsSubject.asObservable();

    effects.placeOrder$.subscribe((out) => {
      expect(out.type).toBe(OrderActions.placeOrderFailure.type);
      done();
    });

    actionsSubject.next(OrderActions.placeOrder({ request: req }));
  });
});
