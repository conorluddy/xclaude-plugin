# XC-Plugin MCP Servers

Modular task-based MCP architecture for iOS development workflows.

## Architecture Overview

```
mcp-servers/
├── shared/                    # Single source of truth
│   ├── tools/                # 22 individual tools
│   ├── types/                # Shared type definitions
│   └── utils/                # Shared utilities
├── xc-compile/               # MCP 1: Ultra-minimal build (~300 tokens)
├── xc-interact/              # MCP 2: Pure UI interaction (~900 tokens)
├── xc-build/                 # MCP 3: Build validation (~600 tokens)
├── xc-ai-assist/             # MCP 4: AI UI automation (~1400 tokens)
├── xc-setup/                 # MCP 5: Environment setup (~800 tokens)
├── xc-testing/               # MCP 6: E2E testing (~1200 tokens)
├── xc-meta/                  # MCP 7: Project maintenance (~700 tokens)
└── xc-hybrid/                # MCP 8: Full toolkit (~3500 tokens)
```

## Key Features

- **Modular Design**: Each tool is a standalone, testable function
- **Non-Exclusive Sets**: Tools can appear in multiple MCP servers
- **Workflow-Specific**: Each MCP server is optimized for a specific dev phase
- **Token Efficient**: Enable only the MCPs you need (600-3500 tokens)
- **Type-Safe**: Zero `any` usage, full TypeScript type safety

## The 8 MCP Servers

### 🔥 Surgical MCPs (Ultra-Focused)

#### 1. **xc-compile** - Ultra-Minimal Build
**Use when**: Tight code→build→fix loops, minimal token overhead, only care about "did it compile?"

**Tools** (1):
- `xcode_build` - Build with automatic error extraction (up to 10 errors)

**Token cost**: ~300

**Why enable**: You're in rapid iteration mode fixing compilation errors. No scheme discovery, no cleaning, just build and show errors. Perfect for LLM-driven TDD where you need instant feedback with minimal context.

---

#### 2. **xc-interact** - Pure UI Interaction
**Use when**: Testing UI flows with app already built and running, no build overhead needed

**Tools** (6):
- `idb_describe` - Query accessibility tree (3-4x faster than screenshots)
- `idb_tap` - Tap UI elements
- `idb_input` - Type text or press keys
- `idb_gesture` - Swipes and hardware buttons
- `idb_find_element` - Search by label (semantic)
- `idb_check_quality` - Assess accessibility data richness

**Token cost**: ~900

**Why enable**: You have a built app and want to explore/test UI flows without rebuilding. Accessibility-first automation (120ms queries vs 2000ms screenshots). Perfect for manual testing sessions or UI exploration.

---

### 📦 Core Workflow MCPs

#### 3. **xc-build** - Build Validation
**Use when**: CI/CD, quick compilation checks, scheme discovery, need clean operations

**Tools** (3):
- `xcode_build` - Build Xcode project
- `xcode_clean` - Clean build artifacts
- `xcode_list` - List available schemes

**Token cost**: ~600

**Why enable**: More comprehensive than xc-compile - includes scheme discovery and clean operations. Use for CI/CD pipelines or when you need to explore project structure.

---

#### 4. **xc-ai-assist** - AI UI Automation
**Use when**: AI making UI changes, iterating on UX, testing UI flows with visual feedback

**Tools** (7):
- `xcode_build` - Rebuild after changes
- `idb_describe` - Query accessibility tree (fast)
- `idb_tap` - Tap UI elements
- `idb_input` - Type text
- `idb_find_element` - Search by label
- `idb_check_quality` - Assess accessibility
- `simulator_screenshot` - Capture screenshot (fallback)

**Token cost**: ~1400

