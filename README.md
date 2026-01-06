# xClaude Plugin

```
/plugin marketplace add conorluddy/xclaude-plugin
```

**Modular iOS development automation for Claude Code**

Build, test, and automate iOS apps through natural conversation with Claude. 8 workflow-specific MCP servers with 24 tools across Xcode, Simulator, and IDB.

**Enable only what you need.** Each MCP is purpose-built for specific workflows, keeping your context window lean. Plus, our tools intelligently encapsulate Xcode output (errors, test results, build logs) so Claude processes structured JSON instead of raw 50+ line logs—saving significant tokens and enabling faster feedback loops.

<img width="1278" height="407" alt="Screenshot 2025-11-08 at 10 44 28" src="https://github.com/user-attachments/assets/ff1c0a09-f29d-4a86-a280-97b3bbc8c635" />

## Features

### 🎯 Modular Architecture

- **8 workflow-specific MCP servers** (600-3500 tokens each)
- **Enable only what you need** - Ultra-minimal to full-featured
- **23 shared tools** across Xcode, Simulator, and IDB
- **Single source of truth** - tools defined once, imported by MCPs

### 🔥 Surgical MCPs (Ultra-Focused)

- **xc-build** (~600 tokens) - Build validation, errors, clean, list schemes
- **xc-launch** (~400 tokens) - Simulator app lifecycle: install and launch
- **xc-interact** (~900 tokens) - Pure UI interaction, no build

### 📦 Core Workflow MCPs

- **xc-ai-assist** (~1400 tokens) - Build + UI automation + screenshots
- **xc-setup** (~800 tokens) - Environment configuration and validation
- **xc-testing** (~1200 tokens) - Test execution + UI flows
- **xc-meta** (~700 tokens) - Project maintenance and housekeeping

### 🚀 Full Access

- **xc-all** (~3500 tokens) - All 24 tools for complex workflows

### 📚 8 Procedural Skills (Loaded On-Demand)

- **xcode-workflows** - Build system guidance and result analysis
- **simulator-workflows** - Device and app lifecycle patterns
- **ui-automation-workflows** - Accessibility-first automation
- **accessibility-testing** - WCAG compliance and quality checks
- **ios-testing-patterns** - Test execution and flaky test detection
- **crash-debugging** - Crash log analysis and symbolication
- **performance-profiling** - Instruments integration
- **state-management** - Cache and configuration management

## Installation

### From GitHub (Recommended)

```bash
/plugin marketplace add conorluddy/xclaude-plugin
/plugin install xclaude-plugin
```

### From Local Development

```bash
/plugin marketplace add /path/to/xclaude-plugin
/plugin install xclaude-plugin
```

## First 60 Seconds

Just installed? Enable **xc-build** and **xc-launch** for rapid development:

```
1. In Claude settings, enable "xc-build" and "xc-launch" MCPs
2. Ask Claude: "Build and run MyApp on iPhone 15"
3. Done! ✨
```

That's it. **xc-build** + **xc-launch** gives you a composable development loop: build with xc-build, then install & launch with xc-launch. Claude orchestrates the two-step workflow. If you need other workflows (testing, setup, UI automation), see **Choosing the Right MCP** below.

## Requirements

- macOS 13.0+ or Linux
- Xcode 15.0+ (macOS only, for iOS development)
- Node.js 18+
- Optional: IDB (Facebook iOS Development Bridge) for advanced UI automation

## Migration Guide (v0.4.0)

If you're upgrading from an earlier version, note these breaking changes:

### Renamed Server: `xc-build-and-launch` → `xc-launch`

**What changed:**
- Server renamed from **xc-build-and-launch** to **xc-launch** for clarity
- **Removed:** `xcode_build_and_launch` monolithic tool (with `skip_build` flag), plus `xcode_build`, `xcode_clean`, `xcode_list` (moved to xc-build)
- **Now contains:** Only `simulator_install_app` and `simulator_launch_app`
- **Philosophy:** Use **xc-build** + **xc-launch** together for development loop

