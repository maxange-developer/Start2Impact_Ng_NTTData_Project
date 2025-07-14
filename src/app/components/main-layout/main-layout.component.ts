import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { AuthService } from '../../@core/services/auth/auth.service';
import { filter } from 'rxjs/operators';

/**
 * Main layout component that provides the primary navigation structure
 * Handles sidebar navigation, route tracking, and user authentication actions
 */
@Component({
  selector: 'app-main-layout',
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.css'],
})
export class MainLayoutComponent implements OnInit {
  /** Navigation menu items for the application sidebar */
  menuItems: MenuItem[] = [];

  /** Current active route for navigation highlighting */
  currentRoute = '';

  /**
   * Creates an instance of MainLayoutComponent
   * @param router Angular Router service for navigation handling
   * @param authService Authentication service for user session management
   */
  constructor(public router: Router, private authService: AuthService) {}

  /**
   * Component initialization lifecycle hook
   * Sets up navigation menu items and subscribes to router events for route tracking
   */
  ngOnInit() {
    this.menuItems = [
      {
        label: 'Home',
        icon: 'pi pi-home',
        routerLink: '/main/home',
      },
      {
        label: 'Users',
        icon: 'pi pi-users',
        routerLink: '/main/users',
      },
      {
        label: 'Posts',
        icon: 'pi pi-file-edit',
        routerLink: '/main/posts',
      },
    ];

    // Initialize current route from router URL
    this.currentRoute = this.router.url;

    // Subscribe to navigation events to track active route
    this.router.events
      .pipe(
        filter(
          (event): event is NavigationEnd => event instanceof NavigationEnd
        )
      )
      .subscribe((event: NavigationEnd) => {
        this.currentRoute = event.urlAfterRedirects;
      });
  }

  /**
   * Determines if a given route is currently active
   * Used for highlighting the active navigation item in the sidebar
   * @param routerLink The route path to check for activity
   * @returns True if the route is active, false otherwise
   */
  isActiveRoute(routerLink: string): boolean {
    return (
      this.currentRoute === routerLink ||
      (routerLink === '/main/home' && this.currentRoute === '/main')
    );
  }

  /**
   * Handles user logout action
   * Delegates to AuthService to clear authentication and redirect to login
   */
  logout() {
    this.authService.logout();
  }
}
