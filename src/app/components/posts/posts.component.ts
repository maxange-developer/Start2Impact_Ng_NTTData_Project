import { Component, OnInit } from '@angular/core';
import {
  Post,
  PostsResponse,
  CreatePostRequest,
} from '../../@core/models/posts';
import { User } from '../../@core/models/users';
import { Comment, CreateCommentRequest } from '../../@core/models/comments';
import { PostsService } from '../../@core/services/posts.service';
import { UsersService } from '../../@core/services/users.service';
import { CommentsService } from '../../@core/services/comments.service';
import { TooltipService } from '../../@core/services/tooltip.service';
import { MessageService, ConfirmationService } from 'primeng/api';

/**
 * Extended Post interface that includes comment management functionality
 * Combines post data with interactive comment features and form states
 */
interface PostWithComments extends Post {
  /** Array of comments associated with this post */
  comments: Comment[];
  /** Loading state for comment operations */
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
 * Posts component that manages blog post functionality
 * Handles CRUD operations for posts, comment management, and user interactions
 */
@Component({
  selector: 'app-posts',
  templateUrl: './posts.component.html',
  styleUrls: ['./posts.component.css'],
})
export class PostsComponent implements OnInit {
  /** Array of posts with extended comment functionality */
  posts: PostWithComments[] = [];

  /** Array of all available users for author selection */
  users: User[] = [];

  /** Currently selected post for editing or creation */
  selectedPost: Post = {
    id: 0,
    user_id: 0,
    title: '',
    body: '',
  };

  /** Post being viewed in detail modal */
  viewingPost: Post | null = null;

  /** Dialog visibility state for add/edit operations */
  showDialog = false;

  /** Dialog visibility state for post detail view */
  showViewDialog = false;

  /** Current dialog mode - either adding new post or editing existing */
  dialogMode: 'add' | 'edit' = 'add';

  /** Loading state for posts operations */
  loading = false;

  /** Global loading state for comment operations */
  commentsLoading = false;

  /** Current page number for pagination */
  currentPage = 1;

  /** Number of posts displayed per page */
  itemsPerPage = 6;

  /** Total number of posts available */
  totalRecords = 0;

  /** Search term for filtering posts by title */
  searchTerm = '';

  /** Selected user ID for filtering posts by author */
  selectedUserId = '';

  /** Dropdown options for user selection in filters */
  userOptions: { label: string; value: number }[] = [];

  /**
   * Creates an instance of PostsComponent
   * @param postsService Service for post-related API operations
   * @param usersService Service for user-related API operations
   * @param commentsService Service for comment-related API operations
   * @param messageService PrimeNG service for displaying toast messages
   * @param confirmationService PrimeNG service for confirmation dialogs
   * @param tooltipService Service for tooltip configuration management
   */
  constructor(
    private postsService: PostsService,
    private usersService: UsersService,
    private commentsService: CommentsService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    public tooltipService: TooltipService
  ) {}

  /**
   * Component initialization lifecycle hook
   * Loads initial data including users, posts, and all comments
   */
  async ngOnInit() {
    await this.loadUsers();
    await this.loadPosts();
    await this.loadAllComments();
  }