**Why:** The monolithic `xcode_build_and_launch` tool coupled build, install, and launch into a single operation. The new architecture separates build concerns (xc-build) from simulator lifecycle (xc-launch), enabling:
- Better error recovery (retry individual steps)
- Clearer mental model (build → install → launch)
- No `skip_build` code smell
- Follows Single Responsibility Principle

**Action required:**
1. Update your `.mcp.json` configuration:
   ```diff
   - "xc-build-and-launch": {
   -   "command": "node",
   -   "args": ["${CLAUDE_PLUGIN_ROOT}/mcp-servers/xc-build-and-launch/dist/index.js"]
   + "xc-launch": {
   +   "command": "node",
   +   "args": ["${CLAUDE_PLUGIN_ROOT}/mcp-servers/xc-launch/dist/index.js"]
   ```
2. In Claude settings, enable "xc-launch" instead of "xc-build-and-launch"

**Previous versions:**
- `v0.3.0`: `xc-run` → `xc-build-and-launch`
- `v0.3.0`: `xc-compile` → `xc-build`, `xc-hybrid` → `xc-all`

See `.mcp.json.example` for the current configuration.

## Choosing the Right MCP

### Enable the Right MCP for Your Task

**IMPORTANT**: Enable **ONE MCP at a time** for optimal token efficiency. Choose based on your current workflow:

```
☐ xc-build                # Build validation, errors, clean? (~600 tokens)
☐ xc-launch               # Simulator lifecycle: install + launch? (~400 tokens)
☐ xc-interact             # Testing UI with app already built? (~900 tokens)
☐ xc-ai-assist            # AI-driven UI iteration? (~1400 tokens)
☐ xc-setup                # First time setup? (~800 tokens)
☐ xc-testing              # Running test suites? (~1200 tokens)
☐ xc-meta                 # Maintenance tasks? (~700 tokens)
☐ xc-all                  # Complex workflow needing everything? (~3500 tokens)

💡 Tip: Enable xc-build + xc-launch together for development loop (~1000 tokens total)
```

### Example Workflows

**Scenario 1: Build and fix errors**

```
Enable: xc-build (~600 tokens)

"Build the project and show me the errors"

→ Uses xcode_build with automatic error extraction
→ Returns up to 10 errors for quick fixes
→ 87% less tokens than old architecture!
```

**Scenario 2: Rapid development - build and run**

```
Enable: xc-build + xc-launch (~1000 tokens)

"Build and run MyApp on iPhone 15"

→ Claude orchestrates: build (xc-build) → install & launch (xc-launch)
→ Composable two-server workflow
→ Better error recovery (retry individual steps)
→ Perfect for iterative development
```

**Scenario 3: Testing UI flows (app already built)**

```
Enable: xc-interact (~900 tokens)

"Tap the Login button, then check if the profile screen appears"

→ Queries accessibility tree (3-4x faster than screenshots)
→ Taps elements by coordinates
→ Validates UI state without rebuilding
```

**Scenario 4: AI-driven UI iteration**

```
Enable: xc-ai-assist (~1400 tokens)

"Update the button color to blue, rebuild, and show me a screenshot"

→ Modifies code, builds, captures screenshot
→ Complete workflow in one MCP
→ Includes visual feedback (screenshots)
```

## Architecture

### Modular MCP Design

```
┌─────────────────────────────────────────────────────┐
│  Shared Tool Library (24 tools)                     │
│  ├─ Xcode (6): build, build+run, clean, test, list, version │
│  ├─ Simulator (12): boot, install, screenshot, etc.│
│  └─ IDB (6): describe, tap, input, gesture, etc.   │
└─────────────────────────────────────────────────────┘
         ↓ Tools imported by MCP servers ↓
┌─────────────────────────────────────────────────────┐
│  8 Workflow-Specific MCP Servers                    │
│  ├─ xc-build:            3 tools   (~600 tokens)   │
│  ├─ xc-launch:           2 tools   (~400 tokens)   │
│  ├─ xc-interact:         6 tools   (~900 tokens)   │
│  ├─ xc-ai-assist:        7 tools   (~1400 tokens)  │
│  ├─ xc-setup:            5 tools   (~800 tokens)   │
│  ├─ xc-testing:          6 tools   (~1200 tokens)  │
│  ├─ xc-meta:             6 tools   (~700 tokens)   │
│  └─ xc-all:              24 tools  (~3500 tokens)  │
└─────────────────────────────────────────────────────┘
```

