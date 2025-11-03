import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { OrderActions } from './store/order.actions';
import {
  selectOrderError,
  selectOrderLoading,
  selectOrderResponse,
} from '../../pages/order/./store/order.selector';
import { LoginService } from '../login/services/login.service';
import { CreateOrderRequest } from './interfaces/order-request';
import { filter, take } from 'rxjs';

@Component({
  selector: 'app-order-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.css'],
})
export class OrderComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private store = inject(Store);
  private loginService = inject(LoginService);

  user = this.loginService.user;

  form: FormGroup = this.fb.group({
    customerId: [''],
    name: ['', Validators.required],
    role: [''],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required, Validators.pattern(/^[0-9\-\+]{9,15}$/)]],
    address: ['', Validators.required],
    items: this.fb.array([]),
  });

  loading = this.store.selectSignal(selectOrderLoading);
  response = this.store.selectSignal(selectOrderResponse);
  error = this.store.selectSignal(selectOrderError);
  errorLocal = signal<string | null>(null);
  toastMessage = signal<string | null>(null);
  total = signal(0);

  constructor() {
    const user = this.user();

    this.form.patchValue({
      customerId: user?.id ?? '',
      name: user?.name ?? '',
      role: user?.role ?? '',
    });

    this.loadCart();

    window.addEventListener('storage', () => this.loadCart());
    this.items.valueChanges.subscribe(() => this.recalculateTotal());
  }

  get items(): FormArray {
    return this.form.get('items') as FormArray;
  }

  get hasItems(): boolean {
    return this.items.length > 0;
  }

  goToProducts() {
    this.router.navigate(['/products']);
  }

  loadCart() {
    const user = this.user();
    const cartKey = `cart_${user?.id ?? 'guest'}`;
    const savedCart = JSON.parse(localStorage.getItem(cartKey) || '[]');

    this.items.clear();

    savedCart.forEach((item: any) => {
      const group = this.fb.group({
        productName: [item.name, Validators.required],
        productId: [item.productId, Validators.required],
        basePrice: [item.price, Validators.required],
        quantity: [item.quantity || 1, [Validators.required, Validators.min(1)]],
        totalPrice: [item.price * (item.quantity || 1)],
      });

      group.get('quantity')?.valueChanges.subscribe((q: number | null) => {
        const quantity = q ?? 1;
        const base = group.get('basePrice')?.value || 0;
        const total = base * quantity;
        group.get('totalPrice')?.setValue(total, { emitEvent: false });
        this.recalculateTotal();

        const currentCart = JSON.parse(localStorage.getItem(cartKey) || '[]');
        const index = currentCart.findIndex((c: any) => c.productId === item.productId);
        if (index !== -1) {
          currentCart[index].quantity = quantity;
          localStorage.setItem(cartKey, JSON.stringify(currentCart));
        }
      });

      this.items.push(group);
    });

    this.recalculateTotal();
  }

  recalculateTotal() {
    const sum = this.items.controls.reduce((acc, group) => {
      const total = group.get('totalPrice')?.value || 0;
      return acc + total;
    }, 0);
    this.total.set(sum);
  }

  removeItem(index: number) {
    const user = this.user();
    const cartKey = `cart_${user?.id ?? 'guest'}`;
    const savedCart = JSON.parse(localStorage.getItem(cartKey) || '[]');
    const updatedCart = savedCart.filter((_: any, idx: number) => idx !== index);

    localStorage.setItem(cartKey, JSON.stringify(updatedCart));
    this.items.removeAt(index);
    window.dispatchEvent(new Event('storage'));

    this.recalculateTotal();
    this.showToast('🗑️ Product removed from cart.');

    if (updatedCart.length === 0) {
      this.showToast('🛒 Your cart is now empty.');
    }
  }

  showToast(message: string) {
    this.toastMessage.set(message);
    setTimeout(() => this.toastMessage.set(null), 2500);
  }

  submit() {
    if (!this.hasItems) {
      this.errorLocal.set('🛒 Your cart is empty. Add at least one product before ordering.');
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.errorLocal.set('⚠️ Please fill in all required fields before submitting.');
      return;
    }

    this.errorLocal.set(null);

    const payload: CreateOrderRequest = {
      customerId: this.form.value.customerId,
      items: this.form.value.items.map((i: any) => ({
        productId: i.productId,
        quantity: i.quantity,
      })),
    };

    this.store.dispatch(OrderActions.placeOrder({ request: payload }));

    this.store
      .select(selectOrderResponse)
      .pipe(filter((r): r is NonNullable<typeof r> => !!r && r.status !== 'failed'), take(1))
      .subscribe((res) => {
        this.showToast(`✅ Order #${res.orderId} placed! Status: ${res.status}`);
        this.form.reset();
        this.items.clear();
        this.total.set(0);
        const user = this.user();
        if (user) {
          localStorage.removeItem(`cart_${user.id}`);
          window.dispatchEvent(new Event('storage'));
        }
      });

    this.store
      .select(selectOrderError)
      .pipe(filter((e): e is string => !!e), take(1))
      .subscribe(() => this.showToast('❌ Order failed. Please try again later.'));
  }

  isInvalid(controlName: string): boolean {
    const control = this.form.get(controlName);
    return !!(control && control.invalid && control.touched);
  }
}
