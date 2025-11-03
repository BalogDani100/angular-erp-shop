import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, of, switchMap } from 'rxjs';
import { OrderActions } from './order.actions';
import { OrderService } from '../services/order.service';

@Injectable()
export class OrdersEffects {
  private actions$ = inject(Actions);
  private orderService = inject(OrderService);

  placeOrder$ = createEffect(() =>
    this.actions$.pipe(
      ofType(OrderActions.placeOrder),
      switchMap(({ request }) =>
        this.orderService.placeOrder(request).pipe(
          map((response) => OrderActions.placeOrderSuccess({ response })),
          catchError(() => of(OrderActions.placeOrderFailure({ error: 'Failed to place order' })))
        )
      )
    )
  );
}
