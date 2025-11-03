import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { CreateOrderRequest } from '../interfaces/order-request';
import { CreateOrderResponse } from '../interfaces/order-response';

export const OrderActions = createActionGroup({
  source: 'Orders',
  events: {
    'Place Order': props<{ request: CreateOrderRequest }>(),
    'Place Order Success': props<{ response: CreateOrderResponse }>(),
    'Place Order Failure': props<{ error: string }>(),
    'Reset Order State': emptyProps(),
  },
});
