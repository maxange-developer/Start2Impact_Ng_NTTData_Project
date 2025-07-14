import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UsersComponent } from './users.component';
import { UsersService } from '../../@core/services/users.service';
import { MessageService, ConfirmationService } from 'primeng/api';
import { TooltipService } from '../../@core/services/tooltip.service';
import { FormsModule } from '@angular/forms';
import {
  User,
  UsersResponse,
  CreateUserRequest,
} from '../../@core/models/users';
import { NO_ERRORS_SCHEMA } from '@angular/core';

/**
 * Test suite for UsersComponent
 * Verifies user management functionality, CRUD operations, filtering, and UI interactions
 */
describe('UsersComponent', () => {
  let component: UsersComponent;
  let fixture: ComponentFixture<UsersComponent>;
  let mockUsersService: jasmine.SpyObj<UsersService>;
  let mockMessageService: jasmine.SpyObj<MessageService>;
  let mockConfirmationService: jasmine.SpyObj<ConfirmationService>;
  let mockTooltipService: jasmine.SpyObj<TooltipService>;

  /**
   * Mock user data for testing user management functionality
   */
  const mockUser: User = {
    id: 1,
    name: 'Test User',
    email: 'test@test.com',
    gender: 'male',
    status: 'active',
  };

  /**
   * Mock API response with pagination metadata for users list
   */
  const mockUsersResponse: UsersResponse = {
    data: [
      mockUser,
      {
        id: 2,
        name: 'Test User 2',
        email: 'test2@test.com',
        gender: 'female',
        status: 'active',
      },
    ],
    meta: { pagination: { page: 1, pages: 1, per_page: 9, total: 2 } },
  };

  /**
   * Sets up test environment with mocked dependencies and services
   */
  beforeEach(async () => {
    mockUsersService = jasmine.createSpyObj('UsersService', [
      'getUsers',
      'createUser',
      'updateUser',
      'deleteUser',
    ]);
    mockMessageService = jasmine.createSpyObj('MessageService', ['add']);
    mockConfirmationService = jasmine.createSpyObj('ConfirmationService', [
      'confirm',
    ]);
    mockTooltipService = jasmine.createSpyObj('TooltipService', [
      'getViewTooltip',
      'getEditTooltip',
      'getDeleteTooltip',
      'getAddTooltip',
      'getRefreshUserTooltip',
    ]);

    await TestBed.configureTestingModule({
      imports: [FormsModule],
      declarations: [UsersComponent],
      providers: [
        { provide: UsersService, useValue: mockUsersService },
        { provide: MessageService, useValue: mockMessageService },
        { provide: ConfirmationService, useValue: mockConfirmationService },
        { provide: TooltipService, useValue: mockTooltipService },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    // Setup default mock returns for successful operations
    mockUsersService.getUsers.and.returnValue(
      Promise.resolve(mockUsersResponse)
    );
    mockUsersService.createUser.and.returnValue(Promise.resolve(mockUser));
    mockUsersService.updateUser.and.returnValue(Promise.resolve(mockUser));
    mockUsersService.deleteUser.and.returnValue(Promise.resolve());

    // Setup tooltip service mocks with consistent configurations
    mockTooltipService.getViewTooltip.and.returnValue({
      text: 'Visualizza dettagli',
      position: 'top',
      styleClass: 'view-tooltip',
    });
    mockTooltipService.getEditTooltip.and.returnValue({
      text: 'Modifica',
      position: 'top',
      styleClass: 'edit-tooltip',
    });
    mockTooltipService.getDeleteTooltip.and.returnValue({
      text: 'Elimina',
      position: 'top',
      styleClass: 'delete-tooltip',
    });
    mockTooltipService.getAddTooltip.and.returnValue({
      text: 'Aggiungi nuovo',
      position: 'bottom',
      styleClass: 'add-tooltip',
    });
    mockTooltipService.getRefreshUserTooltip.and.returnValue({
      text: 'Aggiorna',
      position: 'top',
      styleClass: 'refresh-user-tooltip',
    });

    fixture = TestBed.createComponent(UsersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  /**
   * Verifies that UsersComponent can be instantiated correctly
   */
  it('should create', () => {
    expect(component).toBeTruthy();
  });

  /**
   * Tests component initialization with users data loading
   */
  it('should load users on init', async () => {
    await component.ngOnInit();
    expect(mockUsersService.getUsers).toHaveBeenCalledWith(1, 9, {});
    expect(component.users.length).toBe(2);
    expect(component.totalRecords).toBe(2);
    expect(component.loading).toBeFalse();
  });

  /**
   * Tests users loading with multiple filter parameters applied
   */
  it('should load users with filters', async () => {
    component.searchTerm = 'test';
    component.selectedStatus = 'active';
    component.selectedGender = 'male';

    await component.loadUsers();

    expect(mockUsersService.getUsers).toHaveBeenCalledWith(1, 9, {
      name: 'test',
      status: 'active',
      gender: 'male',
    });
  });

  /**
   * Tests error handling when users loading fails with specific error message
   */
  it('should handle error in loadUsers', async () => {
    mockUsersService.getUsers.and.returnValue(
      Promise.reject({ error: { message: 'Test error' } })
    );

    await component.loadUsers();

    expect(mockMessageService.add).toHaveBeenCalledWith({
      severity: 'error',
      summary: 'Error',
      detail: 'Test error',
    });
    expect(component.loading).toBeFalse();
  });

  /**
   * Tests error handling when users loading fails without specific error message
   */
  it('should handle error without message in loadUsers', async () => {
    mockUsersService.getUsers.and.returnValue(Promise.reject({}));

    await component.loadUsers();

    expect(mockMessageService.add).toHaveBeenCalledWith({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to load users',
    });
  });

  /**
   * Tests users list refresh functionality with filter reset
   */
  it('should refresh users', () => {
    component.currentPage = 2;
    component.searchTerm = 'test';
    component.selectedStatus = 'active';
    component.selectedGender = 'male';
    spyOn(component, 'loadUsers');

    component.refreshUsers();

    expect(component.currentPage).toBe(1);
    expect(component.searchTerm).toBe('');
    expect(component.selectedStatus).toBe('');
    expect(component.selectedGender).toBe('');
    expect(component.loadUsers).toHaveBeenCalled();
  });

  /**
   * Tests pagination functionality with page change events
   */
  it('should handle page change', () => {
    spyOn(component, 'loadUsers');
    const event = { page: 2, rows: 9 };

    component.onPageChange(event);

    expect(component.currentPage).toBe(3);
    expect(component.loadUsers).toHaveBeenCalled();
  });

  /**
   * Tests search functionality with page reset to first page
   */
  it('should handle search', () => {
    spyOn(component, 'loadUsers');
    component.currentPage = 2;

    component.onSearch();

    expect(component.currentPage).toBe(1);
    expect(component.loadUsers).toHaveBeenCalled();
  });

  /**
   * Tests dialog opening for new user creation
   */
  it('should show add dialog', () => {
    component.showAddDialog();

    expect(component.dialogMode).toBe('add');
    expect(component.showDialog).toBeTrue();
    expect(component.selectedUser).toEqual({
      id: 0,
      name: '',
      email: '',
      gender: 'male',
      status: 'active',
    });
  });

  /**
   * Tests dialog opening for user editing with data pre-population
   */
  it('should edit user', () => {
    component.editUser(mockUser);

    expect(component.dialogMode).toBe('edit');
    expect(component.showDialog).toBeTrue();
    expect(component.selectedUser).toEqual(mockUser);
  });

  /**
   * Tests successful new user creation with proper API call and UI updates
   */
  it('should save new user', async () => {
    component.dialogMode = 'add';
    component.selectedUser = {
      id: 0,
      name: 'New User',
      email: 'new@test.com',
      gender: 'female',
      status: 'active',
    };
    spyOn(component, 'hideDialog');
    spyOn(component, 'loadUsers');

    await component.saveUser();

    const expectedCreateRequest: CreateUserRequest = {
      name: 'New User',
      email: 'new@test.com',
      gender: 'female',
      status: 'active',
    };

    expect(mockUsersService.createUser).toHaveBeenCalledWith(
      expectedCreateRequest
    );
    expect(mockMessageService.add).toHaveBeenCalledWith({
      severity: 'success',
      summary: 'Success',
      detail: 'User created successfully',
    });
    expect(component.hideDialog).toHaveBeenCalled();
    expect(component.loadUsers).toHaveBeenCalled();
  });

  /**
   * Tests error handling during user creation with specific error message
   */
  it('should handle error in saveUser for create', async () => {
    component.dialogMode = 'add';
    component.selectedUser = mockUser;
    mockUsersService.createUser.and.returnValue(
      Promise.reject({
        error: [{ message: 'Create error' }],
      })
    );

    await component.saveUser();

    expect(mockMessageService.add).toHaveBeenCalledWith({
      severity: 'error',
      summary: 'Error',
      detail: 'Create error',
    });
  });

  /**
   * Tests error handling during user update with specific error message
   */
  it('should handle error in saveUser for update', async () => {
    component.dialogMode = 'edit';
    component.selectedUser = mockUser;
    mockUsersService.updateUser.and.returnValue(
      Promise.reject({
        error: [{ message: 'Update error' }],
      })
    );

    await component.saveUser();

    expect(mockMessageService.add).toHaveBeenCalledWith({
      severity: 'error',
      summary: 'Error',
      detail: 'Update error',
    });
  });

  /**
   * Tests error handling when save operation fails without specific error message
   */
  it('should handle error without specific message in saveUser', async () => {
    component.dialogMode = 'add';
    component.selectedUser = mockUser;
    mockUsersService.createUser.and.returnValue(Promise.reject({}));

    await component.saveUser();

    expect(mockMessageService.add).toHaveBeenCalledWith({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to save user',
    });
  });

  /**
   * Tests dialog closing functionality
   */
  it('should hide dialog', () => {
    component.showDialog = true;
    component.hideDialog();
    expect(component.showDialog).toBeFalse();
  });

  /**
   * Tests initials extraction from user names for avatar display
   */
  it('should get initials correctly', () => {
    expect(component.getInitials('John Doe')).toBe('JD');
    expect(component.getInitials('Mary Jane Smith')).toBe('MJ');
    expect(component.getInitials('')).toBe('');
  });

  /**
   * Tests avatar color generation based on user ID
   */
  it('should get avatar color', () => {
    const color1 = component.getAvatarColor(1);
    const color2 = component.getAvatarColor(2);
    const color9 = component.getAvatarColor(9); // Should wrap around

    expect(color1).toBe('#10b981');
    expect(color2).toBe('#f59e0b');
    expect(typeof color1).toBe('string');
    expect(color1).toMatch(/^#[0-9a-f]{6}$/);
  });

  /**
   * Tests error handling during pagination operations
   */
  it('should handle error in onPageChange', async () => {
    mockUsersService.getUsers.and.returnValue(
      Promise.reject('Page change error')
    );

    const event = { page: 1, rows: 9 };
    await component.onPageChange(event);

    expect(component.loading).toBeFalse();
    expect(mockMessageService.add).toHaveBeenCalledWith({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to load users',
    });
  });

  /**
   * Tests loading state management during users data fetching
   */
  it('should set loading state correctly during loadUsers', async () => {
    expect(component.loading).toBeFalse();

    const loadPromise = component.loadUsers();
    expect(component.loading).toBeTrue();

    await loadPromise;
    expect(component.loading).toBeFalse();
  });

  /**
   * Tests that dropdown options are properly configured
   */
  it('should have correct options arrays', () => {
    expect(component.statusOptions).toEqual([
      { label: 'Active', value: 'active' },
      { label: 'Inactive', value: 'inactive' },
    ]);
    expect(component.genderOptions).toEqual([
      { label: 'Male', value: 'male' },
      { label: 'Female', value: 'female' },
    ]);
  });
});
