import { TestBed } from '@angular/core/testing';
import { PostsService } from './posts.service';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { Post, PostsResponse, CreatePostRequest } from '../models/posts';
import { PLATFORM_ID } from '@angular/core';
import { ConfigService } from './config.service';

/**
 * Test suite for PostsService
 * Verifies post management operations, API integration, and mock data functionality
 */
describe('PostsService', () => {
  let service: PostsService;
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
        PostsService,
        { provide: ConfigService, useValue: mockConfigService },
        { provide: PLATFORM_ID, useValue: 'browser' },
      ],
    });
    service = TestBed.inject(PostsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  /**
   * Verifies no outstanding HTTP requests after each test
   */
  afterEach(() => {
    httpMock.verify();
  });

  /**
   * Verifies that PostsService can be instantiated correctly
   */
  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  /**
   * Test suite for getPosts method
   * Covers filtering, pagination, error handling, and platform-specific behavior
   */
  describe('getPosts', () => {
    /**
     * Tests basic posts retrieval without any filters
     */
    it('should get posts without filters', async () => {
      const mockResponse: PostsResponse = {
        data: [{ id: 1, user_id: 1, title: 'Test Post', body: 'Test body' }],
        meta: { pagination: { page: 1, pages: 1, per_page: 10, total: 1 } },
      };

      const promise = service.getPosts(1, 10);
      const req = httpMock.expectOne(
        'https://gorest.co.in/public/v2/posts?page=1&per_page=10'
      );
      expect(req.request.method).toBe('GET');
      req.flush(
        [{ id: 1, user_id: 1, title: 'Test Post', body: 'Test body' }],
        {
          headers: {
            'x-pagination-total': '1',
            'x-pagination-pages': '1',
          },
        }
      );

      const result = await promise;
      expect(result.data).toBeDefined();
      expect(result.data.length).toBe(1);
    });

    /**
     * Tests posts retrieval with title filter parameter
     */
    it('should get posts with title filter', async () => {
      const promise = service.getPosts(1, 10, { title: 'Angular' });
      const req = httpMock.expectOne(
        'https://gorest.co.in/public/v2/posts?page=1&per_page=10&title=Angular'
      );
      req.flush([]);
      await promise;
    });

    /**
     * Tests posts retrieval with body content filter parameter
     */
    it('should get posts with body filter', async () => {
      const promise = service.getPosts(1, 10, { body: 'tutorial' });
      const req = httpMock.expectOne(
        'https://gorest.co.in/public/v2/posts?page=1&per_page=10&body=tutorial'
      );
      req.flush([]);
      await promise;
    });

    /**
     * Tests posts retrieval with user ID filter parameter
     */
    it('should get posts with user_id filter', async () => {
      const promise = service.getPosts(1, 10, { user_id: 123 });
      const req = httpMock.expectOne(
        'https://gorest.co.in/public/v2/posts?page=1&per_page=10&user_id=123'
      );
      req.flush([]);
      await promise;
    });

    /**
     * Tests posts retrieval with all available filter parameters combined
     */
    it('should get posts with all filters', async () => {
      const promise = service.getPosts(1, 10, {
        title: 'Angular',
        body: 'tutorial',
        user_id: 123,
      });
      const req = httpMock.expectOne(
        'https://gorest.co.in/public/v2/posts?page=1&per_page=10&title=Angular&body=tutorial&user_id=123'
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
          PostsService,
          { provide: ConfigService, useValue: mockConfigService },
          { provide: PLATFORM_ID, useValue: 'server' },
        ],
      });

      const ssrService = TestBed.inject(PostsService);
      const result = await ssrService.getPosts(1, 10);

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
          PostsService,
          { provide: ConfigService, useValue: mockConfigService },
          { provide: PLATFORM_ID, useValue: 'browser' },
        ],
      });

      const mockService = TestBed.inject(PostsService);
      const result = await mockService.getPosts(1, 10);

      expect(result.data).toBeDefined();
      expect(Array.isArray(result.data)).toBeTrue();
    });

    /**
     * Tests fallback to mock data when HTTP request fails
     */
    it('should fallback to mock data on HTTP error', async () => {
      const promise = service.getPosts(1, 10);
      const req = httpMock.expectOne(
        'https://gorest.co.in/public/v2/posts?page=1&per_page=10'
      );
      req.flush('Server Error', {
        status: 500,
        statusText: 'Internal Server Error',
      });

      const result = await promise;
      expect(result.data).toBeDefined();
      expect(Array.isArray(result.data)).toBeTrue();
    });

    /**
     * Tests handling of responses with missing pagination headers
     */
    it('should handle missing pagination headers', async () => {
      const promise = service.getPosts(1, 10);
      const req = httpMock.expectOne(
        'https://gorest.co.in/public/v2/posts?page=1&per_page=10'
      );
      req.flush([{ id: 1, user_id: 1, title: 'Test', body: 'Body' }]);

      const result = await promise;
      expect(result.meta.pagination.total).toBe(0);
      expect(result.meta.pagination.pages).toBe(0);
    });
  });

  /**
   * Test suite for getPostById method
   * Covers individual post retrieval and error scenarios
   */
  describe('getPostById', () => {
    /**
     * Tests successful retrieval of a specific post by ID
     */
    it('should get post by id successfully', async () => {
      const mockPost: Post = {
        id: 1,
        user_id: 1,
        title: 'Test Post',
        body: 'Test body',
      };

      const promise = service.getPostById(1);
      const req = httpMock.expectOne('https://gorest.co.in/public/v2/posts/1');
      req.flush(mockPost);

      const result = await promise;
      expect(result).toEqual(mockPost);
    });

    /**
     * Tests fallback to mock data when post is not found via API
     */
    it('should fallback to mock when post not found', async () => {
      const promise = service.getPostById(1);
      const req = httpMock.expectOne('https://gorest.co.in/public/v2/posts/1');
      req.flush('Not Found', { status: 404, statusText: 'Not Found' });

      const result = await promise;
      expect(result).toBeDefined();
      expect(result.id).toBe(1);
    });

    /**
     * Tests mock data usage for individual post retrieval
     */
    it('should use mock data when useMockData is true', async () => {
      mockConfigService = jasmine.createSpyObj('ConfigService', [], {
        useMockData: true,
      });

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        imports: [HttpClientTestingModule],
        providers: [
          PostsService,
          { provide: ConfigService, useValue: mockConfigService },
          { provide: PLATFORM_ID, useValue: 'browser' },
        ],
      });

      const mockService = TestBed.inject(PostsService);
      const result = await mockService.getPostById(1);

      expect(result).toBeDefined();
      expect(result.id).toBe(1);
    });

    /**
     * Tests error handling when mock post is not found
     */
    it('should throw error when mock post not found', async () => {
      mockConfigService = jasmine.createSpyObj('ConfigService', [], {
        useMockData: true,
      });

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        imports: [HttpClientTestingModule],
        providers: [
          PostsService,
          { provide: ConfigService, useValue: mockConfigService },
          { provide: PLATFORM_ID, useValue: 'browser' },
        ],
      });

      const mockService = TestBed.inject(PostsService);

      await expectAsync(mockService.getPostById(999)).toBeRejectedWithError(
        'Post with ID 999 not found'
      );
    });
  });

  /**
   * Test suite for createPost method
   * Covers post creation with both API and mock data
   */
  describe('createPost', () => {
    /**
     * Tests successful post creation via API
     */
    it('should create post successfully', async () => {
      const newPost: CreatePostRequest = {
        user_id: 1,
        title: 'New Post',
        body: 'New body',
      };
      const createdPost: Post = { id: 2, ...newPost };

      const promise = service.createPost(newPost);
      const req = httpMock.expectOne('https://gorest.co.in/public/v2/posts');
      req.flush(createdPost);

      const result = await promise;
      expect(result).toEqual(createdPost);
    });

    /**
     * Tests post creation using mock data
     */
    it('should create post with mock data', async () => {
      mockConfigService = jasmine.createSpyObj('ConfigService', [], {
        useMockData: true,
      });

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        imports: [HttpClientTestingModule],
        providers: [
          PostsService,
          { provide: ConfigService, useValue: mockConfigService },
          { provide: PLATFORM_ID, useValue: 'browser' },
        ],
      });

      const mockService = TestBed.inject(PostsService);
      const newPost: CreatePostRequest = {
        user_id: 1,
        title: 'Mock Post',
        body: 'Mock body',
      };

      const result = await mockService.createPost(newPost);

      expect(result).toBeDefined();
      expect(result.title).toBe('Mock Post');
      expect(result.id).toBeGreaterThan(0);
    });

    /**
     * Tests error handling during post creation
     */
    it('should handle create post error', async () => {
      const newPost: CreatePostRequest = {
        user_id: 1,
        title: 'Test',
        body: 'Body',
      };

      const promise = service.createPost(newPost);
      const req = httpMock.expectOne('https://gorest.co.in/public/v2/posts');
      req.flush('Server Error', {
        status: 500,
        statusText: 'Internal Server Error',
      });

      await expectAsync(promise).toBeRejected();
    });
  });

  /**
   * Test suite for updatePost method
   * Covers post updates with validation and error handling
   */
  describe('updatePost', () => {
    /**
     * Tests successful post update via API
     */
    it('should update post successfully', async () => {
      const updateData: Partial<CreatePostRequest> = { title: 'Updated Title' };
      const updatedPost: Post = {
        id: 1,
        user_id: 1,
        title: 'Updated Title',
        body: 'Test body',
      };

      const promise = service.updatePost(1, updateData);
      const req = httpMock.expectOne('https://gorest.co.in/public/v2/posts/1');
      req.flush(updatedPost);

      const result = await promise;
      expect(result).toEqual(updatedPost);
    });

    /**
     * Tests post update using mock data
     */
    it('should update post with mock data', async () => {
      mockConfigService = jasmine.createSpyObj('ConfigService', [], {
        useMockData: true,
      });

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        imports: [HttpClientTestingModule],
        providers: [
          PostsService,
          { provide: ConfigService, useValue: mockConfigService },
          { provide: PLATFORM_ID, useValue: 'browser' },
        ],
      });

      const mockService = TestBed.inject(PostsService);
      const updateData: Partial<CreatePostRequest> = {
        title: 'Updated Mock Title',
      };

      const result = await mockService.updatePost(1, updateData);

      expect(result).toBeDefined();
      expect(result.title).toBe('Updated Mock Title');
    });

    /**
     * Tests error handling when updating non-existent mock post
     */
    it('should throw error when updating non-existent mock post', async () => {
      mockConfigService = jasmine.createSpyObj('ConfigService', [], {
        useMockData: true,
      });

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        imports: [HttpClientTestingModule],
        providers: [
          PostsService,
          { provide: ConfigService, useValue: mockConfigService },
          { provide: PLATFORM_ID, useValue: 'browser' },
        ],
      });

      const mockService = TestBed.inject(PostsService);

      await expectAsync(
        mockService.updatePost(999, { title: 'Updated' })
      ).toBeRejectedWithError('Post with ID 999 not found');
    });

    /**
     * Tests error handling during post update
     */
    it('should handle update post error', async () => {
      const promise = service.updatePost(1, { title: 'Updated' });
      const req = httpMock.expectOne('https://gorest.co.in/public/v2/posts/1');
      req.flush('Server Error', {
        status: 500,
        statusText: 'Internal Server Error',
      });

      await expectAsync(promise).toBeRejected();
    });
  });

  /**
   * Test suite for deletePost method
   * Covers post deletion scenarios and error handling
   */
  describe('deletePost', () => {
    /**
     * Tests successful post deletion via API
     */
    it('should delete post successfully', async () => {
      const promise = service.deletePost(1);
      const req = httpMock.expectOne('https://gorest.co.in/public/v2/posts/1');
      req.flush({});

      await promise;
      expect(true).toBeTrue();
    });

    /**
     * Tests post deletion using mock data
     */
    it('should delete post with mock data', async () => {
      mockConfigService = jasmine.createSpyObj('ConfigService', [], {
        useMockData: true,
      });

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        imports: [HttpClientTestingModule],
        providers: [
          PostsService,
          { provide: ConfigService, useValue: mockConfigService },
          { provide: PLATFORM_ID, useValue: 'browser' },
        ],
      });

      const mockService = TestBed.inject(PostsService);

      await mockService.deletePost(1);
      expect(true).toBeTrue();
    });

    /**
     * Tests error handling when deleting non-existent mock post
     */
    it('should throw error when deleting non-existent mock post', async () => {
      mockConfigService = jasmine.createSpyObj('ConfigService', [], {
        useMockData: true,
      });

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        imports: [HttpClientTestingModule],
        providers: [
          PostsService,
          { provide: ConfigService, useValue: mockConfigService },
          { provide: PLATFORM_ID, useValue: 'browser' },
        ],
      });

      const mockService = TestBed.inject(PostsService);

      await expectAsync(mockService.deletePost(999)).toBeRejectedWithError(
        'Post with ID 999 not found'
      );
    });

    /**
     * Tests error handling during post deletion
     */
    it('should handle delete post error', async () => {
      const promise = service.deletePost(1);
      const req = httpMock.expectOne('https://gorest.co.in/public/v2/posts/1');
      req.flush('Server Error', {
        status: 500,
        statusText: 'Internal Server Error',
      });

      await expectAsync(promise).toBeRejected();
    });
  });

  /**
   * Test suite for helper methods
   * Covers convenience methods for searching and filtering posts
   */
  describe('helper methods', () => {
    /**
     * Tests post search functionality by title
     */
    it('should search posts', async () => {
      const promise = service.searchPosts('Angular', 1, 20);
      const req = httpMock.expectOne(
        'https://gorest.co.in/public/v2/posts?page=1&per_page=20&title=Angular'
      );
      req.flush([]);

      await promise;
      expect(true).toBeTrue();
    });

    /**
     * Tests retrieval of posts for a specific user
     */
    it('should get posts by user', async () => {
      const promise = service.getPostsByUser(1, 1, 20);
      const req = httpMock.expectOne(
        'https://gorest.co.in/public/v2/posts?page=1&per_page=20&user_id=1'
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
          PostsService,
          { provide: ConfigService, useValue: mockConfigService },
          { provide: PLATFORM_ID, useValue: 'browser' },
        ],
      });
      service = TestBed.inject(PostsService);
    });

    /**
     * Tests title-based filtering of mock posts
     */
    it('should filter mock posts by title', async () => {
      const result = await service.getPosts(1, 20, { title: 'Angular' });

      expect(
        result.data.every((post) =>
          post.title.toLowerCase().includes('angular')
        )
      ).toBeTrue();
    });

    /**
     * Tests body content filtering of mock posts
     */
    it('should filter mock posts by body', async () => {
      const result = await service.getPosts(1, 20, { body: 'web' });

      expect(
        result.data.every((post) => post.body.toLowerCase().includes('web'))
      ).toBeTrue();
    });

    /**
     * Tests user ID filtering of mock posts
     */
    it('should filter mock posts by user_id', async () => {
      const result = await service.getPosts(1, 20, { user_id: 1 });

      expect(result.data.every((post) => post.user_id === 1)).toBeTrue();
    });

    /**
     * Tests pagination functionality with mock data
     */
    it('should handle pagination with mock data', async () => {
      const result = await service.getPosts(2, 5);

      expect(result.meta.pagination.page).toBe(2);
      expect(result.meta.pagination.per_page).toBe(5);
      expect(result.data.length).toBeLessThanOrEqual(5);
    });
  });

  /**
   * Tests handling of user_id as string parameter
   */
  it('should handle user_id as string filter', async () => {
    const promise = service.getPosts(1, 10, { user_id: '123' as any });
    const req = httpMock.expectOne(
      'https://gorest.co.in/public/v2/posts?page=1&per_page=10&user_id=123'
    );
    req.flush([]);
    await promise;
  });

  /**
   * Tests SSR behavior returning empty data consistently
   */
  it('should return empty mock data during SSR', async () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        PostsService,
        { provide: ConfigService, useValue: mockConfigService },
        { provide: PLATFORM_ID, useValue: 'server' },
      ],
    });

    const ssrService = TestBed.inject(PostsService);
    const result = await ssrService.getPosts(1, 10);

    expect(result.data).toEqual([]);
    expect(result.meta.pagination.total).toBe(0);
  });

  /**
   * Tests handling of empty filters object
   */
  it('should handle empty filters object', async () => {
    const promise = service.getPosts(1, 10, {});
    const req = httpMock.expectOne(
      'https://gorest.co.in/public/v2/posts?page=1&per_page=10'
    );
    req.flush([]);
    await promise;
  });

  /**
   * Tests handling of null/undefined filter properties
   */
  it('should handle null/undefined filters properties', async () => {
    const promise = service.getPosts(1, 10, {
      title: undefined,
      body: null as any,
      user_id: undefined,
    });
    const req = httpMock.expectOne(
      'https://gorest.co.in/public/v2/posts?page=1&per_page=10'
    );
    req.flush([]);
    await promise;
  });

  /**
   * Tests handling of partial pagination header presence
   */
  it('should handle partial header presence', async () => {
    const promise = service.getPosts(1, 10);
    const req = httpMock.expectOne(
      'https://gorest.co.in/public/v2/posts?page=1&per_page=10'
    );
    req.flush([{ id: 1, user_id: 1, title: 'Test', body: 'Body' }], {
      headers: {
        'x-pagination-total': '10',
      },
    });

    const result = await promise;
    expect(result.meta.pagination.total).toBe(10);
    expect(result.meta.pagination.pages).toBe(0);
  });

  /**
   * Tests 404 error handling for getPostById with rejection
   */
  it('should handle 404 error for getPostById and fallback to mock', async () => {
    const promise = service.getPostById(999);
    const req = httpMock.expectOne('https://gorest.co.in/public/v2/posts/999');
    req.flush('Not Found', { status: 404, statusText: 'Not Found' });

    await expectAsync(promise).toBeRejected();
  });

  /**
   * Tests error when no fallback post exists in mock data
   */
  it('should handle no fallback post in getPostById', async () => {
    const promise = service.getPostById(999);
    const req = httpMock.expectOne('https://gorest.co.in/public/v2/posts/999');
    req.flush('Not Found', { status: 404, statusText: 'Not Found' });

    await expectAsync(promise).toBeRejected();
  });

  /**
   * Test suite for mock data edge cases
   * Covers complex filtering and pagination scenarios
   */
  describe('mock data edge cases', () => {
    /**
     * Configures mock data environment for edge case testing
     */
    beforeEach(() => {
      mockConfigService = jasmine.createSpyObj('ConfigService', [], {
        useMockData: true,
      });

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        imports: [HttpClientTestingModule],
        providers: [
          PostsService,
          { provide: ConfigService, useValue: mockConfigService },
          { provide: PLATFORM_ID, useValue: 'browser' },
        ],
      });
      service = TestBed.inject(PostsService);
    });

    /**
     * Tests handling of filter results that return no matches
     */
    it('should handle empty filter results in mock data', async () => {
      const result = await service.getPosts(1, 10, {
        title: 'NonExistentTitle',
      });

      expect(result.data.length).toBe(0);
      expect(result.meta.pagination.total).toBe(0);
      expect(result.meta.pagination.pages).toBe(0);
    });

    /**
     * Tests pagination requests beyond available data
     */
    it('should handle pagination beyond available pages', async () => {
      const result = await service.getPosts(100, 10);

      expect(result.data.length).toBe(0);
      expect(result.meta.pagination.page).toBe(100);
    });

    /**
     * Tests filtering with multiple criteria simultaneously
     */
    it('should filter mock data with multiple criteria', async () => {
      const result = await service.getPosts(1, 10, {
        title: 'Angular',
        user_id: 1,
      });

      expect(
        result.data.every(
          (post) =>
            post.title.toLowerCase().includes('angular') && post.user_id === 1
        )
      ).toBeTrue();
    });

    /**
     * Tests case insensitive title filtering
     */
    it('should handle case insensitive title filtering', async () => {
      const result = await service.getPosts(1, 10, { title: 'ANGULAR' });

      expect(
        result.data.every((post: any) =>
          post.title.toLowerCase().includes('angular')
        )
      ).toBeTrue();
    });

    /**
     * Tests case insensitive body content filtering
     */
    it('should handle case insensitive body filtering', async () => {
      const result = await service.getPosts(1, 10, { body: 'WEB' });

      expect(
        result.data.every((post: any) =>
          post.body.toLowerCase().includes('web')
        )
      ).toBeTrue();
    });
  });
});
