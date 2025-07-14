import { Component, OnInit } from '@angular/core';
import { UsersService } from '../../@core/services/users.service';
import { CreateUserRequest, User } from '../../@core/models/users';
import { MessageService, ConfirmationService } from 'primeng/api';
import { TooltipService } from '../../@core/services/tooltip.service';
import { Router } from '@angular/router';

/**
 * Users component that manages user CRUD operations and data visualization
 * Provides functionality for listing, creating, editing, deleting users with filtering and pagination
 */
@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css'],
})
export class UsersComponent implements OnInit {
  /** Array of users to display in the table */
  users: User[] = [];

  /** Currently selected user for editing or creation */
  selectedUser: User = {
    id: 0,
    name: '',
    email: '',
    gender: 'male',
    status: 'active',
  };

  /** Dialog visibility state for add/edit operations */
  showDialog = false;

  /** Current dialog mode - either adding new user or editing existing */
  dialogMode: 'add' | 'edit' = 'add';

  /** Loading state for users operations */
  loading = false;

  /** Current page number for pagination */
  currentPage = 1;

  /** Number of users displayed per page */
  itemsPerPage = 9;

  /** Total number of users available */
  totalRecords = 0;

  /** Search term for filtering users by name */
  searchTerm = '';

  /** Selected status for filtering users */
  selectedStatus = '';

  /** Selected gender for filtering users */
  selectedGender = '';

  /** Dropdown options for user status selection */
  statusOptions = [
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' },
  ];

  /** Dropdown options for user gender selection */
  genderOptions = [
    { label: 'Male', value: 'male' },
    { label: 'Female', value: 'female' },
  ];

  /**
   * Creates an instance of UsersComponent
   * @param usersService Service for user-related API operations
   * @param messageService PrimeNG service for displaying toast messages
   * @param confirmationService PrimeNG service for confirmation dialogs
   * @param tooltipService Service for tooltip configuration management
   * @param router Angular Router service for navigation
   */
  constructor(
    private usersService: UsersService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    public tooltipService: TooltipService,
    private router: Router
  ) {}

  /**
   * Component initialization lifecycle hook
   * Loads initial users data
   */
  ngOnInit() {
    this.loadUsers();
  }

