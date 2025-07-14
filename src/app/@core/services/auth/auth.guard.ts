import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import {
  CanActivateFn,
  CanMatchFn,
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Route,
  UrlSegment,
} from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';

/**
 * Functional guard for route activation protection
 * @param route Current activated route snapshot
 * @param state Current router state snapshot
 * @returns True if user is authenticated, false otherwise
 */
export const authGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
): boolean => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  return checkAuth(authService, router, platformId);
};

/**
 * Functional guard for module loading protection (replaces CanLoad)
 * @param route Route configuration for the module
 * @param segments URL segments for the route
 * @returns True if user is authenticated, false otherwise
 */
export const authMatchGuard: CanMatchFn = (
  route: Route,
  segments: UrlSegment[]
): boolean => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  return checkAuth(authService, router, platformId);
};

/**
 * Shared authentication logic for both guard types
 * Handles SSR by allowing access during server-side rendering
 * @param authService Authentication service instance
 * @param router Router instance for navigation
 * @param platformId Platform identifier for SSR detection
 * @returns True if authenticated or SSR, false otherwise
 */
function checkAuth(
  authService: AuthService,
  router: Router,
  platformId: Object
): boolean {
  if (!isPlatformBrowser(platformId)) {
    return true;
  }

  if (authService.isAuthenticated()) {
    return true;
  } else {
    router.navigate(['/login']);
    return false;
  }
}

/**
 * Class-based guard implementation for backward compatibility
 * Provides same functionality as functional guards but as injectable service
 */
@Injectable({
  providedIn: 'root',
})
export class AuthGuard {
  constructor(
    private authService: AuthService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  /**
   * Determines if route can be activated based on authentication status
   * @returns True if user is authenticated, false otherwise
   */
  canActivate(): boolean {
    return checkAuth(this.authService, this.router, this.platformId);
  }

  /**
   * Determines if module can be loaded based on authentication status
   * @param route Route configuration for the module
   * @param segments URL segments for the route
   * @returns True if user is authenticated, false otherwise
   */
  canLoad(route: Route, segments: UrlSegment[]): boolean {
    return checkAuth(this.authService, this.router, this.platformId);
  }
}
