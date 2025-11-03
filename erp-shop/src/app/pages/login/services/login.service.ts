import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environments';
import { LoginResponse } from '../interfaces/login-response';

@Injectable({ providedIn: 'root' })
export class LoginService {
  private readonly loginUrl = `${environment.apiBaseUrl}/auth/login`;

  private userSignal = signal<LoginResponse | null>(this.loadUserFromStorage());

  user = computed(() => this.userSignal());
  isLoggedIn = computed(() => !!this.userSignal()?.token);

  constructor(private http: HttpClient) {}

  login(username: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(this.loginUrl, { username, password }).pipe(
      tap((res) => {
        localStorage.setItem('user', JSON.stringify(res));
        this.userSignal.set(res);
      })
    );
  }

  logout(): void {
    localStorage.removeItem('user');
    this.userSignal.set(null);
  }

  private loadUserFromStorage(): LoginResponse | null {
    const data = localStorage.getItem('user');
    return data ? (JSON.parse(data) as LoginResponse) : null;
  }
}
