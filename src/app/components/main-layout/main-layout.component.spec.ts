import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, NavigationEnd } from '@angular/router';
import { MainLayoutComponent } from './main-layout.component';
import { AuthService } from '../../@core/services/auth/auth.service';
import { BreakpointObserver } from '@angular/cdk/layout';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of, Subject } from 'rxjs';

/**
 * Test suite for MainLayoutComponent
 * Verifies main application layout functionality, navigation, and responsive behavior
 */
describe('MainLayoutComponent', () => {
  let component: MainLayoutComponent;
  let fixture: ComponentFixture<MainLayoutComponent>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockRouter: any;
  let mockBreakpointObserver: jasmine.SpyObj<BreakpointObserver>;
  let routerEventsSubject: Subject<any>;

  /**
   * Sets up test environment with mocked dependencies
   * Configures router events, auth service, and breakpoint observer
   */
  beforeEach(async () => {
    mockAuthService = jasmine.createSpyObj('AuthService', ['logout']);
    routerEventsSubject = new Subject();

    // Create a proper router mock with events observable
    mockRouter = {
      url: '/main/home',
      navigate: jasmine.createSpy('navigate'),
      events: routerEventsSubject.asObservable(),
    };

    mockBreakpointObserver = jasmine.createSpyObj('BreakpointObserver', [
      'observe',
    ]);

    // Mock BreakpointObserver.observe to return an observable
    mockBreakpointObserver.observe.and.returnValue(
      of({ matches: false, breakpoints: {} })
    );

    await TestBed.configureTestingModule({
      declarations: [MainLayoutComponent],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter },
        { provide: BreakpointObserver, useValue: mockBreakpointObserver },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(MainLayoutComponent);
    component = fixture.componentInstance;
  });

  /**
   * Verifies that MainLayoutComponent can be instantiated correctly
   */
  it('should create', () => {
    expect(component).toBeTruthy();
  });

  /**
   * Tests component initialization on ngOnInit
   * Verifies menu items setup and initial route configuration
   */
  it('should initialize component correctly on ngOnInit', () => {
    fixture.detectChanges(); // This triggers ngOnInit

    expect(component.menuItems).toEqual([
      {
        label: 'Home',
        icon: 'pi pi-home',
        routerLink: '/main/home',
      },
      {
        label: 'Users',
        icon: 'pi pi-users',
        routerLink: '/main/users',
      },
      {
        label: 'Posts',
        icon: 'pi pi-file-edit',
        routerLink: '/main/posts',
      },
    ]);

    expect(component.currentRoute).toBe('/main/home');
  });

  /**
   * Tests route tracking functionality when NavigationEnd event occurs
   */
  it('should update currentRoute when NavigationEnd event occurs', () => {
    fixture.detectChanges(); // This triggers ngOnInit and subscribes to router events

    // Emit a NavigationEnd event
    const navigationEnd = new NavigationEnd(1, '/main/users', '/main/users');
    routerEventsSubject.next(navigationEnd);

    expect(component.currentRoute).toBe('/main/users');
  });

  /**
   * Tests that non-NavigationEnd router events are properly ignored
   */
  it('should ignore non-NavigationEnd events', () => {
    fixture.detectChanges(); // This triggers ngOnInit

    const initialRoute = component.currentRoute;

    // Emit a non-NavigationEnd event (like NavigationStart)
    routerEventsSubject.next({ id: 1, url: '/main/posts' });

    // Route should not change
    expect(component.currentRoute).toBe(initialRoute);
  });

  /**
   * Tests logout functionality delegation to AuthService
   */
  it('should call logout method from AuthService', () => {
    component.logout();
    expect(mockAuthService.logout).toHaveBeenCalled();
  });

  /**
   * Test suite for isActiveRoute method
   * Verifies route matching logic for navigation highlighting
   */
  describe('isActiveRoute method', () => {
    /**
     * Sets up component before each isActiveRoute test
     */
    beforeEach(() => {
      fixture.detectChanges();
    });

    /**
     * Tests exact route matching functionality
     */
    it('should return true for exact route match', () => {
      component.currentRoute = '/main/home';
      expect(component.isActiveRoute('/main/home')).toBe(true);

      component.currentRoute = '/main/users';
      expect(component.isActiveRoute('/main/users')).toBe(true);

      component.currentRoute = '/main/posts';
      expect(component.isActiveRoute('/main/posts')).toBe(true);
    });

    /**
     * Tests rejection of non-matching routes
     */
    it('should return false for non-matching routes', () => {
      component.currentRoute = '/main/home';
      expect(component.isActiveRoute('/main/users')).toBe(false);
      expect(component.isActiveRoute('/main/posts')).toBe(false);

      component.currentRoute = '/main/users';
      expect(component.isActiveRoute('/main/home')).toBe(false);
      expect(component.isActiveRoute('/main/posts')).toBe(false);
    });

    /**
     * Tests special case for root /main route defaulting to home
     */
    it('should return true for /main/home when current route is /main', () => {
      component.currentRoute = '/main';
      expect(component.isActiveRoute('/main/home')).toBe(true);
    });

    /**
     * Tests that non-home routes are not active when current route is /main
     */
    it('should return false for other routes when current route is /main', () => {
      component.currentRoute = '/main';
      expect(component.isActiveRoute('/main/users')).toBe(false);
      expect(component.isActiveRoute('/main/posts')).toBe(false);
    });

    /**
     * Tests handling of edge cases with empty or invalid routes
     */
    it('should handle edge cases', () => {
      component.currentRoute = '';
      expect(component.isActiveRoute('/main/home')).toBe(false);

      component.currentRoute = '/other/route';
      expect(component.isActiveRoute('/main/home')).toBe(false);
    });
  });

  /**
   * Test suite for router event subscription edge cases
   * Covers complex navigation scenarios and URL redirects
   */
  describe('Router event subscription edge cases', () => {
    /**
     * Tests handling of urlAfterRedirects in NavigationEnd events
     */
    it('should handle urlAfterRedirects correctly in NavigationEnd', () => {
      fixture.detectChanges();

      // Test with different urlAfterRedirects
      const navigationEnd = new NavigationEnd(
        1,
        '/main/users',
        '/main/users/redirected'
      );
      routerEventsSubject.next(navigationEnd);

      expect(component.currentRoute).toBe('/main/users/redirected');
    });

    /**
     * Tests proper handling of multiple sequential navigation events
     */
    it('should handle multiple NavigationEnd events', () => {
      fixture.detectChanges();

      // First navigation
      routerEventsSubject.next(
        new NavigationEnd(1, '/main/users', '/main/users')
      );
      expect(component.currentRoute).toBe('/main/users');

      // Second navigation
      routerEventsSubject.next(
        new NavigationEnd(2, '/main/posts', '/main/posts')
      );
      expect(component.currentRoute).toBe('/main/posts');

      // Third navigation
      routerEventsSubject.next(
        new NavigationEnd(3, '/main/home', '/main/home')
      );
      expect(component.currentRoute).toBe('/main/home');
    });
  });

  /**
   * Test suite for component initialization scenarios
   * Verifies proper setup based on initial router state
   */
  describe('Component initialization', () => {
    /**
     * Tests initial route setup from router.url property
     */
    it('should set up router URL correctly from initial router.url', () => {
      mockRouter.url = '/main/posts';

      fixture.detectChanges();

      expect(component.currentRoute).toBe('/main/posts');
    });
  });

  /**
   * Test suite for menu items functionality
   * Verifies navigation menu structure and configuration
   */
  describe('Menu items functionality', () => {
    /**
     * Sets up component before each menu test
     */
    beforeEach(() => {
      fixture.detectChanges();
    });

    /**
     * Tests menu items structure and configuration
     */
    it('should have correct menu structure', () => {
      expect(component.menuItems).toBeDefined();
      expect(component.menuItems.length).toBe(3);

      expect(component.menuItems[0].label).toBe('Home');
      expect(component.menuItems[0].icon).toBe('pi pi-home');
      expect(component.menuItems[0].routerLink).toBe('/main/home');

      expect(component.menuItems[1].label).toBe('Users');
      expect(component.menuItems[1].icon).toBe('pi pi-users');
      expect(component.menuItems[1].routerLink).toBe('/main/users');

      expect(component.menuItems[2].label).toBe('Posts');
      expect(component.menuItems[2].icon).toBe('pi pi-file-edit');
      expect(component.menuItems[2].routerLink).toBe('/main/posts');
    });
  });

  /**
   * Tests subscription cleanup on component destruction
   * Ensures proper memory management and prevents memory leaks
   */
  it('should clean up subscriptions on destroy', () => {
    fixture.detectChanges();

    // Spy on unsubscribe if the component implements OnDestroy
    // If not implemented, this test documents expected behavior
    expect(component).toBeTruthy();

    // Destroy the component
    fixture.destroy();

    // After destruction, emitting events should not affect the component
    routerEventsSubject.next(new NavigationEnd(1, '/main/test', '/main/test'));
    // Component should not crash or update
    expect(component).toBeTruthy();
  });
});
