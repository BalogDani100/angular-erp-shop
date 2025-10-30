import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductsActions } from './products.actions';
import {
  selectAllProducts,
  selectError,
  selectLoading,
  selectTotalProducts,
} from './products.selectors';
import { Product } from './interfaces/product.model';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css'],
})
export class ProductsComponent implements OnInit {
  private store = inject(Store);

  loading = this.store.selectSignal(selectLoading);
  error = this.store.selectSignal(selectError);
  items = this.store.selectSignal(selectAllProducts);
  total = this.store.selectSignal(selectTotalProducts);

  page = signal(1);
  pageSize = signal(12);
  search = signal('');

  filteredItems = computed(() => {
    const term = this.search().trim().toLowerCase();
    const list = this.items();
    if (!term) return list;
    return list.filter(
      (p) =>
        p.name.toLowerCase().includes(term) ||
        p.description.toLowerCase().includes(term) ||
        (p.category?.toLowerCase().includes(term) ?? false)
    );
  });

  totalPages = computed(() =>
    Math.max(1, Math.ceil(this.filteredItems().length / this.pageSize()))
  );

  pagedItems = computed(() => {
    const start = (this.page() - 1) * this.pageSize();
    const end = start + this.pageSize();
    return this.filteredItems().slice(start, end);
  });

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.store.dispatch(
      ProductsActions.loadProducts({
        page: this.page(),
        pageSize: this.pageSize(),
        search: this.search(),
      })
    );
  }

  onSearchEnter(): void {
    this.page.set(1);
    this.load();
  }

  onSearchChange(value: string): void {
    this.search.set(value);
    this.page.set(1);
  }

  changePage(delta: number): void {
    const next = this.page() + delta;
    if (next < 1 || next > this.totalPages()) return;
    this.page.set(next);
  }

  changePageSize(size: number): void {
    this.pageSize.set(size);
    this.page.set(1);
  }

  trackById(_: number, p: Product): string {
    return p.id;
  }
}
