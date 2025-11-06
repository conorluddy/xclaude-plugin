# xc-mcp Integration Strategy

## Overview

This document outlines the integration strategy for implementing the 28 placeholder dispatcher operations in xc-plugin by copying and adapting utilities from the existing xc-mcp project. The xc-plugin architecture consolidates multiple tools into three dispatchers (Xcode, Simulator, IDB), while xc-mcp has a more granular tool-per-operation structure. We'll adapt xc-mcp's battle-tested utilities to work within the xc-plugin dispatcher pattern.

**Status**: xc-mcp codebase fully accessible at `/Users/conor/Development/xc-mcp`

**Key Integration Goals**:

1. Copy core utilities for command execution, caching, and state management
2. Adapt xc-mcp's progressive disclosure pattern for token efficiency
3. Integrate smart defaults and learning capabilities (simulator preference, build configs)
4. Maintain xc-mcp's accessibility-first approach for IDB operations

---

## Architecture Comparison

### xc-mcp Structure (Granular)

- 28+ individual MCP tools
- Each tool is self-contained
- Direct command execution in tool handlers
- Utilities shared across tools

### xc-plugin Structure (Consolidated)

- 3 dispatcher tools (Xcode, Simulator, IDB)
- Operations dispatched via switch statements
- Each dispatcher has placeholder methods
- Will share xc-mcp utilities

---

## Files to Copy/Adapt

### Phase 1: Core Utilities (Foundation)

#### 1.1 Command Execution

**Source**: `/Users/conor/Development/xc-mcp/src/utils/command.ts`
**Destination**: `/Users/conor/Development/xc-plugin/mcp-server/src/utils/command.ts`
**Purpose**: Async command execution with timeout handling, spawn-based execution (security), xcodebuild/simctl command builders
**Modifications**:

- None required - use as-is
- Already has TypeScript types
- Provides `executeCommand()`, `executeCommandWithArgs()`, `buildXcodebuildCommand()`, `buildSimctlCommand()`

**Key Functions**:

```typescript
executeCommand(command: string, options?: CommandOptions): Promise<CommandResult>
executeCommandWithArgs(command: string, args: string[], options?): Promise<CommandResult>
buildXcodebuildCommand(action: string, projectPath: string, options: {...}): string
buildSimctlCommand(action: string, options: {...}): string
```

---

#### 1.2 JSON Parsing

**Source**: `/Users/conor/Development/xc-mcp/src/utils/json-parser.ts`
**Destination**: `/Users/conor/Development/xc-plugin/mcp-server/src/utils/json-parser.ts`
**Purpose**: Flexible JSON parsing for array and NDJSON formats (IDB returns JSON arrays, other tools use NDJSON)
**Modifications**: None required

**Key Functions**:

```typescript
parseFlexibleJson(text: string): any[]
detectJsonFormat(text: string): 'array' | 'ndjson' | 'single' | 'unknown'
```

---

#### 1.3 Validation

**Source**: `/Users/conor/Development/xc-mcp/src/utils/validation.ts`
**Destination**: `/Users/conor/Development/xc-plugin/mcp-server/src/utils/validation.ts`
**Purpose**: Input validation for project paths, schemes, device IDs, shell escaping
**Modifications**: None required

**Key Functions**:

```typescript
validateXcodeInstallation(): Promise<void>
validateProjectPath(projectPath: string): Promise<void>
validateScheme(scheme: string): void
validateDeviceId(deviceId: string): void
escapeShellArg(arg: string): string
```

---

#### 1.4 Error Formatting

**Source**: `/Users/conor/Development/xc-mcp/src/utils/error-formatter.ts`
**Destination**: `/Users/conor/Development/xc-plugin/mcp-server/src/utils/error-formatter.ts`
**Purpose**: Condense verbose Apple error messages into token-efficient actionable messages
**Modifications**: None required

**Key Functions**:

```typescript
condenseAppleError(errorOutput: string): string
formatToolError(stderr: string, defaultMessage?: string): string
```

---

#### 1.5 Device Detection

**Source**: `/Users/conor/Development/xc-mcp/src/utils/device-detection.ts`
**Destination**: `/Users/conor/Development/xc-plugin/mcp-server/src/utils/device-detection.ts`
**Purpose**: Auto-detect booted simulator, resolve device IDs
**Modifications**: None required

**Key Functions**:

```typescript
getBootedDevice(): Promise<BootedDevice>
resolveDeviceId(udid?: string): Promise<string>
```

---

### Phase 2: State Management & Caching

#### 2.1 Response Cache

**Source**: `/Users/conor/Development/xc-mcp/src/utils/response-cache.ts`
**Destination**: `/Users/conor/Development/xc-plugin/mcp-server/src/utils/response-cache.ts`
**Purpose**: Progressive disclosure - store full command outputs, return cache IDs for on-demand retrieval
**Modifications**: None required - already has persistence integration

**Key Features**:

- Stores full stdout/stderr/exitCode with unique IDs
- 30-minute TTL, 100 entry limit
- Helper functions: `extractBuildSummary()`, `extractTestSummary()`, `extractSimulatorSummary()`, `createProgressiveSimulatorResponse()`
- Integrates with persistence layer

