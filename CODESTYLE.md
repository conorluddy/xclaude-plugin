# Code Style Guide

**xc-plugin Development Guidelines**

## Philosophy

### 1. Token Efficiency First

Every line of code, comment, and structure decision should consider: **How will this appear to an AI agent reading the codebase?**

**Principles:**
- **Minimize cognitive load** - Clear names, short functions, obvious structure
- **Progressive disclosure** - Show essentials first, details on-demand
- **Self-documenting** - Code explains itself through structure and naming
- **Context-aware** - Recognize that AI agents have finite context windows

### 2. Optimize for Understanding, Not Cleverness

```typescript
// Bad: Clever but unclear
const r = d.filter(x => x.s === 'B').map(x => x.n);

// Good: Clear and obvious
const bootedDevices = devices
  .filter(device => device.state === 'Booted')
  .map(device => device.name);
```

**Readability hierarchy:**
1. Structure (clear boundaries, logical grouping)
2. Names (descriptive, unambiguous)
3. Comments (sparingly, for non-obvious "why")
4. Types (explicit, helpful)

### 3. Single Responsibility Principle

**Functions:**
- 20-30 lines ideal
- 60 lines maximum
- One clear purpose
- Named for what they do

**Files:**
- One primary export
- Related helpers colocated
- ~200-300 lines ideal
- ~500 lines maximum

**Classes:**
- Single well-defined responsibility
- Methods follow same size guidelines
- Prefer composition over inheritance

## TypeScript Guidelines

### Naming Conventions

**Variables and Functions:**
```typescript
// camelCase for variables and functions
const deviceName = 'iPhone 15';
function executeCommand(args: CommandArgs): Promise<Result> {}
```

**Classes and Interfaces:**
```typescript
// PascalCase for classes and interfaces
class XcodeDispatcher extends BaseDispatcher {}
interface ToolDefinition {}
```

**Constants:**
```typescript
// UPPER_SNAKE_CASE for constants
const DEFAULT_TIMEOUT = 120000;
const MAX_RETRIES = 3;
```

**Files:**
```typescript
// kebab-case for files
// simulator-tools.ts
// response-cache.ts
// idb-device-detection.ts
```

### Type Annotations

**Always explicit for:**
- Function parameters
- Function return types
- Public class properties
- Exported constants

**Can infer for:**
- Local variables with obvious types
- Private class properties
- Intermediate computation results

```typescript
// Good: Explicit where it matters
export async function executeBuild(
  params: BuildParams
): Promise<BuildResult> {
  const scheme = params.scheme; // Inferred OK
  return buildProject(scheme);
}

// Bad: Unnecessary noise
const deviceName: string = getDeviceName(); // Type obvious from function
```

### `any` and `unknown` Usage

**NEVER use `any` or `unknown`** - Always define explicit types.

**Zero tolerance policy:**
- ❌ No `any` types (even during development)
- ❌ No `unknown` types (define the actual structure)
- ✅ Define interfaces and types for all data structures
- ✅ Use union types for multiple possibilities
- ✅ Use generics for reusable patterns

```typescript
// Bad
function process(data: any) {
  return data.value;
}

// Bad
function process(data: unknown) {
  return (data as { value: string }).value;
}

// Good - Explicit interface
interface ProcessData {
  value: string;
}

function process(data: ProcessData) {
  return data.value;
}

// Good - Union type for multiple possibilities
type OperationResult = BuildResult | TestResult | ErrorResult;

function executeOperation(op: string): OperationResult {
  // Implementation
}
```

**Exception:** Third-party SDK types that use `any` (cannot be changed). Document why:
```typescript
// MCP SDK uses any for schema properties - cannot be changed
properties: Record<string, any>;
```

## Code Organization

### File Structure

**Standard pattern:**
```typescript
/**
 * Brief file description
 *
 * Additional context if needed
 */

// Imports - grouped and sorted
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { logger } from '../utils/logger.js';

import type { ToolDefinition } from './types.js';

// Types and interfaces
export interface BuildParams {
  scheme: string;
  configuration: 'Debug' | 'Release';
}

// Constants
const DEFAULT_CONFIGURATION = 'Debug';

// Main exports
export class XcodeDispatcher {
  // Implementation
}

// Helper functions (private to file)
function parseOutput(text: string): ParsedOutput {
  // Implementation
}
```

