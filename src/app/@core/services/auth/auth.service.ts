import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { ConfigService } from '../config.service';

/**
 * Service responsible for managing user authentication and session state.
 * Supports both real GoREST API authentication and mock authentication for development.
 */
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly TOKEN_KEY = 'authToken';
  private readonly useMockAuth = this.configService.useMockData;

  /**
   * Mock user data for development and testing purposes
   */
  private readonly mockUser = {
    id: 1,
    name: 'Mario Rossi',
    email: 'mario.rossi@email.com',
    role: 'admin',
  };

  constructor(
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object,
    private configService: ConfigService
  ) {}

  /**
   * Authenticates user with provided token and navigates to main application
   * @param token GoREST API token for authentication
   */
  login(token: string): void {
    if (isPlatformBrowser(this.platformId)) {
      if (this.useMockAuth) {
        const mockToken = this.generateMockToken();
        localStorage.setItem(this.TOKEN_KEY, mockToken);
      } else {
        localStorage.setItem(this.TOKEN_KEY, token);
      }
    }
    setTimeout(() => {
      this.router.navigate(['/main/home']);
    }, 100);
  }

  /**
   * Authenticates user using email and password credentials (mock implementation)
   * @param email User email address
   * @param password User password
   * @returns True if authentication successful, false otherwise
   */
  loginWithCredentials(email: string, password: string): boolean {
    if (this.useMockAuth) {
      if (email === 'admin@test.com' && password === 'password') {
        const mockToken = this.generateMockToken();
        if (isPlatformBrowser(this.platformId)) {
          localStorage.setItem(this.TOKEN_KEY, mockToken);
        }
        setTimeout(() => {
          this.router.navigate(['/main/home']);
        }, 100);
        return true;
      }
      return false;
    }

    return false;
  }

  /**
   * Logs out current user by clearing session data and redirecting to login
   */
  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(this.TOKEN_KEY);
    }
    this.router.navigate(['/login']);
  }

  /**
   * Checks if user is currently authenticated and token is valid
   * @returns True if user is authenticated with valid token, false otherwise
   */
  isAuthenticated(): boolean {
    if (!isPlatformBrowser(this.platformId)) {
      return false;
    }

    const token = this.getToken();
    return !!token && !this.isTokenExpired(token);
  }

  /**
   * Retrieves stored authentication token from localStorage
   * @returns Authentication token or null if not found
   */
  getToken(): string | null {
    if (!isPlatformBrowser(this.platformId)) {
      return null;
    }
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Gets current authenticated user information
   * @returns User object if authenticated in mock mode, null otherwise
   */
  getCurrentUser() {
    if (this.useMockAuth && this.isAuthenticated()) {
      return this.mockUser;
    }
    return null;
  }

  /**
   * Generates a mock JWT token for development purposes
   * @returns Mock JWT token with user information and 24-hour expiration
   */
  private generateMockToken(): string {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(
      JSON.stringify({
        sub: this.mockUser.id,
        name: this.mockUser.name,
        email: this.mockUser.email,
        role: this.mockUser.role,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60,
      })
    );
    const signature = btoa('mock_signature');

    return `${header}.${payload}.${signature}`;
  }

  /**
   * Validates token expiration for JWT tokens
   * @param token Token to validate
   * @returns True if token is expired, false if valid or not JWT format
   */
  private isTokenExpired(token: string): boolean {
    if (!token) return true;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const now = Math.floor(Date.now() / 1000);
      return payload.exp < now;
    } catch {
      return false;
    }
  }
}