**Usage Pattern**:

```typescript
// Store full output
const cacheId = responseCache.store({
  tool: 'xcodebuild-build',
  fullOutput: result.stdout,
  stderr: result.stderr,
  exitCode: result.code,
  command,
  metadata: { /* ... */ }
});

// Return concise summary + cacheId
return { summary: extractBuildSummary(...), buildId: cacheId }
```

---

#### 2.2 Simulator Cache

**Source**: `/Users/conor/Development/xc-mcp/src/state/simulator-cache.ts`
**Destination**: `/Users/conor/Development/xc-plugin/mcp-server/src/state/simulator-cache.ts`
**Purpose**: 1-hour cached simulator list, learning (recently used, project preferences), intelligent suggestions
**Modifications**: None required

**Key Features**:

- Optimized SimulatorInfo (essential fields only)
- Tracks `lastUsed`, `bootHistory`, `performanceMetrics` per device
- Project-specific simulator preferences
- Smart ranking algorithm (40% recent usage, 30% iOS version, 20% common models, 10% boot performance)

**Key Methods**:

```typescript
getSimulatorList(force?: boolean): Promise<CachedSimulatorList>
getAvailableSimulators(deviceType?: string, runtime?: string): Promise<SimulatorInfo[]>
getPreferredSimulator(projectPath?: string, deviceType?: string): Promise<SimulatorInfo | null>
getSuggestedSimulators(projectPath?: string, deviceType?: string, maxSuggestions?: number)
recordSimulatorUsage(udid: string, projectPath?: string): void
recordBootEvent(udid: string, success: boolean, duration?: number): void
```

---

#### 2.3 Project Cache

**Source**: `/Users/conor/Development/xc-mcp/src/state/project-cache.ts`
**Destination**: `/Users/conor/Development/xc-plugin/mcp-server/src/state/project-cache.ts`
**Purpose**: Cache project metadata, build history, smart build config defaults, dependency tracking
**Modifications**: None required

**Key Features**:

- Caches xcodebuild -list output (schemes/targets)
- Tracks last 20 builds per project with metrics
- Records successful build configs (scheme, configuration, destination)
- Dependency detection (SPM, CocoaPods, Carthage)
- Performance trends analysis

**Key Methods**:

```typescript
getProjectInfo(projectPath: string, force?: boolean): Promise<ProjectInfo>
getPreferredBuildConfig(projectPath: string): Promise<BuildConfig | null>
recordBuildResult(projectPath: string, config: BuildConfig, metrics: {...}): void
getBuildHistory(projectPath: string, limit?: number): BuildMetrics[]
getPerformanceTrends(projectPath: string): { avgBuildTime, successRate, ... }
```

---

#### 2.4 Persistence Manager

**Source**: `/Users/conor/Development/xc-mcp/src/utils/persistence.ts`
**Destination**: `/Users/conor/Development/xc-plugin/mcp-server/src/utils/persistence.ts`
**Purpose**: File-based state persistence across sessions
**Modifications**: None required

**Features**:

- Saves/loads cache state to `~/.xc-mcp/` directory
- Debounced saves (avoid excessive disk I/O)
- Graceful degradation if persistence fails
- Used by simulator-cache, project-cache, response-cache

---

### Phase 3: Specialized Utilities

#### 3.1 Build Artifacts Discovery

**Source**: `/Users/conor/Development/xc-mcp/src/utils/build-artifacts.ts`
**Destination**: `/Users/conor/Development/xc-plugin/mcp-server/src/utils/build-artifacts.ts`
**Purpose**: Find .app bundle paths after building (for auto-install workflows)
**Modifications**: None required

**Key Functions**:

```typescript
findBuildArtifacts(projectPath, scheme, configuration): Promise<BuildArtifacts>
verifyBuildArtifacts(projectPath, scheme, configuration): Promise<{ valid, appPath?, error?, guidance? }>
```

---

#### 3.2 Build Settings Cache

**Source**: `/Users/conor/Development/xc-mcp/src/state/build-settings-cache.ts`
**Destination**: `/Users/conor/Development/xc-plugin/mcp-server/src/state/build-settings-cache.ts`
**Purpose**: Cache xcodebuild -showBuildSettings output (expensive operation)
**Modifications**: None required

**Note**: Required by build-artifacts.ts

---

#### 3.3 IDB Device Detection

**Source**: `/Users/conor/Development/xc-mcp/src/utils/idb-device-detection.ts`
**Destination**: `/Users/conor/Development/xc-plugin/mcp-server/src/utils/idb-device-detection.ts`
**Purpose**: Auto-detect IDB targets (physical devices and simulators)
**Modifications**: None required

---

#### 3.4 Coordinate Transformation (IDB)

**Source**: `/Users/conor/Development/xc-mcp/src/utils/coordinate-transform.ts`
**Destination**: `/Users/conor/Development/xc-plugin/mcp-server/src/utils/coordinate-transform.ts`
**Purpose**: Transform screenshot coordinates to actual tap coordinates (screenshots may be scaled)
**Modifications**: None required

---

#### 3.5 Element Extraction (IDB)