### Key Benefits

**For Users:**

- Enable only what you need (300-3500 tokens)
- Clear mental model (workflow-based naming)
- No tool duplication confusion
- Easy to toggle on/off in Claude settings

**For Developers:**

- Single source of truth (shared tools)
- Easy testing (isolated functions)
- Simple maintenance (update once)
- Type-safe throughout (zero `any` usage)

## MCP Server Reference

### 🔥 Surgical MCPs

| MCP             | Tools | Token Cost | Use When                                               |
| ---------------------- | ----- | ---------- | ------------------------------------------------------ |
| **xc-build**           | 3     | ~600       | Build validation with clean/scheme discovery            |
| **xc-launch**          | 2     | ~400       | Simulator lifecycle: install and launch app            |
| **xc-interact**        | 6     | ~900       | Testing UI flows with app already built                |

### 📦 Core Workflow MCPs

| MCP              | Tools | Token Cost | Use When                                      |
| ---------------- | ----- | ---------- | --------------------------------------------- |
| **xc-ai-assist** | 7     | ~1400      | AI UI iteration with visual feedback          |
| **xc-setup**     | 5     | ~800       | Initial setup, environment validation         |
| **xc-testing**   | 6     | ~1200      | Running test suites + UI automation           |
| **xc-meta**      | 6     | ~700       | Maintenance, housekeeping, environment checks |

### 🚀 Full Access

| MCP       | Tools | Token Cost | Use When                             |
| --------- | ----- | ---------- | ------------------------------------ |
| **xc-all** | 23    | ~3500      | Complex workflows needing everything |

**Pro tip**: Don't enable multiple MCPs simultaneously - tool duplication will increase token usage! Use xc-all instead for multi-workflow sessions.

## Cheat Sheet - Which Tools Are in Which MCP?

Quick reference to find which MCP has the tools you need:

### Xcode Tools

| Tool | xc-build | xc-launch | xc-interact | xc-ai-assist | xc-setup | xc-testing | xc-meta | xc-all |
|------|:--------:|:---------:|:-----------:|:------------:|:--------:|:----------:|:-------:|:------:|
| `xcode_build` | ✅ | | | ✅ | | | | ✅ |
| `xcode_build_and_launch` | | | | | | | | ✅ |
| `xcode_clean` | ✅ | | | | | | ✅ | ✅ |
| `xcode_test` | | | | | | ✅ | | ✅ |
| `xcode_list` | ✅ | | | | | | ✅ | ✅ |
| `xcode_version` | | | | | ✅ | | ✅ | ✅ |

### Simulator Tools

| Tool | xc-build | xc-launch | xc-interact | xc-ai-assist | xc-setup | xc-testing | xc-meta | xc-all |
|------|:--------:|:---------:|:-----------:|:------------:|:--------:|:----------:|:-------:|:------:|
| `simulator_list` | | | | | ✅ | | | ✅ |
| `simulator_boot` | | | | | ✅ | | | ✅ |
| `simulator_shutdown` | | | | | | | ✅ | ✅ |
| `simulator_create` | | | | | ✅ | | | ✅ |
| `simulator_delete` | | | | | | | ✅ | ✅ |
| `simulator_install_app` | | ✅ | | | | | | ✅ |
| `simulator_launch_app` | | ✅ | | | | | | ✅ |
| `simulator_terminate_app` | | | | | | | | ✅ |
| `simulator_screenshot` | | | | ✅ | | ✅ | | ✅ |
| `simulator_openurl` | | | | | | | | ✅ |
| `simulator_get_app_container` | | | | | | | | ✅ |
| `simulator_health_check` | | | | | ✅ | | ✅ | ✅ |

