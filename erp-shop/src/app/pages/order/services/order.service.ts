import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of } from 'rxjs';
import { environment } from '../../../environments/environments';
import { CreateOrderRequest } from '../interfaces/order-request';
import { CreateOrderResponse } from '../interfaces/order-response';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private readonly orderUrl = `${environment.apiBaseUrl}/orders`;

  constructor(private readonly http: HttpClient) {}

  placeOrder(order: CreateOrderRequest): Observable<CreateOrderResponse> {
    return this.http.post<CreateOrderResponse>(this.orderUrl, order).pipe(
      map((res) => this.normalizeResponse(res)),
      catchError((error) => {
        console.error('❌ Order request failed', error);
        return of(this.createErrorResponse());
      })
    );
  }

  private normalizeResponse(res: CreateOrderResponse): CreateOrderResponse {
    return {
      orderId: res.orderId ?? 'unknown',
      status: res.status ?? 'pending',
      total: Number(res.total) || 0,
      timestamp: res.timestamp ?? new Date().toISOString(),
    };
  }

  private createErrorResponse(): CreateOrderResponse {
    return {
      orderId: 'N/A',
      status: 'failed',
      total: 0,
      timestamp: new Date().toISOString(),
    };
  }
}
