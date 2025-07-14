import { TestBed } from '@angular/core/testing';
import { ConfigService } from './config.service';

/**
 * Test suite for ConfigService
 * Verifies configuration management, mock data toggling, and default values
 */
describe('ConfigService', () => {
  let service: ConfigService;

  /**
   * Sets up test environment with ConfigService injection
   */
  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ConfigService);
  });

  /**
   * Verifies that ConfigService can be instantiated correctly
   */
  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  /**
   * Tests that default useMockData value is false
   */
  it('should return default useMockData value', () => {
    expect(service.useMockData).toBeFalse();
  });

  /**
   * Tests that default apiTimeout value is 5000ms
   */
  it('should return default apiTimeout value', () => {
    expect(service.apiTimeout).toBe(5000);
  });

  /**
   * Tests that default retryAttempts value is 3
   */
  it('should return default retryAttempts value', () => {
    expect(service.retryAttempts).toBe(3);
  });

  /**
   * Tests that default isDevelopment value is true
   */
  it('should return default isDevelopment value', () => {
    expect(service.isDevelopment).toBeTrue();
  });

  /**
   * Tests mock data toggle functionality with console logging verification
   */
  it('should toggle mock data and log message', () => {
    spyOn(console, 'log');
    const initialValue = service.useMockData;

    service.toggleMockData();

    expect(service.useMockData).toBe(!initialValue);
    expect(console.log).toHaveBeenCalledWith('Mock data enabled');

    service.toggleMockData();

    expect(service.useMockData).toBe(initialValue);
    expect(console.log).toHaveBeenCalledWith('Mock data disabled');
  });

  /**
   * Tests setting mock data to true explicitly
   */
  it('should set mock data to true', () => {
    service.setMockData(true);
    expect(service.useMockData).toBeTrue();
  });

  /**
   * Tests setting mock data to false explicitly
   */
  it('should set mock data to false', () => {
    service.setMockData(false);
    expect(service.useMockData).toBeFalse();
  });

  /**
   * Tests that all configuration properties are properly defined
   */
  it('should have correct config structure', () => {
    expect(service.useMockData).toBeDefined();
    expect(service.apiTimeout).toBeDefined();
    expect(service.retryAttempts).toBeDefined();
    expect(service.isDevelopment).toBeDefined();
  });

  /**
   * Tests that multiple toggle operations work correctly
   */
  it('should handle multiple toggles correctly', () => {
    const initialValue = service.useMockData;

    // Toggle multiple times
    service.toggleMockData();
    service.toggleMockData();
    service.toggleMockData();

    expect(service.useMockData).toBe(!initialValue);
  });
});