**Source**: `/Users/conor/Development/xc-mcp/src/utils/element-extraction.ts`
**Destination**: `/Users/conor/Development/xc-plugin/mcp-server/src/utils/element-extraction.ts`
**Purpose**: Parse accessibility tree from IDB describe output
**Modifications**: None required

---

#### 3.6 Build Settings Parser

**Source**: `/Users/conor/Development/xc-mcp/src/utils/build-settings-parser.ts`
**Destination**: `/Users/conor/Development/xc-plugin/mcp-server/src/utils/build-settings-parser.ts`
**Purpose**: Parse xcodebuild -showBuildSettings output into structured data
**Modifications**: None required

---

### Phase 4: Type Definitions

#### 4.1 Xcode Types

**Source**: `/Users/conor/Development/xc-mcp/src/types/xcode.ts`
**Destination**: `/Users/conor/Development/xc-plugin/mcp-server/src/types/xcode.ts`
**Purpose**: TypeScript interfaces for Xcode-specific data structures
**Modifications**: Merge with existing xc-plugin types.ts

**Key Types**:

```typescript
interface SimulatorList { devices, runtimes, devicetypes }
interface SimulatorDevice { name, udid, state, isAvailable, ... }
interface XcodeProject { project?, workspace?, schemes, targets }
```

---

## Implementation Approach

### Phase 1: Utilities Setup (Day 1-2)

**Goal**: Establish foundation for all operations

1. **Create utils directory structure**

   ```bash
   mkdir -p /Users/conor/Development/xc-plugin/mcp-server/src/utils
   mkdir -p /Users/conor/Development/xc-plugin/mcp-server/src/state
   ```

2. **Copy core utilities** (copy as-is, no modifications):
   - `command.ts` → foundation for all CLI operations
   - `json-parser.ts` → handles IDB JSON output
   - `validation.ts` → input validation
   - `error-formatter.ts` → condense error messages
   - `device-detection.ts` → auto-detect booted simulators

3. **Test utilities independently**:

   ```typescript
   // Create test file: src/utils/__tests__/command.test.ts
   import { executeCommand, buildXcodebuildCommand } from '../command';

   test('executes xcodebuild -version', async () => {
     const result = await executeCommand('xcodebuild -version');
     expect(result.code).toBe(0);
   });
   ```

---

### Phase 2: State Management (Day 3-4)

**Goal**: Progressive disclosure and intelligent caching

1. **Copy persistence layer first** (dependency for caches):
   - `persistence.ts` → file-based state storage

2. **Copy caching utilities**:
   - `response-cache.ts` → progressive disclosure
   - `simulator-cache.ts` → simulator state + learning
   - `project-cache.ts` → build configs + history
   - `build-settings-cache.ts` → xcodebuild settings

3. **Wire up global instances**:
   ```typescript
   // Create: src/state/index.ts
   export { simulatorCache } from './simulator-cache';
   export { projectCache } from './project-cache';
   export { responseCache } from '../utils/response-cache';
   ```

---

### Phase 3: Dispatcher Implementation (Day 5-10)

#### 3.1 Xcode Dispatcher Operations

**Build Operation** (`XcodeDispatcher.executeBuild`):

```typescript
import { executeCommand, buildXcodebuildCommand } from '../utils/command';
import { validateProjectPath, validateScheme } from '../utils/validation';
import { responseCache, extractBuildSummary } from '../utils/response-cache';
import { projectCache } from '../state/project-cache';
import { simulatorCache } from '../state/simulator-cache';

private async executeBuild(params: Partial<BuildParams>): Promise<OperationResult<XcodeResultData>> {
  // 1. Validate inputs
  await validateProjectPath(params.project_path!);
  validateScheme(params.scheme!);

  // 2. Get smart defaults from cache
  const preferredConfig = await projectCache.getPreferredBuildConfig(params.project_path!);
  const smartDestination = params.destination ||
    await this.getSmartDestination(preferredConfig, params.project_path!);

  // 3. Build final config
  const finalConfig = {
    scheme: params.scheme!,
    configuration: params.configuration || preferredConfig?.configuration || 'Debug',
    destination: smartDestination,
    sdk: params.options?.sdk || preferredConfig?.sdk,
    derivedDataPath: params.options?.derived_data_path || preferredConfig?.derivedDataPath
  };

  // 4. Build command and execute
  const command = buildXcodebuildCommand('build', params.project_path!, finalConfig);
  const startTime = Date.now();
  const result = await executeCommand(command, { timeout: 600000, maxBuffer: 50 * 1024 * 1024 });
  const duration = Date.now() - startTime;

  // 5. Extract summary and cache result
  const summary = extractBuildSummary(result.stdout, result.stderr, result.code);

  projectCache.recordBuildResult(params.project_path!, finalConfig, {
    timestamp: new Date(),
    success: summary.success,
    duration,
    errorCount: summary.errorCount,
    warningCount: summary.warningCount,
    buildSizeBytes: summary.buildSizeBytes
  });

  // 6. Store full output in cache for progressive disclosure
  const cacheId = responseCache.store({
    tool: 'xcodebuild-build',
    fullOutput: result.stdout,
    stderr: result.stderr,
    exitCode: result.code,
    command,
    metadata: { projectPath: params.project_path!, scheme: params.scheme!, duration, success: summary.success }
  });

  // 7. Return concise response
  const data: BuildResultData = {
    buildId: cacheId,
    success: summary.success,
    summary: {
      ...summary,
      scheme: finalConfig.scheme,
      configuration: finalConfig.configuration,
      duration
    },
    intelligence: {
      usedSmartDestination: !params.destination && !!smartDestination,
      configurationLearned: summary.success
    },
    guidance: summary.success
      ? [`Build completed in ${duration}ms`, `Use 'get-details' with buildId '${cacheId}' for full logs`]
      : [`Build failed: ${summary.firstError}`, `Use 'get-details' with buildId '${cacheId}' for full errors`]
  };

  return this.formatSuccess(data);
}
```

