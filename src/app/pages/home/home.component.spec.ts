import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HomeComponent } from './home.component';
import { UsersService } from '../../@core/services/users.service';
import { PostsService } from '../../@core/services/posts.service';
import { AuthService } from '../../@core/services/auth/auth.service';
import { ConfigService } from '../../@core/services/config.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { of } from 'rxjs';

/**
 * Test suite for HomeComponent
 * Verifies dashboard functionality, statistics loading, and error handling
 */
describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let mockUsersService: jasmine.SpyObj<UsersService>;
  let mockPostsService: jasmine.SpyObj<PostsService>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockConfigService: jasmine.SpyObj<ConfigService>;
  let mockRouter: jasmine.SpyObj<Router>;

  /**
   * Sets up test environment with mocked dependencies and services
   */
  beforeEach(async () => {
    mockUsersService = jasmine.createSpyObj('UsersService', ['getUsers']);
    mockPostsService = jasmine.createSpyObj('PostsService', ['getPosts']);
    mockAuthService = jasmine.createSpyObj('AuthService', ['getCurrentUser']);
    mockConfigService = jasmine.createSpyObj('ConfigService', [], {
      useMockData: false,
    });
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      declarations: [HomeComponent],
      providers: [
        { provide: UsersService, useValue: mockUsersService },
        { provide: PostsService, useValue: mockPostsService },
        { provide: AuthService, useValue: mockAuthService },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: Router, useValue: mockRouter },
        { provide: PLATFORM_ID, useValue: 'browser' },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;

    // Default mock returns for successful statistics loading
    mockUsersService.getUsers.and.returnValue(
      Promise.resolve({
        data: [],
        meta: { pagination: { page: 1, pages: 1, per_page: 20, total: 100 } },
      })
    );

    mockPostsService.getPosts.and.returnValue(
      Promise.resolve({
        data: [],
        meta: { pagination: { page: 1, pages: 1, per_page: 20, total: 250 } },
      })
    );
  });

  /**
   * Verifies that HomeComponent can be instantiated correctly
   */
  it('should create', () => {
    expect(component).toBeTruthy();
  });

  /**
   * Tests component initialization with default property values
   */
  it('should initialize with default values', () => {
    expect(component.totalUsers).toBe(0);
    expect(component.totalPosts).toBe(0);
  });

  /**
   * Test suite for component initialization
   * Covers ngOnInit lifecycle hook and statistics loading
   */
  describe('ngOnInit', () => {
    /**
     * Tests successful statistics loading during component initialization
     */
    it('should load stats on init successfully', async () => {
      fixture.detectChanges(); // This triggers ngOnInit

      // Wait for async operations to complete
      await fixture.whenStable();

      expect(mockUsersService.getUsers).toHaveBeenCalledWith(1, 1);
      expect(mockPostsService.getPosts).toHaveBeenCalledWith(1, 1);
      expect(component.totalUsers).toBe(100);
      expect(component.totalPosts).toBe(250);
    });

    /**
     * Tests that ngOnInit properly calls the loadStats method
     */
    it('should call loadStats method', () => {
      spyOn(component as any, 'loadStats');
      component.ngOnInit();
      expect((component as any).loadStats).toHaveBeenCalled();
    });
  });

  /**
   * Test suite for statistics loading functionality
   * Covers successful loading, error handling, and edge cases
   */
  describe('loadStats method', () => {
    /**
     * Tests successful loading of users and posts statistics
     */
    it('should load users and posts stats successfully', async () => {
      await (component as any).loadStats();

      expect(mockUsersService.getUsers).toHaveBeenCalledWith(1, 1);
      expect(mockPostsService.getPosts).toHaveBeenCalledWith(1, 1);
      expect(component.totalUsers).toBe(100);
      expect(component.totalPosts).toBe(250);
    });

    /**
     * Tests graceful error handling when users service fails
     */
    it('should handle users service error gracefully', async () => {
      // Mock users service to throw error
      mockUsersService.getUsers.and.returnValue(Promise.reject('Users error'));
      spyOn(console, 'error');

      await (component as any).loadStats();

      expect(console.error).toHaveBeenCalledWith(
        'Error loading users stats:',
        'Users error'
      );
      expect(component.totalUsers).toBe(0); // Should remain 0
      expect(component.totalPosts).toBe(250); // Posts should still load
    });

    /**
     * Tests graceful error handling when posts service fails
     */
    it('should handle posts service error gracefully', async () => {
      // Mock posts service to throw error
      mockPostsService.getPosts.and.returnValue(Promise.reject('Posts error'));
      spyOn(console, 'error');

      await (component as any).loadStats();

      expect(console.error).toHaveBeenCalledWith(
        'Error loading posts stats:',
        'Posts error'
      );
      expect(component.totalUsers).toBe(100); // Users should still load
      expect(component.totalPosts).toBe(0); // Should remain 0
    });

    /**
     * Tests graceful error handling when both services fail
     */
    it('should handle both services errors gracefully', async () => {
      // Mock both services to throw errors
      mockUsersService.getUsers.and.returnValue(Promise.reject('Users error'));
      mockPostsService.getPosts.and.returnValue(Promise.reject('Posts error'));
      spyOn(console, 'error');

      await (component as any).loadStats();

      expect(console.error).toHaveBeenCalledWith(
        'Error loading users stats:',
        'Users error'
      );
      expect(console.error).toHaveBeenCalledWith(
        'Error loading posts stats:',
        'Posts error'
      );
      expect(component.totalUsers).toBe(0);
      expect(component.totalPosts).toBe(0);
    });

    /**
     * Tests handling of missing pagination metadata in users response
     */
    it('should handle missing pagination metadata in users response', async () => {
      mockUsersService.getUsers.and.returnValue(
        Promise.resolve({
          data: [],
          meta: {}, // Missing pagination
        } as any)
      );

      await (component as any).loadStats();

      expect(component.totalUsers).toBe(0);
    });

    /**
     * Tests handling of missing pagination metadata in posts response
     */
    it('should handle missing pagination metadata in posts response', async () => {
      mockPostsService.getPosts.and.returnValue(
        Promise.resolve({
          data: [],
          meta: {}, // Missing pagination
        } as any)
      );

      await (component as any).loadStats();

      expect(component.totalPosts).toBe(0);
    });

    /**
     * Tests handling of null pagination metadata in users response
     */
    it('should handle null pagination metadata in users response', async () => {
      mockUsersService.getUsers.and.returnValue(
        Promise.resolve({
          data: [],
          meta: { pagination: null },
        } as any)
      );

      await (component as any).loadStats();

      expect(component.totalUsers).toBe(0);
    });

    /**
     * Tests handling of null pagination metadata in posts response
     */
    it('should handle null pagination metadata in posts response', async () => {
      mockPostsService.getPosts.and.returnValue(
        Promise.resolve({
          data: [],
          meta: { pagination: null },
        } as any)
      );

      await (component as any).loadStats();

      expect(component.totalPosts).toBe(0);
    });

    /**
     * Tests handling of undefined total in users pagination
     */
    it('should handle undefined total in users pagination', async () => {
      mockUsersService.getUsers.and.returnValue(
        Promise.resolve({
          data: [],
          meta: {
            pagination: {
              page: 1,
              pages: 1,
              per_page: 20,
              total: undefined,
            },
          },
        } as any)
      );

      await (component as any).loadStats();

      expect(component.totalUsers).toBe(0);
    });

    /**
     * Tests handling of undefined total in posts pagination
     */
    it('should handle undefined total in posts pagination', async () => {
      mockPostsService.getPosts.and.returnValue(
        Promise.resolve({
          data: [],
          meta: {
            pagination: {
              page: 1,
              pages: 1,
              per_page: 20,
              total: undefined,
            },
          },
        } as any)
      );

      await (component as any).loadStats();

      expect(component.totalPosts).toBe(0);
    });

    /**
     * Tests proper handling of different total values
     */
    it('should handle different total values correctly', async () => {
      mockUsersService.getUsers.and.returnValue(
        Promise.resolve({
          data: [],
          meta: { pagination: { page: 1, pages: 5, per_page: 20, total: 500 } },
        })
      );

      mockPostsService.getPosts.and.returnValue(
        Promise.resolve({
          data: [],
          meta: {
            pagination: { page: 1, pages: 10, per_page: 20, total: 1000 },
          },
        })
      );

      await (component as any).loadStats();

      expect(component.totalUsers).toBe(500);
      expect(component.totalPosts).toBe(1000);
    });

    /**
     * Tests proper handling of zero totals
     */
    it('should handle zero totals correctly', async () => {
      mockUsersService.getUsers.and.returnValue(
        Promise.resolve({
          data: [],
          meta: { pagination: { page: 1, pages: 0, per_page: 20, total: 0 } },
        })
      );

      mockPostsService.getPosts.and.returnValue(
        Promise.resolve({
          data: [],
          meta: { pagination: { page: 1, pages: 0, per_page: 20, total: 0 } },
        })
      );

      await (component as any).loadStats();

      expect(component.totalUsers).toBe(0);
      expect(component.totalPosts).toBe(0);
    });
  });

  /**
   * Test suite for component integration scenarios
   * Verifies full component lifecycle and property updates
   */
  describe('component integration', () => {
    /**
     * Tests complete integration flow from ngOnInit to property updates
     */
    it('should load stats during ngOnInit and update component properties', async () => {
      // Custom totals for this test
      mockUsersService.getUsers.and.returnValue(
        Promise.resolve({
          data: [],
          meta: { pagination: { page: 1, pages: 1, per_page: 20, total: 42 } },
        })
      );

      mockPostsService.getPosts.and.returnValue(
        Promise.resolve({
          data: [],
          meta: { pagination: { page: 1, pages: 1, per_page: 20, total: 84 } },
        })
      );

      fixture.detectChanges(); // Triggers ngOnInit
      await fixture.whenStable(); // Wait for async operations

      expect(component.totalUsers).toBe(42);
      expect(component.totalPosts).toBe(84);
    });

    /**
     * Tests proper component lifecycle management
     */
    it('should handle component lifecycle correctly', () => {
      expect(component.totalUsers).toBe(0);
      expect(component.totalPosts).toBe(0);

      // Component should be properly initialized
      expect(component).toBeTruthy();
      expect(typeof component.ngOnInit).toBe('function');
    });
  });

  /**
   * Test suite for error scenarios and edge cases
   * Covers network errors, malformed data, and timeout scenarios
   */
  describe('error scenarios', () => {
    /**
     * Tests handling of network timeout errors
     */
    it('should handle network timeout errors', async () => {
      const timeoutError = { message: 'Network timeout' };
      mockUsersService.getUsers.and.returnValue(Promise.reject(timeoutError));
      mockPostsService.getPosts.and.returnValue(Promise.reject(timeoutError));
      spyOn(console, 'error');

      await (component as any).loadStats();

      expect(console.error).toHaveBeenCalledWith(
        'Error loading users stats:',
        timeoutError
      );
      expect(console.error).toHaveBeenCalledWith(
        'Error loading posts stats:',
        timeoutError
      );
    });

    /**
     * Tests handling of malformed response data
     */
    it('should handle malformed response data', async () => {
      mockUsersService.getUsers.and.returnValue(Promise.resolve(null as any));
      mockPostsService.getPosts.and.returnValue(
        Promise.resolve(undefined as any)
      );
      spyOn(console, 'error');

      await (component as any).loadStats();

      // Should handle gracefully without throwing
      expect(component.totalUsers).toBe(0);
      expect(component.totalPosts).toBe(0);
    });
  });
});
