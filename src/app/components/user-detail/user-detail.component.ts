import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { User } from '../../@core/models/users';
import { Post } from '../../@core/models/posts';
import { Comment, CreateCommentRequest } from '../../@core/models/comments';
import { UsersService } from '../../@core/services/users.service';
import { PostsService } from '../../@core/services/posts.service';
import { CommentsService } from '../../@core/services/comments.service';
import { TooltipService } from '../../@core/services/tooltip.service';
import { MessageService } from 'primeng/api';

/**
 * Extended Post interface that includes comment management functionality
 * Combines post data with interactive comment features and form states
 */
interface PostWithComments extends Post {
  /** Array of comments associated with this post */
  comments: Comment[];
  /** Loading state for individual post comment operations */
  commentsLoading: boolean;
  /** Visibility state for comments section */
  showComments: boolean;
  /** Visibility state for comment creation form */
  showCommentForm: boolean;
  /** Form data for creating new comments */
  newComment: {
    name: string;
    email: string;
    body: string;
  };
}

/**
 * User detail component that displays comprehensive user information
 * Shows user profile, posts, comments, and provides interaction capabilities
 */
@Component({
  selector: 'app-user-detail',
  templateUrl: './user-detail.component.html',
  styleUrls: ['./user-detail.component.css'],
})
export class UserDetailComponent implements OnInit {
  /** Currently displayed user information */
  user: User | null = null;

  /** Array of user's posts with extended comment functionality */
  posts: PostWithComments[] = [];

  /** Loading state for user detail data */
  loading = false;

  /** Loading state for user's posts */
  postsLoading = false;

  /** Global loading state for comment operations */
  commentsLoading = false;

  /** Current user ID from route parameters */
  userId: number = 0;

  /** User engagement statistics */
  stats = {
    /** Total number of posts created by the user */
    totalPosts: 0,
    /** Total number of comments across all user's posts */
    totalComments: 0,
    /** Average comments per post ratio */
    averageCommentsPerPost: 0,
  };

