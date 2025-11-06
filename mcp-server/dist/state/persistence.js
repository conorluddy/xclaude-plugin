/**
 * Simplified persistence manager for response cache
 * Provides minimal persistence functionality without file I/O
 */
/**
 * Minimal PersistenceManager - currently disabled by default
 * Can be extended in the future to support actual file persistence
 */
export class PersistenceManager {
    enabled = false;
    /**
     * Check if persistence is currently enabled
     */
    isEnabled() {
        return this.enabled;
    }
    /**
     * Load state for a specific cache type
     * Currently returns null as persistence is not enabled
     */
    async loadState(_cacheType) {
        return null;
    }
    /**
     * Save state for a specific cache type
     * Currently a no-op as persistence is not enabled
     */
    async saveState(_cacheType, _data) {
        // No-op when disabled
    }
}
// Global persistence manager instance
export const persistenceManager = new PersistenceManager();
//# sourceMappingURL=persistence.js.map