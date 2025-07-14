import { Post } from './posts';

export interface User {
  id: number;
  name: string;
  email: string;
  gender: 'male' | 'female';
  status: 'active' | 'inactive';
}

export interface UserDetail extends User {
  posts: Post[];
}

export interface UsersResponse {
  data: User[];
  meta: {
    pagination: {
      page: number;
      pages: number;
      per_page: number;
      total: number;
    };
  };
}

export interface NewUserRequest {
  name: string;
  email: string;
  gender: 'male' | 'female';
  status: 'active' | 'inactive';
}

export interface CreateUserRequest {
  name: string;
  email: string;
  gender: 'male' | 'female';
  status: 'active' | 'inactive';
}

export interface UpdateUserRequest extends CreateUserRequest {
  id: number;
}
