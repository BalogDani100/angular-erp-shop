import { Component, HostListener, computed, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LoginService } from '../../pages/login/services/login.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent {
  private router = inject(Router);
  private loginService = inject(LoginService);

  menuOpen = false;
  scrolled = false;

  user = this.loginService.user;
  isLoggedIn = this.loginService.isLoggedIn;

  // 🔹 Kosár darabszám
  cartCount = signal(0);

  constructor() {
    // Betöltéskor frissítjük a kosár állapotát
    this.updateCartCount();

    // Figyeljük a localStorage változását (más tab / új termék hozzáadás)
    window.addEventListener('storage', () => this.updateCartCount());
  }

  @HostListener('window:scroll')
  onScroll() {
    this.scrolled = window.scrollY > 10;
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  onLogin() {
    this.router.navigate(['/login']);
  }

  onLogout() {
    const user = this.user();
    if (user) {
      localStorage.removeItem(`cart_${user.id}`);
    }
    this.loginService.logout();
    this.router.navigate(['/']);
    this.cartCount.set(0);
  }

  goToCart() {
    this.router.navigate(['/order']);
  }

  private updateCartCount() {
    const user = this.user();
    if (!user) {
      this.cartCount.set(0);
      return;
    }

    const cartKey = `cart_${user.id}`;
    const cart = JSON.parse(localStorage.getItem(cartKey) || '[]');
    this.cartCount.set(cart.length);
  }
}
