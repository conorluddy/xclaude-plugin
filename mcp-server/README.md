# xclaude-plugin MCP Server

**Token-efficient iOS development automation via Model Context Protocol (MCP)**

A consolidated MCP server that provides iOS development automation through three powerful dispatchers: Xcode operations, Simulator control, and IDB UI automation. Designed for maximal functionality with minimal token overhead (~2.2k at rest vs xc-mcp's 18.7k).

## Features

### 🔨 Xcode Operations

- **Build**: Compile projects with smart configuration defaults
- **Clean**: Clear build artifacts
- **Test**: Run test suites with result summaries
- **List**: Query project schemes and targets (cached)
- **Version**: Check Xcode installation details

### 📱 Simulator Control

- **Device Lifecycle**: Boot, shutdown, create, delete, erase, clone simulators
- **App Lifecycle**: Install, uninstall, launch, terminate apps
- **IO Operations**: Capture screenshots, record video
- **Push Notifications**: Simulate push notifications with JSON payloads
- **URL Handling**: Open URLs and deep links
- **Container Access**: Retrieve app container filesystem paths
- **List & Health**: Enumerate simulators, check development environment

### 🤖 UI Automation (IDB)

- **Accessibility-First**: Query UI hierarchy 3-4x faster than screenshots
- **Tap Automation**: Precise coordinate-based tapping
- **Text Input**: Type text, press keys, execute key sequences
- **Gestures**: Swipe gestures and hardware button presses (HOME, LOCK, SIRI)
- **Element Finding**: Search UI elements by label/identifier
- **App Management**: Install, uninstall, launch, terminate via IDB
- **Target Management**: List and describe IDB targets
- **Quality Assessment**: Evaluate accessibility data sufficiency

## Installation

### Prerequisites

1. **macOS** with Xcode Command Line Tools installed
2. **Node.js** v18+ and npm
3. **Xcode** (for xcodebuild and simctl)
4. **IDB** (optional, for UI automation) - [Install IDB](https://fbidb.io/)

### Setup

```bash
# Clone the repository
cd /Users/conor/Development/xclaude-plugin/mcp-server

# Install dependencies
npm install

# Build the project
npm run build

# Verify installation
npm run start
```

## Configuration

### MCP Server Configuration

Add to your Claude Desktop configuration (`~/Library/Application Support/Claude/claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "xclaude-plugin": {
      "command": "node",
      "args": ["/Users/conor/Development/xclaude-plugin/mcp-server/dist/index.js"]
    }
  }
}
```

### Environment Setup

The server requires:

- Xcode Command Line Tools: `xcode-select --install`
- Simulator access: `xcrun simctl list` should work
- (Optional) IDB installed: `brew tap facebook/fb && brew install idb-companion`

## Usage

### Xcode Operations

**Build a project:**

```typescript
{
  "operation": "build",
  "project_path": "/path/to/Project.xcodeproj",
  "scheme": "MyApp",
  "configuration": "Debug",
  "destination": "platform=iOS Simulator,name=iPhone 15"
}
```

**List schemes:**

```typescript
{
  "operation": "list",
  "project_path": "/path/to/Project.xcodeproj"
}
```

### Simulator Control

**Boot a simulator:**

```typescript
{
  "operation": "device-lifecycle",
  "sub_operation": "boot",
  "device_id": "UDID-HERE"
}
```

**Install and launch an app:**

```typescript
// Install
{
  "operation": "app-lifecycle",
  "sub_operation": "install",
  "device_id": "booted",
  "parameters": {
    "app_path": "/path/to/MyApp.app"
  }
}

// Launch
{
  "operation": "app-lifecycle",
  "sub_operation": "launch",
  "app_identifier": "com.example.MyApp"
}
```

**Capture screenshot:**

```typescript
{
  "operation": "io",
  "sub_operation": "screenshot",
  "device_id": "booted",
  "parameters": {
    "output_path": "/tmp/screenshot.png"
  }
}
```

**Send push notification:**

```typescript
{
  "operation": "push",
  "app_identifier": "com.example.MyApp",
  "parameters": {
    "payload": "{\"aps\":{\"alert\":\"Hello World\"}}"
  }
}
```

### IDB UI Automation

**Query accessibility tree (recommended first step):**

```typescript
{
  "operation": "describe",
  "target": "booted",
  "parameters": {
    "operation": "all"
  }
}
```

**Tap at coordinates:**

```typescript
{
  "operation": "tap",
  "target": "booted",
  "parameters": {
    "x": 187,
    "y": 450,
    "duration": 0.1
  }
}
```

**Type text:**

```typescript
{
  "operation": "input",
  "target": "booted",
  "parameters": {
    "text": "Hello World"
  }
}
```

**Swipe gesture:**

```typescript
{
  "operation": "gesture",
  "target": "booted",
  "parameters": {
    "gesture_type": "swipe",
    "start_x": 200,
    "start_y": 400,
    "end_x": 200,
    "end_y": 100,
    "duration": 200
  }
}
```

**Press hardware button:**

```typescript
{
  "operation": "gesture",
  "target": "booted",
  "parameters": {
    "gesture_type": "button",
    "button": "HOME"
  }
}
```

**Find UI element:**

```typescript
{
  "operation": "find-element",
  "target": "booted",
  "parameters": {
    "query": "Login Button"
  }
}
```

**Check accessibility quality:**

```typescript
{
  "operation": "check-accessibility",
  "target": "booted"
}
```

## Architecture

### Three Consolidated Dispatchers

```
xclaude-plugin MCP Server (0.0.1)
├── XcodeDispatcher       → execute_xcode_command
│   ├── build             (5 operations)
│   ├── clean
│   ├── test
│   ├── list
│   └── version
├── SimulatorDispatcher   → execute_simulator_command
│   ├── device-lifecycle  (7 sub-operations)
│   ├── app-lifecycle     (4 sub-operations)
│   ├── io                (2 sub-operations)
│   ├── push
│   ├── openurl
│   ├── list
│   ├── health-check
│   └── get-app-container
└── IDBDispatcher         → execute_idb_command
    ├── tap               (9 operations)
    ├── input
    ├── gesture
    ├── describe
    ├── find-element
    ├── app
    ├── list-apps
    ├── check-accessibility
    └── targets
```

**Token Efficiency**: 3 tools at rest (~2.2k tokens) vs 28 granular tools (~18.7k tokens) = **88% reduction**

### Project Structure

```
mcp-server/
├── src/
│   ├── dispatchers/          # Operation dispatchers
│   │   ├── base.ts           # Base dispatcher class
│   │   ├── xcode.ts          # Xcode operations
│   │   ├── simulator.ts      # Simulator control
│   │   └── idb.ts            # IDB UI automation
│   ├── resources/            # On-demand documentation
│   │   ├── catalog.ts        # Resource registry
│   │   └── content/          # Markdown docs
│   ├── utils/                # Utility functions
│   │   ├── command.ts        # Command execution
│   │   └── logger.ts         # Logging
│   ├── types.ts              # Type definitions
│   ├── constants.ts          # Configuration constants
│   └── index.ts              # MCP server entry point
├── CODESTYLE.md              # Development guidelines
└── package.json
```

## Development

### Building

```bash
npm run build       # Compile TypeScript
npm run watch       # Watch mode
```

### Linting

```bash
npm run lint        # ESLint
npm run typecheck   # TypeScript validation
```

### Code Style

This project follows strict TypeScript guidelines:

- **Zero tolerance** for `any` or `unknown` without justification
- Comprehensive JSDoc for public APIs
- Consistent error handling patterns
- Accessibility-first approach for UI automation

See [CODESTYLE.md](./CODESTYLE.md) for detailed guidelines.

### Contributing

1. Follow code style guidelines in CODESTYLE.md
2. Write tests for new functionality
3. Ensure `npm run build` passes without errors
4. Use conventional commit messages

## Accessibility-First Strategy

For UI automation, **always** query the accessibility tree before resorting to screenshots:

1. **Check quality** (80ms, ~30 tokens) - `check-accessibility`
2. **Query tree** (120ms, ~50 tokens) - `describe`
3. **Find elements** (100ms, ~40 tokens) - `find-element`
4. **Screenshot fallback** (2000ms, ~170 tokens) - only if accessibility insufficient

**Performance**: 3-4x faster, 80% cheaper than screenshot-first approach.

## Troubleshooting

### Common Issues

**"Xcode not found"**

```bash
# Install Command Line Tools
xcode-select --install

# Verify installation
xcodebuild -version
```

**"No simulators available"**

```bash
# Check simulator list
xcrun simctl list

# Boot a simulator
xcrun simctl boot <UDID>
```

**"IDB command not found"**

```bash
# Install IDB
brew tap facebook/fb
brew install idb-companion

# Verify installation
idb list-targets
```

**"Target device not found"**

- Use `"device_id": "booted"` to target the active simulator
- Use `operation: "list"` to see available simulators
- Ensure simulator is booted before running operations

### Debug Logging

Set environment variable for verbose logging:

```bash
LOG_LEVEL=debug node dist/index.js
```

## Resources

- **MCP Documentation**: [Model Context Protocol](https://modelcontextprotocol.io/)
- **Xcode CLI Tools**: `man xcodebuild`, `man simctl`
- **IDB Documentation**: [https://fbidb.io/](https://fbidb.io/)
- **Code Style Guide**: [CODESTYLE.md](./CODESTYLE.md)

## License

Private project - © 2024

## Version

**0.0.1** - Feature-complete implementation with all operations functional

---

**Built with ❤️ for efficient iOS development automation**
