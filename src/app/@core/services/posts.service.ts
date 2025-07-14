import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { delay, firstValueFrom, of } from 'rxjs';
import {
  Post,
  PostsResponse,
  CreatePostRequest,
  UpdatePostRequest,
} from '../models/posts';
import { isPlatformBrowser } from '@angular/common';
import { ConfigService } from './config.service';

/**
 * Service for managing post-related operations with GoREST API
 * Handles CRUD operations for posts with support for mock data fallback
 */
@Injectable({
  providedIn: 'root',
})
export class PostsService {
  private readonly baseUrl = 'https://gorest.co.in/public/v2/posts';
  private readonly useMockData = this.configService.useMockData;

  /**
   * Mock posts data for development and testing purposes
   */
  private mockPosts: Post[] = [
    {
      id: 1,
      user_id: 1,
      title: 'Introduzione ad Angular',
      body: 'Angular è un framework potente per lo sviluppo di applicazioni web moderne. In questo post esploreremo le sue caratteristiche principali e come iniziare.',
    },
    {
      id: 2,
      user_id: 1,
      title: 'TypeScript: Le basi essenziali',
      body: 'TypeScript aggiunge tipizzazione statica a JavaScript, rendendo il codice più robusto e manutenibile. Scopriamo come utilizzarlo al meglio.',
    },
    {
      id: 3,
      user_id: 2,
      title: 'CSS Grid vs Flexbox',
      body: 'Due sistemi di layout potenti per il web moderno. Quando usare Grid e quando utilizzare Flexbox per ottenere i migliori risultati.',
    },
    {
      id: 4,
      user_id: 2,
      title: 'Responsive Design nel 2025',
      body: 'Le migliori pratiche per il design responsive moderno, includendo nuove tecniche CSS e considerazioni per dispositivi pieghevoli.',
    },
    {
      id: 5,
      user_id: 3,
      title: 'Node.js per principianti',
      body: 'Come iniziare con Node.js per lo sviluppo backend. Una guida completa dalle basi fino alla creazione della prima API.',
    },
    {
      id: 6,
      user_id: 3,
      title: 'Database NoSQL vs SQL',
      body: 'Quale tipologia di database scegliere per il tuo prossimo progetto? Analizziamo vantaggi e svantaggi di entrambe le soluzioni.',
    },
    {
      id: 7,
      user_id: 4,
      title: 'Testing in JavaScript',
      body: 'Strategie e tools per testare applicazioni JavaScript moderne. Unit testing, integration testing e end-to-end testing.',
    },
    {
      id: 8,
      user_id: 4,
      title: 'Git: Workflow avanzati',
      body: 'Come gestire repository complessi con Git. Branching strategies, merge vs rebase, e best practices per team di sviluppo.',
    },
    {
      id: 9,
      user_id: 5,
      title: 'API REST con Express.js',
      body: 'Creare API robuste e scalabili con Express.js. Middleware, autenticazione, validazione e documentazione automatica.',
    },
    {
      id: 10,
      user_id: 5,
      title: 'Docker per sviluppatori',
      body: 'Containerizzare le tue applicazioni con Docker. Dal Dockerfile al Docker Compose, una guida pratica per lo sviluppo moderno.',
    },
    {
      id: 11,
      user_id: 6,
      title: 'Machine Learning con Python',
      body: 'Introduzione al Machine Learning per sviluppatori web. Librerie essenziali e primi progetti pratici.',
    },
    {
      id: 12,
      user_id: 6,
      title: 'Sicurezza Web: Best Practices',
      body: 'Come proteggere le tue applicazioni web dalle vulnerabilità più comuni. OWASP Top 10 e implementazione pratica.',
    },
    {
      id: 13,
      user_id: 7,
      title: 'Progressive Web Apps',
      body: 'Creare app web che si comportano come applicazioni native. Service Workers, offline functionality e app shell.',
    },
    {
      id: 14,
      user_id: 7,
      title: 'GraphQL vs REST',
      body: 'Confronto dettagliato tra i due paradigmi API più popolari. Quando scegliere GraphQL e quando restare con REST.',
    },
    {
      id: 15,
      user_id: 8,
      title: 'Microservizi con Node.js',
      body: 'Architettura a microservizi per applicazioni scalabili. Comunicazione tra servizi, gestione errori e monitoring.',
    },
    {
      id: 16,
      user_id: 8,
      title: 'CI/CD con GitHub Actions',
      body: 'Automazione del deployment con GitHub Actions. Pipeline di build, test automatici e deployment su cloud.',
    },
    {
      id: 17,
      user_id: 9,
      title: 'Vue.js vs React: Confronto 2025',
      body: 'Analisi approfondita dei due framework frontend più popolari. Performance, ecosistema e curve di apprendimento.',
    },
    {
      id: 18,
      user_id: 9,
      title: 'WebAssembly: Il futuro del web',
      body: "Come WebAssembly sta rivoluzionando le performance web. Casi d'uso pratici e integrazione con JavaScript.",
    },
    {
      id: 19,
      user_id: 10,
      title: 'Accessibilità Web: Guida completa',
      body: 'Rendere il web accessibile a tutti. WCAG guidelines, testing tools e implementazione pratica per sviluppatori.',
    },
    {
      id: 20,
      user_id: 10,
      title: 'Performance Optimization',
      body: 'Tecniche avanzate per ottimizzare le performance web. Code splitting, lazy loading e Web Vitals.',
    },
  ];

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object,
    private configService: ConfigService
  ) {}

  /**
   * Retrieves paginated list of posts with optional filtering
   * @param page Page number (1-based)
   * @param perPage Number of posts per page
   * @param filters Optional filters for title, body, user_id
   * @returns Promise resolving to posts response with pagination metadata
   */
  async getPosts(
    page: number = 1,
    perPage: number = 20,
    filters?: {
      title?: string;
      body?: string;
      user_id?: number;
    }
  ): Promise<PostsResponse> {
    if (!isPlatformBrowser(this.platformId)) {
      return {
        data: [],
        meta: {
          pagination: {
            page: 1,
            pages: 0,
            per_page: perPage,
            total: 0,
          },
        },
      };
    }

    if (this.useMockData) {
      return this.getMockPosts(page, perPage, filters);
    }

    let params = new HttpParams()
      .set('page', page.toString())
      .set('per_page', perPage.toString());

    if (filters) {
      if (filters.title) {
        params = params.set('title', filters.title);
      }
      if (filters.body) {
        params = params.set('body', filters.body);
      }
      if (filters.user_id) {
        params = params.set('user_id', filters.user_id.toString());
      }
    }

    try {
      console.log('🔍 Making request to:', this.baseUrl);
      console.log('📋 With params:', params.toString());

      const response = await firstValueFrom(
        this.http.get<Post[]>(this.baseUrl, {
          params,
          observe: 'response',
        })
      );

      console.log('✅ Response received:', response.status);

      const totalItems = parseInt(
        response.headers.get('x-pagination-total') || '0'
      );
      const totalPages = parseInt(
        response.headers.get('x-pagination-pages') || '0'
      );

      return {
        data: response.body || [],
        meta: {
          pagination: {
            page: page,
            pages: totalPages,
            per_page: perPage,
            total: totalItems,
          },
        },
      };
    } catch (error: any) {
      console.error('❌ Error fetching posts, using mock data:', {
        status: error.status,
        message: error.message,
      });
      return this.getMockPosts(page, perPage, filters);
    }
  }

  /**
   * Generates mock posts data for development and testing
   * @param page Page number for pagination
   * @param perPage Posts per page
   * @param filters Optional filters to apply
   * @returns Promise resolving to mock posts response
   */
  private async getMockPosts(
    page: number = 1,
    perPage: number = 20,
    filters?: {
      title?: string;
      body?: string;
      user_id?: number;
    }
  ): Promise<PostsResponse> {
    await firstValueFrom(of(null).pipe(delay(300)));

    let filteredPosts = [...this.mockPosts];

    if (filters) {
      if (filters.title) {
        filteredPosts = filteredPosts.filter((post) =>
          post.title.toLowerCase().includes(filters.title!.toLowerCase())
        );
      }
      if (filters.body) {
        filteredPosts = filteredPosts.filter((post) =>
          post.body.toLowerCase().includes(filters.body!.toLowerCase())
        );
      }
      if (filters.user_id) {
        filteredPosts = filteredPosts.filter(
          (post) => post.user_id === filters.user_id
        );
      }
    }

    const startIndex = (page - 1) * perPage;
    const endIndex = startIndex + perPage;
    const pageData = filteredPosts.slice(startIndex, endIndex);

    return {
      data: pageData,
      meta: {
        pagination: {
          page,
          pages: Math.ceil(filteredPosts.length / perPage),
          per_page: perPage,
          total: filteredPosts.length,
        },
      },
    };
  }

  /**
   * Retrieves a specific post by ID
   * @param id Post ID to retrieve
   * @returns Promise resolving to post object
   */
  async getPostById(id: number): Promise<Post> {
    if (this.useMockData) {
      await firstValueFrom(of(null).pipe(delay(200)));
      const post = this.mockPosts.find((p) => p.id === id);
      if (!post) {
        throw new Error(`Post with ID ${id} not found`);
      }
      return post;
    }

    try {
      return await firstValueFrom(this.http.get<Post>(`${this.baseUrl}/${id}`));
    } catch (error) {
      console.error('Error fetching post:', error);
      const post = this.mockPosts.find((p) => p.id === id);
      if (post) return post;
      throw error;
    }
  }

  /**
   * Creates a new post
   * @param postData Post data for creation
   * @returns Promise resolving to created post object
   */
  async createPost(postData: CreatePostRequest): Promise<Post> {
    if (this.useMockData) {
      await firstValueFrom(of(null).pipe(delay(500)));
      const newPost: Post = {
        id: Math.max(...this.mockPosts.map((p) => p.id)) + 1,
        ...postData,
      };
      this.mockPosts.push(newPost);
      return newPost;
    }

    try {
      return await firstValueFrom(this.http.post<Post>(this.baseUrl, postData));
    } catch (error) {
      console.error('Error creating post:', error);
      throw error;
    }
  }

  /**
   * Updates an existing post
   * @param id Post ID to update
   * @param postData Updated post data
   * @returns Promise resolving to updated post object
   */
  async updatePost(
    id: number,
    postData: Partial<CreatePostRequest>
  ): Promise<Post> {
    if (this.useMockData) {
      await firstValueFrom(of(null).pipe(delay(400)));
      const postIndex = this.mockPosts.findIndex((p) => p.id === id);
      if (postIndex === -1) {
        throw new Error(`Post with ID ${id} not found`);
      }
      this.mockPosts[postIndex] = { ...this.mockPosts[postIndex], ...postData };
      return this.mockPosts[postIndex];
    }

    try {
      return await firstValueFrom(
        this.http.put<Post>(`${this.baseUrl}/${id}`, postData)
      );
    } catch (error) {
      console.error('Error updating post:', error);
      throw error;
    }
  }

  /**
   * Deletes a post by ID
   * @param id Post ID to delete
   * @returns Promise resolving when deletion is complete
   */
  async deletePost(id: number): Promise<void> {
    if (this.useMockData) {
      await firstValueFrom(of(null).pipe(delay(300)));
      const postIndex = this.mockPosts.findIndex((p) => p.id === id);
      if (postIndex === -1) {
        throw new Error(`Post with ID ${id} not found`);
      }
      this.mockPosts.splice(postIndex, 1);
      return;
    }

    try {
      await firstValueFrom(this.http.delete<void>(`${this.baseUrl}/${id}`));
    } catch (error) {
      console.error('Error deleting post:', error);
      throw error;
    }
  }

  /**
   * Retrieves posts for a specific user with pagination
   * @param userId User ID to filter posts by
   * @param page Page number
   * @param perPage Posts per page
   * @returns Promise resolving to user's posts response
   */
  async getPostsByUser(
    userId: number,
    page: number = 1,
    perPage: number = 20
  ): Promise<PostsResponse> {
    return this.getPosts(page, perPage, { user_id: userId });
  }

  /**
   * Searches posts by title with pagination
   * @param searchTerm Term to search in post titles
   * @param page Page number
   * @param perPage Posts per page
   * @returns Promise resolving to filtered posts response
   */
  async searchPosts(
    searchTerm: string,
    page: number = 1,
    perPage: number = 20
  ): Promise<PostsResponse> {
    return this.getPosts(page, perPage, { title: searchTerm });
  }
}
