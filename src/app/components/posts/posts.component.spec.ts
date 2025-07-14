import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError, BehaviorSubject } from 'rxjs';

import { PostsComponent } from './posts.component';
import { PostsService } from '../../@core/services/posts.service';
import { UsersService } from '../../@core/services/users.service';
import { CommentsService } from '../../@core/services/comments.service';
import { TooltipService } from '../../@core/services/tooltip.service';
import { MessageService, ConfirmationService } from 'primeng/api';
import { NO_ERRORS_SCHEMA } from '@angular/core';

// Import the interfaces
import { User, UsersResponse } from '../../@core/models/users';
import { Post, PostsResponse } from '../../@core/models/posts';
import { Comment } from '../../@core/models/comments';

/**
 * Test suite for PostsComponent
 * Verifies post management functionality, CRUD operations, and comment handling
 */
describe('PostsComponent', () => {
  let component: PostsComponent;
  let fixture: ComponentFixture<PostsComponent>;
  let postsService: jasmine.SpyObj<PostsService>;
  let usersService: jasmine.SpyObj<UsersService>;
  let commentsService: jasmine.SpyObj<CommentsService>;
  let tooltipService: jasmine.SpyObj<TooltipService>;
  let messageService: jasmine.SpyObj<MessageService>;
  let confirmationService: jasmine.SpyObj<ConfirmationService>;

  /**
   * Mock user data for testing user-related functionality
   */
  const mockUsers: User[] = [
    {
      id: 1,
      name: 'John Doe',
      email: 'john@test.com',
      gender: 'male' as const,
      status: 'active' as const,
    },
    {
      id: 2,
      name: 'Jane Smith',
      email: 'jane@test.com',
      gender: 'female' as const,
      status: 'active' as const,
    },
  ];

  /**
   * Mock post data for testing post-related functionality
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
      user_id: 2,
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
      name: 'Commenter 1',
      email: 'comment1@test.com',
      body: 'Test comment 1',
    },
    {
      id: 2,
      post_id: 1,
      name: 'Commenter 2',
      email: 'comment2@test.com',
      body: 'Test comment 2',
    },
    {
      id: 3,
      post_id: 2,
      name: 'Commenter 3',
      email: 'comment3@test.com',
      body: 'Test comment 3',
    },
  ];

  /**
   * Mock posts API response with pagination metadata
   */
  const mockPostsResponse: PostsResponse = {
    data: mockPosts,
    meta: {
      pagination: {
        page: 1,
        pages: 1,
        per_page: 6,
        total: 2,
      },
    },
  };

  /**
   * Mock users API response with pagination metadata
   */
  const mockUsersResponse: UsersResponse = {
    data: mockUsers,
    meta: {
      pagination: {
        page: 1,
        pages: 1,
        per_page: 100,
        total: 2,
      },
    },
  };

  /**
   * Mock tooltip configuration for UI elements
   */
  const mockTooltipConfig = {
    text: 'Test tooltip',
    position: 'top' as const,
    styleClass: 'test-tooltip',
  };

  /**
   * Sets up test environment with mocked dependencies and services
   */
  beforeEach(async () => {
    const postsServiceSpy = jasmine.createSpyObj('PostsService', [
      'getPosts',
      'createPost',
      'updatePost',
      'deletePost',
    ]);

    const usersServiceSpy = jasmine.createSpyObj('UsersService', ['getUsers']);

    const commentsServiceSpy = jasmine.createSpyObj('CommentsService', [
      'getCommentsByPost',
      'createComment',
    ]);

    const tooltipServiceSpy = jasmine.createSpyObj('TooltipService', [
      'getViewTooltip',
      'getEditTooltip',
      'getDeleteTooltip',
      'getAddTooltip',
      'getRefreshTooltip',
      'getRefreshUserTooltip',
      'getRefreshPostTooltip',
      'getEditPostTooltip',
    ]);

    const messageServiceSpy = jasmine.createSpyObj('MessageService', ['add']);

    // Configure ConfirmationService with proper observable setup
    const confirmationServiceSpy = jasmine.createSpyObj('ConfirmationService', [
      'confirm',
    ]);

    // Mock the subject to avoid subscription errors
    const mockConfirmSource = new BehaviorSubject(null);
    confirmationServiceSpy.confirmSource = mockConfirmSource;
    confirmationServiceSpy.requireConfirmationSource = mockConfirmSource;

    await TestBed.configureTestingModule({
      declarations: [PostsComponent],
      imports: [FormsModule, NoopAnimationsModule],
      providers: [
        { provide: PostsService, useValue: postsServiceSpy },
        { provide: UsersService, useValue: usersServiceSpy },
        { provide: CommentsService, useValue: commentsServiceSpy },
        { provide: TooltipService, useValue: tooltipServiceSpy },
        { provide: MessageService, useValue: messageServiceSpy },
        { provide: ConfirmationService, useValue: confirmationServiceSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(PostsComponent);
    component = fixture.componentInstance;
    postsService = TestBed.inject(PostsService) as jasmine.SpyObj<PostsService>;
    usersService = TestBed.inject(UsersService) as jasmine.SpyObj<UsersService>;
    commentsService = TestBed.inject(
      CommentsService
    ) as jasmine.SpyObj<CommentsService>;
    tooltipService = TestBed.inject(
      TooltipService
    ) as jasmine.SpyObj<TooltipService>;
    messageService = TestBed.inject(
      MessageService
    ) as jasmine.SpyObj<MessageService>;
    confirmationService = TestBed.inject(
      ConfirmationService
    ) as jasmine.SpyObj<ConfirmationService>;

    // Setup default mock responses
    postsService.getPosts.and.returnValue(Promise.resolve(mockPostsResponse));
    usersService.getUsers.and.returnValue(Promise.resolve(mockUsersResponse));
    commentsService.getCommentsByPost.and.returnValue(Promise.resolve([]));

    // Setup tooltip service mock returns
    tooltipService.getViewTooltip.and.returnValue(mockTooltipConfig);
    tooltipService.getEditTooltip.and.returnValue(mockTooltipConfig);
    tooltipService.getDeleteTooltip.and.returnValue(mockTooltipConfig);
    tooltipService.getAddTooltip.and.returnValue(mockTooltipConfig);
    tooltipService.getRefreshPostTooltip.and.returnValue(mockTooltipConfig);
    tooltipService.getEditPostTooltip.and.returnValue(mockTooltipConfig);
  });

  /**
   * Tests that the component can be instantiated correctly
   */
  it('should create', () => {
    expect(component).toBeTruthy();
  });

  /**
   * Tests component initialization with default values
   */
  it('should initialize with default values', () => {
    expect(component.posts).toEqual([]);
    expect(component.users).toEqual([]);
    expect(component.loading).toBe(false);
  });

  /**
   * Test suite for basic component functionality
   * Covers core features like data loading and dialog management
   */
  describe('Basic functionality', () => {
    /**
     * Tests posts loading functionality
     */
    it('should load posts', async () => {
      await component.loadPosts();
      expect(postsService.getPosts).toHaveBeenCalled();
      expect(component.posts.length).toBeGreaterThan(0);
    });

    /**
     * Tests users loading functionality
     */
    it('should load users', async () => {
      await component.loadUsers();
      expect(usersService.getUsers).toHaveBeenCalled();
      expect(component.users.length).toBeGreaterThan(0);
    });

    /**
     * Tests dialog operations for post creation and editing
     */
    it('should handle dialog operations', () => {
      component.showAddDialog();
      expect(component.dialogMode).toBe('add');
      expect(component.showDialog).toBe(true);

      component.hideDialog();
      expect(component.showDialog).toBe(false);
    });

    /**
     * Tests confirmation dialog for post deletion
     */
    it('should handle confirmation dialog', () => {
      component.deletePost(1);
      expect(confirmationService.confirm).toHaveBeenCalled();
    });

    /**
     * Tests comments visibility toggle functionality
     */
    it('should toggle comments visibility', () => {
      const post = {
        ...mockPosts[0],
        showComments: false,
        comments: mockComments,
        showCommentForm: false,
        commentsLoading: false,
        newComment: { name: '', email: '', body: '' },
      };

      component.toggleComments(post);
      expect(post.showComments).toBe(true);

      component.toggleComments(post);
      expect(post.showComments).toBe(false);
    });

    /**
     * Tests author initials generation for user avatars
     */
    it('should get author initials correctly', () => {
      component.users = mockUsers;
      const initials = component.getAuthorInitials(1);
      expect(initials).toBe('JD');
    });

    /**
     * Tests text truncation utility for long content
     */
    it('should truncate text correctly', () => {
      const longText = 'This is a very long text that should be truncated';
      const truncated = component.truncateText(longText, 20);
      expect(truncated).toBe('This is a very long ...');

      const shortText = 'Short text';
      const notTruncated = component.truncateText(shortText, 20);
      expect(notTruncated).toBe('Short text');
    });

    /**
     * Tests search functionality with title filtering
     */
    it('should handle search functionality', async () => {
      component.searchTerm = 'test';
      await component.onSearch();
      expect(postsService.getPosts).toHaveBeenCalledWith(1, 6, {
        title: 'test',
      });
    });

    /**
     * Tests pagination functionality with page change events
     */
    it('should handle page change', async () => {
      const event = { page: 1, first: 6 };
      await component.onPageChange(event);
      expect(component.currentPage).toBe(2);
      expect(postsService.getPosts).toHaveBeenCalledWith(2, 6, {});
    });
  });

  /**
   * Test suite for error handling scenarios
   * Verifies proper error management and user feedback
   */
  describe('Error handling', () => {
    /**
     * Tests error handling when posts loading fails
     */
    it('should handle posts loading error', async () => {
      postsService.getPosts.and.returnValue(
        Promise.reject({ error: { message: 'Posts error' } })
      );

      await component.loadPosts();

      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail: 'Posts error',
      });
    });

    /**
     * Tests error handling when users loading fails
     */
    it('should handle users loading error', async () => {
      usersService.getUsers.and.returnValue(Promise.reject('Users error'));
      spyOn(console, 'error');

      await component.loadUsers();

      expect(console.error).toHaveBeenCalledWith(
        'Error loading users:',
        'Users error'
      );
    });
  });

  /**
   * Test suite for post CRUD operations
   * Covers creation, update, and management of posts
   */
  describe('Post CRUD operations', () => {
    /**
     * Tests successful new post creation
     */
    it('should create new post', async () => {
      const newPost: Post = {
        id: 3,
        user_id: 1,
        title: 'New Post',
        body: 'New content',
      };
      postsService.createPost.and.returnValue(Promise.resolve(newPost));

      component.dialogMode = 'add';
      component.selectedPost = {
        id: 0,
        user_id: 1,
        title: 'New Post',
        body: 'New content',
      };

      await component.savePost();

      expect(postsService.createPost).toHaveBeenCalled();
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'success',
        summary: 'Success',
        detail: 'Post created successfully',
      });
    });

    /**
     * Tests successful post update functionality
     */
    it('should update existing post', async () => {
      const updatedPost: Post = {
        id: 1,
        user_id: 1,
        title: 'Updated Post',
        body: 'Updated content',
      };
      postsService.updatePost.and.returnValue(Promise.resolve(updatedPost));

      component.dialogMode = 'edit';
      component.selectedPost = updatedPost;

      await component.savePost();

      expect(postsService.updatePost).toHaveBeenCalled();
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'success',
        summary: 'Success',
        detail: 'Post updated successfully',
      });
    });
  });

  /**
   * Test suite for comment functionality
   * Covers comment submission, validation, and management
   */
  describe('Comment functionality', () => {
    /**
     * Tests successful comment submission
     */
    it('should submit comment successfully', async () => {
      const newComment: Comment = {
        id: 4,
        post_id: 1,
        name: 'Test',
        email: 'test@test.com',
        body: 'Test comment',
      };
      commentsService.createComment.and.returnValue(
        Promise.resolve(newComment)
      );

      const post = {
        ...mockPosts[0],
        comments: [],
        newComment: {
          name: 'Test',
          email: 'test@test.com',
          body: 'Test comment',
        },
        showCommentForm: true,
        showComments: true,
        commentsLoading: false,
      };

      await component.submitComment(post);

      expect(commentsService.createComment).toHaveBeenCalled();
      expect(post.comments[0]).toEqual(newComment);
      expect(post.showCommentForm).toBe(false);
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'success',
        summary: 'Success',
        detail: 'Comment added successfully',
      });
    });

    /**
     * Tests comment form validation for required fields
     */
    it('should validate comment form', async () => {
      const post = {
        ...mockPosts[0],
        comments: [],
        newComment: { name: '', email: 'test@test.com', body: 'Test comment' },
        showCommentForm: true,
        showComments: true,
        commentsLoading: false,
      };

      await component.submitComment(post);

      expect(commentsService.createComment).not.toHaveBeenCalled();
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Please fill in all required fields',
      });
    });
  });

  /**
   * Test suite for helper utility methods
   * Covers formatting, colors, and text processing functions
   */
  describe('Helper methods', () => {
    /**
     * Tests avatar color generation for consistent user representation
     */
    it('should get correct avatar color', () => {
      const color = component.getAvatarColor(1);
      expect(color).toMatch(/^#[0-9a-f]{6}$/i);
    });

    /**
     * Tests initials extraction from names for user avatars
     */
    it('should get initials from name', () => {
      expect(component.getInitials('John Doe')).toBe('JD');
      expect(component.getInitials('Mary Jane Watson')).toBe('MJ');
      expect(component.getInitials('Cher')).toBe('C');
      expect(component.getInitials('')).toBe('');
    });
  });

  /**
   * Test suite for tooltip functionality
   * Verifies tooltip configuration retrieval for UI elements
   */
  describe('Tooltip methods', () => {
    /**
     * Tests tooltip configuration methods for various UI actions
     */
    it('should get tooltip configurations', () => {
      expect(component.getViewTooltipConfig()).toEqual(mockTooltipConfig);
      expect(component.getEditTooltipConfig()).toEqual(mockTooltipConfig);
      expect(component.getDeleteTooltipConfig()).toEqual(mockTooltipConfig);
      expect(component.getAddTooltipConfig()).toEqual(mockTooltipConfig);
      expect(component.getRefreshTooltipConfig()).toEqual(mockTooltipConfig);
    });
  });
});
