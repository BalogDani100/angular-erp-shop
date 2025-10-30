import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <header class="header">
      <a routerLink="/" class="brand">ERP Shop</a>
      <nav class="nav">
        <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }"
          >Home</a
        >
        <a routerLink="/products" routerLinkActive="active">Products</a>
        <a routerLink="/checkout" routerLinkActive="active">Checkout</a>
      </nav>
    </header>

    <main class="main">
      <router-outlet></router-outlet>
    </main>
  `,
  styles: [
    `
      .header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 12px 16px;
        border-bottom: 1px solid #e5e7eb;
      }
      .brand {
        font-weight: 600;
      }
      .nav {
        display: flex;
        gap: 12px;
      }
      .active {
        font-weight: 700;
      }
      .main {
        padding: 16px;
      }
    `,
  ],
})
export class AppComponent {}
