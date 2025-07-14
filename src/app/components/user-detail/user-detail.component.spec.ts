import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { of, throwError } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { MessageService } from 'primeng/api';

import { UserDetailComponent } from './user-detail.component';
import { UsersService } from '../../@core/services/users.service';
import { PostsService } from '../../@core/services/posts.service';
import { CommentsService } from '../../@core/services/comments.service';
import { TooltipService } from '../../@core/services/tooltip.service';
import { User } from '../../@core/models/users';
import { Post } from '../../@core/models/posts';
import { Comment } from '../../@core/models/comments';

/**
 * Test suite for UserDetailComponent
 * Verifies user detail display, post management, comment functionality, and navigation
 */
describe('UserDetailComponent', () => {
  let component: UserDetailComponent;
  let fixture: ComponentFixture<UserDetailComponent>;
  let mockUsersService: jasmine.SpyObj<UsersService>;
  let mockPostsService: jasmine.SpyObj<PostsService>;
  let mockCommentsService: jasmine.SpyObj<CommentsService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockLocation: jasmine.SpyObj<Location>;
  let mockMessageService: jasmine.SpyObj<MessageService>;
  let mockTooltipService: jasmine.SpyObj<TooltipService>;
  let mockActivatedRoute: any;

  /**
   * Mock user data for testing user detail functionality
   */
  const mockUser: User = {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    gender: 'male',
    status: 'active',
  };

  /**
   * Mock post data for testing user's post display
   */
  const mockPosts: Post[] = [
    {
      id: 1,
      user_id: 1,
      title: 'Test Post 1',
      body: 'This is test post 1 content',
    },
    {
      id: 2,
      user_id: 1,
      title: 'Test Post 2',
      body: 'This is test post 2 content',
    },
  ];

  /**
   * Mock comment data for testing comment functionality
   */
  const mockComments: Comment[] = [
    {
      id: 1,
      post_id: 1,
      name: 'Jane Doe',
      email: 'jane@example.com',
      body: 'Great post!',
    },
    {
      id: 2,
      post_id: 1,
      name: 'Bob Smith',
      email: 'bob@example.com',
      body: 'Thanks for sharing!',
    },
  ];

  /**
   * Sets up test environment with mocked dependencies and services
   */
  beforeEach(async () => {
    const usersServiceSpy = jasmine.createSpyObj('UsersService', [
      'getUserById',
    ]);
    const postsServiceSpy = jasmine.createSpyObj('PostsService', ['getPosts']);
    const commentsServiceSpy = jasmine.createSpyObj('CommentsService', [
      'getCommentsByPost',
      'createComment',
    ]);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const locationSpy = jasmine.createSpyObj('Location', ['back']);
    const messageServiceSpy = jasmine.createSpyObj('MessageService', ['add']);
    const tooltipServiceSpy = jasmine.createSpyObj('TooltipService', [
      'getViewTooltip',
      'getEditTooltip',
    ]);

    mockActivatedRoute = {
      params: of({ id: '1' }),
    };

    await TestBed.configureTestingModule({
      declarations: [UserDetailComponent],
      providers: [
        { provide: UsersService, useValue: usersServiceSpy },
        { provide: PostsService, useValue: postsServiceSpy },
        { provide: CommentsService, useValue: commentsServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: Location, useValue: locationSpy },
        { provide: MessageService, useValue: messageServiceSpy },
        { provide: TooltipService, useValue: tooltipServiceSpy },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(UserDetailComponent);
    component = fixture.componentInstance;

    mockUsersService = TestBed.inject(
      UsersService
    ) as jasmine.SpyObj<UsersService>;
    mockPostsService = TestBed.inject(
      PostsService
    ) as jasmine.SpyObj<PostsService>;
    mockCommentsService = TestBed.inject(
      CommentsService
    ) as jasmine.SpyObj<CommentsService>;
    mockRouter = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    mockLocation = TestBed.inject(Location) as jasmine.SpyObj<Location>;
    mockMessageService = TestBed.inject(
      MessageService
    ) as jasmine.SpyObj<MessageService>;
    mockTooltipService = TestBed.inject(
      TooltipService
    ) as jasmine.SpyObj<TooltipService>;
  });

  /**
   * Verifies that UserDetailComponent can be instantiated correctly
   */
  it('should create', () => {
    expect(component).toBeTruthy();
  });

  /**
   * Test suite for component initialization
   * Verifies proper setup and data loading on component initialization
   */
  describe('ngOnInit', () => {
    /**
     * Tests successful component initialization with user and posts loading
     */
    it('should load user detail and posts on initialization', fakeAsync(() => {
      mockUsersService.getUserById.and.returnValue(Promise.resolve(mockUser));
      mockPostsService.getPosts.and.returnValue(
        Promise.resolve({
          data: mockPosts,
          meta: { pagination: { page: 1, pages: 1, per_page: 50, total: 2 } },
        })
      );
      mockCommentsService.getCommentsByPost.and.returnValue(
        Promise.resolve(mockComments)
      );

      component.ngOnInit();
      tick();

      expect(component.userId).toBe(1);
      expect(mockUsersService.getUserById).toHaveBeenCalledWith(1);
      expect(mockPostsService.getPosts).toHaveBeenCalledWith(1, 50, {
        user_id: 1,
      });
    }));

    /**
     * Tests proper handling of route parameter changes
     */
    it('should handle route params change', fakeAsync(() => {
      mockActivatedRoute.params = of({ id: '2' });
      mockUsersService.getUserById.and.returnValue(Promise.resolve(mockUser));
      mockPostsService.getPosts.and.returnValue(
        Promise.resolve({
          data: [],
          meta: { pagination: { page: 1, pages: 1, per_page: 50, total: 0 } },
        })
      );

      component.ngOnInit();
      tick();

      expect(component.userId).toBe(2);
    }));
  });

  /**
   * Test suite for user detail loading functionality
   * Covers successful loading, error handling, and loading states
   */
  describe('loadUserDetail', () => {
    /**
     * Tests successful user data loading
     */
    it('should load user successfully', fakeAsync(() => {
      mockUsersService.getUserById.and.returnValue(Promise.resolve(mockUser));

      component.userId = 1;
      component.loadUserDetail();
      tick();

      expect(component.loading).toBe(false);
      expect(component.user).toEqual(mockUser);
      expect(mockUsersService.getUserById).toHaveBeenCalledWith(1);
    }));

    /**
     * Tests error handling when user loading fails
     */
    it('should handle user loading error', fakeAsync(() => {
      mockUsersService.getUserById.and.returnValue(
        Promise.reject('Error loading user')
      );

      component.userId = 1;
      component.loadUserDetail();
      tick();

      expect(component.loading).toBe(false);
      expect(mockMessageService.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to load user details',
      });
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/main/users']);
    }));

    /**
     * Tests loading state management during user data fetching
     */
    it('should set loading state correctly', () => {
      mockUsersService.getUserById.and.returnValue(Promise.resolve(mockUser));

      expect(component.loading).toBe(false);
      component.loadUserDetail();
      expect(component.loading).toBe(true);
    });
  });

  /**
   * Test suite for user posts loading functionality
   * Verifies posts retrieval, transformation, and error handling
   */
  describe('loadUserPosts', () => {
    /**
     * Tests successful posts loading with proper data transformation
     */
    it('should load posts successfully', fakeAsync(() => {
      mockPostsService.getPosts.and.returnValue(
        Promise.resolve({
          data: mockPosts,
          meta: { pagination: { page: 1, pages: 1, per_page: 50, total: 2 } },
        })
      );

      component.userId = 1;
      component.loadUserPosts();
      tick();

      expect(component.postsLoading).toBe(false);
      expect(component.posts.length).toBe(2);
      expect(component.stats.totalPosts).toBe(2);
      expect(component.posts[0].comments).toEqual([]);
      expect(component.posts[0].showComments).toBe(false);
      expect(component.posts[0].showCommentForm).toBe(false);
    }));

    /**
     * Tests error handling when posts loading fails
     */
    it('should handle posts loading error', fakeAsync(() => {
      mockPostsService.getPosts.and.returnValue(
        Promise.reject('Error loading posts')
      );

      component.userId = 1;
      component.loadUserPosts();
      tick();

      expect(component.postsLoading).toBe(false);
      expect(mockMessageService.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to load user posts',
      });
    }));
  });

  /**
   * Test suite for comments loading functionality
   * Covers bulk comment loading for all user posts
   */
  describe('loadAllComments', () => {
    /**
     * Sets up posts with comment management properties before each test
     */
    beforeEach(() => {
      component.posts = mockPosts.map((post) => ({
        ...post,
        comments: [],
        commentsLoading: false,
        showComments: false,
        showCommentForm: false,
        newComment: { name: '', email: '', body: '' },
      }));
    });

    /**
     * Tests successful comments loading for all posts
     */
    it('should load comments for all posts', fakeAsync(() => {
      mockCommentsService.getCommentsByPost.and.returnValue(
        Promise.resolve(mockComments)
      );

      component.loadAllComments();
      tick();

      expect(component.commentsLoading).toBe(false);
      expect(mockCommentsService.getCommentsByPost).toHaveBeenCalledTimes(2);
      expect(component.posts[0].comments).toEqual(mockComments);
    }));

    /**
     * Tests early return when no posts are available
     */
    it('should return early if no posts', fakeAsync(() => {
      component.posts = [];

      component.loadAllComments();
      tick();

      expect(mockCommentsService.getCommentsByPost).not.toHaveBeenCalled();
    }));
  });

  /**
   * Test suite for comment visibility toggle functionality
   * Verifies proper state management for comment sections
   */
  describe('toggleComments', () => {
    /**
     * Tests comment visibility toggle functionality
     */
    it('should toggle comments visibility', () => {
      const post = {
        ...mockPosts[0],
        comments: [],
        commentsLoading: false,
        showComments: false,
        showCommentForm: false,
        newComment: { name: '', email: '', body: '' },
      };

      component.toggleComments(post);
      expect(post.showComments).toBe(true);

      component.toggleComments(post);
      expect(post.showComments).toBe(false);
    });
  });

  /**
   * Test suite for comment form toggle functionality
   * Covers form visibility and pre-population with user data
   */
  describe('toggleCommentForm', () => {
    /**
     * Tests comment form toggle with user data pre-population
     */
    it('should toggle comment form visibility', () => {
      component.user = mockUser;
      const post = {
        ...mockPosts[0],
        comments: [],
        commentsLoading: false,
        showComments: false,
        showCommentForm: false,
        newComment: { name: '', email: '', body: '' },
      };

      component.toggleCommentForm(post);
      expect(post.showCommentForm).toBe(true);
      expect(post.newComment.name).toBe(mockUser.name);
      expect(post.newComment.email).toBe(mockUser.email);

      component.toggleCommentForm(post);
      expect(post.showCommentForm).toBe(false);
    });

    /**
     * Tests form pre-population when no user data is available
     */
    it('should pre-fill form with empty values when no user', () => {
      component.user = null;
      const post = {
        ...mockPosts[0],
        comments: [],
        commentsLoading: false,
        showComments: false,
        showCommentForm: false,
        newComment: { name: '', email: '', body: '' },
      };

      component.toggleCommentForm(post);
      expect(post.newComment.name).toBe('');
      expect(post.newComment.email).toBe('');
    });
  });

  /**
   * Test suite for comment submission functionality
   * Covers successful submission, validation, and error handling
   */
  describe('submitComment', () => {
    let post: any;

    /**
     * Sets up post with comment form data before each test
     */
    beforeEach(() => {
      post = {
        ...mockPosts[0],
        comments: [],
        commentsLoading: false,
        showComments: false,
        showCommentForm: true,
        newComment: {
          name: 'Test User',
          email: 'test@example.com',
          body: 'Test comment',
        },
      };
    });

    /**
     * Tests successful comment submission with proper state updates
     */
    it('should submit comment successfully', fakeAsync(() => {
      const newComment: Comment = {
        id: 3,
        post_id: 1,
        name: 'Test User',
        email: 'test@example.com',
        body: 'Test comment',
      };
      mockCommentsService.createComment.and.returnValue(
        Promise.resolve(newComment)
      );

      component.submitComment(post);
      tick();

      expect(post.comments.length).toBe(1);
      expect(post.comments[0]).toEqual(newComment);
      expect(post.showCommentForm).toBe(false);
      expect(post.newComment).toEqual({ name: '', email: '', body: '' });
      expect(mockMessageService.add).toHaveBeenCalledWith({
        severity: 'success',
        summary: 'Success',
        detail: 'Comment added successfully',
      });
    }));

    /**
     * Tests form validation for incomplete comment data
     */
    it('should show warning for incomplete form', () => {
      post.newComment.body = '';

      component.submitComment(post);

      expect(mockMessageService.add).toHaveBeenCalledWith({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Please fill in all required fields',
      });
      expect(mockCommentsService.createComment).not.toHaveBeenCalled();
    });

    /**
     * Tests error handling during comment submission
     */
    it('should handle comment submission error', fakeAsync(() => {
      mockCommentsService.createComment.and.returnValue(
        Promise.reject('Error creating comment')
      );

      component.submitComment(post);
      tick();

      expect(mockMessageService.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to add comment',
      });
    }));
  });

  /**
   * Test suite for comment form cancellation
   * Verifies proper form state reset when cancelling comment creation
   */
  describe('cancelComment', () => {
    /**
     * Tests comment form cancellation with state reset
     */
    it('should cancel comment form', () => {
      const post = {
        ...mockPosts[0],
        comments: [],
        commentsLoading: false,
        showComments: false,
        showCommentForm: true,
        newComment: {
          name: 'Test',
          email: 'test@example.com',
          body: 'Test body',
        },
      };

      component.cancelComment(post);

      expect(post.showCommentForm).toBe(false);
      expect(post.newComment).toEqual({ name: '', email: '', body: '' });
    });
  });

  /**
   * Test suite for statistics calculation
   * Verifies proper computation of user engagement metrics
   */
  describe('calculateStats', () => {
    /**
     * Sets up posts with comments for statistics calculation
     */
    beforeEach(() => {
      component.posts = [
        {
          ...mockPosts[0],
          comments: [mockComments[0], mockComments[1]],
          commentsLoading: false,
          showComments: false,
          showCommentForm: false,
          newComment: { name: '', email: '', body: '' },
        },
        {
          ...mockPosts[1],
          comments: [mockComments[0]],
          commentsLoading: false,
          showComments: false,
          showCommentForm: false,
          newComment: { name: '', email: '', body: '' },
        },
      ];
    });

    /**
     * Tests accurate statistics calculation for posts and comments
     */
    it('should calculate statistics correctly', () => {
      component.calculateStats();

      expect(component.stats.totalPosts).toBe(2);
      expect(component.stats.totalComments).toBe(3);
      expect(component.stats.averageCommentsPerPost).toBe(1.5);
    });

    /**
     * Tests statistics calculation when no posts are available
     */
    it('should handle zero posts', () => {
      component.posts = [];
      component.calculateStats();

      expect(component.stats.totalPosts).toBe(0);
      expect(component.stats.totalComments).toBe(0);
      expect(component.stats.averageCommentsPerPost).toBe(0);
    });
  });

  /**
   * Test suite for navigation functionality
   * Covers browser navigation and programmatic routing
   */
  describe('navigation methods', () => {
    /**
     * Tests browser back navigation functionality
     */
    it('should go back', () => {
      component.goBack();
      expect(mockLocation.back).toHaveBeenCalled();
    });

    /**
     * Tests navigation to user edit mode with query parameters
     */
    it('should navigate to edit user', () => {
      component.userId = 1;
      component.editUser();

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/main/users'], {
        queryParams: { editUserId: 1 },
      });
    });
  });

  /**
   * Test suite for utility methods
   * Covers text processing, formatting, and visual helper functions
   */
  describe('utility methods', () => {
    /**
     * Tests initials extraction from user names for avatars
     */
    it('should get initials correctly', () => {
      expect(component.getInitials('John Doe')).toBe('JD');
      expect(component.getInitials('John')).toBe('J');
      expect(component.getInitials('John Middle Doe')).toBe('JM');
      expect(component.getInitials('')).toBe('');
    });

    /**
     * Tests consistent avatar color generation based on user ID
     */
    it('should get avatar color based on id', () => {
      const color1 = component.getAvatarColor(1);
      const color2 = component.getAvatarColor(9); // Should wrap around

      expect(color1).toBeDefined();
      expect(color2).toBeDefined();
      expect(color1).toBe(component.getAvatarColor(9)); // Test modulo behavior
    });

    /**
     * Tests date formatting based on post ID for consistent display
     */
    it('should format date based on id', () => {
      const date = component.formatDate(1);
      expect(date).toBeDefined();
      expect(typeof date).toBe('string');
    });

    /**
     * Tests text truncation with default length limits
     */
    it('should truncate text correctly', () => {
      const longText = 'a'.repeat(200);
      const truncated = component.truncateText(longText);

      expect(truncated.length).toBeLessThanOrEqual(153); // 150 + '...'
      expect(truncated.endsWith('...')).toBe(true);

      const shortText = 'short';
      expect(component.truncateText(shortText)).toBe('short');
    });

    /**
     * Tests text truncation with custom length parameter
     */
    it('should truncate text with custom length', () => {
      const text = 'a'.repeat(100);
      const truncated = component.truncateText(text, 50);

      expect(truncated.length).toBe(53); // 50 + '...'
    });
  });
});