**Copy from xc-mcp**:

- `/Users/conor/Development/xc-mcp/src/tools/xcodebuild/build.ts` → reference implementation
- Adapt to dispatcher pattern (remove MCP tool boilerplate)

**Other Xcode Operations**:

- `executeClean` → simpler, use `buildXcodebuildCommand('clean', ...)`
- `executeTest` → similar to build, use `extractTestSummary()`
- `executeList` → use `projectCache.getProjectInfo()` (cached)
- `executeVersion` → simple `executeCommand('xcodebuild -version')`

---

#### 3.2 Simulator Dispatcher Operations

**List Operation** (`SimulatorDispatcher.executeList`):

```typescript
import { simulatorCache, extractSimulatorSummary, createProgressiveSimulatorResponse } from '../state/simulator-cache';
import { responseCache } from '../utils/response-cache';

private async executeList(params?: SimulatorParameters): Promise<OperationResult<SimulatorResultData>> {
  // 1. Get cached simulator list (1-hour TTL)
  const cachedList = await simulatorCache.getSimulatorList();

  // 2. Extract concise summary
  const summary = extractSimulatorSummary(cachedList);

  // 3. Store full list in response cache
  const cacheId = responseCache.store({
    tool: 'simctl-list',
    fullOutput: JSON.stringify(cachedList, null, 2),
    stderr: '',
    exitCode: 0,
    command: 'xcrun simctl list -j',
    metadata: { totalDevices: summary.totalDevices, availableDevices: summary.availableDevices }
  });

  // 4. Return progressive disclosure response
  const responseData = createProgressiveSimulatorResponse(summary, cacheId, {
    deviceType: params?.device_type,
    runtime: params?.runtime
  });

  const data: ListResultData = {
    ...responseData,
    message: `Found ${summary.availableDevices} available simulators`
  };

  return this.formatSuccess(data);
}
```

**Copy from xc-mcp**:

- `/Users/conor/Development/xc-mcp/src/tools/simctl/list.ts` → reference
- `/Users/conor/Development/xc-mcp/src/tools/simctl/boot.ts` → device lifecycle
- `/Users/conor/Development/xc-mcp/src/tools/simctl/device/index.ts` → device router

**Device Lifecycle** (`executeDeviceLifecycle`):

```typescript
private async executeDeviceLifecycle(params: Partial<DeviceLifecycleParams>): Promise<OperationResult<SimulatorResultData>> {
  const { device_id, sub_operation, parameters } = params;

  // Resolve device ID (auto-detect if not provided)
  const udid = await resolveDeviceId(device_id);

  switch (sub_operation) {
    case 'boot':
      const command = buildSimctlCommand('boot', { deviceId: udid });
      const result = await executeCommand(command, { timeout: 120000 });

      if (result.code === 0) {
        simulatorCache.recordBootEvent(udid, true);
      }

      return this.formatSuccess({
        message: result.code === 0 ? 'Simulator booted' : 'Boot failed',
        sub_operation: 'boot',
        device_id: udid,
        error: result.code !== 0 ? formatToolError(result.stderr) : undefined
      });

    case 'shutdown':
      // Similar pattern...

    case 'create':
      // Requires: name, device_type, runtime from parameters
      // ...
  }
}
```

**App Lifecycle** (`executeAppLifecycle`):

```typescript
private async executeAppLifecycle(params: Partial<AppLifecycleParams>): Promise<OperationResult<SimulatorResultData>> {
  const { device_id, app_identifier, sub_operation, parameters } = params;
  const udid = await resolveDeviceId(device_id);

  switch (sub_operation) {
    case 'install':
      const appPath = parameters?.app_path;
      if (!appPath) throw new Error('app_path required for install');

      const command = `xcrun simctl install ${udid} "${appPath}"`;
      const result = await executeCommand(command);

      return this.formatSuccess({
        message: result.code === 0 ? 'App installed' : 'Install failed',
        sub_operation: 'install',
        bundleId: app_identifier,
        error: result.code !== 0 ? formatToolError(result.stderr) : undefined
      });

    case 'launch':
      // xcrun simctl launch ${udid} ${bundleId}
      // ...
  }
}
```

---

#### 3.3 IDB Dispatcher Operations

**Accessibility-First Pattern**:

