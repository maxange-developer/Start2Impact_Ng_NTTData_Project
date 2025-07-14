import { Component, OnInit } from '@angular/core';
import { UsersService } from '../../@core/services/users.service';
import { PostsService } from '../../@core/services/posts.service';

/**
 * Home component that serves as the main dashboard
 * Displays application statistics including total users and posts counts
 */
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  /** Total number of users in the system */
  totalUsers: number = 0;

  /** Total number of posts in the system */
  totalPosts: number = 0;

  /**
   * Creates an instance of HomeComponent
   * @param usersService Service for user-related API operations
   * @param postsService Service for post-related API operations
   */
  constructor(
    private usersService: UsersService,
    private postsService: PostsService
  ) {}

  /**
   * Component initialization lifecycle hook
   * Loads application statistics when the component is initialized
   */
  ngOnInit() {
    this.loadStats();
  }

  /**
   * Loads application statistics asynchronously
   * Fetches total counts for users and posts from respective services
   * Handles errors gracefully by logging them to console and maintaining default values
   *
   * @private
   */
  private async loadStats() {
    try {
      // Load users statistics with minimal data fetch (1 item per page)
      const users = await this.usersService.getUsers(1, 1);
      this.totalUsers = users.meta?.pagination?.total || 0;
    } catch (error) {
      console.error('Error loading users stats:', error);
    }

    try {
      // Load posts statistics with minimal data fetch (1 item per page)
      const posts = await this.postsService.getPosts(1, 1);
      this.totalPosts = posts.meta?.pagination?.total || 0;
    } catch (error) {
      console.error('Error loading posts stats:', error);
    }
  }
}
