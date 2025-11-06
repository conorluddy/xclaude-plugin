# CLAUDE.md - AI Assistant Context

This file provides essential guidance to Claude Code when working with the xclaude-plugin repository.

## Project Overview

**xclaude-plugin** is a complete, feature-complete MCP (Model Context Protocol) plugin for iOS development automation. It consolidates iOS build, test, simulator control, and UI automation into 3 semantic dispatchers with minimal token overhead.

**Status**: ✅ Production-ready (v0.0.1) - All operations fully implemented, zero placeholders remaining.

**Key Features**:
- **3 consolidated dispatchers**: execute_xcode_command, execute_simulator_command, execute_idb_command
- **22 total operations** across Xcode, Simulator, and IDB domains
- **8 procedural Skills** (on-demand documentation with examples)
- **~2.2k tokens at rest** with progressive disclosure architecture

## Repository Structure

```
xclaude-plugin/
├── README.md                      # User-facing plugin documentation
├── CLAUDE.md                      # This file - AI assistant context
├── .claude-plugin/                # Plugin configuration
│   ├── plugin.json               # Plugin manifest
│   └── marketplace.json          # Marketplace configuration
├── mcp-server/                    # MCP server implementation
│   ├── README.md                 # Technical documentation
│   ├── CLAUDE.md                 # Server-specific context
│   ├── CODESTYLE.md              # Development guidelines
│   ├── package.json              # Dependencies
│   ├── tsconfig.json             # TypeScript configuration
│   ├── src/
│   │   ├── dispatchers/          # 3 dispatcher implementations
│   │   │   ├── base.ts           # Abstract BaseDispatcher
│   │   │   ├── xcode.ts          # 5 Xcode operations
│   │   │   ├── simulator.ts      # 8 Simulator operations
│   │   │   └── idb.ts            # 9 IDB operations
│   │   ├── resources/            # On-demand documentation (MCP resources)
│   │   │   └── catalog.ts        # Resource registry
│   │   ├── utils/
│   │   │   ├── command.ts        # Safe command execution (spawn-based)
│   │   │   └── logger.ts         # Structured logging
│   │   ├── types.ts              # Centralized type definitions
│   │   ├── constants.ts          # Configuration constants
│   │   └── index.ts              # MCP server entry point
│   └── dist/                     # Compiled JavaScript
├── skills/                        # 8 procedural Skills (on-demand)
│   ├── xcode-workflows/
│   ├── simulator-workflows/
│   ├── ui-automation-workflows/
│   ├── accessibility-testing/
│   ├── ios-testing-patterns/
│   ├── crash-debugging/
│   ├── performance-profiling/
│   └── state-management/
└── .gitignore                    # Version control exclusions
```

## Core Architecture

### 3-Dispatcher Pattern

Instead of 20+ granular tools, the plugin uses semantic dispatchers:

```typescript
// XcodeDispatcher: All build-related operations
execute_xcode_command({
  operation: 'build' | 'test' | 'clean' | 'list' | 'version',
  // ... operation-specific parameters
})

// SimulatorDispatcher: All simulator control operations
execute_simulator_command({
  operation: 'device-lifecycle' | 'app-lifecycle' | 'io' | 'push' | 'openurl' | 'list' | 'health-check' | 'get-app-container',
  sub_operation?: string,
  // ... operation-specific parameters
})

// IDBDispatcher: All UI automation operations
execute_idb_command({
  operation: 'tap' | 'input' | 'gesture' | 'describe' | 'find-element' | 'app' | 'list-apps' | 'check-accessibility' | 'targets',
  // ... operation-specific parameters
})
```

### 8 Procedural Skills

Skills are on-demand, procedural knowledge documents (Markdown + YAML frontmatter):

1. **xcode-workflows** - Build system patterns, certificate handling, dependency management
2. **simulator-workflows** - Device lifecycle patterns, app installation, testing flows
3. **ui-automation-workflows** - Accessibility-first automation, element finding, gesture patterns
4. **accessibility-testing** - WCAG compliance checks, VoiceOver simulation
5. **ios-testing-patterns** - Test execution, flaky test detection, result analysis
6. **crash-debugging** - Crash log symbolication, debugging patterns
7. **performance-profiling** - Instruments integration, profiling analysis
8. **state-management** - Cache management, configuration persistence

