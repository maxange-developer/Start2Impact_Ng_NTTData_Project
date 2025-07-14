import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { firstValueFrom, of, delay } from 'rxjs';
import {
  Comment,
  CreateCommentRequest,
  CommentsResponse,
} from '../models/comments';
import { ConfigService } from './config.service';

/**
 * Service for managing comment-related operations with GoREST API
 * Handles CRUD operations for comments with support for mock data fallback
 */
@Injectable({
  providedIn: 'root',
})
export class CommentsService {
  private readonly baseUrl = 'https://gorest.co.in/public/v2/comments';
  private readonly useMockData = this.configService.useMockData;

  /**
   * Mock comments data for development and testing purposes
   */
  private mockComments: Comment[] = [
    {
      id: 1,
      post_id: 1,
      name: 'Marco Verdi',
      email: 'marco.verdi@email.com',
      body: 'Ottimo articolo su Angular! Molto utile per chi inizia.',
    },
    {
      id: 2,
      post_id: 1,
      name: 'Sara Bianchi',
      email: 'sara.bianchi@email.com',
      body: 'Spiegazione chiara e dettagliata. Grazie per la condivisione!',
    },
    {
      id: 3,
      post_id: 2,
      name: 'Luigi Rossi',
      email: 'luigi.rossi@email.com',
      body: 'TypeScript è davvero fondamentale per progetti grandi.',
    },
    {
      id: 4,
      post_id: 3,
      name: 'Anna Neri',
      email: 'anna.neri@email.com',
      body: 'CSS Grid ha rivoluzionato il modo di fare layout!',
    },
    {
      id: 5,
      post_id: 4,
      name: 'Paolo Ferrari',
      email: 'paolo.ferrari@email.com',
      body: 'Il responsive design è sempre più importante nel 2025.',
    },
  ];

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object,
    private configService: ConfigService
  ) {}

  /**
   * Retrieves all comments for a specific post
   * @param postId Post ID to fetch comments for
   * @returns Promise resolving to array of comments for the post
   */
  async getCommentsByPost(postId: number): Promise<Comment[]> {
    if (!isPlatformBrowser(this.platformId)) {
      return [];
    }

    if (this.useMockData) {
      return this.getMockCommentsByPost(postId);
    }

    try {
      const params = new HttpParams().set('post_id', postId.toString());
      const comments = await firstValueFrom(
        this.http.get<Comment[]>(this.baseUrl, { params })
      );
      return comments || [];
    } catch (error) {
      console.error('Error fetching comments, using mock data:', error);
      return this.getMockCommentsByPost(postId);
    }
  }

  /**
   * Creates a new comment for a post
   * @param commentData Comment data for creation including post_id, name, email, body
   * @returns Promise resolving to created comment object
   */
  async createComment(commentData: CreateCommentRequest): Promise<Comment> {
    if (this.useMockData) {
      await firstValueFrom(of(null).pipe(delay(300)));
      const newComment: Comment = {
        id: Math.max(...this.mockComments.map((c) => c.id), 0) + 1,
        ...commentData,
      };
      this.mockComments.push(newComment);
      return newComment;
    }

    try {
      const comment = await firstValueFrom(
        this.http.post<Comment>(this.baseUrl, commentData)
      );
      return comment;
    } catch (error) {
      console.error('Error creating comment:', error);
      throw error;
    }
  }

  /**
   * Generates mock comments data for a specific post
   * @param postId Post ID to filter comments by
   * @returns Promise resolving to filtered mock comments array
   */
  private async getMockCommentsByPost(postId: number): Promise<Comment[]> {
    await firstValueFrom(of(null).pipe(delay(200)));
    return this.mockComments.filter((comment) => comment.post_id === postId);
  }
}
