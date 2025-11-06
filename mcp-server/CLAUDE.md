# xclaude-plugin MCP Server - AI Assistant Context

This document provides essential context for Claude Code when working on the xclaude-plugin MCP server codebase.

## Project Overview

**xclaude-plugin MCP Server** is a consolidated Model Context Protocol server for iOS development automation. It provides 22 operations across 3 dispatchers (Xcode, Simulator, IDB) with ~2.2k tokens at rest through progressive disclosure architecture.

**Status**: ✅ Feature-complete (v0.0.1) - All operations fully implemented, zero placeholders remaining.

## Core Architecture

### 3-Dispatcher Pattern

Instead of granular tool-per-operation, the server uses semantic domain dispatchers:

```typescript
// XcodeDispatcher: All build-related operations
execute_xcode_command({
  operation: 'build' | 'clean' | 'test' | 'list' | 'version',
  project_path?: string,
  scheme: string,
  configuration?: 'Debug' | 'Release',
  // ... other parameters
})

// SimulatorDispatcher: All simulator control operations
execute_simulator_command({
  operation: 'device-lifecycle' | 'app-lifecycle' | 'io' | 'push' | 'openurl' | 'list' | 'health-check' | 'get-app-container',
  sub_operation?: string,
  device_id?: string,
  // ... other parameters
})

// IDBDispatcher: All UI automation operations
execute_idb_command({
  operation: 'tap' | 'input' | 'gesture' | 'describe' | 'find-element' | 'app' | 'list-apps' | 'check-accessibility' | 'targets',
  target?: string,
  // ... other parameters
})
```

**Key Classes**:

- `BaseDispatcher<TArgs, TResult>` - Abstract base with `formatSuccess/formatError` methods
- `XcodeDispatcher` - 5 Xcode operations
- `SimulatorDispatcher` - 8 Simulator control operations
- `IDBDispatcher` - 9 IDB UI automation operations

### File Organization

```
src/
├── dispatchers/          # Operation implementations
│   ├── base.ts          # Abstract BaseDispatcher class
│   ├── xcode.ts         # 5 Xcode operations
│   ├── simulator.ts     # 8 Simulator control operations
│   └── idb.ts           # 9 IDB UI automation operations
├── resources/           # On-demand documentation (MCP resources)
│   ├── catalog.ts       # Resource registry
│   └── content/         # Markdown documentation files
├── utils/
│   ├── command.ts       # Safe command execution (spawn-based, no shell injection)
│   └── logger.ts        # Structured logging
├── types.ts             # Centralized type definitions (zero tolerance for `any`)
├── constants.ts         # Configuration constants (no magic numbers)
└── index.ts             # MCP server entry point
```

## Code Style Principles

**CRITICAL**: All code must follow [CODESTYLE.md](./CODESTYLE.md) standards.

### Type Safety - Zero Tolerance

Never use `any` or `unknown` without explicit justification:

```typescript
// ❌ Bad
const args = toolArgs as any;

// ✅ Good
const args = toolArgs as unknown as XcodeOperationArgs;

// Exception (must be documented): External library constraints
// MCP SDK constraint: schema properties must be any
properties: Record<string, any>;
```

### Error Handling

Always handle errors - no silent failures:

```typescript
// ❌ Bad - empty catch
try {
  await operation();
} catch {}

// ✅ Good - log and handle
try {
  await operation();
} catch (error) {
  logger.error('Operation failed', error as Error);
  return this.formatError(error as Error, 'operation-name');
}

// ✅ Also good - health check pattern (errors expected)
const issues: string[] = [];
try {
  await checkDependency();
} catch {
  issues.push('Dependency not available');
}
```

### Constants Over Magic Numbers

All configuration values live in `constants.ts`:

```typescript
// ❌ Bad
const timeout = 300000;

// ✅ Good
import { COMMAND_CONFIG } from '../constants.js';
const timeout = COMMAND_CONFIG.DEFAULT_TIMEOUT_MS;
```

### Naming Conventions

