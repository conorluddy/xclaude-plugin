# xc-plugin

**Token-efficient iOS development automation for Claude Code**

88% reduction in context overhead (18.7k → 2.2k tokens) while maintaining full iOS development capabilities.

## Features

### 🎯 Minimal Token Overhead
- **At rest: ~2.2k tokens** (1.1% of context)
- **In use: ~10k tokens** (still 45% less than xc-mcp at rest)
- 88% token reduction through strategic architecture

### 🛠️ 3 MCP Dispatchers (~1.2k tokens)
- **execute_xcode_command** - xcodebuild operations (build, test, clean, list)
- **execute_simulator_command** - simctl device/app management
- **execute_idb_command** - IDB UI automation and accessibility

### 📚 8 Procedural Skills (~320 tokens metadata, loaded on-demand)
- **xcode-workflows** - Build system guidance and result analysis
- **simulator-workflows** - Device and app lifecycle management
- **ui-automation-workflows** - Accessibility-first automation patterns
- **accessibility-testing** - WCAG compliance and quality checks
- **ios-testing-patterns** - Test execution and flaky test detection
- **crash-debugging** - Crash log analysis and symbolication
- **performance-profiling** - Instruments integration and optimization
- **state-management** - Cache and configuration guidance

### 📖 MCP Resources (0 tokens at rest, loaded on-demand)
- Operation references for all commands
- Build settings dictionary
- Error code lookup
- Device specifications
- Accessibility tree documentation

## Installation

### From GitHub (Recommended)

```bash
/plugin marketplace add conorluddy/xc-plugin
/plugin install xc-plugin
```

### From Local Development

```bash
/plugin marketplace add /path/to/xc-plugin
/plugin install xc-plugin
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
→ Returns summary (~300 tokens) with cache ID for detailed logs
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
→ First tries idb-ui-describe (fast, 50 tokens)
→ Finds element via accessibility tree
→ execute_idb_command to tap coordinates
→ Fallback to screenshot only if needed
```

## Architecture

### Token Efficiency Strategy

```
┌─────────────────────────────────────────┐
│   At Rest: ~2,220 tokens (88% reduction)│
├─────────────────────────────────────────┤
│  MCP Dispatchers (3)        1,200 tokens│
│  Skill Metadata (8)           320 tokens│
│  Resource Catalog             500 tokens│
│  Server Overhead              200 tokens│
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│   In Use: Skills + Resources load on-demand│
├─────────────────────────────────────────┤
│  Base overhead              2,220 tokens│
│  Active Skill (1 loaded)   +6,000 tokens│
│  Resource query (1)        +2,000 tokens│
│  Total active usage        ~10,220 tokens│
└─────────────────────────────────────────┘
```

### Why This Architecture?

**MCP Tools** = System command execution (must be tools)
- execute_xcode_command → `xcodebuild`, `xcodebuild-test`
- execute_simulator_command → `xcrun simctl`
- execute_idb_command → `idb`

**Skills** = Procedural knowledge (loaded on-demand)
- WHEN to use operations
- HOW to interpret results
- WHAT parameters to use
- Progressive disclosure: metadata only (~40 tokens) until activated

**Resources** = Reference documentation (0 tokens until queried)
- Operation parameters
- Error codes
- Device specs
- Only loaded when Claude requests them

## Token Comparison

| Architecture | At Rest | Active Use | Reduction |
|--------------|---------|------------|-----------|
| xc-mcp (28 tools) | 18,700 | 18,700 | baseline |
| xc-plugin | 2,220 | ~10,220 | **88%** |

## From xc-mcp to xc-plugin

### What Changed?

- ✅ All 28 operations still available
- ✅ Same underlying command execution
- ✅ File-based processing preserved
- ✅ Progressive disclosure enhanced
- ✨ 88% token reduction
- ✨ Skills add procedural guidance
- ✨ Resources provide on-demand docs

### Migration

No code changes needed! xc-plugin is a drop-in replacement:
- Same operations, different structure
- Dispatchers route to familiar logic
- Skills enhance (don't replace) functionality

## Development

### Building from Source

```bash
# Clone repository
git clone https://github.com/conorluddy/xc-plugin.git
cd xc-plugin

# Install dependencies
npm install

# Build MCP server
npm run build

# Test locally
/plugin marketplace add /path/to/xc-plugin
/plugin install xc-plugin
```

### Project Structure

```
xc-plugin/
├── .claude-plugin/
│   ├── plugin.json           # Plugin manifest
│   └── marketplace.json      # Marketplace configuration
├── mcp-server/               # MCP server (TypeScript/Node.js)
│   ├── src/
│   │   ├── index.ts          # Main entry point
│   │   ├── dispatchers/      # 3 dispatcher implementations
│   │   ├── resources/        # MCP resources (on-demand docs)
│   │   └── utils/            # Shared utilities from xc-mcp
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

## Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - See [LICENSE](LICENSE) for details

## Acknowledgments

Built on the foundation of [xc-mcp](https://github.com/conorluddy/xc-mcp) with token efficiency as the primary design goal.

## Support

- 🐛 [Report issues](https://github.com/conorluddy/xc-plugin/issues)
- 💬 [Discussions](https://github.com/conorluddy/xc-plugin/discussions)
- 📖 [Documentation](https://github.com/conorluddy/xc-plugin/wiki)

---

**Token-efficient iOS automation for Claude Code** 🚀