### IDB Tools

| Tool | xc-build | xc-launch | xc-interact | xc-ai-assist | xc-setup | xc-testing | xc-meta | xc-all |
|------|:--------:|:---------:|:-----------:|:------------:|:--------:|:----------:|:-------:|:------:|
| `idb_describe` | | | ✅ | ✅ | | ✅ | | ✅ |
| `idb_tap` | | | ✅ | ✅ | | ✅ | | ✅ |
| `idb_input` | | | ✅ | ✅ | | ✅ | | ✅ |
| `idb_gesture` | | | ✅ | | | ✅ | | ✅ |
| `idb_find_element` | | | ✅ | ✅ | | | | ✅ |
| `idb_check_quality` | | | ✅ | ✅ | | | | ✅ |

## Tool Library (24 Total)

### Xcode Tools (6)

- `xcode_build` - Build with automatic error extraction
- `xcode_build_and_launch` - Build, install, and launch on simulator
- `xcode_clean` - Clean build artifacts
- `xcode_test` - Run XCTest suites
- `xcode_list` - List schemes/targets
- `xcode_version` - Check Xcode installation

### Simulator Tools (12)

- `simulator_list` - Enumerate simulators
- `simulator_boot` - Boot device
- `simulator_shutdown` - Shutdown device
- `simulator_create` - Create new simulator
- `simulator_delete` - Delete simulator
- `simulator_install_app` - Install app
- `simulator_launch_app` - Launch app
- `simulator_terminate_app` - Terminate app
- `simulator_screenshot` - Capture screenshot
- `simulator_openurl` - Open URL/deep link
- `simulator_get_app_container` - Get app container path
- `simulator_health_check` - Validate environment

### IDB Tools (6)

- `idb_describe` - Query accessibility tree (accessibility-first!)
- `idb_tap` - Tap coordinates
- `idb_input` - Type text or press keys
- `idb_gesture` - Swipes and hardware buttons
- `idb_find_element` - Search by label (semantic)
- `idb_check_quality` - Assess accessibility data richness

## Configuring Your Project

Add this section to your project's `.claude/CLAUDE.md` file. This guides Claude on when and why to use the xclaude-plugin tools instead of directly calling Xcode or shell commands:

