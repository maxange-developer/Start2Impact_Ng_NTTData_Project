export interface Post {
  id: number;
  user_id: number;
  title: string;
  body: string;
}

export interface PostsResponse {
  data: Post[];
  meta: {
    pagination: {
      page: number;
      pages: number;
      per_page: number;
      total: number;
    };
  };
}

export interface CreatePostRequest {
  user_id: number;
  title: string;
  body: string;
}

export interface UpdatePostRequest extends CreatePostRequest {
  id: number;
}

export interface NewPostRequest {
  title: string;
  body: string;
  user_id: number;
}