**Why enable**: Complete build + interact + visual feedback workflow. Includes screenshot capability (xc-interact doesn't). Perfect for AI-driven UI iteration where you need to rebuild, interact, and validate visually.

---

#### 5. **xc-setup** - Environment Configuration
**Use when**: Initial session setup, creating simulators, validating environment

**Tools** (5):
- `simulator_list` - Discover available devices
- `simulator_create` - Create new simulator
- `simulator_boot` - Boot simulator
- `simulator_health_check` - Validate environment
- `xcode_version` - Check Xcode installation

**Token cost**: ~800

**Why enable**: First session or onboarding new developer. Validates Xcode installation, discovers/creates simulators, boots devices. Disable after environment is stable.

---

#### 6. **xc-testing** - E2E Testing
**Use when**: Running test suites, automating test flows, capturing evidence

**Tools** (6):
- `xcode_test` - Run XCTest suite
- `idb_describe` - Query UI for testing
- `idb_tap` - Interact with UI
- `idb_input` - Type in test flows
- `idb_gesture` - Swipes and gestures
- `simulator_screenshot` - Capture test evidence

**Token cost**: ~1200

**Why enable**: Full test execution + UI automation. Run XCTest suites, automate UI test flows, capture screenshots for evidence. Includes gesture support for complex interactions.

---

#### 7. **xc-meta** - Project Maintenance
**Use when**: Checking environment, managing schemes, cleanup tasks

**Tools** (6):
- `xcode_version` - Check Xcode version
- `xcode_list` - List schemes/targets
- `xcode_clean` - Clean artifacts
- `simulator_health_check` - Validate environment
- `simulator_delete` - Delete simulators
- `simulator_shutdown` - Shutdown simulators

**Token cost**: ~700

**Why enable**: Housekeeping tasks - check versions, clean artifacts, manage simulators. No build or test execution, just maintenance. Perfect for troubleshooting environment issues.

---

### 🚀 Full Access

#### 8. **xc-hybrid** - Full Toolkit
**Use when**: Human+AI collaboration, complex workflows, need full access

**Tools** (23): All tools from all categories

**Token cost**: ~3500

**Why enable**: Maximum flexibility - all 22 tools available. Use when workflow is unpredictable or you need access to everything. Equivalent to old monolithic dispatcher but with better organization.

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

**IMPORTANT**: Enable **ONE MCP at a time** for optimal token efficiency. If you enable multiple MCPs, shared tools will appear multiple times and increase token usage.

In Claude's MCP settings, toggle the server you need:

```
☐ xc-compile        # Ultra-minimal: just build (~300 tokens)
☐ xc-interact       # Pure UI automation (~900 tokens)
☐ xc-build          # Build + clean + schemes (~600 tokens)
☐ xc-ai-assist      # Build + UI + screenshots (~1400 tokens)
☐ xc-setup          # Environment setup (~800 tokens)
☐ xc-testing        # Tests + UI flows (~1200 tokens)
☐ xc-meta           # Maintenance tasks (~700 tokens)
☐ xc-hybrid         # Everything (~3500 tokens)
```

**Pro tip**: Use xc-hybrid if your workflow spans multiple categories, rather than enabling multiple focused MCPs.

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

| Aspect | Old (3 Dispatchers) | New (8 MCP Servers) |
|--------|---------------------|---------------------|
| **MCP Servers** | 1 monolithic | 8 workflow-specific |
| **Tools Exposed** | 22 (always) | 1-23 (configurable) |
| **Token Cost** | ~2200 (fixed) | 300-3500 (flexible) |
| **Modularity** | Via Skills | Via MCP toggle |
| **Discoverability** | Need inspection | Named by workflow |
| **Code Organization** | Monolithic files | Modular functions |

## Token Cost Examples

**Scenario 1: Fixing compilation errors**
```
✅ xc-compile (300 tokens)
Total: 300 tokens - 87% less than old architecture!
```

**Scenario 2: Testing UI flows (app already built)**
```
✅ xc-interact (900 tokens)
Total: 900 tokens - 59% less than old architecture!
```

**Scenario 3: AI UI iteration with visual feedback**
```
✅ xc-ai-assist (1400 tokens)
Total: 1400 tokens - 36% less than old architecture!
```

**Scenario 4: Full development session**
```
⚠️ Don't do this (tool duplication):
✅ xc-build (600 tokens)
✅ xc-ai-assist (1400 tokens)  ← xcode_build appears twice!
✅ xc-testing (1200 tokens)    ← xcode_build appears again!
Total: 3200 tokens + duplication overhead

✅ Do this instead:
✅ xc-hybrid (3500 tokens)
Total: 3500 tokens - all tools, no duplication
```

**Scenario 5: Everything**
```
✅ xc-hybrid (3500 tokens)
Total: 3500 tokens - 59% more than old, but full modular architecture
```

## Requirements

- macOS 13.0+
- Xcode 15.0+
- Node.js 18+
- IDB (optional, for UI automation)

## License

MIT
