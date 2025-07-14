import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { PLATFORM_ID } from '@angular/core';
import { authGuard, authMatchGuard, AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';
import {
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Route,
  UrlSegment,
} from '@angular/router';

/**
 * Test suite for AuthGuard implementations
 * Tests both class-based and functional guard behaviors for route protection
 */
describe('AuthGuard', () => {
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;
  let guard: AuthGuard;

  /**
   * Sets up test environment with mocked dependencies
   * Configures AuthService and Router spies for isolated testing
   */
  beforeEach(() => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', [
      'isAuthenticated',
    ]);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        AuthGuard,
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: PLATFORM_ID, useValue: 'browser' },
      ],
    });

    guard = TestBed.inject(AuthGuard);
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  /**
   * Tests for class-based AuthGuard implementation
   * Verifies canActivate and canLoad methods behavior
   */
  describe('AuthGuard class', () => {
    /**
     * Verifies that AuthGuard can be instantiated correctly
     */
    it('should be created', () => {
      expect(guard).toBeTruthy();
    });

    /**
     * Tests that authenticated users can access protected routes
     */
    it('should allow access when authenticated', () => {
      authService.isAuthenticated.and.returnValue(true);
      expect(guard.canActivate()).toBeTrue();
      expect(router.navigate).not.toHaveBeenCalled();
    });

    /**
     * Tests that unauthenticated users are redirected to login
     */
    it('should deny access and redirect when not authenticated', () => {
      authService.isAuthenticated.and.returnValue(false);
      expect(guard.canActivate()).toBeFalse();
      expect(router.navigate).toHaveBeenCalledWith(['/login']);
    });

    /**
     * Tests that authenticated users can load lazy modules
     */
    it('should allow canLoad when authenticated', () => {
      authService.isAuthenticated.and.returnValue(true);
      const route = {} as Route;
      const segments = [] as UrlSegment[];

      expect(guard.canLoad(route, segments)).toBeTrue();
      expect(router.navigate).not.toHaveBeenCalled();
    });

    /**
     * Tests that unauthenticated users cannot load lazy modules
     */
    it('should deny canLoad and redirect when not authenticated', () => {
      authService.isAuthenticated.and.returnValue(false);
      const route = {} as Route;
      const segments = [] as UrlSegment[];

      expect(guard.canLoad(route, segments)).toBeFalse();
      expect(router.navigate).toHaveBeenCalledWith(['/login']);
    });
  });

  /**
   * Tests for functional guard implementations
   * Verifies modern Angular functional guards behavior
   */
  describe('Functional Guards', () => {
    /**
     * Tests that functional authGuard allows access for authenticated users
     */
    it('should allow functional authGuard access when authenticated', () => {
      TestBed.runInInjectionContext(() => {
        authService.isAuthenticated.and.returnValue(true);
        const route = {} as ActivatedRouteSnapshot;
        const state = {} as RouterStateSnapshot;

        expect(authGuard(route, state)).toBeTrue();
        expect(router.navigate).not.toHaveBeenCalled();
      });
    });

    /**
     * Tests that functional authGuard denies access for unauthenticated users
     */
    it('should deny functional authGuard access when not authenticated', () => {
      TestBed.runInInjectionContext(() => {
        authService.isAuthenticated.and.returnValue(false);
        const route = {} as ActivatedRouteSnapshot;
        const state = {} as RouterStateSnapshot;

        expect(authGuard(route, state)).toBeFalse();
        expect(router.navigate).toHaveBeenCalledWith(['/login']);
      });
    });

    /**
     * Tests that functional authMatchGuard allows module loading for authenticated users
     */
    it('should allow functional authMatchGuard access when authenticated', () => {
      TestBed.runInInjectionContext(() => {
        authService.isAuthenticated.and.returnValue(true);
        const route = {} as Route;
        const segments = [] as UrlSegment[];

        expect(authMatchGuard(route, segments)).toBeTrue();
        expect(router.navigate).not.toHaveBeenCalled();
      });
    });

    /**
     * Tests that functional authMatchGuard denies module loading for unauthenticated users
     */
    it('should deny functional authMatchGuard access when not authenticated', () => {
      TestBed.runInInjectionContext(() => {
        authService.isAuthenticated.and.returnValue(false);
        const route = {} as Route;
        const segments = [] as UrlSegment[];

        expect(authMatchGuard(route, segments)).toBeFalse();
        expect(router.navigate).toHaveBeenCalledWith(['/login']);
      });
    });
  });

  /**
   * Tests for server-side rendering (SSR) behavior
   * Ensures guards work correctly during pre-rendering
   */
  describe('SSR Behavior', () => {
    /**
     * Tests that class-based guard allows access during server-side rendering
     * SSR should bypass authentication checks to prevent hydration issues
     */
    it('should allow access during SSR (server-side)', () => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          AuthGuard,
          { provide: AuthService, useValue: authService },
          { provide: Router, useValue: router },
          { provide: PLATFORM_ID, useValue: 'server' }, // SSR
        ],
      });

      const ssrGuard = TestBed.inject(AuthGuard);

      // Durante SSR, dovrebbe sempre permettere l'accesso
      expect(ssrGuard.canActivate()).toBeTrue();
      expect(router.navigate).not.toHaveBeenCalled();
    });

    /**
     * Tests that functional guards allow access during server-side rendering
     * Ensures consistent SSR behavior across all guard types
     */
    it('should allow functional guard access during SSR', () => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          { provide: AuthService, useValue: authService },
          { provide: Router, useValue: router },
          { provide: PLATFORM_ID, useValue: 'server' },
        ],
      });

      TestBed.runInInjectionContext(() => {
        const route = {} as ActivatedRouteSnapshot;
        const state = {} as RouterStateSnapshot;

        expect(authGuard(route, state)).toBeTrue();
        expect(router.navigate).not.toHaveBeenCalled();
      });
    });
  });
});
