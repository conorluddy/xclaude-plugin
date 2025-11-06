# xclaude-plugin - AI Assistant Context

This document provides essential context for AI assistants (like Claude) working on the xclaude-plugin MCP server codebase.

## Project Overview

**xclaude-plugin** is a token-efficient MCP (Model Context Protocol) server for iOS development automation. It consolidates 28+ individual operations into 3 dispatchers, reducing at-rest token overhead by 88% (2.2k vs 18.7k tokens).

**Status**: ✅ Feature-complete (v0.0.1) - All operations fully implemented, zero placeholders remaining.

## Core Architecture

### Dispatcher Pattern

The project uses a **consolidated dispatcher pattern** instead of granular tool-per-operation:

```typescript
// Single MCP tool per domain
execute_xcode_command({ operation: "build", ... })
execute_simulator_command({ operation: "device-lifecycle", sub_operation: "boot", ... })
execute_idb_command({ operation: "tap", ... })
```

**Key Classes**:

- `BaseDispatcher<TArgs, TResult>` - Abstract base with `formatSuccess/formatError`
- `XcodeDispatcher` - Xcode operations (build, test, clean, list, version)
- `SimulatorDispatcher` - Simulator control (device/app lifecycle, IO, push, openurl, etc.)
- `IDBDispatcher` - UI automation (tap, input, gesture, describe, find-element, etc.)

### File Organization

```
src/
├── dispatchers/          # Operation implementations
│   ├── base.ts          # Abstract BaseDispatcher
│   ├── xcode.ts         # 5 Xcode operations
│   ├── simulator.ts     # 8 Simulator operations
│   └── idb.ts           # 9 IDB operations
├── resources/           # On-demand documentation (MCP resources)
│   ├── catalog.ts       # Resource registry
│   └── content/*.md     # Markdown documentation
├── utils/
│   ├── command.ts       # Safe command execution (spawn-based, no shell injection)
│   └── logger.ts        # Structured logging
├── types.ts             # Centralized type definitions (zero tolerance for `any`)
├── constants.ts         # Configuration constants (no magic numbers)
└── index.ts             # MCP server entry point
```

## Code Style Principles

### Type Safety - Zero Tolerance

**Never use `any` or `unknown` without explicit justification**. All types must be explicitly defined.

```typescript
// ❌ Bad
const args = toolArgs as any;

// ✅ Good
const args = toolArgs as unknown as XcodeOperationArgs;
```

**Only acceptable `any`**: External library constraints (MCP SDK schema properties), must be documented:

```typescript
// MCP SDK constraint: schema properties must be any
properties: Record<string, any>;
```

### Error Handling

**Always handle errors** - no silent failures:

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

- **Variables/Functions**: camelCase (`executeCommand`, `deviceId`)
- **Types/Interfaces**: PascalCase (`CommandResult`, `XcodeOperationArgs`)
- **Result types**: `*ResultData` (`BuildResultData`, `TestResultData`)
- **Parameter types**: `*Params` (`BuildParams`, `TapParams`)
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

```typescript
private async executeOperation(
  params: Partial<OperationParams>
): Promise<OperationResult<ResultData>> {
  try {
    const { runCommand } = await import('../utils/command.js');

    // 1. Validate required parameters
    if (!params.required_field) {
      return this.formatError('required_field is required', 'operation-name');
    }

    // 2. Execute command
    const result = await runCommand('command', ['arg1', 'arg2']);

    // 3. Format response data
    const data: ResultData = {
      message: 'Operation completed successfully',
      note: 'Additional context',
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

Use dynamic imports for utility functions to reduce initial load time:

```typescript
const { runCommand } = await import('../utils/command.js');
const { writeFile, unlink } = await import('fs/promises');
```

### 4. Temporary File Management

Always clean up temporary files with try/finally:

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
XcodeOperationArgs { operation: XcodeOperation, ...params }
SimulatorOperationArgs { operation: SimulatorOperation, sub_operation?, ...params }
IDBOperationArgs { operation: IDBOperation, ...params }

// Specific parameter interfaces
BuildParams extends { scheme: string, configuration: 'Debug' | 'Release', ... }
TapParams extends { target?: string, parameters: { x: number, y: number, ... } }

// Result data types
BuildResultData extends { message: string, note?: string, params?: BuildParams }
IDBOperationResultData extends { message: string, note?: string, params?: IDBParameters }
```

## Key Operations by Dispatcher

