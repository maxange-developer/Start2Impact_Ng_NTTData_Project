import { Injectable } from '@angular/core';

/**
 * Configuration interface for tooltip settings
 */
export interface TooltipConfig {
  /** Text content to display in tooltip */
  text: string;
  /** Position of tooltip relative to target element */
  position: 'top' | 'bottom' | 'left' | 'right';
  /** CSS class for tooltip styling */
  styleClass: string;
}

/**
 * Service for managing tooltip configurations across the application
 * Provides centralized tooltip settings and helper methods for consistent UI
 */
@Injectable({
  providedIn: 'root',
})
export class TooltipService {
  /**
   * Predefined tooltip configurations for different action types
   * Ensures consistent tooltip behavior across the application
   */
  readonly tooltipConfigs = {
    view: {
      text: 'Visualizza dettagli',
      position: 'top' as const,
      styleClass: 'view-tooltip',
    },
    edit: {
      text: 'Modifica',
      position: 'top' as const,
      styleClass: 'edit-tooltip',
    },
    delete: {
      text: 'Elimina',
      position: 'top' as const,
      styleClass: 'delete-tooltip',
    },
    add: {
      text: 'Aggiungi nuovo',
      position: 'bottom' as const,
      styleClass: 'add-tooltip',
    },
    refresh: {
      text: 'Aggiorna',
      position: 'top' as const,
      styleClass: 'refresh-tooltip',
    },
    refreshUser: {
      text: 'Aggiorna',
      position: 'top' as const,
      styleClass: 'refresh-user-tooltip',
    },
    refreshPost: {
      text: 'Aggiorna',
      position: 'top' as const,
      styleClass: 'refresh-post-tooltip',
    },
    editPost: {
      text: 'Modifica',
      position: 'top' as const,
      styleClass: 'edit-post-tooltip',
    },
  };

  /**
   * Gets tooltip configuration for specified type with optional custom text
   * @param type Predefined tooltip type from available configurations
   * @param customText Optional custom text to override default
   * @returns Complete tooltip configuration object
   */
  getTooltipConfig(
    type: keyof typeof this.tooltipConfigs,
    customText?: string
  ): TooltipConfig {
    const config = this.tooltipConfigs[type];
    return {
      ...config,
      text: customText || config.text,
    };
  }

  /**
   * Gets tooltip configuration for view actions
   * @param customText Optional custom text override
   * @returns View tooltip configuration
   */
  getViewTooltip(customText?: string) {
    return this.getTooltipConfig('view', customText);
  }

  /**
   * Gets tooltip configuration for edit actions
   * @param customText Optional custom text override
   * @returns Edit tooltip configuration
   */
  getEditTooltip(customText?: string) {
    return this.getTooltipConfig('edit', customText);
  }

  /**
   * Gets tooltip configuration for delete actions
   * @param customText Optional custom text override
   * @returns Delete tooltip configuration
   */
  getDeleteTooltip(customText?: string) {
    return this.getTooltipConfig('delete', customText);
  }

  /**
   * Gets tooltip configuration for add actions
   * @param customText Optional custom text override
   * @returns Add tooltip configuration
   */
  getAddTooltip(customText?: string) {
    return this.getTooltipConfig('add', customText);
  }

  /**
   * Gets tooltip configuration for general refresh actions
   * @param customText Optional custom text override
   * @returns Refresh tooltip configuration
   */
  getRefreshTooltip(customText?: string) {
    return this.getTooltipConfig('refresh', customText);
  }

  /**
   * Gets tooltip configuration for user-specific refresh actions
   * @param customText Optional custom text override
   * @returns User refresh tooltip configuration
   */
  getRefreshUserTooltip(customText?: string) {
    return this.getTooltipConfig('refreshUser', customText);
  }

  /**
   * Gets tooltip configuration for post-specific refresh actions
   * @param customText Optional custom text override
   * @returns Post refresh tooltip configuration
   */
  getRefreshPostTooltip(customText?: string) {
    return this.getTooltipConfig('refreshPost', customText);
  }

  /**
   * Gets tooltip configuration for post-specific edit actions
   * @param customText Optional custom text override
   * @returns Post edit tooltip configuration
   */
  getEditPostTooltip(customText?: string) {
    return this.getTooltipConfig('editPost', customText);
  }
}
