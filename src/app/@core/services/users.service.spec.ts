import { TestBed } from '@angular/core/testing';
import { UsersService } from './users.service';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { User, UsersResponse, CreateUserRequest } from '../models/users';
import { PLATFORM_ID } from '@angular/core';
import { ConfigService } from './config.service';

/**
 * Test suite for UsersService
 * Verifies user management operations, API integration, and mock data functionality
 */
describe('UsersService', () => {
  let service: UsersService;
  let httpMock: HttpTestingController;
  let mockConfigService: jasmine.SpyObj<ConfigService>;

  /**
   * Sets up test environment with HTTP testing infrastructure and mocked dependencies
   */
  beforeEach(() => {
    mockConfigService = jasmine.createSpyObj('ConfigService', [], {
      useMockData: false,
    });

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        UsersService,
        { provide: ConfigService, useValue: mockConfigService },
        { provide: PLATFORM_ID, useValue: 'browser' },
      ],
    });
    service = TestBed.inject(UsersService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  /**
   * Verifies no outstanding HTTP requests after each test
   */
  afterEach(() => {
    httpMock.verify();
  });

  /**
   * Verifies that UsersService can be instantiated correctly
   */
  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  /**
   * Test suite for getUsers method
   * Covers filtering, pagination, error handling, and platform-specific behavior
   */
  describe('getUsers', () => {
    /**
     * Tests successful users retrieval with pagination headers
     */
    it('should get users successfully with headers', async () => {
      const promise = service.getUsers(1, 50);
      const req = httpMock.expectOne(
        'https://gorest.co.in/public/v2/users?page=1&per_page=50'
      );
      expect(req.request.method).toBe('GET');

      req.flush(
        [
          {
            id: 1,
            name: 'Test User',
            email: 'test@test.com',
            gender: 'male',
            status: 'active',
          },
        ],
        {
          headers: {
            'x-pagination-total': '25',
            'x-pagination-pages': '3',
            'x-pagination-page': '1',
            'x-pagination-per-page': '50',
          },
        }
      );

      const result = await promise;
      expect(result.data.length).toBe(1);
      expect(result.meta.pagination.total).toBe(25);
      expect(result.meta.pagination.pages).toBe(3);
    });

    /**
     * Tests users retrieval with all available filter parameters combined
     */
    it('should get users with all filters', async () => {
      const promise = service.getUsers(1, 50, {
        name: 'Mario',
        email: 'mario@',
        gender: 'male',
        status: 'active',
      });
      const req = httpMock.expectOne(
        'https://gorest.co.in/public/v2/users?page=1&per_page=50&name=Mario&email=mario@&gender=male&status=active'
      );
      req.flush([]);
      await promise;
    });

    /**
     * Tests users retrieval with individual filter parameters
     */
    it('should get users with individual filters', async () => {
      // Test name filter
      let promise = service.getUsers(1, 50, { name: 'Mario' });
      let req = httpMock.expectOne(
        'https://gorest.co.in/public/v2/users?page=1&per_page=50&name=Mario'
      );
      req.flush([]);
      await promise;

      // Test email filter
      promise = service.getUsers(1, 50, { email: 'test@' });
      req = httpMock.expectOne(
        'https://gorest.co.in/public/v2/users?page=1&per_page=50&email=test@'
      );
      req.flush([]);
      await promise;

      // Test gender filter
      promise = service.getUsers(1, 50, { gender: 'female' });
      req = httpMock.expectOne(
        'https://gorest.co.in/public/v2/users?page=1&per_page=50&gender=female'
      );
      req.flush([]);
      await promise;

      // Test status filter
      promise = service.getUsers(1, 50, { status: 'inactive' });
      req = httpMock.expectOne(
        'https://gorest.co.in/public/v2/users?page=1&per_page=50&status=inactive'
      );
      req.flush([]);
      await promise;
    });

    /**
     * Tests server-side rendering behavior returning empty data
     */
    it('should return empty data during SSR', async () => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        imports: [HttpClientTestingModule],
        providers: [
          UsersService,
          { provide: ConfigService, useValue: mockConfigService },
          { provide: PLATFORM_ID, useValue: 'server' },
        ],
      });

      const ssrService = TestBed.inject(UsersService);
      const result = await ssrService.getUsers(1, 50);

      expect(result.data).toEqual([]);
      expect(result.meta.pagination.total).toBe(0);
    });

    /**
     * Tests mock data usage when configured to use mock data
     */
    it('should use mock data when useMockData is true', async () => {
      mockConfigService = jasmine.createSpyObj('ConfigService', [], {
        useMockData: true,
      });

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        imports: [HttpClientTestingModule],
        providers: [
          UsersService,
          { provide: ConfigService, useValue: mockConfigService },
          { provide: PLATFORM_ID, useValue: 'browser' },
        ],
      });

      const mockService = TestBed.inject(UsersService);
      const result = await mockService.getUsers(1, 50);

      expect(result.data).toBeDefined();
      expect(Array.isArray(result.data)).toBeTrue();
    });

    /**
     * Tests handling of responses with missing pagination headers
     */
    it('should handle missing pagination headers', async () => {
      const promise = service.getUsers(1, 50);
      const req = httpMock.expectOne(
        'https://gorest.co.in/public/v2/users?page=1&per_page=50'
      );
      req.flush([]);

      const result = await promise;
      expect(result.meta.pagination.total).toBe(0);
      expect(result.meta.pagination.pages).toBe(1);
    });

    /**
     * Tests fallback to mock data when HTTP request fails
     */
    it('should fallback to mock data on any HTTP error', async () => {
      const promise = service.getUsers(1, 50);
      const req = httpMock.expectOne(
        'https://gorest.co.in/public/v2/users?page=1&per_page=50'
      );
      req.flush('Any Error', { status: 403, statusText: 'Forbidden' });

      const result = await promise;
      expect(result.data).toBeDefined();
      expect(Array.isArray(result.data)).toBeTrue();
    });
  });

  /**
   * Test suite for getUserById method
   * Covers individual user retrieval and error scenarios
   */
  describe('getUserById', () => {
    /**
     * Tests successful retrieval of a specific user by ID
     */
    it('should get user by id successfully', async () => {
      const mockUser: User = {
        id: 1,
        name: 'Test',
        email: 'test@test.com',
        gender: 'male',
        status: 'active',
      };

      const promise = service.getUserById(1);
      const req = httpMock.expectOne('https://gorest.co.in/public/v2/users/1');
      req.flush(mockUser);

      const result = await promise;
      expect(result).toEqual(mockUser);
    });

    /**
     * Tests mock data usage for individual user retrieval
     */
    it('should use mock data when useMockData is true', async () => {
      mockConfigService = jasmine.createSpyObj('ConfigService', [], {
        useMockData: true,
      });

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        imports: [HttpClientTestingModule],
        providers: [
          UsersService,
          { provide: ConfigService, useValue: mockConfigService },
          { provide: PLATFORM_ID, useValue: 'browser' },
        ],
      });

      const mockService = TestBed.inject(UsersService);
      const result = await mockService.getUserById(1);

      expect(result).toBeDefined();
      expect(result.id).toBe(1);
    });

    /**
     * Tests error handling when mock user is not found
     */
    it('should throw error when mock user not found', async () => {
      mockConfigService = jasmine.createSpyObj('ConfigService', [], {
        useMockData: true,
      });

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        imports: [HttpClientTestingModule],
        providers: [
          UsersService,
          { provide: ConfigService, useValue: mockConfigService },
          { provide: PLATFORM_ID, useValue: 'browser' },
        ],
      });

      const mockService = TestBed.inject(UsersService);

      await expectAsync(mockService.getUserById(999)).toBeRejectedWithError(
        'User with ID 999 not found'
      );
    });

    /**
     * Tests fallback to mock data when user is not found via API
     */
    it('should fallback to mock when HTTP fails', async () => {
      const promise = service.getUserById(1);
      const req = httpMock.expectOne('https://gorest.co.in/public/v2/users/1');
      req.flush('Not Found', { status: 404, statusText: 'Not Found' });

      const result = await promise;
      expect(result).toBeDefined();
      expect(result.id).toBe(1);
    });

    /**
     * Tests error handling when user is not found in both API and mock data
     */
    it('should throw error when neither API nor mock has user', async () => {
      const promise = service.getUserById(999);
      const req = httpMock.expectOne(
        'https://gorest.co.in/public/v2/users/999'
      );
      req.flush('Not Found', { status: 404, statusText: 'Not Found' });

      await expectAsync(promise).toBeRejected();
    });
  });

  /**
   * Test suite for createUser method
   * Covers user creation with both API and mock data
   */
  describe('createUser', () => {
    /**
     * Tests successful user creation via API
     */
    it('should create user successfully', async () => {
      const newUser: CreateUserRequest = {
        name: 'New User',
        email: 'new@test.com',
        gender: 'female',
        status: 'active',
      };
      const createdUser: User = { id: 2, ...newUser };

      const promise = service.createUser(newUser);
      const req = httpMock.expectOne('https://gorest.co.in/public/v2/users');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(newUser);
      req.flush(createdUser);

      const result = await promise;
      expect(result).toEqual(createdUser);
    });

    /**
     * Tests user creation using mock data
     */
    it('should create user with mock data', async () => {
      mockConfigService = jasmine.createSpyObj('ConfigService', [], {
        useMockData: true,
      });

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        imports: [HttpClientTestingModule],
        providers: [
          UsersService,
          { provide: ConfigService, useValue: mockConfigService },
          { provide: PLATFORM_ID, useValue: 'browser' },
        ],
      });

      const mockService = TestBed.inject(UsersService);
      const newUser: CreateUserRequest = {
        name: 'New User',
        email: 'new@test.com',
        gender: 'female',
        status: 'active',
      };

      const result = await mockService.createUser(newUser);

      expect(result).toBeDefined();
      expect(result.name).toBe('New User');
      expect(result.id).toBeGreaterThan(0);
    });

    /**
     * Tests error handling during user creation
     */
    it('should handle create user error', async () => {
      const newUser: CreateUserRequest = {
        name: 'Test',
        email: 'test@test.com',
        gender: 'male',
        status: 'active',
      };

      const promise = service.createUser(newUser);
      const req = httpMock.expectOne('https://gorest.co.in/public/v2/users');
      req.flush('error', { status: 500, statusText: 'Server Error' });

      await expectAsync(promise).toBeRejected();
    });
  });

  /**
   * Test suite for updateUser method
   * Covers user updates with validation and error handling
   */
  describe('updateUser', () => {
    /**
     * Tests successful user update via API
     */
    it('should update user successfully', async () => {
      const updateData: Partial<CreateUserRequest> = {
        name: 'Updated Name',
        email: 'updated@test.com',
      };
      const updatedUser: User = {
        id: 1,
        name: 'Updated Name',
        email: 'updated@test.com',
        gender: 'male',
        status: 'active',
      };

      const promise = service.updateUser(1, updateData);
      const req = httpMock.expectOne('https://gorest.co.in/public/v2/users/1');
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updateData);
      req.flush(updatedUser);

      const result = await promise;
      expect(result).toEqual(updatedUser);
    });

    /**
     * Tests user update using mock data
     */
    it('should update user with mock data', async () => {
      mockConfigService = jasmine.createSpyObj('ConfigService', [], {
        useMockData: true,
      });

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        imports: [HttpClientTestingModule],
        providers: [
          UsersService,
          { provide: ConfigService, useValue: mockConfigService },
          { provide: PLATFORM_ID, useValue: 'browser' },
        ],
      });

      const mockService = TestBed.inject(UsersService);
      const updateData: Partial<CreateUserRequest> = { name: 'Updated Name' };

      const result = await mockService.updateUser(1, updateData);

      expect(result).toBeDefined();
      expect(result.name).toBe('Updated Name');
    });

    /**
     * Tests error handling when updating non-existent mock user
     */
    it('should throw error when updating non-existent mock user', async () => {
      mockConfigService = jasmine.createSpyObj('ConfigService', [], {
        useMockData: true,
      });

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        imports: [HttpClientTestingModule],
        providers: [
          UsersService,
          { provide: ConfigService, useValue: mockConfigService },
          { provide: PLATFORM_ID, useValue: 'browser' },
        ],
      });

      const mockService = TestBed.inject(UsersService);

      await expectAsync(
        mockService.updateUser(999, { name: 'Updated' })
      ).toBeRejectedWithError('User with ID 999 not found');
    });

    /**
     * Tests error handling during user update
     */
    it('should handle update user error', async () => {
      const promise = service.updateUser(1, { name: 'Updated' });
      const req = httpMock.expectOne('https://gorest.co.in/public/v2/users/1');
      req.flush('Server Error', {
        status: 500,
        statusText: 'Internal Server Error',
      });

      await expectAsync(promise).toBeRejected();
    });
  });

  /**
   * Test suite for deleteUser method
   * Covers user deletion scenarios and error handling
   */
  describe('deleteUser', () => {
    /**
     * Tests successful user deletion via API
     */
    it('should delete user successfully', async () => {
      const promise = service.deleteUser(1);
      const req = httpMock.expectOne('https://gorest.co.in/public/v2/users/1');
      expect(req.request.method).toBe('DELETE');
      req.flush({});

      await promise;
      expect(true).toBeTrue(); // Test passed if no error thrown
    });

    /**
     * Tests user deletion using mock data
     */
    it('should delete user with mock data', async () => {
      mockConfigService = jasmine.createSpyObj('ConfigService', [], {
        useMockData: true,
      });

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        imports: [HttpClientTestingModule],
        providers: [
          UsersService,
          { provide: ConfigService, useValue: mockConfigService },
          { provide: PLATFORM_ID, useValue: 'browser' },
        ],
      });

      const mockService = TestBed.inject(UsersService);

      await mockService.deleteUser(1);
      expect(true).toBeTrue(); // Test passed if no error thrown
    });

    /**
     * Tests error handling when deleting non-existent mock user
     */
    it('should throw error when deleting non-existent mock user', async () => {
      mockConfigService = jasmine.createSpyObj('ConfigService', [], {
        useMockData: true,
      });

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        imports: [HttpClientTestingModule],
        providers: [
          UsersService,
          { provide: ConfigService, useValue: mockConfigService },
          { provide: PLATFORM_ID, useValue: 'browser' },
        ],
      });

      const mockService = TestBed.inject(UsersService);

      await expectAsync(mockService.deleteUser(999)).toBeRejectedWithError(
        'User with ID 999 not found'
      );
    });

    /**
     * Tests error handling during user deletion
     */
    it('should handle delete user error', async () => {
      const promise = service.deleteUser(1);
      const req = httpMock.expectOne('https://gorest.co.in/public/v2/users/1');
      req.flush('error', { status: 500, statusText: 'Server Error' });

      await expectAsync(promise).toBeRejected();
    });
  });

  /**
   * Test suite for helper methods
   * Covers convenience methods for searching and filtering users
   */
  describe('helper methods', () => {
    /**
     * Tests user search functionality by name
     */
    it('should search users', async () => {
      const promise = service.searchUsers('Mario', 1, 20);
      const req = httpMock.expectOne(
        'https://gorest.co.in/public/v2/users?page=1&per_page=20&name=Mario'
      );
      req.flush([]);

      await promise;
      expect(true).toBeTrue();
    });

    /**
     * Tests retrieval of users filtered by status
     */
    it('should get users by status', async () => {
      const promise = service.getUsersByStatus('active', 1, 20);
      const req = httpMock.expectOne(
        'https://gorest.co.in/public/v2/users?page=1&per_page=20&status=active'
      );
      req.flush([]);

      await promise;
      expect(true).toBeTrue();
    });

    /**
     * Tests retrieval of users filtered by gender
     */
    it('should get users by gender', async () => {
      const promise = service.getUsersByGender('female', 1, 20);
      const req = httpMock.expectOne(
        'https://gorest.co.in/public/v2/users?page=1&per_page=20&gender=female'
      );
      req.flush([]);

      await promise;
      expect(true).toBeTrue();
    });
  });

  /**
   * Test suite for mock data filtering functionality
   * Covers client-side filtering of mock data
   */
  describe('mock data filtering', () => {
    /**
     * Configures test environment to use mock data for filtering tests
     */
    beforeEach(() => {
      mockConfigService = jasmine.createSpyObj('ConfigService', [], {
        useMockData: true,
      });

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        imports: [HttpClientTestingModule],
        providers: [
          UsersService,
          { provide: ConfigService, useValue: mockConfigService },
          { provide: PLATFORM_ID, useValue: 'browser' },
        ],
      });
      service = TestBed.inject(UsersService);
    });

    /**
     * Tests name-based filtering of mock users
     */
    it('should filter mock users by name', async () => {
      const result = await service.getUsers(1, 50, { name: 'Mario' });

      expect(
        result.data.every((user) => user.name.toLowerCase().includes('mario'))
      ).toBeTrue();
    });

    /**
     * Tests email-based filtering of mock users
     */
    it('should filter mock users by email', async () => {
      const result = await service.getUsers(1, 50, { email: 'email.com' });

      expect(
        result.data.every((user) =>
          user.email.toLowerCase().includes('email.com')
        )
      ).toBeTrue();
    });

    /**
     * Tests gender-based filtering of mock users
     */
    it('should filter mock users by gender', async () => {
      const result = await service.getUsers(1, 50, { gender: 'male' });

      expect(result.data.every((user) => user.gender === 'male')).toBeTrue();
    });

    /**
     * Tests status-based filtering of mock users
     */
    it('should filter mock users by status', async () => {
      const result = await service.getUsers(1, 50, { status: 'active' });

      expect(result.data.every((user) => user.status === 'active')).toBeTrue();
    });

    /**
     * Tests pagination functionality with mock data
     */
    it('should handle pagination with mock data', async () => {
      const result = await service.getUsers(2, 5);

      expect(result.meta.pagination.page).toBe(2);
      expect(result.meta.pagination.per_page).toBe(5);
      expect(result.data.length).toBeLessThanOrEqual(5);
    });

    /**
     * Tests handling of filter results that return no matches
     */
    it('should return empty results when no matches', async () => {
      const result = await service.getUsers(1, 50, { name: 'NonExistentName' });

      expect(result.data.length).toBe(0);
      expect(result.meta.pagination.total).toBe(0);
    });
  });

  /**
   * Test suite for additional edge cases to achieve complete test coverage
   * Covers boundary conditions and error scenarios
   */
  describe('additional edge cases for complete coverage', () => {
    /**
     * Tests handling of partial HTTP response headers
     */
    it('should handle partial header values in HTTP response', async () => {
      const promise = service.getUsers(1, 50);
      const req = httpMock.expectOne(
        'https://gorest.co.in/public/v2/users?page=1&per_page=50'
      );
      req.flush(
        [
          {
            id: 1,
            name: 'Test',
            email: 'test@test.com',
            gender: 'male',
            status: 'active',
          },
        ],
        {
          headers: {
            'x-pagination-total': '100',
            'x-pagination-page': '1',
            // Missing some headers to test fallback
          },
        }
      );

      const result = await promise;
      expect(result.meta.pagination.total).toBe(100);
      expect(result.meta.pagination.pages).toBe(1); // Should fallback to 1
    });

    /**
     * Tests getUserById with HTTP success after configuring mock environment
     */
    it('should handle getUserById with HTTP success after previous mock setup', async () => {
      // Reset to use real HTTP
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        imports: [HttpClientTestingModule],
        providers: [
          UsersService,
          {
            provide: ConfigService,
            useValue: jasmine.createSpyObj('ConfigService', [], {
              useMockData: false,
            }),
          },
          { provide: PLATFORM_ID, useValue: 'browser' },
        ],
      });

      const httpService = TestBed.inject(UsersService);
      const httpMockNew = TestBed.inject(HttpTestingController);

      const mockUser: User = {
        id: 1,
        name: 'Test',
        email: 'test@test.com',
        gender: 'male',
        status: 'active',
      };

      const promise = httpService.getUserById(1);
      const req = httpMockNew.expectOne(
        'https://gorest.co.in/public/v2/users/1'
      );
      req.flush(mockUser);

      const result = await promise;
      expect(result).toEqual(mockUser);

      httpMockNew.verify();
    });

    /**
     * Tests createUser HTTP error handling without fallback
     */
    it('should handle createUser HTTP error without fallback', async () => {
      const newUser: CreateUserRequest = {
        name: 'Test User',
        email: 'test@test.com',
        gender: 'male',
        status: 'active',
      };

      const promise = service.createUser(newUser);
      const req = httpMock.expectOne('https://gorest.co.in/public/v2/users');
      req.flush('Validation Error', {
        status: 422,
        statusText: 'Unprocessable Entity',
      });

      await expectAsync(promise).toBeRejected();
    });

    /**
     * Tests updateUser HTTP error handling without fallback
     */
    it('should handle updateUser HTTP error without fallback', async () => {
      const updateData = { name: 'Updated Name' };

      const promise = service.updateUser(1, updateData);
      const req = httpMock.expectOne('https://gorest.co.in/public/v2/users/1');
      req.flush('User not found', { status: 404, statusText: 'Not Found' });

      await expectAsync(promise).toBeRejected();
    });

    /**
     * Tests deleteUser HTTP error handling without fallback
     */
    it('should handle deleteUser HTTP error without fallback', async () => {
      const promise = service.deleteUser(1);
      const req = httpMock.expectOne('https://gorest.co.in/public/v2/users/1');
      req.flush('User not found', { status: 404, statusText: 'Not Found' });

      await expectAsync(promise).toBeRejected();
    });
  });

  /**
   * Test suite for comprehensive mock data filtering scenarios
   * Covers complex filtering combinations and edge cases
   */
  describe('mock data comprehensive filtering', () => {
    /**
     * Configures mock data environment for comprehensive filtering tests
     */
    beforeEach(() => {
      mockConfigService = jasmine.createSpyObj('ConfigService', [], {
        useMockData: true,
      });

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        imports: [HttpClientTestingModule],
        providers: [
          UsersService,
          { provide: ConfigService, useValue: mockConfigService },
          { provide: PLATFORM_ID, useValue: 'browser' },
        ],
      });
      service = TestBed.inject(UsersService);
    });

    /**
     * Tests filtering with multiple criteria applied simultaneously
     */
    it('should combine all filters correctly', async () => {
      const result = await service.getUsers(1, 50, {
        name: 'Mario',
        email: 'email.com',
        gender: 'male',
        status: 'active',
      });

      expect(
        result.data.every(
          (user) =>
            user.name.toLowerCase().includes('mario') &&
            user.email.toLowerCase().includes('email.com') &&
            user.gender === 'male' &&
            user.status === 'active'
        )
      ).toBeTrue();
    });

    /**
     * Tests case-insensitive email filtering functionality
     */
    it('should handle case sensitivity in email filter', async () => {
      const result = await service.getUsers(1, 50, { email: 'EMAIL.COM' });

      expect(
        result.data.every((user) =>
          user.email.toLowerCase().includes('email.com')
        )
      ).toBeTrue();
    });

    /**
     * Tests edge case pagination calculations with small page sizes
     */
    it('should handle edge case pagination calculations', async () => {
      const result = await service.getUsers(1, 1); // 1 item per page

      expect(result.data.length).toBeLessThanOrEqual(1);
      expect(result.meta.pagination.per_page).toBe(1);
      expect(result.meta.pagination.pages).toBeGreaterThan(1);
    });
  });
});
