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
  selectPage,
  selectPageSize,
  selectSearch,
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

  priceMin = signal<number | null>(null);
  priceMax = signal<number | null>(null);
  availability = signal<'all' | 'in' | 'out'>('all');
  category = signal('all');

  totalPages = computed(() =>
    Math.max(1, Math.ceil(this.filteredItems().length / this.pageSize()))
  );

  ngOnInit(): void {
    const pageFromStore = this.store.selectSignal(selectPage)();
    const pageSizeFromStore = this.store.selectSignal(selectPageSize)();
    const searchFromStore = this.store.selectSignal(selectSearch)();

    this.page.set(pageFromStore);
    this.pageSize.set(pageSizeFromStore);
    this.search.set(searchFromStore);

    const hasProducts = this.items().length > 0;
    if (!hasProducts) {
      this.load();
    }
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

  onFilterChange(): void {
    this.page.set(1);
  }

  filteredItems = computed(() => {
    return this.items()
      .filter((p) =>
        p.name.toLowerCase().includes(this.search().toLowerCase())
      )
      .filter((p) => {
        const min = this.priceMin();
        const max = this.priceMax();
        const price = typeof p.price === 'number' ? p.price : parseFloat(p.price);

        if (min !== null && price < min) return false;
        if (max !== null && price > max) return false;
        return true;
      })
      .filter((p) => {
        if (this.availability() === 'in') return p.available === true;
        if (this.availability() === 'out') return p.available === false;
        return true;
      })
      .filter((p) => {
        if (this.category() === 'all') return true;
        return p.category === this.category();
      });
  });

  pagedItems = computed(() => {
    const start = (this.page() - 1) * this.pageSize();
    const end = start + this.pageSize();
    return this.filteredItems().slice(start, end);
  });

  changePage(delta: number): void {
    const next = this.page() + delta;
    if (next < 1 || next > this.totalPages()) return;

    this.page.set(next);
    this.load();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  changePageSize(size: number): void {
    this.pageSize.set(size);
    this.page.set(1);
    this.load();
  }

  trackById(_: number, p: Product): string {
    return p.id;
  }
}
