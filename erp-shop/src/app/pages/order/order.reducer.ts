import { createReducer, on } from '@ngrx/store';
import { OrderActions } from './order.actions';
import { CreateOrderResponse } from './interfaces/order-response';

export interface OrderState {
  loading: boolean;
  error: string | null;
  response: CreateOrderResponse | null;
}

export const initialState: OrderState = {
  loading: false,
  error: null,
  response: null,
};

export const ordersReducer = createReducer(
  initialState,

  on(OrderActions.placeOrder, (state) => ({
    ...state,
    loading: true,
    error: null,
    response: null,
  })),

  on(OrderActions.placeOrderSuccess, (state, { response }) => ({
    ...state,
    loading: false,
    response,
  })),

  on(OrderActions.placeOrderFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  on(OrderActions.resetOrderState, () => initialState)
);
