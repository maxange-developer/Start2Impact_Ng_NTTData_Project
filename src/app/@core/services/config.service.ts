import { Injectable } from '@angular/core';

/**
 * Service for managing global application configuration settings
 * Centralizes environment-specific configurations and feature flags
 */
@Injectable({
  providedIn: 'root',
})
export class ConfigService {
  /**
   * Global configuration object for all services
   * Contains runtime settings that can be modified during application lifecycle
   */
  private readonly config = {
    /** Flag to determine whether to use mock data instead of real API calls */
    useMockData: false, // Cambia a false quando GoRest torna online
    /** Request timeout in milliseconds for API calls */
    apiTimeout: 5000,
    /** Number of retry attempts for failed API requests */
    retryAttempts: 3,
    /** Flag indicating if application is running in development mode */
    development: true,
  };

  /**
   * Gets the current mock data usage setting
   * @returns True if mock data should be used, false for real API calls
   */
  get useMockData(): boolean {
    return this.config.useMockData;
  }

  /**
   * Gets the configured API timeout value
   * @returns Timeout duration in milliseconds
   */
  get apiTimeout(): number {
    return this.config.apiTimeout;
  }

  /**
   * Gets the configured number of retry attempts for failed requests
   * @returns Number of retry attempts
   */
  get retryAttempts(): number {
    return this.config.retryAttempts;
  }

  /**
   * Gets the development mode status
   * @returns True if in development mode, false otherwise
   */
  get isDevelopment(): boolean {
    return this.config.development;
  }

  /**
   * Toggles the mock data usage setting between enabled and disabled
   * Logs the current state change to console for debugging
   */
  toggleMockData(): void {
    this.config.useMockData = !this.config.useMockData;
    console.log(
      `Mock data ${this.config.useMockData ? 'enabled' : 'disabled'}`
    );
  }

  /**
   * Sets the mock data usage to a specific value
   * @param enabled True to enable mock data, false to use real API
   */
  setMockData(enabled: boolean): void {
    this.config.useMockData = enabled;
  }
}
