export interface CachedResponse {
    id: string;
    tool: string;
    timestamp: Date;
    fullOutput: string;
    stderr: string;
    exitCode: number;
    command: string;
    metadata: Record<string, string | number | boolean | null | undefined>;
}
export declare class ResponseCache {
    private cache;
    private readonly maxAge;
    private readonly maxEntries;
    constructor();
    store(data: Omit<CachedResponse, 'id' | 'timestamp'>): string;
    get(id: string): CachedResponse | undefined;
    getRecentByTool(tool: string, limit?: number): CachedResponse[];
    delete(id: string): boolean;
    clear(): void;
    private cleanup;
    getStats(): {
        totalEntries: number;
        byTool: Record<string, number>;
    };
    /**
     * Load persisted state from disk
     */
    private loadPersistedState;
    /**
     * Persist state to disk with debouncing
     */
    private saveStateTimeout;
    private persistStateDebounced;
}
export declare const responseCache: ResponseCache;
export declare function extractBuildSummary(output: string, stderr: string, exitCode: number): {
    success: boolean;
    exitCode: number;
    errorCount: number;
    warningCount: number;
    duration: number | undefined;
    target: string | undefined;
    hasErrors: boolean;
    hasWarnings: boolean;
    firstError: string;
    buildSizeBytes: number;
};
export declare function extractTestSummary(output: string, stderr: string, exitCode: number): {
    success: boolean;
    exitCode: number;
    testsRun: number;
    passed: boolean;
    resultSummary: string[];
};
interface SimulatorDeviceForSummary {
    isAvailable: boolean;
    state: string;
    name: string;
    udid: string;
    lastUsed?: Date;
}
interface CachedSimulatorList {
    devices: Record<string, SimulatorDeviceForSummary[]>;
    lastUpdated: Date;
}
export declare function extractSimulatorSummary(cachedList: CachedSimulatorList): {
    totalDevices: number;
    availableDevices: number;
    bootedDevices: number;
    deviceTypes: string[];
    commonRuntimes: string[];
    lastUpdated: Date;
    cacheAge: string;
    bootedList: {
        name: string;
        udid: string;
        state: string;
        runtime: string;
    }[];
    recentlyUsed: {
        name: string;
        udid: string;
        lastUsed: string;
    }[];
};
interface SimulatorSummary {
    totalDevices: number;
    availableDevices: number;
    bootedDevices: number;
    deviceTypes: string[];
    commonRuntimes: string[];
    lastUpdated: Date;
    cacheAge: string;
    bootedList: Array<{
        name: string;
        udid: string;
        state: string;
        runtime: string;
    }>;
    recentlyUsed: Array<{
        name: string;
        udid: string;
        lastUsed: string;
    }>;
}
interface SimulatorFilters {
    deviceType?: string;
    runtime?: string;
    availability?: string;
}
export declare function createProgressiveSimulatorResponse(summary: SimulatorSummary, cacheId: string, filters: SimulatorFilters): {
    cacheId: string;
    summary: {
        totalDevices: number;
        availableDevices: number;
        bootedDevices: number;
        deviceTypes: string[];
        commonRuntimes: string[];
        lastUpdated: string;
        cacheAge: string;
    };
    quickAccess: {
        bootedDevices: {
            name: string;
            udid: string;
            state: string;
            runtime: string;
        }[];
        recentlyUsed: {
            name: string;
            udid: string;
            lastUsed: string;
        }[];
        recommendedForBuild: {
            name: string;
            udid: string;
            state: string;
            runtime: string;
        }[] | {
            name: string;
            udid: string;
            lastUsed: string;
        }[];
    };
    nextSteps: string[];
    availableDetails: string[];
    smartFilters: {
        commonDeviceTypes: string[];
        commonRuntimes: string[];
        suggestedFilters: string;
    };
};
export {};
//# sourceMappingURL=response-cache.d.ts.map