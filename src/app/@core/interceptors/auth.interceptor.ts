import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth/auth.service';

/**
 * HTTP interceptor that automatically adds authentication token to outgoing requests.
 * Applies Bearer token authentication for API calls to GoREST endpoints.
 */
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  /**
   * Intercepts HTTP requests and adds authentication header when token is available
   * @param request Original HTTP request
   * @param next Next handler in the interceptor chain
   * @returns Observable of HTTP event with modified request
   */
  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    const token = this.authService.getToken();

    if (token) {
      const authRequest = request.clone({
        headers: request.headers.set('Authorization', `Bearer ${token}`),
      });
      return next.handle(authRequest);
    }

    return next.handle(request);
  }
}
