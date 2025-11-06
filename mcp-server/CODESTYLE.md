# xclaude-plugin Code Style Guide

This document defines the coding standards and best practices for the xclaude-plugin project. Following these guidelines ensures consistent, maintainable, and high-quality code.

## Table of Contents

- [Type Safety](#type-safety)
- [Error Handling](#error-handling)
- [Documentation](#documentation)
- [Code Organization](#code-organization)
- [Constants and Configuration](#constants-and-configuration)
- [Naming Conventions](#naming-conventions)
- [Import Conventions](#import-conventions)
- [Testing](#testing)

---

## Type Safety

### Zero Tolerance Policy

**Never use `any` or `unknown` without explicit justification.**

```typescript
// ❌ Bad - uses `any`
function processData(data: any) {
  return data.value;
}

// ✅ Good - uses specific types
function processData(data: { value: string }): string {
  return data.value;
}
```

### Type Assertions

Avoid `as never` casts. Use proper type assertions or unions instead:

```typescript
// ❌ Bad - bypasses type system
const value = input as never;

// ✅ Good - proper type assertion
const value = input as SpecificType;

// ✅ Better - type narrowing
if (isSpecificType(input)) {
  const value = input; // TypeScript infers correct type
}
```

### External Data

When dealing with external data (e.g., MCP SDK), use explicit type assertions through `unknown`:

```typescript
// ✅ Good - explicit assertion for external data
const args = toolArgs as unknown as OperationArgs;
```

### Documented Exceptions

The only acceptable use of `any` is when required by external libraries, and it must be documented:

```typescript
// MCP SDK constraint: schema properties must be any
properties: Record<string, any>;
```

---

## Error Handling

### Always Handle Errors

Never use empty catch blocks. Always log or handle errors appropriately:

```typescript
// ❌ Bad - silent failure
try {
  await riskyOperation();
} catch {
  // Silent failure
}

// ✅ Good - log error
try {
  await riskyOperation();
} catch (error) {
  logger.error('Operation failed', error as Error);
  throw error;
}

// ✅ Also good - graceful degradation with explanation
try {
  await loadOptionalData();
} catch (error) {
  // Non-critical: persistence layer unavailable, continuing without it
  logger.warn('Failed to load optional data:', error);
}
```

### Health Checks

For health check operations, errors are expected and should be collected as issues:

```typescript
// ✅ Good - health check pattern
const issues: string[] = [];
try {
  await checkDependency();
} catch {
  issues.push('Dependency not available');
}
```

### Error Messages

Provide clear, actionable error messages:

```typescript
// ❌ Bad - vague
return this.formatError('Failed', operation);

// ✅ Good - specific
return this.formatError('scheme required for test operation', operation);
```

---

## Documentation

### JSDoc for Public APIs

All public functions and classes must have JSDoc comments:

```typescript
/**
 * Executes a command with arguments using spawn.
 * This function does NOT invoke a shell, preventing command injection.
 *
 * @param command - The command to execute (e.g., 'idb', 'xcrun')
 * @param args - Array of arguments (each element is safely passed as-is)
 * @param options - Execution options
 * @returns Command result with stdout, stderr, and exit code
 * @throws {McpError} If command times out or exceeds buffer size
 */
export async function executeCommandWithArgs(
  command: string,
  args: string[],
  options?: CommandOptions
): Promise<CommandResult> {
  // Implementation
}
```

### Required Tags

- `@param` - Description for each parameter
- `@returns` - Description of return value
- `@throws` - Document exceptions
- `@example` - For complex functions

### Class Documentation

```typescript
/**
 * Response Cache
 *
 * Manages caching of command outputs for progressive disclosure.
 * Reduces token usage by 85-90% by storing full outputs and returning summaries.
 */
export class ResponseCache {
  // Implementation
}
```

### TODO Comments

Mark incomplete implementations with TODO comments:

```typescript
// TODO: Implement IO operations (screenshot, video)
private async executeIO(params: Partial<IOParams>) {
  // Placeholder implementation
}
```

---

## Code Organization

### File Structure

```
src/
├── dispatchers/     # Tool dispatchers (Xcode, Simulator, IDB)
├── resources/       # MCP resource system
├── state/           # State management (cache, persistence)
├── utils/           # Utility functions
├── types.ts         # Type definitions
├── constants.ts     # Configuration constants
└── index.ts         # Entry point
```

### Separation of Concerns

- One class per file (except related types)
- Group related functions in utility modules
- Keep dispatchers focused on their domain

### Function Length

- Prefer functions under 50 lines
- Extract complex logic into helper functions
- Use descriptive names for extracted functions

---

## Constants and Configuration

### Centralized Constants

All magic numbers must be defined in `constants.ts`:

```typescript
// ❌ Bad - magic number
const timeout = 300000;

// ✅ Good - named constant
import { COMMAND_CONFIG } from '../constants.js';
const timeout = COMMAND_CONFIG.DEFAULT_TIMEOUT_MS;
```

### Configuration Objects

Group related constants:

```typescript
export const CACHE_CONFIG = {
  MAX_AGE_MS: 30 * 60 * 1000,
  MAX_ENTRIES: 100,
  PERSISTENCE_DEBOUNCE_MS: 1000,
} as const;
```

---

## Naming Conventions

### Variables and Functions

- Use camelCase: `deviceId`, `executeCommand`
- Be descriptive: `bootedDeviceCount` not `count`
- Boolean variables: `isAvailable`, `hasError`

### Types and Interfaces

- Use PascalCase: `CommandResult`, `XcodeOperationArgs`
- Result types: `*ResultData` (e.g., `BuildResultData`)
- Parameter types: `*Params` (e.g., `TestParams`)
- Operation enums: `*Operation` (e.g., `SimulatorOperation`)
- Sub-operations: `*SubOperation` (e.g., `DeviceLifecycleSubOperation`)

### Constants

- Use UPPER_SNAKE_CASE: `MAX_AGE_MS`, `DEFAULT_TIMEOUT_MS`
- Configuration objects: `*_CONFIG` (e.g., `CACHE_CONFIG`)

### Files

- Use kebab-case: `response-cache.ts`, `xcode-dispatcher.ts`
- Match class name: `ResponseCache` → `response-cache.ts`

---

## Import Conventions

### ES Module Syntax

Always use ES modules with `.js` extensions:

```typescript
import { CommandResult } from '../utils/command.js';
import type { OperationResult } from '../types.js';
```

### Import Order

1. External dependencies
2. Internal modules (absolute)
3. Types (use `import type`)
4. Blank line between groups

```typescript
import { Server } from '@modelcontextprotocol/sdk/server/index.js';

import { XcodeDispatcher } from './dispatchers/xcode.js';
import { logger } from './utils/logger.js';

import type { XcodeOperationArgs, SimulatorOperationArgs } from './types.js';
```

### Dynamic Imports

Use dynamic imports for lazy loading:

```typescript
const { runCommand } = await import('../utils/command.js');
```

---

## Testing

### Test Organization

- Test files: `*.test.ts`
- Co-locate with implementation
- One test file per module

### Test Structure

```typescript
describe('executeCommand', () => {
  it('should execute command successfully', async () => {
    const result = await executeCommand('echo "test"');
    expect(result.code).toBe(0);
    expect(result.stdout).toBe('test');
  });

  it('should handle timeout errors', async () => {
    await expect(executeCommand('sleep 10', { timeout: 100 })).rejects.toThrow('timed out');
  });
});
```

---

## Progressive Disclosure Pattern

When implementing operations that return large outputs:

1. Cache full output using `ResponseCache`
2. Return summary with `cache_id`
3. Provide get-details operation for full access

```typescript
// Cache full output
const cache = new ResponseCache();
const cacheId = cache.store({
  tool: 'operation-name',
  fullOutput: result.stdout,
  stderr: result.stderr,
  exitCode: result.code,
  command: 'full command string',
  metadata: { key: 'value' },
});

// Return summary
return this.formatSuccess(
  {
    message: 'Operation completed',
    note: 'Use get-details with cache_id to see full output',
  },
  `cache_id: ${cacheId}`
);
```

---

## Accessibility-First Strategy

When implementing UI automation:

1. **Query accessibility tree first** (3-4x faster, 80% cheaper)
2. Only use screenshots as fallback
3. Provide quality assessment

```typescript
// ✅ Preferred - accessibility tree
const result = await runCommand('idb', ['ui', 'describe-all']);
const elements = JSON.parse(result.stdout);

// ❌ Fallback only - screenshot
if (elements.length === 0) {
  const screenshot = await captureScreenshot();
}
```

---

## Git Commit Guidelines

### Commit Message Format

```
<type>: <subject>

<body>

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `refactor`: Code refactoring
- `docs`: Documentation changes
- `test`: Test changes
- `chore`: Build/tooling changes

### Subject Line

- Use imperative mood: "add feature" not "added feature"
- No period at end
- Maximum 72 characters

---

## Linting and Formatting

### Pre-commit Hooks

All code must pass:

- TypeScript compilation (`tsc`)
- ESLint (`eslint src --ext .ts`)
- Prettier (`prettier --write`)

### Acceptable Warnings

Two ESLint warnings are acceptable when documented:

1. `@typescript-eslint/no-explicit-any` - MCP SDK constraint
2. `@typescript-eslint/no-non-null-assertion` - Safe non-null assertions with comment

---

## Performance Considerations

### Token Efficiency

- Use progressive disclosure for large outputs (85-90% reduction)
- Consolidated dispatchers (3 vs 28 tools = 88% reduction at rest)
- Cache frequently accessed data

### Command Execution

- Use `spawn` instead of `exec` for security
- Set appropriate timeouts and buffer limits
- Handle large outputs with streaming when possible

---

## Security

### Command Injection Prevention

Always use argument arrays, never string concatenation:

```typescript
// ❌ Bad - vulnerable to injection
await executeCommand(`xcodebuild -scheme ${scheme}`);

// ✅ Good - safe from injection
await runCommand('xcodebuild', ['-scheme', scheme]);
```

### Input Validation

Validate all external input before use:

```typescript
if (!scheme) {
  return this.formatError('scheme required for build', operation);
}
```

---

## Questions?

If you have questions about these guidelines or need clarification on any pattern, please:

1. Check existing code for examples
2. Refer to this document
3. Ask in code reviews

Remember: Consistency is key. When in doubt, follow existing patterns in the codebase.