```typescript
// 1. Check accessibility quality first (fast, ~80ms)
const qualityCheck = await this.executeCheckAccessibility({ target: udid });

// 2. If sufficient, use describe (get accessibility tree, ~50 tokens)
if (qualityCheck.isSufficient) {
  const tree = await this.executeDescribe({ target: udid, parameters: { operation: 'all' } });
  const element = findElementInTree(tree, query);
  return element.coordinates; // Use for tap
}

// 3. Fallback to screenshot only if necessary (slow, ~5x cost)
const screenshot = await captureScreenshot(udid);
// Analyze screenshot...
```

**Describe Operation** (`executeDescribe`):

```typescript
import { executeCommandWithArgs } from '../utils/command';
import { parseFlexibleJson } from '../utils/json-parser';

private async executeDescribe(params: Partial<DescribeParams>): Promise<OperationResult<IDBResultData>> {
  const { target, parameters } = params;
  const udid = await resolveDeviceId(target);

  // IDB ui describe-all returns JSON array of accessibility elements
  const result = await executeCommandWithArgs('idb', [
    'ui', 'describe-all', '--udid', udid, '--json'
  ]);

  if (result.code !== 0) {
    return this.formatError(formatToolError(result.stderr), 'describe');
  }

  const elements = parseFlexibleJson(result.stdout);

  // Return accessibility tree
  const data: IDBOperationResultData = {
    message: `Found ${elements.length} accessible elements`,
    elements: elements.slice(0, 20), // Limit for token efficiency
    note: 'Use find-element to search by label/identifier',
    totalElements: elements.length
  };

  return this.formatSuccess(data);
}
```

**Tap Operation** (`executeTap`):

```typescript
import { executeCommandWithArgs } from '../utils/command';
import { transformCoordinates } from '../utils/coordinate-transform';

private async executeTap(params: Partial<TapParams>): Promise<OperationResult<IDBResultData>> {
  const { target, parameters } = params;
  const udid = await resolveDeviceId(target);

  // Transform coordinates if from scaled screenshot
  const coords = parameters.applyScreenshotScale
    ? transformCoordinates(parameters.x, parameters.y, parameters.screenshotScaleX, parameters.screenshotScaleY)
    : { x: parameters.x, y: parameters.y };

  const result = await executeCommandWithArgs('idb', [
    'ui', 'tap', '--udid', udid, `${coords.x}`, `${coords.y}`
  ]);

  const data: IDBOperationResultData = {
    message: result.code === 0 ? `Tapped at (${coords.x}, ${coords.y})` : 'Tap failed',
    coordinates: coords,
    error: result.code !== 0 ? formatToolError(result.stderr) : undefined
  };

  return result.code === 0 ? this.formatSuccess(data) : this.formatError(data.error!, 'tap');
}
```

**Copy from xc-mcp**:

- `/Users/conor/Development/xc-mcp/src/tools/idb/ui-describe.ts`
- `/Users/conor/Development/xc-mcp/src/tools/idb/ui-tap.ts`
- `/Users/conor/Development/xc-mcp/src/tools/idb/ui-input.ts`
- `/Users/conor/Development/xc-mcp/src/tools/idb/ui-gesture.ts`
- `/Users/conor/Development/xc-mcp/src/tools/idb/ui-find-element.ts`
- `/Users/conor/Development/xc-mcp/src/tools/idb/list-apps.ts`
- `/Users/conor/Development/xc-mcp/src/tools/idb/accessibility-quality-check.ts`

---

## File Mapping Table

| xc-mcp Source                        | xc-plugin Destination                           | Purpose                     | Priority | Complexity |
| ------------------------------------ | ----------------------------------------------- | --------------------------- | -------- | ---------- |
| `src/utils/command.ts`               | `mcp-server/src/utils/command.ts`               | Command execution, builders | P0       | Low        |
| `src/utils/json-parser.ts`           | `mcp-server/src/utils/json-parser.ts`           | Parse IDB/simctl JSON       | P0       | Low        |
| `src/utils/validation.ts`            | `mcp-server/src/utils/validation.ts`            | Input validation            | P0       | Low        |
| `src/utils/error-formatter.ts`       | `mcp-server/src/utils/error-formatter.ts`       | Condense errors             | P0       | Low        |
| `src/utils/device-detection.ts`      | `mcp-server/src/utils/device-detection.ts`      | Auto-detect simulators      | P0       | Low        |
| `src/utils/persistence.ts`           | `mcp-server/src/utils/persistence.ts`           | File-based state storage    | P1       | Medium     |
| `src/utils/response-cache.ts`        | `mcp-server/src/utils/response-cache.ts`        | Progressive disclosure      | P1       | Medium     |
| `src/state/simulator-cache.ts`       | `mcp-server/src/state/simulator-cache.ts`       | Simulator state + learning  | P1       | Medium     |
| `src/state/project-cache.ts`         | `mcp-server/src/state/project-cache.ts`         | Project configs + history   | P1       | Medium     |
| `src/state/build-settings-cache.ts`  | `mcp-server/src/state/build-settings-cache.ts`  | xcodebuild settings cache   | P2       | Medium     |
| `src/utils/build-artifacts.ts`       | `mcp-server/src/utils/build-artifacts.ts`       | Find .app bundles           | P2       | Low        |
| `src/utils/build-settings-parser.ts` | `mcp-server/src/utils/build-settings-parser.ts` | Parse build settings        | P2       | Low        |
| `src/utils/idb-device-detection.ts`  | `mcp-server/src/utils/idb-device-detection.ts`  | IDB target detection        | P2       | Low        |
| `src/utils/coordinate-transform.ts`  | `mcp-server/src/utils/coordinate-transform.ts`  | Screenshot coord scaling    | P2       | Low        |
| `src/utils/element-extraction.ts`    | `mcp-server/src/utils/element-extraction.ts`    | Parse accessibility tree    | P2       | Low        |
| `src/types/xcode.ts`                 | `mcp-server/src/types/xcode.ts`                 | Merge with existing types   | P1       | Low        |