### Import Organization

```typescript
// 1. External packages
import { Server } from '@modelcontextprotocol/sdk/server/index.js';

// 2. Internal modules (parent/sibling directories)
import { BaseDispatcher } from './base.js';
import { logger } from '../utils/logger.js';

// 3. Type-only imports
import type { ToolDefinition } from './types.js';
```

**Always use `.js` extension** in imports (even for `.ts` files) - required for ES modules.

## Function Guidelines

### Function Size

**Target:** 20-30 lines
**Maximum:** 60 lines

**If longer:**
- Extract helper functions
- Split into smaller operations
- Consider if function is doing too much

### Function Structure

```typescript
async function executeOperation(
  params: OperationParams
): Promise<OperationResult> {
  // 1. Validation and early returns
  if (!params.scheme) {
    return { success: false, error: 'Scheme required' };
  }

  // 2. Main logic
  const result = await performOperation(params);

  // 3. Error handling
  if (!result.success) {
    logger.error('Operation failed', result.error);
    return formatError(result.error);
  }

  // 4. Success path
  return formatSuccess(result.data);
}
```

### Parameter Objects

**More than 3 parameters?** Use an object:

```typescript
// Bad: Too many parameters
function createDevice(name: string, type: string, runtime: string, erase: boolean) {}

// Good: Parameter object
interface CreateDeviceParams {
  name: string;
  deviceType: string;
  runtime: string;
  erase?: boolean;
}

function createDevice(params: CreateDeviceParams): Promise<Device> {}
```

## Comments

### When to Comment

**Comment the WHY, not the WHAT:**

```typescript
// Bad: Obvious what
// Get device name
const deviceName = getDeviceName();

// Good: Explains why
// Use booted device for faster testing (avoids boot delay)
const deviceName = 'booted';
```

**Comment for:**
- Non-obvious design decisions
- Workarounds for bugs/limitations
- Complex algorithms
- Public API documentation

**Don't comment for:**
- Obvious operations
- Self-explanatory code
- Restating variable names

### JSDoc for Public APIs

```typescript
/**
 * Execute xcodebuild operation
 *
 * @param operation - Operation type (build, clean, test, etc.)
 * @param params - Operation-specific parameters
 * @returns Result with success status and data or error
 *
 * @example
 * ```typescript
 * await execute('build', { scheme: 'MyApp', configuration: 'Debug' });
 * ```
 */
export async function execute(
  operation: Operation,
  params: OperationParams
): Promise<Result> {
  // Implementation
}
```

## Error Handling

### Use Structured Errors

```typescript
// Bad: String errors
throw 'Build failed';

// Good: Error objects
throw new Error('Build failed: scheme not found');

// Better: Structured error responses
return {
  success: false,
  error: 'Build failed',
  details: 'Scheme "MyApp" not found in project',
  code: 'SCHEME_NOT_FOUND'
};
```

### Try-Catch Appropriately

```typescript
// Good: Catch at operation boundaries
async function execute(args: any): Promise<Result> {
  try {
    const result = await performOperation(args);
    return formatSuccess(result);
  } catch (error) {
    logger.error('Operation failed', error);
    return formatError(error);
  }
}

// Don't catch just to re-throw
async function helper() {
  try {
    return await operation();
  } catch (error) {
    throw error; // Unnecessary
  }
}
```

## Async/Await

**Prefer async/await over promises:**

```typescript
// Good: Clear flow
async function buildProject(scheme: string): Promise<BuildResult> {
  const project = await findProject();
  const settings = await getBuildSettings(project, scheme);
  const result = await executeBuild(settings);
  return result;
}

// Bad: Promise chains
function buildProject(scheme: string): Promise<BuildResult> {
  return findProject()
    .then(project => getBuildSettings(project, scheme))
    .then(settings => executeBuild(settings));
}
```

**Exception:** Multiple independent operations:

```typescript
// Good: Parallel execution
const [devices, apps, health] = await Promise.all([
  listDevices(),
  listApps(),
  checkHealth()
]);
```

## Logging

### Log Levels

- **error:** Operation failures, exceptions
- **warn:** Unexpected but handled situations
- **info:** Important state changes, completions
- **debug:** Detailed execution flow (disabled by default)

