/**
 * Performance debugging utilities for tracking navigation delays
 */

interface PerformanceMark {
  name: string;
  timestamp: number;
  metadata?: Record<string, any>;
}

const perfNow = (() => {
  const p: any = (globalThis as any)?.performance;
  if (p && typeof p.now === 'function') return () => p.now();
  return () => Date.now();
})();

class PerformanceDebugger {
  private marks: Map<string, PerformanceMark> = new Map();
  private enabled = __DEV__; // Only in development

  /**
   * Start a performance measurement
   */
  mark(name: string, metadata?: Record<string, any>) {
    if (!this.enabled) return;

    const timestamp = perfNow();
    this.marks.set(name, { name, timestamp, metadata });

    console.log(`[PERF] ${this.formatTimestamp()} START: ${name}`, metadata || '');
  }

  /**
   * End a performance measurement and log the duration
   */
  measure(startMark: string, endMark?: string, metadata?: Record<string, any>) {
    if (!this.enabled) return;

    const start = this.marks.get(startMark);
    if (!start) {
      console.warn(`[PERF] No start mark found for: ${startMark}`);
      return;
    }

    const endTimestamp = perfNow();
    const duration = endTimestamp - start.timestamp;

    const finalEndMark = endMark || `${startMark}:end`;

    console.log(
      `[PERF] ${this.formatTimestamp()} END: ${finalEndMark} (${duration.toFixed(2)}ms)`,
      {
        duration: `${duration.toFixed(2)}ms`,
        ...start.metadata,
        ...metadata,
      }
    );

    // Clean up the mark
    this.marks.delete(startMark);

    return duration;
  }

  /**
   * Log a single event with timestamp
   */
  log(event: string, metadata?: Record<string, any>) {
    if (!this.enabled) return;

    console.log(`[PERF] ${this.formatTimestamp()} ${event}`, metadata || '');
  }

  /**
   * Clear all marks
   */
  clear() {
    this.marks.clear();
  }

  /**
   * Format current timestamp
   */
  private formatTimestamp(): string {
    const now = new Date();
    return `${now.getHours().toString().padStart(2, '0')}:${now
      .getMinutes()
      .toString()
      .padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${now
      .getMilliseconds()
      .toString()
      .padStart(3, '0')}`;
  }

  /**
   * Get all active marks (for debugging)
   */
  getActiveMarks() {
    return Array.from(this.marks.entries()).map(([name, mark]) => ({
      name,
      age: perfNow() - mark.timestamp,
      metadata: mark.metadata,
    }));
  }
}

// Singleton instance
export const perfDebug = new PerformanceDebugger();

// Convenience functions
export const perfMark = (name: string, metadata?: Record<string, any>) =>
  perfDebug.mark(name, metadata);
export const perfMeasure = (startMark: string, endMark?: string, metadata?: Record<string, any>) =>
  perfDebug.measure(startMark, endMark, metadata);
export const perfLog = (event: string, metadata?: Record<string, any>) =>
  perfDebug.log(event, metadata);

// React component lifecycle helpers
export const usePerfTracking = (componentName: string, props?: Record<string, any>) => {
  // Track mount
  React.useEffect(() => {
    perfMark(`${componentName}:mount`, props);

    return () => {
      perfMeasure(`${componentName}:mount`, `${componentName}:unmount`);
    };
  }, [componentName]);

  // Track renders
  React.useEffect(() => {
    perfLog(`${componentName}:render`, props);
  });
};

// Navigation performance helpers
export const trackNavigation = {
  start: (from: string, to: string) => {
    perfMark('navigation:start', { from, to });
    perfMark('navigation:validation');
    perfMark('navigation:routing');
  },

  validationComplete: (isValid: boolean, details?: any) => {
    perfMeasure('navigation:validation', undefined, { isValid, ...details });
  },

  routingComplete: () => {
    perfMeasure('navigation:routing');
  },

  complete: () => {
    perfMeasure('navigation:start', 'navigation:complete');
  },
};

// Screen performance helpers
export const trackScreen = {
  mountStart: (screenName: string) => {
    perfMark(`screen:${screenName}:mount`);
  },

  mountComplete: (screenName: string, metadata?: any) => {
    perfMeasure(`screen:${screenName}:mount`, undefined, metadata);
  },

  renderStart: (screenName: string) => {
    perfMark(`screen:${screenName}:render`);
  },

  renderComplete: (screenName: string) => {
    perfMeasure(`screen:${screenName}:render`);
  },
};

// Data fetching helpers
export const trackQuery = {
  start: (queryName: string, args?: any) => {
    perfMark(`query:${queryName}`, { args });
  },

  complete: (queryName: string, resultSize?: number) => {
    perfMeasure(`query:${queryName}`, undefined, { resultSize });
  },
};

import React from 'react';