```markdown
## xclaude-plugin: Why and When to Use These Tools

The xclaude-plugin provides 8 modular MCPs with 24 specialized iOS tools. **Always prefer these over raw `xcodebuild` or shell commands** for iOS development tasks. Here's why:

### Why These Tools Trump Raw Commands

| Task                 | Direct Bash                                                    | xclaude-plugin                   | Why Plugin Wins                                                           |
| -------------------- | -------------------------------------------------------------- | -------------------------------- | ------------------------------------------------------------------------- |
| Build + get errors   | `xcodebuild -scheme Foo 2>&1` (50+ lines of parsing)           | `xcode_build` tool               | Auto-extracts up to 10 errors, structured JSON, 87% fewer tokens          |
| Test suite execution | `xcodebuild test` + manual parsing                             | `xcode_test` tool                | Parses results, reports failures, timing, code coverage                   |
| Simulator screenshot | `xcrun simctl io booted screenshot /tmp/x.png` + file handling | `simulator_screenshot` tool      | Auto-saves, encoded output, accessible in response                        |
| UI automation        | Manual coordinate finding + shell taps                         | `idb_describe` + `idb_tap` tools | Queries accessibility tree (120ms), semantic element finding, 3-4x faster |
| App installation     | `xcrun simctl install booted App.app`                          | `simulator_install_app` tool     | Builds, finds app, installs, validates—one command                        |

### When to Use Each MCP

**Use `xc-build`** (~600 tokens) when:

- Building and fixing errors
- Need to clean build artifacts
- Discovering schemes/targets in project
- Build validation and configuration

**Use `xc-launch`** (~400 tokens) when:

- Installing and launching an app on the simulator

**Use `xc-interact`** (~900 tokens) when:

- Testing UI flows with app already built
- Automating screen validation without code changes
- Need accessibility-first element querying

**Use `xc-ai-assist`** (~1400 tokens) when:

- Iterating on UI with live feedback (code change → screenshot)
- Need visual validation of changes
- Combining code modification with testing

**Use `xc-testing`** (~1200 tokens) when:

- Running test suites and analyzing results
- Need both unit tests and UI automation
- Debugging test failures

**Use `xc-setup`** (~800 tokens) when:

- First-time environment validation
- Checking Xcode/simulator health
- Discovering project structure (schemes, targets)

**Use `xc-meta`** (~700 tokens) when:

- Maintenance tasks (clearing derived data, managing simulators)
- Non-coding iOS project operations
- Environment housekeeping

**Use `xc-all`** (~3500 tokens) when:

- Complex workflows requiring multiple tool categories
- Don't know which single MCP fits the task
- Need flexibility to pivot between workflows

### Critical: Prefer Plugin Tools Over Bash

When you encounter a task that could use either approach, **always choose the plugin tool**.

**Don't do this:**


# Manual build parsing
> `xcodebuild -scheme MyApp 2>&1 | grep -A5 "error:" | sed ...`


**Do this instead:** Use the `xcode_build` tool from `xc-build` MCP.

---

**Don't do this:**


# Manual screenshot saving
> `xcrun simctl io booted screenshot /tmp/screenshot.png`
> `cat /tmp/screenshot.png | base64`


**Do this instead:** Use the `simulator_screenshot` tool from `xc-interact` MCP.

---

**Don't do this:**


# Finding UI elements by trial and error
> `xcrun simctl spawn booted launchctl list | grep bundleid`


**Do this instead:** Use `idb_describe` tool to query accessibility tree, then `idb_tap` to interact.

### When Bash IS Still Appropriate

Use Bash for tasks outside iOS development:

- File operations: `mkdir`, `cp`, `rm`, `ls`
- Version control: `git status`, `git diff`, `git commit`
- General scripting: `jq`, `sed`, `awk`
- Environment setup: `npm install`, `brew install`

**Never use Bash for iOS-specific tasks** when a plugin tool exists.
```

## Simulator Configuration

xclaude-plugin automatically tracks your simulator usage and supports configuration files for default simulators.

### Config File Locations

**Project-level** (recommended for team consistency):
```bash
# .xcplugin in your project root
{
  "defaultSimulator": "platform=iOS Simulator,name=iPhone 15",
  "maxRecentHistory": 10
}
```

**User-level** (personal defaults across all projects):
```bash
# ~/.xcplugin/config.json
{
  "defaultSimulator": "platform=iOS Simulator,name=iPhone 15 Pro",
  "maxRecentHistory": 10
}
```

**Precedence**: Project config overrides user config.

### How It Works

1. **Auto-resolution**: Partial destinations like `"platform=iOS Simulator,name=iPhone 15"` automatically resolve to the latest OS version available
2. **Usage tracking**: Every build/test automatically tracks which simulators you use
3. **Smart defaults**: When no config exists, the plugin remembers your most recent simulator

### Destination Format

The `xcode_build` and `xcode_test` tools accept three destination formats:

```bash
# 1. Auto-resolve (recommended) - finds latest OS automatically
"platform=iOS Simulator,name=iPhone 15"

# 2. Explicit - specify exact OS version
"platform=iOS Simulator,name=iPhone 15,OS=18.0"

# 3. UDID - direct device identifier
"id=ABC-123-DEF-456"
```

### Quick Setup

