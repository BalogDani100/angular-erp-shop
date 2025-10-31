import { Component, HostListener, inject } from '@angular/core';
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
    this.loginService.logout();
    this.router.navigate(['/']);
  }
}
