import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { User, UsersResponse, CreateUserRequest } from '../models/users';
import { ConfigService } from './config.service';

/**
 * Service for managing user-related operations with GoREST API
 * Handles CRUD operations for users with support for mock data fallback
 */
@Injectable({
  providedIn: 'root',
})
export class UsersService {
  private readonly baseUrl = 'https://gorest.co.in/public/v2/users';
  private readonly useMockData = this.configService.useMockData;

  /**
   * Mock users data for development and testing purposes
   */
  private mockUsers: User[] = [
    {
      id: 1,
      name: 'Mario Rossi',
      email: 'mario.rossi@email.com',
      gender: 'male',
      status: 'active',
    },
    {
      id: 2,
      name: 'Giulia Bianchi',
      email: 'giulia.bianchi@email.com',
      gender: 'female',
      status: 'active',
    },
    {
      id: 3,
      name: 'Luca Verdi',
      email: 'luca.verdi@email.com',
      gender: 'male',
      status: 'inactive',
    },
    {
      id: 4,
      name: 'Anna Neri',
      email: 'anna.neri@email.com',
      gender: 'female',
      status: 'active',
    },
    {
      id: 5,
      name: 'Marco Ferrari',
      email: 'marco.ferrari@email.com',
      gender: 'male',
      status: 'active',
    },
    {
      id: 6,
      name: 'Sara Romano',
      email: 'sara.romano@email.com',
      gender: 'female',
      status: 'inactive',
    },
    {
      id: 7,
      name: 'Andrea Costa',
      email: 'andrea.costa@email.com',
      gender: 'male',
      status: 'active',
    },
    {
      id: 8,
      name: 'Elena Ricci',
      email: 'elena.ricci@email.com',
      gender: 'female',
      status: 'active',
    },
    {
      id: 9,
      name: 'Davide Bruno',
      email: 'davide.bruno@email.com',
      gender: 'male',
      status: 'active',
    },
    {
      id: 10,
      name: 'Chiara Greco',
      email: 'chiara.greco@email.com',
      gender: 'female',
      status: 'inactive',
    },
    {
      id: 11,
      name: 'Francesco Lombardi',
      email: 'francesco.lombardi@email.com',
      gender: 'male',
      status: 'active',
    },
    {
      id: 12,
      name: 'Valentina Esposito',
      email: 'valentina.esposito@email.com',
      gender: 'female',
      status: 'active',
    },
    {
      id: 13,
      name: 'Simone Conti',
      email: 'simone.conti@email.com',
      gender: 'male',
      status: 'inactive',
    },
    {
      id: 14,
      name: 'Francesca Martini',
      email: 'francesca.martini@email.com',
      gender: 'female',
      status: 'active',
    },
    {
      id: 15,
      name: 'Roberto Fontana',
      email: 'roberto.fontana@email.com',
      gender: 'male',
      status: 'active',
    },
    {
      id: 16,
      name: 'Martina Santoro',
      email: 'martina.santoro@email.com',
      gender: 'female',
      status: 'active',
    },
    {
      id: 17,
      name: 'Alessandro Marini',
      email: 'alessandro.marini@email.com',
      gender: 'male',
      status: 'inactive',
    },
    {
      id: 18,
      name: 'Silvia Rinaldi',
      email: 'silvia.rinaldi@email.com',
      gender: 'female',
      status: 'active',
    },
    {
      id: 19,
      name: 'Matteo Caruso',
      email: 'matteo.caruso@email.com',
      gender: 'male',
      status: 'active',
    },
    {
      id: 20,
      name: 'Federica Amato',
      email: 'federica.amato@email.com',
      gender: 'female',
      status: 'active',
    },
    {
      id: 21,
      name: 'Stefano Russo',
      email: 'stefano.russo@email.com',
      gender: 'male',
      status: 'inactive',
    },
    {
      id: 22,
      name: 'Alessia Galli',
      email: 'alessia.galli@email.com',
      gender: 'female',
      status: 'active',
    },
    {
      id: 23,
      name: 'Giuseppe Villa',
      email: 'giuseppe.villa@email.com',
      gender: 'male',
      status: 'active',
    },
    {
      id: 24,
      name: 'Monica Serra',
      email: 'monica.serra@email.com',
      gender: 'female',
      status: 'active',
    },
    {
      id: 25,
      name: 'Emilio De Luca',
      email: 'emilio.deluca@email.com',
      gender: 'male',
      status: 'inactive',
    },
  ];

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object,
    private configService: ConfigService
  ) {}

  /**
   * Retrieves paginated list of users with optional filtering
   * @param page Page number (1-based)
   * @param perPage Number of users per page
   * @param filters Optional filters for name, email, gender, status
   * @returns Promise resolving to users response with pagination metadata
   */
  async getUsers(
    page: number = 1,
    perPage: number = 20,
    filters?: {
      name?: string;
      email?: string;
      gender?: string;
      status?: string;
    }
  ): Promise<UsersResponse> {
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
      return this.getMockUsers(page, perPage, filters);
    }

    let params = new HttpParams()
      .set('page', page.toString())
      .set('per_page', perPage.toString());

    if (filters) {
      if (filters.name) params = params.set('name', filters.name);
      if (filters.email) params = params.set('email', filters.email);
      if (filters.gender) params = params.set('gender', filters.gender);
      if (filters.status) params = params.set('status', filters.status);
    }

    try {
      console.log('🔍 Making request to:', this.baseUrl);
      console.log('📋 With params:', params.toString());

      const response = await firstValueFrom(
        this.http.get<User[]>(this.baseUrl, {
          params,
          observe: 'response',
        })
      );

      console.log('✅ Response received:', response.status);

      const totalItems = parseInt(
        response.headers.get('x-pagination-total') || '0'
      );
      const totalPages = parseInt(
        response.headers.get('x-pagination-pages') || '1'
      );
      const currentPage = parseInt(
        response.headers.get('x-pagination-page') || '1'
      );
      const itemsPerPage = parseInt(
        response.headers.get('x-pagination-per-page') || '20'
      );

      return {
        data: response.body || [],
        meta: {
          pagination: {
            page: currentPage,
            pages: totalPages,
            per_page: itemsPerPage,
            total: totalItems,
          },
        },
      };
    } catch (error: any) {
      console.error('❌ Error fetching users, using mock data:', {
        status: error.status,
        message: error.message,
      });
      return this.getMockUsers(page, perPage, filters);
    }
  }

  /**
   * Generates mock users data for development and testing
   * @param page Page number for pagination
   * @param perPage Users per page
   * @param filters Optional filters to apply
   * @returns Promise resolving to mock users response
   */
  private async getMockUsers(
    page: number = 1,
    perPage: number = 20,
    filters?: {
      name?: string;
      email?: string;
      gender?: string;
      status?: string;
    }
  ): Promise<UsersResponse> {
    await firstValueFrom(of(null).pipe(delay(300)));

    let filteredUsers = [...this.mockUsers];

    if (filters) {
      if (filters.name) {
        filteredUsers = filteredUsers.filter((user) =>
          user.name.toLowerCase().includes(filters.name!.toLowerCase())
        );
      }
      if (filters.email) {
        filteredUsers = filteredUsers.filter((user) =>
          user.email.toLowerCase().includes(filters.email!.toLowerCase())
        );
      }
      if (filters.gender) {
        filteredUsers = filteredUsers.filter(
          (user) => user.gender === filters.gender
        );
      }
      if (filters.status) {
        filteredUsers = filteredUsers.filter(
          (user) => user.status === filters.status
        );
      }
    }

    const startIndex = (page - 1) * perPage;
    const endIndex = startIndex + perPage;
    const pageData = filteredUsers.slice(startIndex, endIndex);

    return {
      data: pageData,
      meta: {
        pagination: {
          page,
          pages: Math.ceil(filteredUsers.length / perPage),
          per_page: perPage,
          total: filteredUsers.length,
        },
      },
    };
  }

  /**
   * Retrieves a specific user by ID
   * @param id User ID to retrieve
   * @returns Promise resolving to user object
   */
  async getUserById(id: number): Promise<User> {
    if (this.useMockData) {
      await firstValueFrom(of(null).pipe(delay(200)));
      const user = this.mockUsers.find((u) => u.id === id);
      if (!user) {
        throw new Error(`User with ID ${id} not found`);
      }
      return user;
    }

    try {
      return await firstValueFrom(this.http.get<User>(`${this.baseUrl}/${id}`));
    } catch (error) {
      console.error('Error fetching user:', error);
      const user = this.mockUsers.find((u) => u.id === id);
      if (user) return user;
      throw error;
    }
  }

  /**
   * Creates a new user
   * @param userData User data for creation
   * @returns Promise resolving to created user object
   */
  async createUser(userData: CreateUserRequest): Promise<User> {
    if (this.useMockData) {
      await firstValueFrom(of(null).pipe(delay(500)));
      const newUser: User = {
        id: Math.max(...this.mockUsers.map((u) => u.id)) + 1,
        ...userData,
      };
      this.mockUsers.push(newUser);
      return newUser;
    }

    try {
      return await firstValueFrom(this.http.post<User>(this.baseUrl, userData));
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  /**
   * Updates an existing user
   * @param id User ID to update
   * @param userData Updated user data
   * @returns Promise resolving to updated user object
   */
  async updateUser(
    id: number,
    userData: Partial<CreateUserRequest>
  ): Promise<User> {
    if (this.useMockData) {
      await firstValueFrom(of(null).pipe(delay(400)));
      const userIndex = this.mockUsers.findIndex((u) => u.id === id);
      if (userIndex === -1) {
        throw new Error(`User with ID ${id} not found`);
      }
      this.mockUsers[userIndex] = { ...this.mockUsers[userIndex], ...userData };
      return this.mockUsers[userIndex];
    }

    try {
      return await firstValueFrom(
        this.http.put<User>(`${this.baseUrl}/${id}`, userData)
      );
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  /**
   * Deletes a user by ID
   * @param id User ID to delete
   * @returns Promise resolving when deletion is complete
   */
  async deleteUser(id: number): Promise<void> {
    if (this.useMockData) {
      await firstValueFrom(of(null).pipe(delay(300)));
      const userIndex = this.mockUsers.findIndex((u) => u.id === id);
      if (userIndex === -1) {
        throw new Error(`User with ID ${id} not found`);
      }
      this.mockUsers.splice(userIndex, 1);
      return;
    }

    try {
      await firstValueFrom(this.http.delete<void>(`${this.baseUrl}/${id}`));
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  /**
   * Searches users by name with pagination
   * @param searchTerm Term to search in user names
   * @param page Page number
   * @param perPage Users per page
   * @returns Promise resolving to filtered users response
   */
  async searchUsers(
    searchTerm: string,
    page: number = 1,
    perPage: number = 20
  ): Promise<UsersResponse> {
    return this.getUsers(page, perPage, { name: searchTerm });
  }

  /**
   * Retrieves users filtered by status
   * @param status User status to filter by
   * @param page Page number
   * @param perPage Users per page
   * @returns Promise resolving to filtered users response
   */
  async getUsersByStatus(
    status: 'active' | 'inactive',
    page: number = 1,
    perPage: number = 20
  ): Promise<UsersResponse> {
    return this.getUsers(page, perPage, { status });
  }

  /**
   * Retrieves users filtered by gender
   * @param gender User gender to filter by
   * @param page Page number
   * @param perPage Users per page
   * @returns Promise resolving to filtered users response
   */
  async getUsersByGender(
    gender: 'male' | 'female',
    page: number = 1,
    perPage: number = 20
  ): Promise<UsersResponse> {
    return this.getUsers(page, perPage, { gender });
  }
}