1. **Create a config file** (choose one):
   ```bash
   # Project-level
   echo '{"defaultSimulator": "platform=iOS Simulator,name=iPhone 15"}' > .xcplugin

   # User-level
   mkdir -p ~/.xcplugin
   echo '{"defaultSimulator": "platform=iOS Simulator,name=iPhone 15"}' > ~/.xcplugin/config.json
   ```

2. **Find your available simulators**:
   ```bash
   xcrun simctl list devices available
   ```

3. **Use the `simulator_list` tool** to see your devices:
   ```
   Ask Claude: "Show me available simulators"
   ```

### Example Config

See `.xcplugin.example` in the plugin directory for a complete example.


## Enable Minimal MCPs for Token Efficiency

- **Token efficiency**: xc-build (~600 tokens) is 83% cheaper than xc-all (3500 tokens)
- **Mental clarity**: Focused tools per workflow phase
- **Composable workflows**: Enable xc-build + xc-launch together (~1000 tokens) for development loop

**Guidelines:**
- **Single workflow**: Enable one focused MCP (e.g., xc-interact for UI testing only)
- **Development loop**: Enable xc-build + xc-launch together for build → install → launch
- **Complex workflows**: Enable xc-all when you need multiple capabilities simultaneously


## Development

### Building from Source

```bash
# Clone repository
git clone https://github.com/conorluddy/xclaude-plugin.git
cd xclaude-plugin

# Install dependencies
npm install

# Build MCP server
npm run build

# Test locally
/plugin marketplace add /path/to/xclaude-plugin
/plugin install xclaude-plugin
```

### Project Structure

```
xclaude-plugin/
├── .claude-plugin/
│   ├── plugin.json           # Plugin manifest (8 MCP servers)
│   └── marketplace.json      # Marketplace configuration
├── mcp-servers/                   # 8 modular MCP servers
│   ├── shared/                    # Shared tool library (24 tools)
│   │   ├── tools/                 # Tool implementations
│   │   ├── types/                 # Shared type definitions
│   │   └── utils/                 # Command execution utilities
│   ├── xc-build/                  # MCP 1: Build validation
│   ├── xc-launch/                 # MCP 2: Simulator lifecycle (install + launch)
│   ├── xc-interact/               # MCP 3: Pure UI interaction
│   ├── xc-ai-assist/              # MCP 4: AI UI automation
│   ├── xc-setup/                  # MCP 5: Environment setup
│   ├── xc-testing/                # MCP 6: Test execution
│   ├── xc-meta/                   # MCP 7: Maintenance
│   └── xc-all/                    # MCP 8: Full toolkit
├── skills/                   # 8 Skills (markdown + YAML)
│   ├── xcode-workflows/
│   ├── simulator-workflows/
│   ├── ui-automation-workflows/
│   ├── accessibility-testing/
│   ├── ios-testing-patterns/
│   ├── crash-debugging/
│   ├── performance-profiling/
│   └── state-management/
└── README.md
```

## Design Philosophy

### Modular Token Efficiency

Enable only what you need. Ultra-minimal MCPs (300 tokens) for focused tasks, comprehensive MCPs (3500 tokens) for complex workflows. 87% token reduction for surgical operations.

### Accessibility-First UI Automation

Query accessibility tree (120ms, ~50 tokens) before screenshots (2000ms, ~170 tokens). 3-4x faster, 80% cheaper, more reliable across theme changes.

### Single Source of Truth

24 tools defined once in shared library, imported by 8 MCPs. Update once, benefit everywhere. Type-safe with zero `any` usage.

### Workflow-Based Organization

MCPs named by developer workflow phase, not technology domain. xc-build for build validation, xc-setup for environment, xc-all for complex sessions.

## Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - See [LICENSE](LICENSE) for details

## Support

- 🐛 [Report issues](https://github.com/conorluddy/xclaude-plugin/issues)
- 💬 [Discussions](https://github.com/conorluddy/xclaude-plugin/discussions)
- 📖 [Documentation](https://github.com/conorluddy/xclaude-plugin/wiki)

---

**Complete iOS development automation for Claude Code** 🚀