### XcodeDispatcher (5 operations)

1. `build` - Compile projects, return build summary
2. `clean` - Remove build artifacts
3. `test` - Run test suites, parse results
4. `list` - Enumerate schemes/targets
5. `version` - Get Xcode version info

### SimulatorDispatcher (8 operations)

1. `device-lifecycle` - Boot, shutdown, create, delete, erase, clone
2. `app-lifecycle` - Install, uninstall, launch, terminate
3. `io` - Screenshot capture, video recording
4. `push` - Simulate push notifications (JSON payload)
5. `openurl` - Open URLs/deep links
6. `list` - Enumerate simulators
7. `health-check` - Validate development environment
8. `get-app-container` - Retrieve app container paths

### IDBDispatcher (9 operations)

1. `tap` - Tap at coordinates
2. `input` - Type text, press keys, key sequences
3. `gesture` - Swipe gestures, hardware buttons (HOME, LOCK, SIRI)
4. `describe` - Query accessibility tree
5. `find-element` - Search UI elements by label
6. `app` - Install, uninstall, launch, terminate via IDB
7. `list-apps` - Enumerate installed apps
8. `check-accessibility` - Assess accessibility data quality
9. `targets` - Manage IDB connections

## Accessibility-First Strategy (IDB)

**Critical Performance Pattern**: Always query accessibility tree before screenshots:

```typescript
// 1. Check quality (80ms, 30 tokens)
const quality = await executeCheckAccessibility({ target: 'booted' });

// 2. If sufficient, use accessibility tree (120ms, 50 tokens)
if (quality.score >= 70) {
  const tree = await executeDescribe({ target: 'booted' });
  const element = findInTree(tree, 'Login Button');
  await executeTap({ parameters: { x: element.centerX, y: element.centerY } });
}

// 3. Only fallback to screenshot if necessary (2000ms, 170 tokens)
else {
  const screenshot = await captureScreenshot();
  // Analyze screenshot...
}
```

**Why**: 3-4x faster, 80% cheaper, more reliable (survives theme changes).

## Common Patterns

### Auto-Detection Patterns

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
  return this.formatError('start_x, start_y, end_x, end_y required', 'gesture');
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

## Testing Guidelines

### What to Test

1. **Parameter validation** - Required fields, invalid values
2. **Command construction** - Correct argument order
3. **Error handling** - Graceful failure modes
4. **Type safety** - No `any` leaks

### Test Structure

```typescript
describe('XcodeDispatcher', () => {
  describe('executeBuild', () => {
    it('should validate required scheme parameter', async () => {
      const dispatcher = new XcodeDispatcher();
      const result = await dispatcher.execute({
        operation: 'build',
        project_path: '/path/to/project',
        // Missing scheme
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('scheme required');
    });
  });
});
```

## Common Pitfalls

### 1. Forgetting to Add New Parameters to Types

When adding new parameters to operations, update **both** the general `*Parameters` interface AND the specific `*Params` interface:

```typescript
// ❌ Added to IDBParameters but forgot InputParams
export interface IDBParameters {
  key_sequence?: string[]; // Added here
}

export interface InputParams {
  parameters: {
    text?: string;
    key?: string;
    // Missing key_sequence! - TypeScript error
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

1. Prettier formatting
2. TypeScript type checking
3. ESLint linting

**Acceptable warnings**:

- `@typescript-eslint/no-explicit-any` - MCP SDK constraint (documented)
- `@typescript-eslint/no-non-null-assertion` - Safe non-null assertions (with comment)

## Project History

- **v1.0.0** - Initial skeleton with placeholder functions
- **v0.0.1** - ✅ Feature-complete implementation
  - All 8 placeholder functions implemented
  - Simulator: executeIO, executePush, executeOpenURL, executeGetAppContainer
  - IDB: executeInput, executeGesture, executeApp, executeTargets
  - Zero placeholders remaining

## Related Projects

- **xc-mcp** - Original 28-tool granular implementation at `/Users/conor/Development/xc-mcp`
- **xclaude-plugin** - This project, consolidated 3-dispatcher approach

## Questions During Development?

1. Check **CODESTYLE.md** for style guidelines
2. Search **types.ts** for type definitions
3. Review **existing dispatcher methods** for patterns
4. Read **XC-MCP-INTEGRATION.md** for historical context (integration planning doc)

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

---

**Status**: Feature-complete v0.0.1 - All operations functional, zero placeholders remaining.