**Total Files**: 16 core files + 28 reference implementations

---

## Progressive Disclosure Pattern

### Problem

Raw xcodebuild output can be 50k+ tokens, simulator lists 10k+ tokens. This causes:

- Token overflow in LLM context windows
- Slow response times
- Wasted tokens on irrelevant data

### Solution (from xc-mcp)

1. **Execute operation** → store full output in response cache
2. **Return concise summary** with cache ID
3. **On-demand retrieval** via separate tool (xcodebuild-get-details, simctl-get-details)

### Example Flow

```typescript
// User: Build the project
// System executes build, stores output

{
  "buildId": "abc-123-def",
  "success": true,
  "summary": {
    "duration": 45000,
    "errorCount": 0,
    "warningCount": 2
  },
  "guidance": [
    "Build completed in 45s",
    "Use 'get-details' with buildId 'abc-123-def' for full logs"
  ]
}

// Later: User wants to see full logs
// User: Show me the full build output for abc-123-def
// System retrieves from cache

responseCache.get('abc-123-def').fullOutput // Full 50k token output
```

---

## Smart Defaults & Learning

### Simulator Preference (from simulator-cache.ts)

**How it learns**:

1. User builds project → destination includes simulator UDID
2. System calls `simulatorCache.recordSimulatorUsage(udid, projectPath)`
3. Cache stores: `preferredByProject.set(projectPath, udid)`
4. Next build: `getPreferredSimulator(projectPath)` returns learned simulator

**Benefits**:

- User doesn't need to specify destination every time
- Works across sessions (persisted to disk)
- Smart ranking considers: recent usage, iOS version, common models, boot performance

### Build Config Learning (from project-cache.ts)

**How it learns**:

1. Build succeeds with specific config (scheme, configuration, destination)
2. System calls `projectCache.recordBuildResult(projectPath, config, metrics)`
3. Cache stores: `projectInfo.lastSuccessfulConfig = config`
4. Next build: `getPreferredBuildConfig(projectPath)` returns learned config

---

## Key Integration Challenges

### Challenge 1: MCP Tool Boilerplate vs Dispatcher Pattern

**xc-mcp structure**:

```typescript
// Each tool exports async function returning MCP tool result
export async function xcodebuildBuildTool(args: any) {
  // ... logic ...
  return {
    content: [{ type: 'text', text: JSON.stringify(data) }],
    isError: !success,
  };
}
```

**xc-plugin structure**:

```typescript
// Dispatcher method returns OperationResult
private async executeBuild(params: BuildParams): Promise<OperationResult<XcodeResultData>> {
  // ... logic ...
  return this.formatSuccess(data);
}
```

**Solution**: Extract core logic from xc-mcp tool functions, wrap in dispatcher methods

---

### Challenge 2: Global Cache Instances

**xc-mcp**: Exports singleton instances

```typescript
// src/state/simulator-cache.ts
export const simulatorCache = new SimulatorCache();
```

**xc-plugin**: Need to import consistently

```typescript
// All dispatchers import same instance
import { simulatorCache } from '../state/simulator-cache';
```

**Solution**: Use same pattern - maintain global singletons, import as needed

---

### Challenge 3: Persistence Directory

**xc-mcp**: Uses `~/.xc-mcp/` for state files
**xc-plugin**: Should use `~/.xc-plugin/` to avoid collision

**Solution**: Modify persistence.ts constructor:

```typescript
// In persistence.ts, change:
- this.cacheDir = join(homedir(), '.xc-mcp');
+ this.cacheDir = join(homedir(), '.xc-plugin');
```

---

### Challenge 4: TypeScript Module Resolution

**xc-mcp**: Uses `.js` extensions in imports (ESM)

```typescript
import { executeCommand } from '../utils/command.js';
```

**xc-plugin**: May use different module resolution

**Solution**: Copy imports exactly as-is (`.js` extensions), configure tsconfig.json:

```json
{
  "compilerOptions": {
    "module": "ES2020",
    "moduleResolution": "node"
  }
}
```

---

## Testing Strategy

### Unit Tests

**Phase 1** - Utilities (isolated):

```typescript
// src/utils/__tests__/command.test.ts
test('buildXcodebuildCommand constructs correct command', () => {
  const cmd = buildXcodebuildCommand('build', '/path/to/Project.xcodeproj', {
    scheme: 'MyApp',
    configuration: 'Debug',
  });
  expect(cmd).toContain('xcodebuild');
  expect(cmd).toContain('-project "/path/to/Project.xcodeproj"');
  expect(cmd).toContain('-scheme "MyApp"');
});
```