  /**
   * Creates an instance of UserDetailComponent
   * @param route ActivatedRoute service for accessing route parameters
   * @param router Router service for programmatic navigation
   * @param location Location service for browser navigation history
   * @param usersService Service for user-related API operations
   * @param postsService Service for post-related API operations
   * @param commentsService Service for comment-related API operations
   * @param messageService PrimeNG service for displaying toast messages
   * @param tooltipService Service for tooltip configuration management
   */
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private usersService: UsersService,
    private postsService: PostsService,
    private commentsService: CommentsService,
    private messageService: MessageService,
    public tooltipService: TooltipService
  ) {}

  /**
   * Component initialization lifecycle hook
   * Subscribes to route parameters and loads user data, posts, and comments
   */
  async ngOnInit() {
    this.route.params.subscribe(async (params) => {
      this.userId = +params['id'];
      if (this.userId) {
        await this.loadUserDetail();
        await this.loadUserPosts();
        await this.loadAllComments();
      }
    });
  }

  /**
   * Loads detailed user information from the API
   * Handles errors by showing toast message and navigating back to users list
   */
  async loadUserDetail() {
    this.loading = true;
    try {
      this.user = await this.usersService.getUserById(this.userId);
    } catch (error) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to load user details',
      });
      this.router.navigate(['/main/users']);
    }
    this.loading = false;
  }

  /**
   * Loads all posts created by the current user
   * Transforms posts to include comment management functionality
   */
  async loadUserPosts() {
    this.postsLoading = true;
    try {
      const response = await this.postsService.getPosts(1, 50, {
        user_id: this.userId,
      });

      this.posts = response.data.map((post) => ({
        ...post,
        comments: [], // Initially empty, populated by loadAllComments
        commentsLoading: false,
        showComments: false,
        showCommentForm: false,
        newComment: {
          name: '',
          email: '',
          body: '',
        },
      }));

      this.stats.totalPosts = this.posts.length;
    } catch (error) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to load user posts',
      });
    }
    this.postsLoading = false;
  }

  /**
   * Loads all comments for all user posts in parallel
   * Optimizes performance by fetching all comments at once rather than on-demand
   */
  async loadAllComments() {
    if (this.posts.length === 0) return;

    this.commentsLoading = true;
    try {
      // Load comments for all posts in parallel for better performance
      const commentsPromises = this.posts.map(async (post) => {
        try {
          const comments = await this.commentsService.getCommentsByPost(
            post.id
          );
          return { postId: post.id, comments };
        } catch (error) {
          console.error(`Error loading comments for post ${post.id}:`, error);
          return { postId: post.id, comments: [] };
        }
      });

      const allCommentsResults = await Promise.all(commentsPromises);

      // Assign comments to their respective posts
      allCommentsResults.forEach(({ postId, comments }) => {
        const post = this.posts.find((p) => p.id === postId);
        if (post) {
          post.comments = comments;
        }
      });

      this.calculateStats();
    } catch (error) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to load comments',
      });
    }
    this.commentsLoading = false;
  }

  /**
   * Toggles the visibility of comments for a specific post
   * Comments are pre-loaded, so this only affects display state
   * @param post The post whose comments visibility should be toggled
   */
  toggleComments(post: PostWithComments) {
    post.showComments = !post.showComments;
  }

  /**
   * Toggles the visibility of the comment creation form
   * Pre-populates form with current user's information when available
   * @param post The post for which to toggle the comment form
   */
  toggleCommentForm(post: PostWithComments) {
    post.showCommentForm = !post.showCommentForm;
    if (post.showCommentForm) {
      // Pre-populate with current user's data if available
      post.newComment = {
        name: this.user?.name || '',
        email: this.user?.email || '',
        body: '',
      };
    }
  }

  /**
   * Submits a new comment for a specific post
   * Validates form data, creates comment, and updates local state
   * @param post The post to add the comment to
   */
  async submitComment(post: PostWithComments) {
    if (
      !post.newComment.name ||
      !post.newComment.email ||
      !post.newComment.body
    ) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Please fill in all required fields',
      });
      return;
    }

    try {
      const commentData: CreateCommentRequest = {
        post_id: post.id,
        name: post.newComment.name,
        email: post.newComment.email,
        body: post.newComment.body,
      };

      const newComment = await this.commentsService.createComment(commentData);
      post.comments.unshift(newComment); // Add to top for immediate visibility
      post.newComment = { name: '', email: '', body: '' };
      post.showCommentForm = false;

      this.calculateStats();

      this.messageService.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Comment added successfully',
      });
    } catch (error) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to add comment',
      });
    }
  }

  /**
   * Cancels comment creation and resets the form
   * @param post The post whose comment form should be cancelled
   */
  cancelComment(post: PostWithComments) {
    post.showCommentForm = false;
    post.newComment = { name: '', email: '', body: '' };
  }

  /**
   * Calculates user engagement statistics
   * Computes total posts, total comments, and average comments per post
   */
  calculateStats() {
    this.stats.totalPosts = this.posts.length;
    this.stats.totalComments = this.posts.reduce(
      (total, post) => total + post.comments.length,
      0
    );
    this.stats.averageCommentsPerPost =
      this.stats.totalPosts > 0
        ? Math.round((this.stats.totalComments / this.stats.totalPosts) * 10) /
          10
        : 0;
  }

  /**
   * Navigates back to the previous page using browser history
   */
  goBack() {
    this.location.back();
  }

  /**
   * Navigates to the users page with edit mode for current user
   * Passes user ID as query parameter to trigger edit dialog
   */
  editUser() {
    this.router.navigate(['/main/users'], {
      queryParams: { editUserId: this.userId },
    });
  }

  /**
   * Extracts initials from a full name for avatar display
   * @param name The full name to extract initials from
   * @returns Two-letter initials in uppercase
   */
  getInitials(name: string): string {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }

  /**
   * Generates a consistent color for user avatars
   * Uses a predefined color palette based on user ID
   * @param id The user ID to base the color on
   * @returns Hex color code for the avatar background
   */
  getAvatarColor(id: number): string {
    const colors = [
      '#3b82f6',
      '#10b981',
      '#f59e0b',
      '#ef4444',
      '#8b5cf6',
      '#06b6d4',
      '#84cc16',
      '#f97316',
    ];
    return colors[id % colors.length];
  }

  /**
   * Generates a formatted date based on an ID
   * Creates pseudo-realistic dates for demo purposes
   * @param id The ID to base the date calculation on
   * @returns Formatted date string
   */
  formatDate(id: number): string {
    // Simulate dates based on ID for consistent display
    const baseDate = new Date(2024, 0, 1);
    baseDate.setDate(baseDate.getDate() + id * 7);
    return baseDate.toLocaleDateString();
  }

  /**
   * Truncates text to a specified length with ellipsis
   * @param text The text to truncate
   * @param maxLength Maximum length before truncation (default: 150)
   * @returns Truncated text with ellipsis or original text if shorter
   */
  truncateText(text: string, maxLength: number = 150): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  }
}