**Key**: Skills load progressively. Metadata (~40 tokens) is always loaded, full content (~6k tokens) only when Claude requests them.

## Key Code Patterns

### 1. Type Safety (Zero Tolerance for `any`)

```typescript
// ❌ Bad - uses any
const args = toolArgs as any;

// ✅ Good - explicit assertion
const args = toolArgs as unknown as XcodeOperationArgs;

// Exception (documented): MCP SDK constraint
// MCP SDK constraint: schema properties must be any
properties: Record<string, any>;
```

### 2. Safe Command Execution (No Shell Injection)

```typescript
// ❌ Vulnerable
await executeCommand(`xcrun simctl boot ${deviceId}`);

// ✅ Safe - spawn with argument array
await runCommand('xcrun', ['simctl', 'boot', deviceId]);
```

### 3. Dispatcher Method Template

```typescript
private async executeOperation(
  params: Partial<OperationParams>
): Promise<OperationResult<ResultData>> {
  try {
    // 1. Validate required parameters
    if (!params.required_field) {
      return this.formatError('required_field is required', 'operation');
    }

    // 2. Execute command
    const { runCommand } = await import('../utils/command.js');
    const result = await runCommand('command', ['arg1', 'arg2']);

    // 3. Format response
    const data: ResultData = {
      message: 'Operation completed successfully',
      note: 'Optional additional context',
      params: { /* echo back relevant params */ },
    };

    return this.formatSuccess(data);
  } catch (error) {
    logger.error('Operation failed', error as Error);
    return this.formatError(error as Error, 'operation');
  }
}
```

### 4. Temporary File Cleanup

Always use try/finally to prevent file leaks:

```typescript
let tempPath: string | null = null;

try {
  const { writeFile, unlink } = await import('fs/promises');
  const { join } = await import('path');
  const { tmpdir } = await import('os');

  tempPath = join(tmpdir(), `temp-${Date.now()}.json`);
  await writeFile(tempPath, content, 'utf8');

  // Use temp file...
  await runCommand('command', [tempPath]);

  return this.formatSuccess(data);
} finally {
  if (tempPath) {
    try {
      await unlink(tempPath);
    } catch {
      // Ignore cleanup errors
    }
  }
}
```

## Code Style Principles

**IMPORTANT**: Always follow [mcp-server/CODESTYLE.md](./mcp-server/CODESTYLE.md) when writing or modifying code.

Key principles:

- **Zero tolerance for `any`** - All types explicitly defined
- **No silent failures** - Always handle and log errors
- **Constants over magic numbers** - All config in constants.ts
- **Progressive disclosure** - Document essentials, details on-demand
- **Function size** - Prefer <50 lines, maximum 100 lines
- **Security first** - Use spawn (not shell) for command execution
- **Comprehensive JSDoc** - All public APIs must be documented

Pre-commit validation:

```bash
npm run build          # TypeScript compilation
npm run lint           # ESLint
npm run typecheck      # Type checking
```

## When Adding/Modifying Operations

1. **Implement** - Add method to dispatcher class
2. **Type** - Update types.ts with operation/parameter/result types
3. **Document** - Add JSDoc with @param, @returns, @throws tags
4. **Validate** - Ensure npm run build passes
5. **Sync docs** - Update mcp-server/README.md usage examples if API changes

### Type Definition Checklist

When adding a new operation, update **both**:

```typescript
// 1. General parameters interface
export interface IDBParameters {
  new_field?: string;  // Add here
}

// 2. Specific operation parameters
export interface TapParams {
  parameters: {
    x: number;
    y: number;
    new_field?: string;  // AND add here
  };
}

// 3. Result data type
export interface IDBOperationResultData {
  message: string;
  new_field?: string;  // Add here
}
```

## Common Development Patterns

### Auto-Detection

```typescript
// Device ID defaults to "booted" if not provided
const deviceId = params.device_id || 'booted';

// Target defaults to "booted" for IDB
const target = params.target || 'booted';

// Configuration defaults to Debug
const configuration = params.configuration || 'Debug';
```

