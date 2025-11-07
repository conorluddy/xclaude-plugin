# XC-Plugin MCP Servers

Modular task-based MCP architecture for iOS development workflows.

## Architecture Overview

```
mcp-servers/
├── shared/                    # Single source of truth
│   ├── tools/                # 22 individual tools
│   ├── types/                # Shared type definitions
│   └── utils/                # Shared utilities
├── xc-build/                 # MCP 1: Build validation (~600 tokens)
├── xc-ai-assist/             # MCP 2: AI UI automation (~1400 tokens)
├── xc-setup/                 # MCP 3: Environment setup (~800 tokens)
├── xc-testing/               # MCP 4: E2E testing (~1200 tokens)
├── xc-meta/                  # MCP 5: Project maintenance (~700 tokens)
└── xc-hybrid/                # MCP 6: Full toolkit (~3500 tokens)
```

## Key Features

- **Modular Design**: Each tool is a standalone, testable function
- **Non-Exclusive Sets**: Tools can appear in multiple MCP servers
- **Workflow-Specific**: Each MCP server is optimized for a specific dev phase
- **Token Efficient**: Enable only the MCPs you need (600-3500 tokens)
- **Type-Safe**: Zero `any` usage, full TypeScript type safety

## The 6 MCP Servers

### 1. **xc-build** - Build Validation
**Use when**: CI/CD, quick compilation checks, scheme discovery

**Tools** (3):
- `xcode_build` - Build Xcode project
- `xcode_clean` - Clean build artifacts
- `xcode_list` - List available schemes

**Token cost**: ~600

### 2. **xc-ai-assist** - AI UI Automation
**Use when**: AI making UI changes, iterating on UX, testing UI flows

**Tools** (7):
- `xcode_build` - Rebuild after changes
- `idb_describe` - Query accessibility tree (fast)
- `idb_tap` - Tap UI elements
- `idb_input` - Type text
- `idb_find_element` - Search by label
- `idb_check_quality` - Assess accessibility
- `simulator_screenshot` - Capture screenshot (fallback)

**Token cost**: ~1400

### 3. **xc-setup** - Environment Configuration
**Use when**: Initial session setup, creating simulators, validating environment

**Tools** (5):
- `simulator_list` - Discover available devices
- `simulator_create` - Create new simulator
- `simulator_boot` - Boot simulator
- `simulator_health_check` - Validate environment
- `xcode_version` - Check Xcode installation

**Token cost**: ~800

### 4. **xc-testing** - E2E Testing
**Use when**: Running test suites, automating test flows, capturing evidence

**Tools** (6):
- `xcode_test` - Run XCTest suite
- `idb_describe` - Query UI for testing
- `idb_tap` - Interact with UI
- `idb_input` - Type in test flows
- `idb_gesture` - Swipes and gestures
- `simulator_screenshot` - Capture test evidence

**Token cost**: ~1200

### 5. **xc-meta** - Project Maintenance
**Use when**: Checking environment, managing schemes, cleanup tasks

**Tools** (6):
- `xcode_version` - Check Xcode version
- `xcode_list` - List schemes/targets
- `xcode_clean` - Clean artifacts
- `simulator_health_check` - Validate environment
- `simulator_delete` - Delete simulators
- `simulator_shutdown` - Shutdown simulators

**Token cost**: ~700

### 6. **xc-hybrid** - Full Toolkit
**Use when**: Human+AI collaboration, complex workflows, need full access

**Tools** (23): All tools from all categories

**Token cost**: ~3500

## Quick Start

### Build All Servers

```bash
cd mcp-servers
./build.sh
```

Or build individually:

```bash
cd xc-build
npm install
npm run build
```

### Enable in Claude

In Claude's MCP settings, toggle the servers you want:

```
☑️ xc-build          # For quick build validation
☐ xc-ai-assist      # Disable when not doing UI work
☐ xc-setup          # Only needed for initial setup
☐ xc-testing        # Enable during testing phase
☐ xc-meta           # For maintenance tasks
☑️ xc-hybrid         # Full access when needed
```

## Tool Library (22 Total)

### Xcode Tools (5)
- `xcode_build` - Build project
- `xcode_clean` - Clean artifacts
- `xcode_test` - Run tests
- `xcode_list` - List schemes/targets
- `xcode_version` - Get Xcode version

### Simulator Tools (12)
- `simulator_list` - List simulators
- `simulator_boot` - Boot device
- `simulator_shutdown` - Shutdown device
- `simulator_create` - Create simulator
- `simulator_delete` - Delete simulator
- `simulator_install_app` - Install app
- `simulator_launch_app` - Launch app
- `simulator_terminate_app` - Terminate app
- `simulator_screenshot` - Capture screenshot
- `simulator_openurl` - Open URL/deep link
- `simulator_get_app_container` - Get app path
- `simulator_health_check` - Validate environment

### IDB Tools (6)
- `idb_describe` - Query accessibility tree
- `idb_tap` - Tap coordinates
- `idb_input` - Type text/keys
- `idb_gesture` - Swipe/button press
- `idb_find_element` - Search by label
- `idb_check_quality` - Assess accessibility

## Development

### Adding a New Tool

1. Create tool file in `shared/tools/{category}/{tool-name}.ts`
2. Export `{toolName}Definition` and `{toolName}()` function
3. Import in relevant MCP server(s)
4. Rebuild affected servers

### Adding a New MCP Server

1. Create directory: `mkdir my-server/src`
2. Create `src/index.ts` (copy from existing)
3. Create `package.json` and `tsconfig.json`
4. Add to `plugin.json` mcpServers
5. Add to `build.sh`

### Type Safety Rules

- **Zero `any` usage** (except MCP SDK constraints)
- All tool params and results typed
- Shared types in `shared/types/`
- Tool-specific types colocated

### Code Style

- Functions <60 lines per CODESTYLE.md
- Use spawn, never shell (security)
- Handle all errors explicitly
- Use logger, not console

## Architecture Benefits

### For Users
- Enable only what you need
- Clear mental model (workflow-based)
- Reduced token overhead
- No overlap confusion

### For Developers
- Single source of truth (shared tools)
- Easy testing (isolated functions)
- Simple maintenance (update once)
- Type-safe throughout

## Comparison: Old vs New

| Aspect | Old (3 Dispatchers) | New (6 MCP Servers) |
|--------|---------------------|---------------------|
| **MCP Servers** | 1 monolithic | 6 workflow-specific |
| **Tools Exposed** | 22 (always) | 3-23 (configurable) |
| **Token Cost** | ~2200 (fixed) | 600-3500 (flexible) |
| **Modularity** | Via Skills | Via MCP toggle |
| **Discoverability** | Need inspection | Named by workflow |
| **Code Organization** | Monolithic files | Modular functions |

## Token Cost Examples

**Scenario 1: Just validating builds**
```
✅ xc-build (600 tokens)
Total: 600 tokens
```

**Scenario 2: AI UI iteration**
```
✅ xc-ai-assist (1400 tokens)
Total: 1400 tokens
```

**Scenario 3: Full development session**
```
✅ xc-build (600 tokens)
✅ xc-ai-assist (1400 tokens)
✅ xc-testing (1200 tokens)
Total: 3200 tokens
```

**Scenario 4: Everything**
```
✅ xc-hybrid (3500 tokens)
Total: 3500 tokens
```

## Requirements

- macOS 13.0+
- Xcode 15.0+
- Node.js 18+
- IDB (optional, for UI automation)

## License

MIT
