import {
  Component,
  OnInit,
  AfterViewInit,
  OnDestroy,
  computed,
  inject,
  signal,
  ViewChild,
  ElementRef,
  HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductsActions } from './store/products.actions';
import {
  selectAllProducts,
  selectError,
  selectLoading,
  selectTotalProducts,
  selectPage,
  selectPageSize,
  selectSearch,
} from './store/products.selectors';
import { Product } from './interfaces/product.model';
import { CATEGORY_OPTIONS } from '../../shared/constants/categories';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css'],
})
export class ProductsComponent implements OnInit, AfterViewInit, OnDestroy {
  private store = inject(Store);

  loading = this.store.selectSignal(selectLoading);
  error = this.store.selectSignal(selectError);
  items = this.store.selectSignal(selectAllProducts);
  total = this.store.selectSignal(selectTotalProducts);

  categoryOptions = CATEGORY_OPTIONS;

  page = signal(1);
  pageSize = signal(12);
  search = signal('');

  priceMin = signal<number | null>(null);
  priceMax = signal<number | null>(null);
  availability = signal<'all' | 'in' | 'out'>('all');
  category = signal('all');

  totalPages = computed(() => Math.max(1, Math.ceil(this.total() / this.pageSize())));

  showTopLoading = computed(() => this.loading() && this.page() === 1);
  showBottomLoading = computed(() => this.loading() && this.page() > 1);

  showBackToTop = signal(false);

  @ViewChild('infiniteAnchor', { static: false }) infiniteAnchor!: ElementRef<HTMLDivElement>;
  private io?: IntersectionObserver;

  ngOnInit(): void {
    const pageFromStore = this.store.selectSignal(selectPage)();
    const pageSizeFromStore = this.store.selectSignal(selectPageSize)();
    const searchFromStore = this.store.selectSignal(selectSearch)();

    this.page.set(pageFromStore);
    this.pageSize.set(pageSizeFromStore);
    this.search.set(searchFromStore);

    if (this.items().length === 0) this.load();
  }

  ngAfterViewInit(): void {
    this.io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          this.loadNextPage();
        }
      },
      { root: null, rootMargin: '200px', threshold: 0 }
    );
    queueMicrotask(() => {
      if (this.infiniteAnchor?.nativeElement) {
        this.io!.observe(this.infiniteAnchor.nativeElement);
      }
    });
  }

  ngOnDestroy(): void {
    this.io?.disconnect();
  }

  private load(): void {
    this.store.dispatch(
      ProductsActions.loadProducts({
        page: this.page(),
        pageSize: this.pageSize(),
        search: this.search(),
      })
    );
  }

  private loadNextPage(): void {
    if (this.loading()) return;
    if (this.page() >= this.totalPages()) return;
    this.page.set(this.page() + 1);
    this.load();
  }

  onSearchEnter(): void {
    this.page.set(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.load();
  }

  onSearchChange(value: string): void {
    this.search.set(value);
    this.page.set(1);
  }

  onFilterChange(): void {}

  filteredItems = computed(() =>
    this.items()
      .filter((p) => p.name.toLowerCase().includes(this.search().toLowerCase()))
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
      .filter((p) => (this.category() === 'all' ? true : p.category === this.category()))
  );

  trackById(_: number, p: Product): string {
    return p.id;
  }

  @HostListener('window:scroll', [])
  onScroll() {
    this.showBackToTop.set(window.scrollY > 400);
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