  /**
   * Loads posts from the API with current filters and pagination
   * Transforms posts to include comment management functionality
   */
  async loadPosts() {
    this.loading = true;
    try {
      const filters: any = {};
      if (this.searchTerm) {
        filters.title = this.searchTerm;
      }
      if (this.selectedUserId) {
        filters.user_id = this.selectedUserId;
      }

      const response = await this.postsService.getPosts(
        this.currentPage,
        this.itemsPerPage,
        filters
      );

      this.posts = response.data.map((post) => ({
        ...post,
        comments: [],
        commentsLoading: false,
        showComments: false,
        showCommentForm: false,
        newComment: {
          name: '',
          email: '',
          body: '',
        },
      }));

      this.totalRecords = response.meta.pagination.total;
    } catch (error: any) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: error?.error?.message || 'Failed to load posts',
      });
    }
    this.loading = false;
  }

  /**
   * Loads all available users for author selection and filtering
   * Populates user dropdown options for UI components
   */
  async loadUsers() {
    try {
      const response = await this.usersService.getUsers(1, 100);
      this.users = response.data;
      this.userOptions = this.users.map((user) => ({
        label: user.name,
        value: user.id,
      }));
    } catch (error) {
      console.error('Error loading users:', error);
    }
  }

  /**
   * Loads all comments for all currently displayed posts
   * Executes parallel requests for optimal performance
   */
  async loadAllComments() {
    if (this.posts.length === 0) return;

    this.commentsLoading = true;
    try {
      // Load comments for all posts in parallel
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
   * Handles pagination change events
   * Updates current page and reloads posts with comments
   * @param event Pagination event containing new page information
   */
  async onPageChange(event: any) {
    this.currentPage = event.page + 1;
    await this.loadPosts();
    await this.loadAllComments();
  }

  /**
   * Handles search functionality
   * Resets to first page and applies current search filters
   */
  async onSearch() {
    this.currentPage = 1;
    await this.loadPosts();
    await this.loadAllComments();
  }

  /**
   * Refreshes the posts list and resets all filters
   * Returns to first page with no active filters
   */
  async refreshPosts() {
    this.currentPage = 1;
    this.searchTerm = '';
    this.selectedUserId = '';
    await this.loadPosts();
    await this.loadAllComments();
  }

  /**
   * Opens the dialog for creating a new post
   * Initializes the form with empty values
   */
  showAddDialog() {
    this.dialogMode = 'add';
    this.showDialog = true;
    this.selectedPost = {
      id: 0,
      user_id: 0,
      title: '',
      body: '',
    };
  }

  /**
   * Opens the dialog for editing an existing post
   * Pre-populates the form with current post data
   * @param post The post to be edited
   */
  editPost(post: Post) {
    this.dialogMode = 'edit';
    this.showDialog = true;
    this.selectedPost = { ...post };
  }

  /**
   * Opens the modal for viewing a post in detail
   * @param post The post to be viewed
   */
  viewPost(post: Post) {
    this.showViewDialog = true;
    this.viewingPost = post;
  }

  /**
   * Closes the add/edit post dialog
   */
  hideDialog() {
    this.showDialog = false;
  }

  /**
   * Saves the current post (either creates new or updates existing)
   * Handles both add and edit modes based on current dialog state
   */
  async savePost() {
    try {
      if (this.dialogMode === 'add') {
        const createData: CreatePostRequest = {
          user_id: this.selectedPost.user_id,
          title: this.selectedPost.title,
          body: this.selectedPost.body,
        };
        await this.postsService.createPost(createData);
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Post created successfully',
        });
      } else {
        const updateData = {
          user_id: this.selectedPost.user_id,
          title: this.selectedPost.title,
          body: this.selectedPost.body,
        };
        await this.postsService.updatePost(this.selectedPost.id, updateData);
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Post updated successfully',
        });
      }
      this.hideDialog();
      await this.loadPosts();
      await this.loadAllComments();
    } catch (error: any) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: error?.error?.[0]?.message || 'Failed to save post',
      });
    }
  }

  /**
   * Initiates post deletion with user confirmation
   * Shows confirmation dialog before proceeding with deletion
   * @param postId ID of the post to be deleted
   */
  deletePost(postId: number) {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this post?',
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      accept: async () => {
        try {
          await this.postsService.deletePost(postId);
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Post deleted successfully',
          });
          await this.loadPosts();
          await this.loadAllComments();
        } catch (error) {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to delete post',
          });
        }
      },
    });
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
   * Initializes form data when opening the form
   * @param post The post for which to toggle the comment form
   */
  toggleCommentForm(post: PostWithComments) {
    post.showCommentForm = !post.showCommentForm;
    if (post.showCommentForm) {
      post.newComment = {
        name: '',
        email: '',
        body: '',
      };
    }
  }

  /**
   * Submits a new comment for a specific post
   * Validates form data and adds comment to the post's comment list
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
      post.comments.unshift(newComment); // Add to top of list
      post.newComment = { name: '', email: '', body: '' };
      post.showCommentForm = false;

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
   * Retrieves the author name for a given user ID
   * @param userId The ID of the user
   * @returns The user's name or a fallback string
   */
  getAuthorName(userId: number): string {
    const user = this.users.find((u) => u.id === userId);
    return user ? user.name : `User ${userId}`;
  }

  /**
   * Generates initials for a user based on their ID
   * Used for avatar display when no profile image is available
   * @param userId The ID of the user
   * @returns Two-letter initials or a fallback
   */
  getAuthorInitials(userId: number): string {
    const user = this.users.find((u) => u.id === userId);
    if (user) {
      return user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
    }
    return `U${userId}`;
  }

  /**
   * Generates a consistent color for user avatars
   * Uses a predefined color palette based on user ID
   * @param userId The ID of the user
   * @returns Hex color code for the avatar background
   */
  getAvatarColor(userId: number): string {
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
    return colors[userId % colors.length];
  }

  /**
   * Truncates text to a specified length with ellipsis
   * @param text The text to truncate
   * @param length Maximum length before truncation
   * @returns Truncated text with ellipsis or original text if shorter
   */
  truncateText(text: string, length: number): string {
    if (text.length <= length) return text;
    return text.substring(0, length) + '...';
  }

  /**
   * Generates a formatted date based on post ID
   * Creates pseudo-realistic dates for demo purposes
   * @param id The post ID to base the date on
   * @returns Formatted date string
   */
  formatDate(id: number): string {
    const baseDate = new Date(2024, 0, 1);
    baseDate.setDate(baseDate.getDate() + id * 7);
    return baseDate.toLocaleDateString();
  }

  /**
   * Extracts initials from a full name
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
   * Gets tooltip configuration for post view action
   * @returns Tooltip configuration object
   */
  getViewTooltipConfig() {
    return this.tooltipService.getViewTooltip('Visualizza post completo');
  }

  /**
   * Gets tooltip configuration for post edit action
   * @returns Tooltip configuration object
   */
  getEditTooltipConfig() {
    return this.tooltipService.getEditPostTooltip('Modifica post');
  }

  /**
   * Gets tooltip configuration for post delete action
   * @returns Tooltip configuration object
   */
  getDeleteTooltipConfig() {
    return this.tooltipService.getDeleteTooltip('Elimina post');
  }

  /**
   * Gets tooltip configuration for post creation action
   * @returns Tooltip configuration object
   */
  getAddTooltipConfig() {
    return this.tooltipService.getAddTooltip('Crea un nuovo post');
  }

  /**
   * Gets tooltip configuration for posts refresh action
   * @returns Tooltip configuration object
   */
  getRefreshTooltipConfig() {
    return this.tooltipService.getRefreshPostTooltip('Aggiorna elenco post');
  }
}