- **Variables/Functions**: camelCase (`executeCommand`, `deviceId`, `isAvailable`)
- **Types/Interfaces**: PascalCase (`CommandResult`, `XcodeOperationArgs`)
- **Result types**: `*ResultData` (`BuildResultData`, `TestResultData`)
- **Parameter types**: `*Params` (`BuildParams`, `TapParams`)
- **Operation enums**: `*Operation` (`SimulatorOperation`, `IDBOperation`)
- **Sub-operations**: `*SubOperation` (`DeviceLifecycleSubOperation`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_AGE_MS`, `DEFAULT_TIMEOUT_MS`)
- **Files**: kebab-case (`response-cache.ts`, `xcode-dispatcher.ts`)

### Import Conventions

Always use ES modules with `.js` extensions:

```typescript
import { executeCommand } from '../utils/command.js';
import type { OperationResult } from '../types.js';
```

## Implementation Patterns

### 1. Command Execution (Security)

**Use spawn, never shell** to prevent command injection:

```typescript
import { runCommand } from '../utils/command.js';

// ✅ Safe - uses spawn with argument array
await runCommand('xcrun', ['simctl', 'boot', deviceId]);

// ❌ Vulnerable - shell string concatenation
await executeCommand(`xcrun simctl boot ${deviceId}`);
```

### 2. Dispatcher Method Template

All dispatcher methods follow this structure:

```typescript
private async executeOperation(
  params: Partial<OperationParams>
): Promise<OperationResult<ResultData>> {
  try {
    // 1. Validate required parameters
    if (!params.required_field) {
      return this.formatError('required_field is required', 'operation-name');
    }

    // 2. Execute command (lazy load utils)
    const { runCommand } = await import('../utils/command.js');
    const result = await runCommand('command', ['arg1', 'arg2']);

    // 3. Format response data
    const data: ResultData = {
      message: 'Operation completed successfully',
      note: 'Additional context if applicable',
      params: { /* echo back relevant params */ },
    };

    return this.formatSuccess(data);
  } catch (error) {
    logger.error('Operation failed', error as Error);
    return this.formatError(error as Error, 'operation-name');
  }
}
```

### 3. Dynamic Imports (Lazy Loading)

Use dynamic imports to reduce startup time:

```typescript
// ✅ Load utilities lazily
const { runCommand } = await import('../utils/command.js');
const { writeFile, unlink } = await import('fs/promises');
```

### 4. Temporary File Management

Always use try/finally to guarantee cleanup:

```typescript
let tempPath: string | null = null;

try {
  const { writeFile, unlink } = await import('fs/promises');
  const { join } = await import('path');
  const { tmpdir } = await import('os');

  tempPath = join(tmpdir(), `temp-${Date.now()}.json`);
  await writeFile(tempPath, content, 'utf8');

  // Use temp file
  await runCommand('command', [tempPath]);

  return this.formatSuccess(data);
} finally {
  // Always clean up
  if (tempPath) {
    try {
      await unlink(tempPath);
    } catch {
      // Ignore cleanup errors
    }
  }
}
```

## Type System

### Operation Result Pattern

All operations return `OperationResult<T>`:

```typescript
export type OperationResult<T = Record<string, never>> = SuccessResult<T> | ErrorResult;

export interface SuccessResult<T> {
  success: true;
  data: T;
  summary?: string;
  cache_id?: string;
}

export interface ErrorResult {
  success: false;
  error: string;
  operation?: string;
}
```

### Type Hierarchy

```typescript
// Top-level operation args
XcodeOperationArgs { operation: XcodeOperation, project_path?, scheme, ... }
SimulatorOperationArgs { operation: SimulatorOperation, device_id?, sub_operation?, ... }
IDBOperationArgs { operation: IDBOperation, target?, ... }

// Specific parameter interfaces (extend from above)
BuildParams extends { scheme: string, configuration: 'Debug' | 'Release', ... }
TapParams extends { target?: string, parameters: { x: number, y: number, ... } }

// Result data types
BuildResultData extends { message: string, note?: string, params?: BuildParams }
IDBOperationResultData extends { message: string, note?: string, params?: IDBParameters }
```

## All 22 Operations

### XcodeDispatcher (5 operations)

1. **build** - Compile projects with configuration options
   - Validates: `scheme` required
   - Returns: Build summary with note about logs via cache_id
2. **clean** - Remove build artifacts
   - Optional: `scheme` (cleans all if not specified)
3. **test** - Run test suites with result parsing
   - Validates: `scheme` required
   - Supports: `test_plan`, `only_testing`, `skip_testing`
4. **list** - Enumerate schemes and targets
   - Returns: Arrays of schemes and targets
5. **version** - Get Xcode installation details
   - Returns: xcode_version, build_number, sdks array

### SimulatorDispatcher (8 operations)

1. **device-lifecycle** - Boot, shutdown, create, delete, erase, clone simulators
   - Sub-operations: boot, shutdown, create, delete, erase, clone
   - Optional: `device_type`, `runtime` for create; `new_name` for clone
2. **app-lifecycle** - Install, uninstall, launch, terminate apps
   - Sub-operations: install, uninstall, launch, terminate
   - Requires: `app_identifier` for all
   - Optional: `app_path` for install; `arguments`, `environment` for launch
3. **io** - Screenshot capture and video recording
   - Sub-operations: screenshot, video
   - Optional: `output_path`, `duration` (video only)
4. **push** - Simulate push notifications
   - Requires: `app_identifier`, `payload` (JSON string or file path)
5. **openurl** - Open URLs and deep links
   - Requires: URL parameter
6. **list** - Enumerate available simulators
   - Returns: Array of device objects (name, udid, state, runtime)
7. **health-check** - Validate development environment
   - Returns: xcode_installed, simctl_available, issues array
8. **get-app-container** - Retrieve app container paths
   - Requires: `device_id`, `app_identifier`
   - Optional: `container_type` (data, bundle, or group)

### IDBDispatcher (9 operations)

1. **tap** - Tap at coordinates
   - Requires: `x`, `y` coordinates
   - Optional: `duration` (0.1 default)
2. **input** - Type text, press keys, execute key sequences
   - Supports: `text` (string), `key` (single), `key_sequence` (array)
   - At least one must be provided
3. **gesture** - Swipe gestures and hardware button presses
   - Sub-types: swipe (start_x/y, end_x/y), button (HOME, LOCK, SIRI, SIDE_BUTTON)
   - Optional: `duration` for swipes (200ms default)
4. **describe** - Query accessibility tree
   - Optional: `operation` ('all' for full tree, or point with x/y)
   - Returns: Full accessibility tree or single element
5. **find-element** - Search UI elements by label/identifier
   - Requires: `query` (element label to find)
   - Returns: Matching elements from accessibility tree
6. **app** - Install, uninstall, launch, terminate via IDB
   - Sub-operations: install, uninstall, launch, terminate
   - Optional: `app_path` (install), `arguments` and `environment` (launch)
7. **list-apps** - Enumerate installed apps
   - Optional: `filter_type` (system, user, internal)
8. **check-accessibility** - Assess accessibility data quality
   - Returns: Quality score, labeled/interactive element counts
9. **targets** - Manage IDB connections
   - Optional: `sub_operation` for future expansion
   - Returns: Available targets

## Common Implementation Patterns

### Auto-Detection

```typescript
// Device ID: defaults to "booted" if not provided
const deviceId = params.device_id || 'booted';

// Target: defaults to "booted" for IDB operations
const target = params.target || 'booted';

// Configuration: defaults to 'Debug' for builds
const configuration = params.configuration || 'Debug';
```

### Payload Handling (JSON or File Path)

```typescript
// Smart detection: file path or inline JSON
if (payload.endsWith('.json') || payload.startsWith('/')) {
  // Use as file path
  payloadPath = payload;
} else {
  // Treat as inline JSON - create temp file
  payloadPath = join(tmpdir(), `payload-${Date.now()}.json`);
  await writeFile(payloadPath, payload, 'utf8');
  isTemporaryFile = true;
}
```

### Coordinate Validation

```typescript
// Check for required coordinates
if (start_x === undefined || start_y === undefined || end_x === undefined || end_y === undefined) {
  return this.formatError('start_x, start_y, end_x, end_y required for swipe', 'gesture');
}

// Convert to strings for command execution
await runCommand('idb', [
  'ui',
  'swipe',
  String(start_x),
  String(start_y),
  String(end_x),
  String(end_y),
  '--duration',
  String(duration),
]);
```

## Accessibility-First Strategy (IDB)

**Critical Pattern**: Always query accessibility tree before screenshots:

```typescript
// 1. Check quality (80ms, ~30 tokens)
const quality = await executeCheckAccessibility({ target: 'booted' });

// 2. If sufficient, use accessibility tree (120ms, ~50 tokens)
if (quality.score >= 70) {
  const tree = await executeDescribe({ target: 'booted' });
  const element = findInTree(tree, 'Login Button');
  await executeTap({ parameters: { x: element.centerX, y: element.centerY } });
}

// 3. Only fallback to screenshot if necessary (2000ms, ~170 tokens)
else {
  const screenshot = await captureScreenshot();
  // Analyze screenshot...
}
```

**Why**: 3-4x faster, 80% cheaper, more reliable (survives theme changes).

## Testing Guidelines

### What to Test

1. **Parameter validation** - Required fields, invalid values
2. **Command construction** - Correct argument order
3. **Error handling** - Graceful failure modes
4. **Type safety** - No `any` leaks

### Test Structure

```typescript
describe('IDBDispatcher', () => {
  describe('executeTap', () => {
    it('should validate required coordinates', async () => {
      const dispatcher = new IDBDispatcher();
      const result = await dispatcher.execute({
        operation: 'tap',
        parameters: {
          // Missing x and y
        },
      });

      expect(result.success).toBe(false);
      expect((result as ErrorResult).error).toContain('x and y required');
    });

    it('should execute tap at provided coordinates', async () => {
      const dispatcher = new IDBDispatcher();
      const result = await dispatcher.execute({
        operation: 'tap',
        parameters: { x: 187, y: 450 },
      });

      expect(result.success).toBe(true);
    });
  });
});
```

## Common Pitfalls

### 1. Forgetting to Add New Parameters to Types

When adding new parameters to operations, update **both** interfaces:

```typescript
// ❌ Added to IDBParameters but forgot InputParams
export interface IDBParameters {
  key_sequence?: string[]; // Added here
}

export interface InputParams {
  parameters: {
    text?: string;
    key?: string;
    // Missing key_sequence! TypeScript error
  };
}

// ✅ Update both
export interface InputParams {
  parameters: {
    text?: string;
    key?: string;
    key_sequence?: string[]; // Added here too
  };
}
```

### 2. Not Cleaning Up Temporary Files

Always use try/finally for cleanup:

```typescript
// ❌ Bad - file may leak on error
const tempPath = createTempFile();
await useFile(tempPath);
await unlink(tempPath); // Never reached if useFile throws

// ✅ Good - cleanup guaranteed
let tempPath: string | null = null;
try {
  tempPath = createTempFile();
  await useFile(tempPath);
} finally {
  if (tempPath) {
    try {
      await unlink(tempPath);
    } catch {}
  }
}
```

### 3. Using Shell Commands Instead of Spawn

```typescript
// ❌ Vulnerable to injection
await executeCommand(`xcrun simctl boot ${deviceId}`);

// ✅ Safe - spawn with args array
await runCommand('xcrun', ['simctl', 'boot', deviceId]);
```

### 4. Returning Raw Command Output

Format responses to be user-friendly:

```typescript
// ❌ Bad - raw output
return this.formatSuccess({ message: result.stdout });

// ✅ Good - structured data
const data: ResultData = {
  message: `App launched: ${bundleId}`,
  note: pid ? `Process ID: ${pid}` : 'Launch successful',
  params: { bundle_id: bundleId, pid },
};
return this.formatSuccess(data);
```

## Documentation Sync Points

When adding/modifying operations:

1. ✅ **Implementation** - `src/dispatchers/*.ts`
2. ✅ **Types** - `src/types.ts` (update relevant interfaces)
3. ✅ **Tool Definition** - `getToolDefinition()` in dispatcher
4. ⚠️ **README.md** - Update usage examples if API changes
5. ⚠️ **CLAUDE.md** - Update this file with new patterns
6. ⚠️ **Resources** - Update `src/resources/content/*.md` if needed

## Development Commands

```bash
npm run build          # TypeScript compilation
npm run watch          # Watch mode
npm run lint           # ESLint
npm run typecheck      # Type checking only
npm run start          # Run MCP server
```

## Build Process

Pre-commit hooks run automatically:

1. Prettier formatting (`npm run format`)
2. TypeScript type checking (`npm run typecheck`)
3. ESLint linting (`npm run lint`)

Acceptable warnings (documented exceptions):

- `@typescript-eslint/no-explicit-any` - MCP SDK schema constraint
- `@typescript-eslint/no-non-null-assertion` - Safe non-null assertions (with comment)

## Project Status

**v0.0.1** - ✅ Feature-complete

All 22 operations fully implemented:

- XcodeDispatcher: 5/5 operations ✅
- SimulatorDispatcher: 8/8 operations ✅
- IDBDispatcher: 9/9 operations ✅
- Zero placeholders remaining
- All types properly defined
- All error handling in place
- JSDoc coverage: 100%

## Quick Reference

**Most common base operations**:

- `this.formatSuccess(data)` - Return successful result
- `this.formatError(error, operation)` - Return error result
- `logger.error/info/warn/debug` - Structured logging
- `await runCommand(cmd, args)` - Safe command execution

**Most common patterns**:

- Validate required params first
- Use dynamic imports for lazy loading
- Clean up temp files in finally blocks
- Echo back relevant params in response data
- Return structured data, not raw command output

---

**xclaude-plugin MCP Server v0.0.1** - Complete iOS development automation
