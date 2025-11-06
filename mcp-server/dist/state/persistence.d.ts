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
export declare class PersistenceManager {
    private enabled;
    /**
     * Check if persistence is currently enabled
     */
    isEnabled(): boolean;
    /**
     * Load state for a specific cache type
     * Currently returns null as persistence is not enabled
     */
    loadState<T>(_cacheType: string): Promise<T | null>;
    /**
     * Save state for a specific cache type
     * Currently a no-op as persistence is not enabled
     */
    saveState(_cacheType: string, _data: unknown): Promise<void>;
}
export declare const persistenceManager: PersistenceManager;
//# sourceMappingURL=persistence.d.ts.map