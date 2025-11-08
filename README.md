# xClaude Plugin

```
/plugin marketplace add conorluddy/xclaude-plugin
```

**Modular iOS development automation for Claude Code**

Build, test, and automate iOS apps through natural conversation with Claude. 8 workflow-specific MCP servers with 22 tools across Xcode, Simulator, and IDB.

Tools are grouped into MCPs - you enable the ones you're currently need and disable others to optimise context. I still need to revise and optimise the groupings.

<img width="1278" height="407" alt="Screenshot 2025-11-08 at 10 44 28" src="https://github.com/user-attachments/assets/ff1c0a09-f29d-4a86-a280-97b3bbc8c635" />

## Features

### 🎯 Modular Architecture

- **8 workflow-specific MCP servers** (300-3500 tokens each)
- **Enable only what you need** - Ultra-minimal to full-featured
- **22 shared tools** across Xcode, Simulator, and IDB
- **Single source of truth** - tools defined once, imported by MCPs

### 🔥 Surgical MCPs (Ultra-Focused)

- **xc-compile** (~300 tokens) - Just build with error extraction
- **xc-interact** (~900 tokens) - Pure UI interaction, no build

### 📦 Core Workflow MCPs

- **xc-build** (~600 tokens) - Build validation with clean/scheme discovery
- **xc-ai-assist** (~1400 tokens) - Build + UI automation + screenshots
- **xc-setup** (~800 tokens) - Environment configuration and validation
- **xc-testing** (~1200 tokens) - Test execution + UI flows
- **xc-meta** (~700 tokens) - Project maintenance and housekeeping

### 🚀 Full Access

- **xc-hybrid** (~3500 tokens) - All 22 tools for complex workflows

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

## Requirements

- macOS 13.0+ or Linux
- Xcode 15.0+ (macOS only, for iOS development)
- Node.js 18+
- Optional: IDB (Facebook iOS Development Bridge) for advanced UI automation

## Quick Start

### Enable the Right MCP for Your Task

**IMPORTANT**: Enable **ONE MCP at a time** for optimal token efficiency. Choose based on your current workflow:

```
☐ xc-compile        # Just fixing compilation errors? (~300 tokens)
☐ xc-interact       # Testing UI with app already built? (~900 tokens)
☐ xc-build          # Need clean/scheme discovery too? (~600 tokens)
☐ xc-ai-assist      # AI-driven UI iteration? (~1400 tokens)
☐ xc-setup          # First time setup? (~800 tokens)
☐ xc-testing        # Running test suites? (~1200 tokens)
☐ xc-meta           # Maintenance tasks? (~700 tokens)
☐ xc-hybrid         # Complex workflow needing everything? (~3500 tokens)
```

### Example Workflows

**Scenario 1: Rapid compilation fixes**

```
Enable: xc-compile (~300 tokens)

"Build the project and show me the errors"

→ Uses xcode_build with automatic error extraction
→ Returns up to 10 errors for quick fixes
→ 87% less tokens than old architecture!
```

**Scenario 2: Testing UI flows (app already built)**

```
Enable: xc-interact (~900 tokens)

"Tap the Login button, then check if the profile screen appears"

→ Queries accessibility tree (3-4x faster than screenshots)
→ Taps elements by coordinates
→ Validates UI state without rebuilding
```

**Scenario 3: AI-driven UI iteration**

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
│  Shared Tool Library (22 tools)                     │
│  ├─ Xcode (5): build, clean, test, list, version   │
│  ├─ Simulator (12): boot, install, screenshot, etc.│
│  └─ IDB (6): describe, tap, input, gesture, etc.   │
└─────────────────────────────────────────────────────┘
         ↓ Tools imported by MCP servers ↓
┌─────────────────────────────────────────────────────┐
│  8 Workflow-Specific MCP Servers                    │
│  ├─ xc-compile:     1 tool    (~300 tokens)        │
│  ├─ xc-interact:    6 tools   (~900 tokens)        │
│  ├─ xc-build:       3 tools   (~600 tokens)        │
│  ├─ xc-ai-assist:   7 tools   (~1400 tokens)       │
│  ├─ xc-setup:       5 tools   (~800 tokens)        │
│  ├─ xc-testing:     6 tools   (~1200 tokens)       │
│  ├─ xc-meta:        6 tools   (~700 tokens)        │
│  └─ xc-hybrid:      23 tools  (~3500 tokens)       │
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
| --------------- | ----- | ---------- | ------------------------------------------------------ |
| **xc-compile**  | 1     | ~300       | Tight code→build→fix loops, just need error extraction |
| **xc-interact** | 6     | ~900       | Testing UI flows with app already built                |

### 📦 Core Workflow MCPs

