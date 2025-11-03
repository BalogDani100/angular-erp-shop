import { createFeatureSelector, createSelector } from '@ngrx/store';
import { OrderState } from './order.reducer';

export const selectOrdersState = createFeatureSelector<OrderState>('orders');

export const selectOrderLoading = createSelector(selectOrdersState, (state) => state.loading);

export const selectOrderError = createSelector(selectOrdersState, (state) => state.error);

export const selectOrderResponse = createSelector(selectOrdersState, (state) => state.response);
