import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { PLATFORM_ID } from '@angular/core';
import { AuthService } from './auth.service';
import { ConfigService } from '../config.service';

/**
 * Test suite for AuthService
 * Verifies authentication, token management, and platform-specific behaviors
 */
describe('AuthService', () => {
  let service: AuthService;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockConfigService: jasmine.SpyObj<ConfigService>;

  /**
   * Sets up test environment with mocked dependencies
   * Configures service with browser platform and mock auth enabled
   */
  beforeEach(() => {
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockConfigService = jasmine.createSpyObj('ConfigService', [], {
      useMockData: true,
    });

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: Router, useValue: mockRouter },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: PLATFORM_ID, useValue: 'browser' },
      ],
    });

    service = TestBed.inject(AuthService);
    localStorage.clear();
  });

  /**
   * Cleans up localStorage after each test to ensure test isolation
   */
  afterEach(() => {
    localStorage.clear();
  });

  /**
   * Verifies that AuthService can be instantiated correctly
   */
  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  /**
   * Tests that valid token returns true for authentication check
   */
  it('should return true if valid token exists', () => {
    const mockToken = generateValidMockToken();
    localStorage.setItem('authToken', mockToken);

    expect(service.isAuthenticated()).toBeTrue();
  });

  /**
   * Tests that missing token returns false for authentication check
   */
  it('should return false if no token exists', () => {
    localStorage.removeItem('authToken');
    expect(service.isAuthenticated()).toBeFalse();
  });

  /**
   * Tests that expired token returns false for authentication check
   */
  it('should return false if token is expired', () => {
    const expiredToken = generateExpiredMockToken();
    localStorage.setItem('authToken', expiredToken);

    expect(service.isAuthenticated()).toBeFalse();
  });

  /**
   * Tests token retrieval from localStorage
   */
  it('should get token from localStorage', () => {
    const testToken = 'test-token';
    localStorage.setItem('authToken', testToken);

    expect(service.getToken()).toBe(testToken);
  });

  /**
   * Tests that null is returned when no token exists in localStorage
   */
  it('should return null if no token in localStorage', () => {
    localStorage.removeItem('authToken');
    expect(service.getToken()).toBeNull();
  });

  /**
   * Tests token-based login with navigation to home page
   */
  it('should login with token and navigate to home', (done) => {
    const testToken = 'test-token';

    service.login(testToken);

    expect(localStorage.getItem('authToken')).toBeTruthy();

    setTimeout(() => {
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/main/home']);
      done();
    }, 150);
  });

  /**
   * Tests successful credential-based login with mock authentication
   */
  it('should login with correct credentials when using mock auth', (done) => {
    const result = service.loginWithCredentials('admin@test.com', 'password');

    expect(result).toBeTrue();
    expect(localStorage.getItem('authToken')).toBeTruthy();

    setTimeout(() => {
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/main/home']);
      done();
    }, 150);
  });

  /**
   * Tests failed login with incorrect credentials
   */
  it('should fail login with incorrect credentials', () => {
    const result = service.loginWithCredentials('wrong@email.com', 'wrong');

    expect(result).toBeFalse();
    expect(localStorage.getItem('authToken')).toBeNull();
  });

  /**
   * Tests logout functionality with token removal and navigation
   */
  it('should logout and remove token', () => {
    localStorage.setItem('authToken', 'test-token');

    service.logout();

    expect(localStorage.getItem('authToken')).toBeNull();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
  });

  /**
   * Tests current user retrieval when authenticated with valid token
   */
  it('should return current user when authenticated with mock auth', () => {
    const mockToken = generateValidMockToken();
    localStorage.setItem('authToken', mockToken);

    const user = service.getCurrentUser();

    expect(user).toEqual({
      id: 1,
      name: 'Mario Rossi',
      email: 'mario.rossi@email.com',
      role: 'admin',
    });
  });

  /**
   * Tests that null is returned for current user when not authenticated
   */
  it('should return null for current user when not authenticated', () => {
    localStorage.removeItem('authToken');

    const user = service.getCurrentUser();

    expect(user).toBeNull();
  });

  /**
   * Tests authentication behavior in server-side rendering environment
   */
  it('should return false for isAuthenticated in SSR environment', () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: Router, useValue: mockRouter },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: PLATFORM_ID, useValue: 'server' },
      ],
    });

    const ssrService = TestBed.inject(AuthService);
    expect(ssrService.isAuthenticated()).toBeFalse();
  });

  /**
   * Tests token retrieval behavior in server-side rendering environment
   */
  it('should return null for getToken in SSR environment', () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: Router, useValue: mockRouter },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: PLATFORM_ID, useValue: 'server' },
      ],
    });

    const ssrService = TestBed.inject(AuthService);
    expect(ssrService.getToken()).toBeNull();
  });

  /**
   * Tests for JWT token validation edge cases
   * Covers tokens with missing or malformed claims
   */
  describe('JWT token validation edge cases', () => {
    /**
     * Tests handling of JWT tokens without expiration claim
     */
    it('should handle JWT with missing exp claim', () => {
      const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
      const payload = btoa(
        JSON.stringify({
          sub: 1,
          name: 'Test User',
          // Missing exp claim
        })
      );
      const signature = btoa('mock_signature');
      const tokenWithoutExp = `${header}.${payload}.${signature}`;

      localStorage.setItem('authToken', tokenWithoutExp);
      expect(service.isAuthenticated()).toBeTrue();
    });
  });

  /**
   * Tests for getCurrentUser method edge cases
   * Covers scenarios with invalid or expired tokens
   */
  describe('getCurrentUser edge cases', () => {
    /**
     * Tests getCurrentUser behavior with expired token
     */
    it('should handle expired token in getCurrentUser', () => {
      const expiredToken = generateExpiredMockToken();
      localStorage.setItem('authToken', expiredToken);
      const user = service.getCurrentUser();
      expect(user).toBeNull();
    });
  });

  /**
   * Tests for additional loginWithCredentials scenarios
   * Covers various invalid email and password combinations
   */
  describe('loginWithCredentials additional branches', () => {
    /**
     * Tests login with various incorrect email formats
     */
    it('should handle different wrong email formats', () => {
      expect(
        service.loginWithCredentials('admin@wrong.com', 'password')
      ).toBeFalse();
      expect(
        service.loginWithCredentials('wrong@test.com', 'password')
      ).toBeFalse();
      expect(service.loginWithCredentials('', 'password')).toBeFalse();
    });

    /**
     * Tests login with various incorrect passwords
     */
    it('should handle different wrong passwords', () => {
      expect(
        service.loginWithCredentials('admin@test.com', 'wrongpassword')
      ).toBeFalse();
      expect(service.loginWithCredentials('admin@test.com', '')).toBeFalse();
      expect(
        service.loginWithCredentials('admin@test.com', '123456')
      ).toBeFalse();
    });

    /**
     * Tests login with both email and password incorrect
     */
    it('should handle both email and password wrong', () => {
      expect(
        service.loginWithCredentials('wrong@email.com', 'wrongpassword')
      ).toBeFalse();
    });
  });

  /**
   * Tests for platform-specific edge cases
   * Ensures consistent behavior across different platforms
   */
  describe('platform edge cases', () => {
    /**
     * Tests consistent SSR behavior across all methods
     */
    it('should handle getToken in SSR consistently', () => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          AuthService,
          { provide: Router, useValue: mockRouter },
          { provide: ConfigService, useValue: mockConfigService },
          { provide: PLATFORM_ID, useValue: 'server' },
        ],
      });
      const ssrService = TestBed.inject(AuthService);

      expect(ssrService.getToken()).toBeNull();
      expect(ssrService.isAuthenticated()).toBeFalse();
      expect(ssrService.getCurrentUser()).toBeNull();
    });
  });
});

/**
 * Helper function to generate a valid mock JWT token for testing
 * Creates a token with future expiration date
 * @returns Valid JWT token string
 */
function generateValidMockToken(): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(
    JSON.stringify({
      sub: 1,
      name: 'Mario Rossi',
      email: 'mario.rossi@email.com',
      role: 'admin',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60, // 24 ore nel futuro
    })
  );
  const signature = btoa('mock_signature');
  return `${header}.${payload}.${signature}`;
}

/**
 * Helper function to generate an expired mock JWT token for testing
 * Creates a token with past expiration date
 * @returns Expired JWT token string
 */
function generateExpiredMockToken(): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(
    JSON.stringify({
      sub: 1,
      name: 'Mario Rossi',
      email: 'mario.rossi@email.com',
      role: 'admin',
      iat: Math.floor(Date.now() / 1000) - 3600,
      exp: Math.floor(Date.now() / 1000) - 1800,
    })
  );
  const signature = btoa('mock_signature');
  return `${header}.${payload}.${signature}`;
}