**Phase 2** - State Management (caching):

```typescript
// src/state/__tests__/simulator-cache.test.ts
test('records simulator usage and retrieves preferred', async () => {
  simulatorCache.recordSimulatorUsage('UDID-123', '/path/to/project');
  const preferred = await simulatorCache.getPreferredSimulator('/path/to/project');
  expect(preferred?.udid).toBe('UDID-123');
});
```

**Phase 3** - Integration (dispatcher methods):

```typescript
// src/dispatchers/__tests__/xcode.test.ts
test('executeBuild returns build result with cache ID', async () => {
  const dispatcher = new XcodeDispatcher();
  const result = await dispatcher.execute({
    operation: 'version',
  });
  expect(result.success).toBe(true);
  expect(result.data).toHaveProperty('message');
});
```

---

## Rollout Plan

### Week 1: Foundation

**Days 1-2**: Copy P0 utilities

- command.ts, json-parser.ts, validation.ts, error-formatter.ts, device-detection.ts
- Test utilities in isolation
- Update xc-plugin types.ts with Xcode types

**Days 3-4**: Copy P1 state management

- persistence.ts, response-cache.ts, simulator-cache.ts, project-cache.ts
- Test caching behavior
- Verify persistence to `~/.xc-plugin/`

**Day 5**: Implement first dispatcher operation

- XcodeDispatcher.executeVersion (simplest)
- Test end-to-end flow
- Validate MCP tool invocation

### Week 2: Core Operations

**Days 6-7**: Xcode operations

- executeBuild (with progressive disclosure)
- executeClean
- executeList (using project cache)

**Days 8-9**: Simulator operations

- executeList (with progressive disclosure)
- executeDeviceLifecycle (boot/shutdown)
- executeAppLifecycle (install/launch)

**Day 10**: Review & test

- Integration tests for implemented operations
- Fix issues, refine error handling

### Week 3: Advanced Operations

**Days 11-13**: IDB operations (accessibility-first)

- executeDescribe, executeFindElement
- executeTap, executeInput
- executeGesture, executeListApps

**Days 14-15**: Remaining operations

- executeTest (Xcode)
- IO operations (Simulator: screenshot, video)
- Push, OpenURL, GetAppContainer (Simulator)

---

## Success Metrics

### Functional Completeness

- [ ] All 28 placeholder operations implemented
- [ ] All operations return proper OperationResult format
- [ ] Error handling consistent across dispatchers

### Quality

- [ ] Unit test coverage > 70%
- [ ] Integration tests for each dispatcher
- [ ] No TypeScript compilation errors

### Performance

- [ ] Progressive disclosure prevents token overflow (summaries < 500 tokens)
- [ ] Caching reduces repeated queries (1-hour TTL working)
- [ ] Smart defaults work (preferred simulator, build configs learned)

### User Experience

- [ ] Clear error messages (condensed, actionable)
- [ ] Guidance provided in responses (next steps, cache ID usage)
- [ ] Accessibility-first approach for IDB (describe before screenshot)

---

## Next Steps

### Immediate Actions

1. **Create directory structure**:

   ```bash
   cd /Users/conor/Development/xc-plugin/mcp-server
   mkdir -p src/utils src/state
   ```

2. **Copy P0 utilities** (start with command.ts):

   ```bash
   cp /Users/conor/Development/xc-mcp/src/utils/command.ts src/utils/
   cp /Users/conor/Development/xc-mcp/src/utils/json-parser.ts src/utils/
   cp /Users/conor/Development/xc-mcp/src/utils/validation.ts src/utils/
   cp /Users/conor/Development/xc-mcp/src/utils/error-formatter.ts src/utils/
   cp /Users/conor/Development/xc-mcp/src/utils/device-detection.ts src/utils/
   ```

3. **Test first utility**:

   ```typescript
   // Create src/utils/__tests__/command.test.ts
   import { executeCommand } from '../command';

   test('executeCommand runs xcodebuild -version', async () => {
     const result = await executeCommand('xcodebuild -version');
     expect(result.code).toBe(0);
     expect(result.stdout).toContain('Xcode');
   });
   ```

4. **Implement first operation** (XcodeDispatcher.executeVersion):

   ```typescript
   private async executeVersion(): Promise<OperationResult<XcodeResultData>> {
     const result = await executeCommand('xcodebuild -version');

     if (result.code !== 0) {
       return this.formatError(formatToolError(result.stderr), 'version');
     }

     const data: VersionResultData = {
       message: result.stdout,
       version: result.stdout.split('\n')[0]
     };

     return this.formatSuccess(data);
   }
   ```

5. **Test end-to-end**:
   - Start MCP server
   - Invoke `execute_xcode_command` with `{ operation: 'version' }`
   - Verify response format

### Follow-up Tasks

- [ ] Copy remaining P0 utilities (Day 1)
- [ ] Copy P1 state management (Day 3)
- [ ] Implement XcodeDispatcher operations (Week 2)
- [ ] Implement SimulatorDispatcher operations (Week 2)
- [ ] Implement IDBDispatcher operations (Week 3)
- [ ] Write comprehensive tests (ongoing)
- [ ] Document new operations (as implemented)

