# xclaude-plugin

**Complete iOS development automation for Claude Code**

Build, test, and automate iOS apps through natural conversation with Claude. Full Xcode, Simulator, and UI automation capabilities with minimal context overhead.

## Features

### 🎯 Token-Efficient Architecture
- **At rest: ~2.2k tokens** (1% of Claude's context window)
- **Active use: ~10k tokens** with skills and resources loaded
- Progressive disclosure keeps context clean while maintaining full functionality

### 🛠️ 3 MCP Dispatchers
- **execute_xcode_command** - Build, test, clean, list projects
- **execute_simulator_command** - Device and app lifecycle management
- **execute_idb_command** - UI automation and accessibility testing

### 📚 8 Procedural Skills (Loaded On-Demand)
- **xcode-workflows** - Build system guidance and result analysis
- **simulator-workflows** - Device and app lifecycle patterns
- **ui-automation-workflows** - Accessibility-first automation
- **accessibility-testing** - WCAG compliance and quality checks
- **ios-testing-patterns** - Test execution and flaky test detection
- **crash-debugging** - Crash log analysis and symbolication
- **performance-profiling** - Instruments integration
- **state-management** - Cache and configuration management

### 📖 MCP Resources (On-Demand Documentation)
- Operation references for all commands
- Build settings dictionary
- Error code lookup
- Device specifications
- Accessibility tree documentation

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

### Building an iOS App

```
Build my iOS app for the simulator

→ Claude uses execute_xcode_command with xcode-workflows Skill
→ Automatically detects project, selects scheme, builds
→ Returns concise summary with full logs available via cache ID
```

### Running Tests

```
Run the tests and analyze any failures

→ Claude uses execute_xcode_command + ios-testing-patterns Skill
→ Executes tests, analyzes results
→ Identifies flaky tests, provides failure summaries
```

### UI Automation (Accessibility-First)

```
Tap the "Login" button on the simulator

→ Claude uses ui-automation-workflows Skill
→ Queries accessibility tree (fast, minimal tokens)
→ Finds element and taps coordinates
→ Falls back to screenshot only if needed
```

## Architecture

### Progressive Disclosure Design

```
┌─────────────────────────────────────────┐
│   At Rest: ~2,220 tokens                │
├─────────────────────────────────────────┤
│  MCP Dispatchers (3)        1,200 tokens│
│  Skill Metadata (8)           320 tokens│
│  Resource Catalog             500 tokens│
│  Server Overhead              200 tokens│
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│   Active Use: On-Demand Loading         │
├─────────────────────────────────────────┤
│  Base overhead              2,220 tokens│
│  Active Skill (1 loaded)   +6,000 tokens│
│  Resource query (1)        +2,000 tokens│
│  Total active usage        ~10,220 tokens│
└─────────────────────────────────────────┘
```

### Three-Layer Architecture

**MCP Tools** = System command execution
- `execute_xcode_command` → xcodebuild, swift build
- `execute_simulator_command` → xcrun simctl
- `execute_idb_command` → IDB (iOS Development Bridge)

**Skills** = Procedural knowledge (on-demand)
- WHEN to use operations
- HOW to interpret results
- WHAT parameters to use
- Load only when relevant to user's request

**Resources** = Reference documentation (on-demand)
- Operation parameters
- Error codes
- Device specifications
- Load only when Claude requests them

## Operations

### Xcode Operations (5)
- **build** - Compile projects with configuration options
- **test** - Run test suites with result parsing
- **clean** - Remove build artifacts
- **list** - Enumerate schemes and targets
- **version** - Check Xcode installation

### Simulator Operations (8)
- **device-lifecycle** - Boot, shutdown, create, delete, erase, clone
- **app-lifecycle** - Install, uninstall, launch, terminate apps
- **io** - Screenshot capture, video recording
- **push** - Simulate push notifications
- **openurl** - Open URLs and deep links
- **list** - Enumerate available simulators
- **health-check** - Validate development environment
- **get-app-container** - Retrieve app container paths

### IDB Operations (9)
- **tap** - Tap at coordinates
- **input** - Type text, press keys, key sequences
- **gesture** - Swipe gestures, hardware buttons
- **describe** - Query accessibility tree
- **find-element** - Search UI elements by label
- **app** - Install, launch, terminate via IDB
- **list-apps** - Enumerate installed apps
- **check-accessibility** - Assess accessibility data quality
- **targets** - Manage IDB connections

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
│   ├── plugin.json           # Plugin manifest
│   └── marketplace.json      # Marketplace configuration
├── mcp-server/               # MCP server (TypeScript/Node.js)
│   ├── src/
│   │   ├── index.ts          # Main entry point
│   │   ├── dispatchers/      # 3 dispatcher implementations
│   │   ├── resources/        # MCP resources (on-demand docs)
│   │   └── utils/            # Shared utilities
│   └── dist/                 # Compiled JavaScript
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

### Token Efficiency
Designed from the ground up for minimal context usage. The 3-dispatcher architecture groups operations semantically, while Skills and Resources use progressive disclosure to load documentation only when needed.

### Accessibility-First
UI automation prioritizes accessibility tree queries (fast, minimal tokens) before falling back to screenshots (slow, token-heavy). This approach is 3-4x faster and more reliable.

### Smart Defaults
Auto-detection and intelligent defaults reduce configuration burden. Claude can often infer project paths, scheme names, and device selections without explicit parameters.

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