### Payload Handling (File or Inline JSON)

```typescript
// Smart detection: file path or inline JSON
if (payload.endsWith('.json') || payload.startsWith('/')) {
  payloadPath = payload;
} else {
  // Create temp file for inline JSON
  payloadPath = join(tmpdir(), `payload-${Date.now()}.json`);
  await writeFile(payloadPath, payload, 'utf8');
  isTemporaryFile = true;
}
```

### Accessibility-First UI Automation

**Critical pattern**: Always query accessibility tree before screenshots:

```typescript
// 1. Check quality (80ms, ~30 tokens)
const quality = await checkAccessibility({ target: 'booted' });

// 2. If sufficient, use accessibility tree (120ms, ~50 tokens)
if (quality.score >= 70) {
  const tree = await describe({ target: 'booted', operation: 'all' });
  const element = findInTree(tree, 'Button Label');
  await tap({ parameters: { x: element.centerX, y: element.centerY } });
}

// 3. Only fallback to screenshot (2000ms, ~170 tokens) if necessary
else {
  const screenshot = await captureScreenshot();
}
```

**Why**: 3-4x faster, 80% cheaper, more reliable (survives theme changes).

## Testing Guidelines

Test all dispatcher methods:

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

## Development Commands

```bash
# Build
npm run build            # TypeScript compilation
npm run watch           # Watch mode

# Validation
npm run lint            # ESLint
npm run typecheck       # Type checking only
npm run start           # Run MCP server

# Development
npm run format          # Prettier formatting
npm run lint:fix        # Auto-fix linting issues
```

## Implementation Completeness

**Version 0.0.1** - ✅ Feature complete:

### XcodeDispatcher (5 operations)
- ✅ build - Compile projects with configuration options
- ✅ clean - Remove build artifacts
- ✅ test - Run test suites with result summaries
- ✅ list - Query schemes and targets
- ✅ version - Check Xcode installation

### SimulatorDispatcher (8 operations)
- ✅ device-lifecycle - Boot, shutdown, create, delete, erase, clone
- ✅ app-lifecycle - Install, uninstall, launch, terminate
- ✅ io - Screenshot and video capture
- ✅ push - Simulate push notifications
- ✅ openurl - Open URLs and deep links
- ✅ list - Enumerate simulators
- ✅ health-check - Validate development environment
- ✅ get-app-container - Retrieve app container paths

### IDBDispatcher (9 operations)
- ✅ tap - Tap at coordinates
- ✅ input - Type text, press keys, key sequences
- ✅ gesture - Swipe gestures and hardware buttons
- ✅ describe - Query accessibility tree
- ✅ find-element - Search UI elements by label
- ✅ app - Install, uninstall, launch, terminate apps
- ✅ list-apps - Enumerate installed apps
- ✅ check-accessibility - Assess accessibility data quality
- ✅ targets - Manage IDB connections

## Important Constraints

- **macOS 13.0+** required (Xcode Command Line Tools)
- **Node.js 18+** for MCP server compilation
- **Xcode 15.0+** for iOS development operations
- **IDB optional** (Facebook iOS Development Bridge) for advanced UI automation

## Quick Reference

**Most common methods**:
- `this.formatSuccess(data)` - Return successful operation result
- `this.formatError(error, operation)` - Return error result
- `logger.error/info/warn/debug` - Structured logging
- `await runCommand(cmd, args)` - Safe command execution with spawn

**Most common parameters**:
- `device_id?: string` - Simulator UDID (defaults to "booted")
- `target?: string` - IDB target (defaults to "booted")
- `operation: Operation` - Required operation type
- `parameters?: Parameters` - Operation-specific parameters

## Resources

- **MCP Documentation**: https://modelcontextprotocol.io/
- **Xcode Command Line Reference**: `man xcodebuild`, `man simctl`
- **IDB Documentation**: https://fbidb.io/
- **Code Style Guide**: [mcp-server/CODESTYLE.md](./mcp-server/CODESTYLE.md)
- **Plugin Repository**: https://github.com/conorluddy/xclaude-plugin

---

**xclaude-plugin v0.0.1** - Complete iOS development automation for Claude Code
