import { OrderItem } from './order-item';

export interface CreateOrderRequest {
  customerId: string;
  items: OrderItem[];
}
