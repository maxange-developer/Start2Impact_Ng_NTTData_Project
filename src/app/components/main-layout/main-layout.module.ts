import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { MainLayoutComponent } from './main-layout.component';

// PrimeNG modules
import { ButtonModule } from 'primeng/button';
import { TabMenuModule } from 'primeng/tabmenu';
import { RippleModule } from 'primeng/ripple';
import { TooltipModule } from 'primeng/tooltip';

/**
 * Routing configuration for the main layout module
 * Defines lazy-loaded child routes with MainLayoutComponent as the shell
 */
const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        /** Default redirect to home page when accessing main layout root */
        path: '',
        redirectTo: 'home',
        pathMatch: 'full',
      },
      {
        /** Home page route with lazy-loaded HomeModule */
        path: 'home',
        loadChildren: () =>
          import('../../pages/home/home.module').then((m) => m.HomeModule),
      },
      {
        /** Users list page route with lazy-loaded UsersModule */
        path: 'users',
        loadChildren: () =>
          import('../users/users.module').then((m) => m.UsersModule),
      },
      {
        /** User detail page route with parameterized ID and lazy-loaded UserDetailModule */
        path: 'users/:id',
        loadChildren: () =>
          import('../user-detail/user-detail.module').then(
            (m) => m.UserDetailModule
          ),
      },
      {
        /** Posts page route with lazy-loaded PostsModule */
        path: 'posts',
        loadChildren: () =>
          import('../posts/posts.module').then((m) => m.PostsModule),
      },
    ],
  },
];

/**
 * Main layout module that provides the application shell structure
 * Implements lazy loading for all child feature modules and includes necessary UI components
 *
 * Features:
 * - Lazy-loaded routing for performance optimization
 * - PrimeNG UI components for consistent styling
 * - Nested routing structure with MainLayoutComponent as parent shell
 */
@NgModule({
  /** Components declared in this module */
  declarations: [MainLayoutComponent],

  /** Imported modules and dependencies */
  imports: [
    /** Angular common functionality (ngIf, ngFor, etc.) */
    CommonModule,

    /** Router configuration for child routes */
    RouterModule.forChild(routes),

    /** PrimeNG UI components for navigation and interaction */
    ButtonModule, // Button components for actions
    TabMenuModule, // Tab-based navigation menu
    RippleModule, // Material Design ripple effect
    TooltipModule, // Tooltip functionality for enhanced UX
  ],
})
export class MainLayoutModule {}
