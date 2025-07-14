export interface Comment {
  id: number;
  post_id: number;
  name: string;
  email: string;
  body: string;
}

export interface CreateCommentRequest {
  post_id: number;
  name: string;
  email: string;
  body: string;
}

export interface CommentsResponse {
  data: Comment[];
  meta: {
    pagination: {
      page: number;
      pages: number;
      per_page: number;
      total: number;
    };
  };
}
