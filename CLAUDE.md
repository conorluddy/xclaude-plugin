# CLAUDE.md - AI Assistant Context

This file provides essential guidance to Claude Code when working with the xclaude-plugin repository.

## Project Overview

**xclaude-plugin** is a production-ready MCP (Model Context Protocol) plugin for iOS development automation. It provides 8 modular, workflow-specific MCP servers that consolidate 23 iOS operations across build, test, simulator control, and UI automation.

**Status**: ✅ Production-ready (v0.3.0) - All operations fully implemented, tested, and with codecov integration.

**Key Features**:

- **8 modular MCP servers** - Workflow-specific, composable architecture
- **23 total operations** across Xcode, Simulator, and IDB domains
- **8 procedural Skills** (on-demand documentation with examples)
- **100% TypeScript** with zero tolerance for `any` types
- **Full test coverage** with codecov reporting

## Repository Structure

```
xclaude-plugin/
├── README.md                      # User-facing plugin documentation
├── CLAUDE.md                      # This file - AI assistant context
├── CODESTYLE.md                   # Development guidelines
├── .claude-plugin/                # Plugin configuration
│   ├── plugin.json               # Plugin manifest (entry point)
│   └── marketplace.json          # Marketplace configuration
├── mcp-servers/                   # 8 modular MCP servers
│   ├── xc-build/                 # Build, clean, list schemes
│   ├── xc-build-and-launch/      # Build, install, launch app
│   ├── xc-interact/              # Simulator + IDB UI automation
│   ├── xc-ai-assist/             # AI-specific workflows
│   ├── xc-setup/                 # Health check, project info
│   ├── xc-testing/               # Test execution, results parsing
│   ├── xc-meta/                  # Metadata and introspection
│   └── xc-all/                   # All-in-one consolidated server
│   └── [each server]/
│       ├── src/
│       │   ├── index.ts          # Server entry point
│       │   └── operations/       # Operation implementations
│       ├── package.json
│       ├── tsconfig.json
│       └── dist/                 # Compiled JavaScript (committed for distribution)
├── skills/                        # 8 procedural Skills (on-demand)
│   ├── xcode-workflows/
│   ├── simulator-workflows/
│   ├── ui-automation-workflows/
│   ├── accessibility-testing/
│   ├── ios-testing-patterns/
│   ├── crash-debugging/
│   ├── performance-profiling/
│   └── state-management/
├── .mcp.json                      # Default MCP configuration (loads xc-setup, xc-build)
├── .mcp.json.example              # Full configuration showing all 8 servers
└── .gitignore                     # Version control exclusions
```

## Default vs Optional Servers

**Default Load** (in `.mcp.json`):

- `xc-setup` - Environment validation, project introspection
- `xc-build` - Build, clean, list schemes

**Optional Load** (documented in README):

- `xc-build-and-launch` - Build, install, and launch app
- `xc-testing` - Test execution and result analysis
- `xc-interact` - Simulator and IDB UI automation
- `xc-ai-assist` - AI-specific workflows
- `xc-meta` - Metadata and introspection
- `xc-all` - All 23 operations in one server

Users can customize `.mcp.json` to load any combination of servers based on their workflow.

## Code Style Principles

**IMPORTANT**: Always follow [CODESTYLE.md](./CODESTYLE.md) when writing or modifying code.

Key principles across all servers:

- **Zero tolerance for `any`** - All types explicitly defined (MCP SDK constraint exception documented)
- **No silent failures** - Always handle and log errors
- **Constants over magic numbers** - All config in constants.ts per server
- **Progressive disclosure** - Document essentials, details on-demand
- **Function size** - Prefer <50 lines, maximum 100 lines
- **Security first** - Use spawn (not shell) for command execution
- **Comprehensive JSDoc** - All public APIs must be documented
- **Consistent error handling** - Structured error responses

Pre-commit validation:

```bash
npm run build          # TypeScript compilation for all servers
npm run test           # Run test suites for all servers
npm run coverage       # Generate coverage reports
```

## When Adding/Modifying Operations

1. **Add to specific server** - Choose appropriate server (or add to xc-all if generic)
2. **Implement operation** - Add to `src/operations/` with JSDoc
3. **Define types** - Update types in same file or shared types
4. **Add tests** - Create matching `.test.ts` file with full coverage
5. **Update README** - Document in server-specific README
6. **Build & validate** - Ensure `npm run build && npm run test` passes

## Development Commands

```bash
# Build all servers
npm run build              # TypeScript compilation

# Testing
npm run test               # Run all tests
npm run coverage           # Generate coverage reports

# Individual server commands (from root)
npm run build --workspace=xc-build      # Build specific server
npm run test --workspace=xc-build       # Test specific server

# Development
npm run clean              # Remove all dist/ directories
```

## Testing Strategy

All servers include:

- Unit tests for each operation
- Integration tests for workflows
- Edge case coverage
- Error handling validation

Coverage target: **>80%** (enforced by codecov integration)

Tests run via:

```bash
npm run test           # All servers
npm run test --workspace=xc-setup  # Specific server
npm run coverage       # Generate reports for CI
```

## Key Implementation Details

### Server Architecture

Each server in `mcp-servers/` follows the same pattern:

```typescript
// src/index.ts - Server entry point
export const server = new Server({
  name: "xc-build",
  version: "0.2.0",
  tools: [
    {
      name: "xc_build",
      description: "Build iOS project",
      inputSchema: {
        /* ... */
      },
    },
    // ... more tools
  ],
});

// Implement handlers for each tool
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  // Route to appropriate operation handler
});
```

### Type Safety

Zero `any` types in implementation code:

```typescript
// ❌ Bad - violates zero-any policy
const args = toolInput as any;

// ✅ Good - explicit typing
interface BuildInput {
  scheme: string;
  configuration?: "Debug" | "Release";
}
const args = toolInput as BuildInput;
```

### Command Execution (Safe Spawn)

All external commands use spawn-based execution:

```typescript
// ❌ Vulnerable to shell injection
await executeCommand(`xcodebuild -scheme ${scheme}`);

// ✅ Safe - arguments as array
const { execAsync } = await import("./exec");
const result = await execAsync("xcodebuild", ["-scheme", scheme]);
```

### Error Handling

Consistent error response format:

```typescript
interface OperationResult<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}
```

## Resources

- **MCP Documentation**: https://modelcontextprotocol.io/
- **Xcode Command Line Reference**: `man xcodebuild`, `man simctl`
- **IDB Documentation**: https://fbidb.io/
- **Plugin Repository**: https://github.com/conorluddy/xclaude-plugin

---

**xclaude-plugin v0.3.0** - Modular iOS development automation for Claude Code
