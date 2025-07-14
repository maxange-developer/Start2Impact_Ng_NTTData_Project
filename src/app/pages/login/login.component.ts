import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { AuthService } from '../../@core/services/auth/auth.service';
import { Router } from '@angular/router';
import { User } from '../../@core/models/users';
import { UsersService } from '../../@core/services/users.service';
import { isPlatformBrowser } from '@angular/common';

/**
 * Login component that handles user authentication and registration
 * Manages token-based authentication and user data collection for new users
 */
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  /** Flag to control user data collection dialog visibility */
  showUserDataDialog = false;

  /** User data form object for new user registration */
  userData: User = {
    id: 0,
    name: '',
    email: '',
    gender: 'male',
    status: 'active',
  };

  /** Token input field value for authentication */
  tokenInput = '';

  /** Dropdown options for gender selection in user registration form */
  genderOptions = [
    { label: 'Male', value: 'male' },
    { label: 'Female', value: 'female' },
  ];

  /** Dropdown options for status selection in user registration form */
  statusOptions = [
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' },
  ];

  /**
   * Creates an instance of LoginComponent
   * @param authService Service for handling authentication operations
   * @param router Angular Router service for navigation
   * @param usersService Service for user-related API operations
   * @param platformId Platform identifier to check if running in browser
   */
  constructor(
    private authService: AuthService,
    private router: Router,
    private usersService: UsersService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  /**
   * Handles user login with token authentication
   * Checks for existing user data in localStorage and shows registration dialog if needed
   * @param token Authentication token provided by the user
   */
  login(token: string) {
    if (!token) return;

    console.log(this.userData);
    this.authService.login(token);

    if (isPlatformBrowser(this.platformId)) {
      // In browser environment, check localStorage for existing user data
      if (!localStorage.getItem('user')) {
        this.showUserDataDialog = true;
        return;
      }
    } else {
      // In server environment, always show the dialog
      this.showUserDataDialog = true;
      return;
    }

    this.router.navigate(['/main/home']);
  }

  /**
   * Saves new user data to the system and localStorage
   * Creates a new user via API, stores the result locally, and navigates to home
   * Handles errors by displaying alert messages to the user
   */
  async saveUserData() {
    console.log(this.userData);
    try {
      const createdUser = await this.usersService.createUser(this.userData);

      // Store user data in localStorage if running in browser
      if (isPlatformBrowser(this.platformId)) {
        localStorage.setItem('user', JSON.stringify(createdUser));
      }

      this.showUserDataDialog = false;
      this.router.navigate(['/main/home']);
    } catch (e: any) {
      alert(
        'Errore nella creazione utente: ' +
          (e?.['error']?.[0]?.message || e?.message || '')
      );
    }
  }
}