| MCP              | Tools | Token Cost | Use When                                      |
| ---------------- | ----- | ---------- | --------------------------------------------- |
| **xc-build**     | 3     | ~600       | Build validation + clean + scheme discovery   |
| **xc-ai-assist** | 7     | ~1400      | AI UI iteration with visual feedback          |
| **xc-setup**     | 5     | ~800       | Initial setup, environment validation         |
| **xc-testing**   | 6     | ~1200      | Running test suites + UI automation           |
| **xc-meta**      | 6     | ~700       | Maintenance, housekeeping, environment checks |

### 🚀 Full Access

| MCP           | Tools | Token Cost | Use When                             |
| ------------- | ----- | ---------- | ------------------------------------ |
| **xc-hybrid** | 23    | ~3500      | Complex workflows needing everything |

**Pro tip**: Don't enable multiple MCPs simultaneously - tool duplication will increase token usage! Use xc-hybrid instead for multi-workflow sessions.

## Tool Library (22 Total)

### Xcode Tools (5)

- `xcode_build` - Build with automatic error extraction
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

The xclaude-plugin provides 8 modular MCPs with 22 specialized iOS tools. **Always prefer these over raw `xcodebuild` or shell commands** for iOS development tasks. Here's why:

### Why These Tools Trump Raw Commands

| Task                 | Direct Bash                                                    | xclaude-plugin                   | Why Plugin Wins                                                           |
| -------------------- | -------------------------------------------------------------- | -------------------------------- | ------------------------------------------------------------------------- |
| Build + get errors   | `xcodebuild -scheme Foo 2>&1` (50+ lines of parsing)           | `xcode_build` tool               | Auto-extracts up to 10 errors, structured JSON, 87% fewer tokens          |
| Test suite execution | `xcodebuild test` + manual parsing                             | `xcode_test` tool                | Parses results, reports failures, timing, code coverage                   |
| Simulator screenshot | `xcrun simctl io booted screenshot /tmp/x.png` + file handling | `simulator_screenshot` tool      | Auto-saves, encoded output, accessible in response                        |
| UI automation        | Manual coordinate finding + shell taps                         | `idb_describe` + `idb_tap` tools | Queries accessibility tree (120ms), semantic element finding, 3-4x faster |
| App installation     | `xcrun simctl install booted App.app`                          | `simulator_install_app` tool     | Builds, finds app, installs, validates—one command                        |

### When to Use Each MCP

**Use `xc-compile`** (~300 tokens) when:

- Fixing build failures in tight code→compile→fix loops
- Just need error extraction without full project context
- Token budget is critical

**Use `xc-interact`** (~900 tokens) when:

- Testing UI flows with app already built
- Automating screen validation without code changes
- Need accessibility-first element querying

**Use `xc-build`** (~600 tokens) when:

- Need build + scheme discovery + clean operations
- Validating build configuration
- One step beyond xc-compile

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

**Use `xc-hybrid`** (~3500 tokens) when:

- Complex workflows requiring multiple tool categories
- Don't know which single MCP fits the task
- Need flexibility to pivot between workflows

### Critical: Prefer Plugin Tools Over Bash

When you encounter a task that could use either approach, **always choose the plugin tool**.

**Don't do this:**


# Manual build parsing
> `xcodebuild -scheme MyApp 2>&1 | grep -A5 "error:" | sed ...`


**Do this instead:** Use the `xcode_build` tool from `xc-compile` MCP.

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


## Why Enable ONE MCP at a Time

- **Token efficiency**: xc-compile is 87% cheaper than loading all 22 tools
- **Mental clarity**: One focused set of tools per workflow phase
- **No duplication**: Multiple MCPs would provide duplicate tools

Switch MCPs as your workflow changes. If you find yourself needing tools from multiple MCPs, use `xc-hybrid` instead.


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
├── mcp-servers/              # 8 modular MCP servers
│   ├── shared/               # Shared tool library (22 tools)
│   │   ├── tools/            # Tool implementations
│   │   ├── types/            # Shared type definitions
│   │   └── utils/            # Command execution utilities
│   ├── xc-compile/           # MCP 1: Ultra-minimal build
│   ├── xc-interact/          # MCP 2: Pure UI interaction
│   ├── xc-build/             # MCP 3: Build validation
│   ├── xc-ai-assist/         # MCP 4: AI UI automation
│   ├── xc-setup/             # MCP 5: Environment setup
│   ├── xc-testing/           # MCP 6: Test execution
│   ├── xc-meta/              # MCP 7: Maintenance
│   └── xc-hybrid/            # MCP 8: Full toolkit
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

22 tools defined once in shared library, imported by 8 MCPs. Update once, benefit everywhere. Type-safe with zero `any` usage.

### Workflow-Based Organization

MCPs named by developer workflow phase, not technology domain. xc-compile for rapid iteration, xc-setup for environment, xc-hybrid for complex sessions.

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