---

## Estimated Complexity

### Overall Assessment: **Medium**

**Low Complexity (40%)**:

- Copying utilities as-is (no modifications needed)
- Simple operations (version, list with cache)
- Type definitions

**Medium Complexity (50%)**:

- Adapting xc-mcp tool functions to dispatcher methods
- Wiring up caching/state management
- Progressive disclosure implementation
- Error handling consistency

**High Complexity (10%)**:

- IDB accessibility-first logic (coordinate transforms, element extraction)
- Build artifacts discovery + auto-install workflows
- Performance optimization (if caching insufficient)

---

## Dependencies

### External

- `@modelcontextprotocol/sdk` (already in xc-plugin)
- Node.js `child_process` (executeCommand)
- Node.js `fs/promises` (persistence)
- `crypto` (UUID generation for cache IDs)

### Internal (from xc-mcp, to copy)

- Utils: command, json-parser, validation, error-formatter, device-detection
- State: simulator-cache, project-cache, response-cache, persistence
- Specialized: build-artifacts, build-settings-cache, coordinate-transform, element-extraction

### System

- Xcode CLI tools (`xcodebuild`, `xcrun simctl`)
- IDB (iOS Development Bridge) - optional for UI automation

---

## Appendix: Key Patterns from xc-mcp

### Pattern 1: Command Execution with Error Handling

```typescript
try {
  const result = await executeCommand(command, { timeout: 300000 });

  if (result.code !== 0) {
    return this.formatError(formatToolError(result.stderr), operation);
  }

  return this.formatSuccess(parseOutput(result.stdout));
} catch (error) {
  if (error instanceof McpError) throw error;
  throw new McpError(ErrorCode.InternalError, `Operation failed: ${error.message}`);
}
```

### Pattern 2: Progressive Disclosure

```typescript
// 1. Execute expensive operation
const result = await executeCommand(longRunningCommand);

// 2. Extract summary
const summary = extractSummary(result.stdout, result.stderr, result.code);

// 3. Cache full output
const cacheId = responseCache.store({
  tool: 'operation-name',
  fullOutput: result.stdout,
  stderr: result.stderr,
  exitCode: result.code,
  command: longRunningCommand,
  metadata: {
    /* ... */
  },
});

// 4. Return concise response with cache ID
return {
  cacheId,
  summary,
  guidance: [`Use 'get-details' with cacheId '${cacheId}' for full output`],
};
```

### Pattern 3: Smart Defaults with Learning

```typescript
// 1. Check cache for preferred config
const preferredConfig = await projectCache.getPreferredBuildConfig(projectPath);

// 2. Use preferred or compute smart default
const finalConfig = {
  scheme: params.scheme || preferredConfig?.scheme || defaultScheme,
  destination: params.destination || preferredConfig?.destination || (await getSmartDestination()),
};

// 3. Execute with final config
const result = await executeBuild(finalConfig);

// 4. Record success for future builds
if (result.success) {
  projectCache.recordBuildResult(projectPath, finalConfig, metrics);
}
```

### Pattern 4: Device Auto-Detection

```typescript
// Allow UDID to be optional, auto-detect booted simulator
const udid = await resolveDeviceId(params.device_id);

// resolveDeviceId:
// - If UDID provided → use it
// - If not provided → find booted simulator
// - If no booted simulator → throw helpful error
```

### Pattern 5: Accessibility-First (IDB)

```typescript
// 1. Quick check: is accessibility data sufficient?
const qualityCheck = await checkAccessibilityQuality(udid);

if (qualityCheck.isSufficient) {
  // 2. Fast path: use accessibility tree (50 tokens, 80ms)
  const elements = await idbDescribe(udid);
  const element = findElement(elements, query);
  return element.coordinates;
} else {
  // 3. Slow path: fallback to screenshot (500+ tokens, 400ms)
  const screenshot = await captureScreenshot(udid);
  const coords = analyzeScreenshot(screenshot, query);
  return coords;
}
```

---

## Summary

**xc-mcp Accessible**: Yes, full source at `/Users/conor/Development/xc-mcp`
**Files Identified**: 16 core utilities + 28 reference implementations
**Key Challenges**:

1. Adapting MCP tool functions to dispatcher methods (medium)
2. Persistence directory collision (easy fix: ~/.xc-plugin)
3. IDB coordinate transforms and accessibility-first logic (medium)

**Estimated Effort**: 2-3 weeks for full implementation
**Complexity**: Medium overall (40% low, 50% medium, 10% high)

**Critical Path**:

1. Copy core utilities (command, validation, caching) - Day 1-4
2. Implement Xcode operations (build, test, list) - Week 2
3. Implement Simulator operations (device/app lifecycle, list) - Week 2
4. Implement IDB operations (describe, tap, input) - Week 3

**Success Criteria**:

- All 28 placeholders replaced with working implementations
- Progressive disclosure prevents token overflow
- Smart defaults work (simulator preference, build configs)
- Accessibility-first approach for IDB
- Test coverage > 70%
