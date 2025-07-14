import { TestBed } from '@angular/core/testing';
import { TooltipService } from './tooltip.service';

/**
 * Test suite for TooltipService
 * Verifies tooltip configuration management and helper methods functionality
 */
describe('TooltipService', () => {
  let service: TooltipService;

  /**
   * Sets up test environment with TooltipService injection
   */
  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TooltipService);
  });

  /**
   * Verifies that TooltipService can be instantiated correctly
   */
  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  /**
   * Tests that all predefined tooltip configurations are available
   */
  it('should have predefined tooltip configurations', () => {
    expect(service.tooltipConfigs).toBeDefined();
    expect(service.tooltipConfigs.view).toBeDefined();
    expect(service.tooltipConfigs.edit).toBeDefined();
    expect(service.tooltipConfigs.delete).toBeDefined();
    expect(service.tooltipConfigs.add).toBeDefined();
    expect(service.tooltipConfigs.refresh).toBeDefined();
    expect(service.tooltipConfigs.refreshUser).toBeDefined();
    expect(service.tooltipConfigs.refreshPost).toBeDefined();
  });

  /**
   * Test suite for getTooltipConfig method
   * Verifies configuration retrieval and customization functionality
   */
  describe('getTooltipConfig', () => {
    /**
     * Tests view tooltip configuration retrieval
     */
    it('should return view tooltip config', () => {
      const config = service.getTooltipConfig('view');
      expect(config.text).toBe('Visualizza dettagli');
      expect(config.position).toBe('top');
      expect(config.styleClass).toBe('view-tooltip');
    });

    /**
     * Tests edit tooltip configuration retrieval
     */
    it('should return edit tooltip config', () => {
      const config = service.getTooltipConfig('edit');
      expect(config.text).toBe('Modifica');
      expect(config.position).toBe('top');
      expect(config.styleClass).toBe('edit-tooltip');
    });

    /**
     * Tests delete tooltip configuration retrieval
     */
    it('should return delete tooltip config', () => {
      const config = service.getTooltipConfig('delete');
      expect(config.text).toBe('Elimina');
      expect(config.position).toBe('top');
      expect(config.styleClass).toBe('delete-tooltip');
    });

    /**
     * Tests add tooltip configuration retrieval
     */
    it('should return add tooltip config', () => {
      const config = service.getTooltipConfig('add');
      expect(config.text).toBe('Aggiungi nuovo');
      expect(config.position).toBe('bottom');
      expect(config.styleClass).toBe('add-tooltip');
    });

    /**
     * Tests refresh tooltip configuration retrieval
     */
    it('should return refresh tooltip config', () => {
      const config = service.getTooltipConfig('refresh');
      expect(config.text).toBe('Aggiorna');
      expect(config.position).toBe('top');
      expect(config.styleClass).toBe('refresh-tooltip');
    });

    /**
     * Tests refreshUser tooltip configuration retrieval
     */
    it('should return refreshUser tooltip config', () => {
      const config = service.getTooltipConfig('refreshUser');
      expect(config.text).toBe('Aggiorna');
      expect(config.position).toBe('top');
      expect(config.styleClass).toBe('refresh-user-tooltip');
    });

    /**
     * Tests refreshPost tooltip configuration retrieval
     */
    it('should return refreshPost tooltip config', () => {
      const config = service.getTooltipConfig('refreshPost');
      expect(config.text).toBe('Aggiorna');
      expect(config.position).toBe('top');
      expect(config.styleClass).toBe('refresh-post-tooltip');
    });

    /**
     * Tests custom text override functionality
     */
    it('should use custom text when provided', () => {
      const config = service.getTooltipConfig('view', 'Custom text');
      expect(config.text).toBe('Custom text');
      expect(config.position).toBe('top');
      expect(config.styleClass).toBe('view-tooltip');
    });
  });

  /**
   * Test suite for helper methods
   * Verifies convenience methods for common tooltip configurations
   */
  describe('helper methods', () => {
    /**
     * Tests view tooltip helper method with default text
     */
    it('should return view tooltip via helper method', () => {
      const config = service.getViewTooltip();
      expect(config.text).toBe('Visualizza dettagli');
      expect(config.styleClass).toBe('view-tooltip');
    });

    /**
     * Tests view tooltip helper method with custom text
     */
    it('should return view tooltip with custom text', () => {
      const config = service.getViewTooltip('Custom view text');
      expect(config.text).toBe('Custom view text');
    });

    /**
     * Tests edit tooltip helper method with default text
     */
    it('should return edit tooltip via helper method', () => {
      const config = service.getEditTooltip();
      expect(config.text).toBe('Modifica');
      expect(config.styleClass).toBe('edit-tooltip');
    });

    /**
     * Tests edit tooltip helper method with custom text
     */
    it('should return edit tooltip with custom text', () => {
      const config = service.getEditTooltip('Custom edit text');
      expect(config.text).toBe('Custom edit text');
    });

    /**
     * Tests delete tooltip helper method with default text
     */
    it('should return delete tooltip via helper method', () => {
      const config = service.getDeleteTooltip();
      expect(config.text).toBe('Elimina');
      expect(config.styleClass).toBe('delete-tooltip');
    });

    /**
     * Tests delete tooltip helper method with custom text
     */
    it('should return delete tooltip with custom text', () => {
      const config = service.getDeleteTooltip('Custom delete text');
      expect(config.text).toBe('Custom delete text');
    });

    /**
     * Tests add tooltip helper method with default text
     */
    it('should return add tooltip via helper method', () => {
      const config = service.getAddTooltip();
      expect(config.text).toBe('Aggiungi nuovo');
      expect(config.styleClass).toBe('add-tooltip');
    });

    /**
     * Tests add tooltip helper method with custom text
     */
    it('should return add tooltip with custom text', () => {
      const config = service.getAddTooltip('Custom add text');
      expect(config.text).toBe('Custom add text');
    });

    /**
     * Tests refresh tooltip helper method with default text
     */
    it('should return refresh tooltip via helper method', () => {
      const config = service.getRefreshTooltip();
      expect(config.text).toBe('Aggiorna');
      expect(config.styleClass).toBe('refresh-tooltip');
    });

    /**
     * Tests refresh tooltip helper method with custom text
     */
    it('should return refresh tooltip with custom text', () => {
      const config = service.getRefreshTooltip('Custom refresh text');
      expect(config.text).toBe('Custom refresh text');
    });

    /**
     * Tests refreshUser tooltip helper method with default text
     */
    it('should return refreshUser tooltip via helper method', () => {
      const config = service.getRefreshUserTooltip();
      expect(config.text).toBe('Aggiorna');
      expect(config.styleClass).toBe('refresh-user-tooltip');
    });

    /**
     * Tests refreshUser tooltip helper method with custom text
     */
    it('should return refreshUser tooltip with custom text', () => {
      const config = service.getRefreshUserTooltip('Custom refresh user text');
      expect(config.text).toBe('Custom refresh user text');
    });

    /**
     * Tests refreshPost tooltip helper method with default text
     */
    it('should return refreshPost tooltip via helper method', () => {
      const config = service.getRefreshPostTooltip();
      expect(config.text).toBe('Aggiorna');
      expect(config.styleClass).toBe('refresh-post-tooltip');
    });

    /**
     * Tests refreshPost tooltip helper method with custom text
     */
    it('should return refreshPost tooltip with custom text', () => {
      const config = service.getRefreshPostTooltip('Custom refresh post text');
      expect(config.text).toBe('Custom refresh post text');
    });

    /**
     * Tests editPost tooltip helper method with default text
     */
    it('should return editPost tooltip via helper method', () => {
      const config = service.getEditPostTooltip();
      expect(config.text).toBe('Modifica');
      expect(config.styleClass).toBe('edit-post-tooltip');
    });

    /**
     * Tests editPost tooltip helper method with custom text
     */
    it('should return editPost tooltip with custom text', () => {
      const config = service.getEditPostTooltip('Custom edit post text');
      expect(config.text).toBe('Custom edit post text');
    });
  });

  /**
   * Test suite for tooltip configuration structure validation
   * Ensures all configurations have required properties
   */
  describe('configuration structure validation', () => {
    /**
     * Tests that all tooltip configurations have required properties
     */
    it('should have complete configuration for all tooltip types', () => {
      const tooltipTypes = Object.keys(service.tooltipConfigs) as Array<
        keyof typeof service.tooltipConfigs
      >;

      tooltipTypes.forEach((type) => {
        const config = service.tooltipConfigs[type];
        expect(config.text).toBeDefined();
        expect(config.position).toBeDefined();
        expect(config.styleClass).toBeDefined();
        expect(typeof config.text).toBe('string');
        expect(['top', 'bottom', 'left', 'right']).toContain(config.position);
        expect(typeof config.styleClass).toBe('string');
      });
    });

    /**
     * Tests that configuration objects are immutable (readonly)
     */
    it('should maintain configuration integrity', () => {
      const originalConfig = service.getTooltipConfig('view');
      const modifiedConfig = service.getTooltipConfig('view', 'Modified text');

      expect(originalConfig.text).toBe('Visualizza dettagli');
      expect(modifiedConfig.text).toBe('Modified text');
    });
  });

  /**
   * Test suite for edge cases and error handling
   * Covers boundary conditions and invalid inputs
   */
  describe('edge cases', () => {
    /**
     * Tests behavior with empty custom text
     */
    it('should handle empty custom text', () => {
      const config = service.getTooltipConfig('view', '');
      expect(config.text).toBe('');
      expect(config.position).toBe('top');
      expect(config.styleClass).toBe('view-tooltip');
    });

    /**
     * Tests behavior with whitespace-only custom text
     */
    it('should handle whitespace custom text', () => {
      const config = service.getTooltipConfig('edit', '   ');
      expect(config.text).toBe('   ');
      expect(config.position).toBe('top');
      expect(config.styleClass).toBe('edit-tooltip');
    });

    /**
     * Tests that helper methods preserve original configuration properties
     */
    it('should preserve all properties in helper methods', () => {
      const viewConfig = service.getViewTooltip();
      const directConfig = service.getTooltipConfig('view');

      expect(viewConfig).toEqual(directConfig);
    });
  });
});