  /**
   * Loads users from the API with current filters and pagination
   * Handles error cases and updates loading state
   */
  async loadUsers() {
    this.loading = true;
    try {
      const filters: any = {};

      // Apply filters if present
      if (this.searchTerm) {
        filters.name = this.searchTerm;
      }
      if (this.selectedStatus) {
        filters.status = this.selectedStatus;
      }
      if (this.selectedGender) {
        filters.gender = this.selectedGender;
      }

      const response = await this.usersService.getUsers(
        this.currentPage,
        this.itemsPerPage,
        filters
      );

      this.users = response.data;
      this.totalRecords = response.meta.pagination.total;
    } catch (error: any) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: error?.error?.message || 'Failed to load users',
      });
    }
    this.loading = false;
  }

  /**
   * Refreshes the users list and resets all filters
   * Returns to first page with no active filters
   */
  refreshUsers() {
    this.currentPage = 1;
    this.searchTerm = '';
    this.selectedStatus = '';
    this.selectedGender = '';
    this.loadUsers();
  }

  /**
   * Handles pagination change events
   * Updates current page and reloads users
   * @param event Pagination event containing new page information
   */
  onPageChange(event: any) {
    this.currentPage = event.page + 1;
    this.loadUsers();
  }

  /**
   * Handles search functionality
   * Resets to first page and applies current search filters
   */
  onSearch() {
    this.currentPage = 1;
    this.loadUsers();
  }

  /**
   * Opens the dialog for creating a new user
   * Initializes the form with default values
   */
  showAddDialog() {
    this.dialogMode = 'add';
    this.selectedUser = {
      id: 0,
      name: '',
      email: '',
      gender: 'male',
      status: 'active',
    };
    this.showDialog = true;
  }

  /**
   * Opens the dialog for editing an existing user
   * Pre-populates the form with current user data
   * @param user The user to be edited
   */
  editUser(user: User) {
    this.dialogMode = 'edit';
    this.selectedUser = { ...user };
    this.showDialog = true;
  }

  /**
   * Navigates to the user detail page
   * @param user The user whose details should be viewed
   */
  viewUser(user: User) {
    this.router.navigate(['/main/users', user.id]);
  }

  /**
   * Saves the current user (either creates new or updates existing)
   * Handles both add and edit modes based on current dialog state
   */
  async saveUser() {
    try {
      if (this.dialogMode === 'add') {
        const createRequest: CreateUserRequest = {
          name: this.selectedUser.name,
          email: this.selectedUser.email,
          gender: this.selectedUser.gender,
          status: this.selectedUser.status,
        };
        await this.usersService.createUser(createRequest);
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'User created successfully',
        });
      } else {
        const updateRequest: Partial<CreateUserRequest> = {
          name: this.selectedUser.name,
          email: this.selectedUser.email,
          gender: this.selectedUser.gender,
          status: this.selectedUser.status,
        };
        await this.usersService.updateUser(this.selectedUser.id, updateRequest);
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'User updated successfully',
        });
      }

      this.hideDialog();
      this.loadUsers();
    } catch (error: any) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: error?.error?.[0]?.message || 'Failed to save user',
      });
    }
  }

  /**
   * Closes the add/edit user dialog
   */
  hideDialog() {
    this.showDialog = false;
  }

  /**
   * Initiates user deletion with user confirmation
   * Shows confirmation dialog before proceeding with deletion
   * @param userId ID of the user to be deleted
   */
  deleteUser(userId: number) {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this user?',
      header: 'Confirm Deletion',
      icon: 'pi pi-exclamation-triangle',
      accept: async () => {
        try {
          await this.usersService.deleteUser(userId);
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'User deleted successfully',
          });
          this.loadUsers();
        } catch (error) {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to delete user',
          });
        }
      },
    });
  }

  /**
   * Extracts initials from a full name for avatar display
   * @param name The full name to extract initials from
   * @returns Two-letter initials in uppercase
   */
  getInitials(name: string): string {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }

  /**
   * Generates a consistent color for user avatars
   * Uses a predefined color palette based on user ID
   * @param id The user ID to base the color on
   * @returns Hex color code for the avatar background
   */
  getAvatarColor(id: number): string {
    const colors = [
      '#3b82f6',
      '#10b981',
      '#f59e0b',
      '#ef4444',
      '#8b5cf6',
      '#06b6d4',
      '#84cc16',
      '#f97316',
    ];
    return colors[id % colors.length];
  }

  /**
   * Gets tooltip configuration for user view action
   * @returns Tooltip configuration object
   */
  getViewTooltipConfig() {
    return this.tooltipService.getViewTooltip('Visualizza dettagli utente');
  }

  /**
   * Gets tooltip configuration for user edit action
   * @returns Tooltip configuration object
   */
  getEditTooltipConfig() {
    return this.tooltipService.getEditTooltip('Modifica utente');
  }

  /**
   * Gets tooltip configuration for user delete action
   * @returns Tooltip configuration object
   */
  getDeleteTooltipConfig() {
    return this.tooltipService.getDeleteTooltip('Elimina utente');
  }

  /**
   * Gets tooltip configuration for user creation action
   * @returns Tooltip configuration object
   */
  getAddTooltipConfig() {
    return this.tooltipService.getAddTooltip('Crea nuovo utente');
  }

  /**
   * Gets tooltip configuration for users refresh action
   * @returns Tooltip configuration object
   */
  getRefreshTooltipConfig() {
    return this.tooltipService.getRefreshUserTooltip('Aggiorna elenco utenti');
  }
}
