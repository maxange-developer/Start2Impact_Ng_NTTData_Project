import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { HTTP_INTERCEPTORS, HttpClient } from '@angular/common/http';
import { AuthInterceptor } from './auth.interceptor';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';

/**
 * Test suite for AuthInterceptor
 * Verifies authentication header injection and platform-specific behavior
 */
describe('AuthInterceptor', () => {
  let httpClient: HttpClient;
  let httpMock: HttpTestingController;

  /**
   * Sets up test environment with HTTP testing infrastructure
   * Configures interceptor with browser platform mock
   */
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        {
          provide: HTTP_INTERCEPTORS,
          useClass: AuthInterceptor,
          multi: true,
        },
        { provide: PLATFORM_ID, useValue: 'browser' },
      ],
    });

    httpClient = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  /**
   * Cleans up after each test to ensure test isolation
   */
  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  /**
   * Verifies interceptor can be instantiated correctly
   */
  it('should be created', () => {
    const interceptor = TestBed.inject(HTTP_INTERCEPTORS);
    expect(interceptor).toBeTruthy();
  });

  /**
   * Tests that Authorization header is added for GoREST API requests when token exists
   */
  it('should add Authorization header for gorest.co.in requests when token exists', () => {
    localStorage.setItem('authToken', 'test-token');

    httpClient.get('https://gorest.co.in/public/v2/users').subscribe();

    const req = httpMock.expectOne('https://gorest.co.in/public/v2/users');
    expect(req.request.headers.get('Authorization')).toBe('Bearer test-token');
    req.flush({ data: [] });
  });

  /**
   * Tests that Authorization header is not added for non-GoREST requests
   */
  it('should not add Authorization header for non-gorest requests', () => {
    localStorage.setItem('authToken', 'test-token');

    httpClient.get('https://api.example.com/data').subscribe();

    const req = httpMock.expectOne('https://api.example.com/data');
    expect(req.request.headers.has('Authorization')).toBeFalse();
    req.flush({ data: [] });
  });

  /**
   * Tests that no Authorization header is added when token doesn't exist
   */
  it('should not add Authorization header when no token exists', () => {
    httpClient.get('https://gorest.co.in/public/v2/users').subscribe();

    const req = httpMock.expectOne('https://gorest.co.in/public/v2/users');
    expect(req.request.headers.has('Authorization')).toBeFalse();
    req.flush({ data: [] });
  });

  /**
   * Tests interceptor behavior with different HTTP methods (POST, PUT, DELETE)
   */
  it('should work with different HTTP methods for gorest.co.in', () => {
    localStorage.setItem('authToken', 'method-test-token');

    // Test POST request with authentication
    httpClient
      .post('https://gorest.co.in/public/v2/users', { name: 'Test' })
      .subscribe();
    let req = httpMock.expectOne('https://gorest.co.in/public/v2/users');
    expect(req.request.headers.get('Authorization')).toBe(
      'Bearer method-test-token'
    );
    req.flush({ data: {} });

    // Test PUT request with authentication
    httpClient
      .put('https://gorest.co.in/public/v2/users/123', { name: 'Updated' })
      .subscribe();
    req = httpMock.expectOne('https://gorest.co.in/public/v2/users/123');
    expect(req.request.headers.get('Authorization')).toBe(
      'Bearer method-test-token'
    );
    req.flush({ data: {} });

    // Test DELETE request with authentication
    httpClient.delete('https://gorest.co.in/public/v2/users/123').subscribe();
    req = httpMock.expectOne('https://gorest.co.in/public/v2/users/123');
    expect(req.request.headers.get('Authorization')).toBe(
      'Bearer method-test-token'
    );
    req.flush({});
  });

  /**
   * Tests correct behavior in server-side rendering environment
   * Should not attempt to access localStorage during SSR
   */
  it('should handle SSR environment correctly', () => {
    // Reconfigure TestBed to simulate server environment
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        {
          provide: HTTP_INTERCEPTORS,
          useClass: AuthInterceptor,
          multi: true,
        },
        { provide: PLATFORM_ID, useValue: 'server' },
      ],
    });

    httpClient = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);

    httpClient.get('https://gorest.co.in/public/v2/users').subscribe();

    const req = httpMock.expectOne('https://gorest.co.in/public/v2/users');
    expect(req.request.headers.has('Authorization')).toBeFalse();
    req.flush({ data: [] });
  });

  /**
   * Tests that existing headers are preserved when adding Authorization header
   */
  it('should preserve existing headers while adding Authorization', () => {
    localStorage.setItem('authToken', 'preserve-headers-token');

    httpClient
      .get('https://gorest.co.in/public/v2/users', {
        headers: {
          'Content-Type': 'application/json',
          'X-Custom-Header': 'custom-value',
        },
      })
      .subscribe();

    const req = httpMock.expectOne('https://gorest.co.in/public/v2/users');
    expect(req.request.headers.get('Content-Type')).toBe('application/json');
    expect(req.request.headers.get('X-Custom-Header')).toBe('custom-value');
    expect(req.request.headers.get('Authorization')).toBe(
      'Bearer preserve-headers-token'
    );
    req.flush({ data: [] });
  });

  /**
   * Tests handling of edge cases with empty or whitespace tokens
   */
  it('should handle empty or whitespace token gracefully', () => {
    // Test with empty string token
    localStorage.setItem('authToken', '');
    httpClient.get('https://gorest.co.in/public/v2/users').subscribe();

    let req = httpMock.expectOne('https://gorest.co.in/public/v2/users');
    expect(req.request.headers.has('Authorization')).toBeFalse();
    req.flush({ data: [] });

    // Test with whitespace-only token
    localStorage.setItem('authToken', '   ');
    httpClient.get('https://gorest.co.in/public/v2/posts').subscribe();

    req = httpMock.expectOne('https://gorest.co.in/public/v2/posts');
    expect(req.request.headers.get('Authorization')).toBe('Bearer    ');
    req.flush({ data: [] });
  });
});
