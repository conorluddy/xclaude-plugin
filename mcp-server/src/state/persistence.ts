/**
 * Simplified persistence manager for response cache
 * Provides minimal persistence functionality without file I/O
 */

export interface PersistenceConfig {
  enabled: boolean;
  cacheDir: string;
  schemaVersion: string;
}

/**
 * Minimal PersistenceManager - currently disabled by default
 * Can be extended in the future to support actual file persistence
 */
export class PersistenceManager {
  private enabled = false;

  /**
   * Check if persistence is currently enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Load state for a specific cache type
   * Currently returns null as persistence is not enabled
   */
  async loadState<T>(_cacheType: string): Promise<T | null> {
    return null;
  }

  /**
   * Save state for a specific cache type
   * Currently a no-op as persistence is not enabled
   */
  async saveState(_cacheType: string, _data: unknown): Promise<void> {
    // No-op when disabled
  }
}

// Global persistence manager instance
export const persistenceManager = new PersistenceManager();
