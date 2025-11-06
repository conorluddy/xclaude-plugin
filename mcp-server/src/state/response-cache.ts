import { randomUUID } from 'crypto';
import { persistenceManager } from './persistence.js';

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

export class ResponseCache {
  private cache = new Map<string, CachedResponse>();
  private readonly maxAge = 1000 * 60 * 30; // 30 minutes
  private readonly maxEntries = 100;

  constructor() {
    // Load persisted state asynchronously without blocking initialization
    this.loadPersistedState().catch((error) => {
      console.warn('Failed to load response cache state:', error);
    });
  }

  store(data: Omit<CachedResponse, 'id' | 'timestamp'>): string {
    const id = randomUUID();
    const cached: CachedResponse = {
      ...data,
      id,
      timestamp: new Date(),
    };

    this.cache.set(id, cached);
    this.cleanup();

    // Persist state changes
    this.persistStateDebounced();

    return id;
  }

  get(id: string): CachedResponse | undefined {
    const cached = this.cache.get(id);
    if (!cached) return undefined;

    // Check if expired
    if (Date.now() - cached.timestamp.getTime() > this.maxAge) {
      this.cache.delete(id);
      return undefined;
    }

    return cached;
  }

  getRecentByTool(tool: string, limit = 5): CachedResponse[] {
    return Array.from(this.cache.values())
      .filter((c) => c.tool === tool)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  delete(id: string): boolean {
    return this.cache.delete(id);
  }

  clear(): void {
    this.cache.clear();

    // Persist state changes
    this.persistStateDebounced();
  }

  private cleanup(): void {
    // Remove expired entries
    const now = Date.now();
    for (const [id, cached] of this.cache) {
      if (now - cached.timestamp.getTime() > this.maxAge) {
        this.cache.delete(id);
      }
    }

    // Remove oldest entries if over limit
    if (this.cache.size > this.maxEntries) {
      const entries = Array.from(this.cache.entries()).sort(
        ([, a], [, b]) => a.timestamp.getTime() - b.timestamp.getTime()
      );

      const toRemove = entries.slice(0, this.cache.size - this.maxEntries);
      for (const [id] of toRemove) {
        this.cache.delete(id);
      }
    }
  }

  getStats(): { totalEntries: number; byTool: Record<string, number> } {
    const byTool: Record<string, number> = {};
    for (const cached of this.cache.values()) {
      byTool[cached.tool] = (byTool[cached.tool] || 0) + 1;
    }

    return {
      totalEntries: this.cache.size,
      byTool,
    };
  }

  /**
   * Load persisted state from disk
   */
  private async loadPersistedState(): Promise<void> {
    if (!persistenceManager.isEnabled()) return;

    try {
      const data = await persistenceManager.loadState<{
        cache: Array<[string, CachedResponse]>;
      }>('responses');

      if (data) {
        // Restore cache from persisted data
        this.cache = new Map(data.cache || []);

        // Clean up expired entries after loading
        this.cleanup();
      }
    } catch (error) {
      console.warn('Failed to load response cache state:', error);
      // Continue with empty state - graceful degradation
    }
  }

  /**
   * Persist state to disk with debouncing
   */
  private saveStateTimeout: NodeJS.Timeout | null = null;
  private persistStateDebounced(): void {
    if (!persistenceManager.isEnabled()) return;

    // Clear existing timeout
    if (this.saveStateTimeout) {
      clearTimeout(this.saveStateTimeout);
    }

    // Debounce saves to avoid excessive disk I/O
    this.saveStateTimeout = setTimeout(async () => {
      try {
        await persistenceManager.saveState('responses', {
          cache: Array.from(this.cache.entries()),
        });
        this.saveStateTimeout = null;
      } catch (error) {
        console.warn('Failed to persist response cache state:', error);
      }
    }, 1000);
  }
}

// Global cache instance
export const responseCache = new ResponseCache();

// Helper functions for common response patterns
export function extractBuildSummary(output: string, stderr: string, exitCode: number) {
  const lines = (output + '\n' + stderr).split('\n');

  // Extract key metrics
  const errors = lines.filter(
    (line) => line.includes('error:') || line.includes('** BUILD FAILED **')
  );

  const warnings = lines.filter((line) => line.includes('warning:'));

  // Look for build success indicator
  const successIndicators = lines.filter(
    (line) => line.includes('** BUILD SUCCEEDED **') || line.includes('Build completed')
  );

  // Extract timing info if available
  const timingMatch = output.match(/Total time: (\d+\.\d+) seconds/);
  const duration = timingMatch ? parseFloat(timingMatch[1]) : undefined;

  // Extract target/scheme info
  const targetMatch = output.match(/Building target (.+?) with configuration/);
  const target = targetMatch ? targetMatch[1] : undefined;

  return {
    success: exitCode === 0 && successIndicators.length > 0,
    exitCode,
    errorCount: errors.length,
    warningCount: warnings.length,
    duration,
    target,
    hasErrors: errors.length > 0,
    hasWarnings: warnings.length > 0,
    firstError: errors[0]?.trim(),
    buildSizeBytes: output.length + stderr.length,
  };
}

export function extractTestSummary(output: string, stderr: string, exitCode: number) {
  const lines = (output + '\n' + stderr).split('\n');

  // Extract test results
  const testResults = lines.filter(
    (line) =>
      line.includes('Test Suite') ||
      line.includes('executed') ||
      line.includes('passed') ||
      line.includes('failed')
  );

  // Look for test completion
  const completionMatch = output.match(/Test Suite .+ (passed|failed)/);
  const passed = completionMatch?.[1] === 'passed';

  // Extract test counts
  const testsRun = (output.match(/(\d+) tests?/g) || [])
    .map((match) => parseInt(match.match(/(\d+)/)?.[1] || '0'))
    .reduce((sum, count) => sum + count, 0);

  return {
    success: exitCode === 0 && passed,
    exitCode,
    testsRun,
    passed: passed ?? false,
    resultSummary: testResults.slice(-3), // Last few result lines
  };
}

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

export function extractSimulatorSummary(cachedList: CachedSimulatorList) {
  const allDevices = Object.values(cachedList.devices).flat();
  const availableDevices = allDevices.filter((d) => d.isAvailable);
  const bootedDevices = availableDevices.filter((d) => d.state === 'Booted');

  // Extract device type distribution
  const deviceTypeCounts = new Map<string, number>();
  availableDevices.forEach((device) => {
    const type = extractDeviceType(device.name);
    deviceTypeCounts.set(type, (deviceTypeCounts.get(type) || 0) + 1);
  });

  // Get common runtimes (those with devices)
  const activeRuntimes = Object.keys(cachedList.devices)
    .filter((runtime) => cachedList.devices[runtime].length > 0)
    .map((runtime) => formatRuntimeName(runtime))
    .slice(0, 5); // Top 5 most common

  return {
    totalDevices: allDevices.length,
    availableDevices: availableDevices.length,
    bootedDevices: bootedDevices.length,
    deviceTypes: Array.from(deviceTypeCounts.keys()).slice(0, 5),
    commonRuntimes: activeRuntimes,
    lastUpdated: cachedList.lastUpdated,
    cacheAge: formatTimeAgo(cachedList.lastUpdated),
    bootedList: bootedDevices.map((d) => ({
      name: d.name,
      udid: d.udid,
      state: d.state,
      runtime: extractRuntimeFromDevice(d, cachedList),
    })),
    recentlyUsed: availableDevices
      .filter((d) => d.lastUsed)
      .sort((a, b) => {
        // We already filtered for devices with lastUsed
        const aTime = a.lastUsed?.getTime() ?? 0;
        const bTime = b.lastUsed?.getTime() ?? 0;
        return bTime - aTime;
      })
      .slice(0, 3)
      .map((d) => ({
        name: d.name,
        udid: d.udid,
        lastUsed: formatTimeAgo(d.lastUsed || new Date()),
      })),
  };
}

function extractDeviceType(deviceName: string): string {
  if (deviceName.includes('iPhone')) return 'iPhone';
  if (deviceName.includes('iPad')) return 'iPad';
  if (deviceName.includes('Apple Watch')) return 'Apple Watch';
  if (deviceName.includes('Apple TV')) return 'Apple TV';
  if (deviceName.includes('Vision')) return 'Apple Vision Pro';
  return 'Other';
}

function formatRuntimeName(runtime: string): string {
  // Convert "com.apple.CoreSimulator.SimRuntime.iOS-18-0" to "iOS 18.0"
  const match = runtime.match(/iOS-(\d+)-(\d+)/);
  if (match) {
    return `iOS ${match[1]}.${match[2]}`;
  }

  // Handle other formats or return as-is
  if (runtime.includes('iOS')) {
    return runtime.replace('com.apple.CoreSimulator.SimRuntime.', '').replace(/-/g, ' ');
  }

  return runtime;
}

function extractRuntimeFromDevice(
  device: { udid: string },
  cachedList: CachedSimulatorList
): string {
  // Find which runtime this device belongs to
  for (const [runtimeKey, devices] of Object.entries(cachedList.devices)) {
    if (devices.some((d) => d.udid === device.udid)) {
      return formatRuntimeName(runtimeKey);
    }
  }
  return 'Unknown';
}

function formatTimeAgo(date: Date | string): string {
  const now = new Date();
  const target = new Date(date);
  const diffMs = now.getTime() - target.getTime();

  const minutes = Math.floor(diffMs / (1000 * 60));
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  return 'Just now';
}

interface SimulatorSummary {
  totalDevices: number;
  availableDevices: number;
  bootedDevices: number;
  deviceTypes: string[];
  commonRuntimes: string[];
  lastUpdated: Date;
  cacheAge: string;
  bootedList: Array<{ name: string; udid: string; state: string; runtime: string }>;
  recentlyUsed: Array<{ name: string; udid: string; lastUsed: string }>;
}

interface SimulatorFilters {
  deviceType?: string;
  runtime?: string;
  availability?: string;
}

export function createProgressiveSimulatorResponse(
  summary: SimulatorSummary,
  cacheId: string,
  filters: SimulatorFilters
) {
  return {
    cacheId,
    summary: {
      totalDevices: summary.totalDevices,
      availableDevices: summary.availableDevices,
      bootedDevices: summary.bootedDevices,
      deviceTypes: summary.deviceTypes,
      commonRuntimes: summary.commonRuntimes,
      lastUpdated: summary.lastUpdated.toISOString(),
      cacheAge: summary.cacheAge,
    },
    quickAccess: {
      bootedDevices: summary.bootedList,
      recentlyUsed: summary.recentlyUsed,
      recommendedForBuild:
        summary.bootedList.length > 0 ? [summary.bootedList[0]] : summary.recentlyUsed.slice(0, 1),
    },
    nextSteps: [
      `✅ Found ${summary.availableDevices} available simulators`,
      `Use 'simctl-get-details' with cacheId for full device list`,
      `Use filters: deviceType=${filters.deviceType || 'iPhone'}, runtime=${filters.runtime || 'iOS 18.5'}`,
    ],
    availableDetails: ['full-list', 'devices-only', 'runtimes-only', 'available-only'],
    smartFilters: {
      commonDeviceTypes: ['iPhone', 'iPad'],
      commonRuntimes: summary.commonRuntimes.slice(0, 2),
      suggestedFilters: `deviceType=iPhone runtime='${summary.commonRuntimes[0] || 'iOS 18.5'}'`,
    },
  };
}