```typescript
logger.error('Build failed', error);
logger.warn('No scheme specified, using default');
logger.info('Build completed successfully');
logger.debug('Executing xcodebuild with args:', args);
```

### Structured Logging

```typescript
// Good: Context-rich
logger.info('Build completed', {
  scheme: 'MyApp',
  configuration: 'Debug',
  duration: '45.2s'
});

// Bad: String interpolation only
logger.info(`Build completed for ${scheme} in ${duration}`);
```

## Testing

### Test File Organization

```typescript
// tests/dispatchers/xcode.test.ts

describe('XcodeDispatcher', () => {
  describe('execute', () => {
    it('should build project successfully', async () => {
      // Arrange
      const dispatcher = new XcodeDispatcher();
      const args = { operation: 'build', scheme: 'MyApp' };

      // Act
      const result = await dispatcher.execute(args);

      // Assert
      expect(result.success).toBe(true);
    });

    it('should return error for invalid scheme', async () => {
      // Test implementation
    });
  });
});
```

### Test Naming

```typescript
// Pattern: should [expected behavior] when [condition]
it('should return cached result when cache is warm', async () => {});
it('should execute command when cache is cold', async () => {});
it('should throw error when device not found', async () => {});
```

## Git Commits

### Commit Message Format

```
<type>: <subject>

<body (optional)>

<footer (optional)>
```

**Types:**
- **feat:** New feature
- **fix:** Bug fix
- **refactor:** Code restructure (no behavior change)
- **docs:** Documentation only
- **style:** Formatting, whitespace
- **test:** Adding/updating tests
- **chore:** Build scripts, dependencies

**Examples:**
```
feat: add simulator health check operation

Implements health-check operation in simulator dispatcher
that validates Xcode installation and simctl availability.

Closes #123
```

```
fix: handle missing scheme in build operation

Previously crashed when scheme omitted. Now returns
descriptive error message with available schemes.
```

## Prettier Configuration

**Enforced by Prettier:**
- Single quotes
- Semicolons
- 100 character line width
- 2 space indentation
- Trailing commas (ES5)
- LF line endings

**Run before commit:**
```bash
npm run format
```

## ESLint Rules

**Key rules:**
- `@typescript-eslint/no-explicit-any`: warn (not error, for prototyping)
- `@typescript-eslint/no-unused-vars`: error (with `_` prefix ignore)
- `no-console`: off (we use logger, console.error is OK for MCP)
- `@typescript-eslint/explicit-function-return-type`: off (infer when obvious)

**Run before commit:**
```bash
npm run lint:fix
```

## Token Efficiency Checklist

When writing code, ask:

- [ ] Are function/variable names descriptive but concise?
- [ ] Is the structure obvious without comments?
- [ ] Can this be understood in a single read?
- [ ] Are related concepts colocated?
- [ ] Is this the simplest solution that works?
- [ ] Would an AI agent understand this in 100 tokens?

## Progressive Disclosure Pattern

**Principle:** Show essentials first, details on-demand.

**In Code:**
```typescript
// Good: Summary first
export interface BuildResult {
  success: boolean;
  summary: string;         // Always present
  cache_id?: string;       // For detailed logs
  build_time?: string;
  warnings?: number;
}

// Usage shows summary, cache_id leads to full logs if needed
```

**In Skills:**
```markdown
---
name: skill-name
description: Brief description (40 tokens) ← Always loaded
---

# Full content (7k tokens) ← Loaded on-demand
```

**In Resources:**
```typescript
// Catalog lists URIs (500 tokens) ← Always available
resources: [
  { uri: 'xc://operations/xcode', name: 'Xcode Reference' }
]

// Content loaded only when requested (0 tokens at rest)
```

## Review Checklist

Before submitting code:

- [ ] Runs `npm run format` (Prettier)
- [ ] Runs `npm run lint:fix` (ESLint)
- [ ] Runs `npm run build` (compiles without errors)
- [ ] Runs `npm run typecheck` (no type errors)
- [ ] Function sizes within guidelines (20-60 lines)
- [ ] File sizes reasonable (<500 lines)
- [ ] Public APIs have JSDoc comments
- [ ] Error handling appropriate
- [ ] Logging at correct levels
- [ ] Tests added/updated (if applicable)
- [ ] Git commit message follows format

---

**Remember:** Write code for understanding. The best code is code that doesn't need explaining.
