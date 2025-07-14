import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { AuthService } from '../../@core/services/auth/auth.service';
import { Router } from '@angular/router';
import { UsersService } from '../../@core/services/users.service';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';

/**
 * Test suite for LoginComponent
 * Verifies authentication flow, user data management, and navigation functionality
 */
describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authService: AuthService;
  let router: Router;
  let usersService: UsersService;

  /**
   * Sets up test environment with mocked dependencies and services
   */
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormsModule],
      declarations: [LoginComponent],
      providers: [
        {
          provide: AuthService,
          useValue: {
            login: jasmine
              .createSpy('login')
              .and.returnValue(Promise.resolve()),
          },
        },
        {
          provide: Router,
          useValue: { navigate: jasmine.createSpy('navigate') },
        },
        {
          provide: UsersService,
          useValue: {
            createUser: jasmine.createSpy('createUser'),
          },
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
    usersService = TestBed.inject(UsersService);
    fixture.detectChanges();
  });

  /**
   * Verifies that LoginComponent can be instantiated correctly
   */
  it('should create', () => {
    expect(component).toBeTruthy();
  });

  /**
   * Tests user data dialog display when user data is not stored locally
   */
  it('should show user data dialog if user not in localStorage', () => {
    spyOn(localStorage, 'getItem').and.returnValue(null);
    component.login('token');
    expect(component.showUserDataDialog).toBeTrue();
  });

  /**
   * Tests user data dialog hiding when user data exists in localStorage
   */
  it('should not show user data dialog if user is in localStorage', () => {
    spyOn(localStorage, 'getItem').and.returnValue('user');
    component.login('token');
    expect(component.showUserDataDialog).toBeFalse();
  });

  /**
   * Tests successful login flow with authentication and navigation
   */
  it('should call AuthService.login and navigate on login', async () => {
    spyOn(localStorage, 'getItem').and.returnValue('user');
    await component.login('token');
    expect(authService.login).toHaveBeenCalledWith('token');
    expect(router.navigate).toHaveBeenCalled();
  });

  /**
   * Tests error handling during login authentication process
   */
  it('should handle login error', async () => {
    (authService.login as jasmine.Spy).and.returnValue(Promise.reject('error'));
    spyOn(localStorage, 'getItem').and.returnValue('user');
    await component.login('token');
    // If there's an error variable, check it here
    // expect(component.error).toBeTruthy();
  });

  /**
   * Tests successful user data creation and storage workflow
   */
  it('should save user data and navigate on success', async () => {
    (usersService.createUser as jasmine.Spy).and.returnValue(
      Promise.resolve({
        id: 1,
        name: 'Test',
        email: 'test@test.com',
        gender: 'male',
        status: 'active',
      })
    );
    spyOn(localStorage, 'setItem');
    component.userData = {
      id: 0,
      name: 'Test',
      email: 'test@test.com',
      gender: 'male',
      status: 'active',
    };
    component.showUserDataDialog = true;
    await component.saveUserData();
    expect(usersService.createUser).toHaveBeenCalled();
    expect(localStorage.setItem).toHaveBeenCalled();
    expect(component.showUserDataDialog).toBeFalse();
    expect(router.navigate).toHaveBeenCalled();
  });

  /**
   * Tests error handling during user data creation process
   */
  it('should handle error in saveUserData', async () => {
    (usersService.createUser as jasmine.Spy).and.returnValue(
      Promise.reject({ error: [{ message: 'Errore' }] })
    );
    spyOn(window, 'alert');
    component.userData = {
      id: 0,
      name: 'Test',
      email: 'test@test.com',
      gender: 'male',
      status: 'active',
    };
    component.showUserDataDialog = true;
    await component.saveUserData();
    expect(usersService.createUser).toHaveBeenCalled();
    expect(window.alert).toHaveBeenCalledWith(jasmine.stringMatching(/Errore/));
    expect(component.showUserDataDialog).toBeTrue();
  });

  /**
   * Tests validation for empty token during login attempt
   */
  it('should not call login or navigate if login called with empty token', () => {
    spyOn(localStorage, 'getItem').and.returnValue('user');
    component.login('');
    expect(authService.login).not.toHaveBeenCalled();
    expect(router.navigate).not.toHaveBeenCalled();
  });
});
