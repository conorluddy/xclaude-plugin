# xc-launch

Simulator app lifecycle MCP server for iOS development - focused on install and launch operations.

## Overview

**xc-launch** is a minimal, composable MCP server that provides only simulator lifecycle operations: installing and launching iOS apps. It's designed to be paired with **xc-build** for a complete development loop.

**Token cost**: ~400 tokens
**Tools**: 2
**Philosophy**: Do one thing well - manage app lifecycle on simulator

## Why xc-launch?

### Composable Architecture

Instead of monolithic "build and launch" operations, xc-launch provides primitives that compose:

```bash
# Development loop using two MCPs:
1. Build app (xc-build MCP)
2. Install app (xc-launch MCP)
3. Launch app (xc-launch MCP)
4. Repeat

Total tokens: ~1000 (xc-build 600 + xc-launch 400)
```

### When to Enable

- **Development loop**: Enable alongside xc-build for rapid iteration
- **Installation testing**: Test app installation without rebuild overhead
- **Launch debugging**: Debug launch behavior independently

### When NOT to Enable

- **One-step workflows**: Use xc-all's `xcode_build_and_launch` instead
- **UI testing only**: App already installed? Use xc-interact
- **Complex workflows**: Multiple MCPs needed? Use xc-all to avoid duplication

## Tools

### simulator_install_app

Install .app bundle on simulator device.

**Input:**
```json
{
  "app_path": "/path/to/MyApp.app",
  "device_id": "booted"  // Optional: defaults to "booted"
}
```

**Output:**
```json
{
  "success": true,
  "message": "App installed successfully",
  "device_id": "ACTUAL-UDID"
}
```

**Features:**
- Auto-resolves "booted" to active simulator UDID
- Validates .app bundle exists before install
- Clear error messages if simulator not running
- Suggests available simulators on failure

---

### simulator_launch_app

Launch installed app by bundle identifier.

**Input:**
```json
{
  "app_identifier": "com.example.MyApp",
  "device_id": "booted"  // Optional: defaults to "booted"
}
```

**Output:**
```json
{
  "success": true,
  "message": "App launched successfully",
  "device_id": "ACTUAL-UDID",
  "bundle_id": "com.example.MyApp"
}
```

**Features:**
- Auto-resolves "booted" to active simulator UDID
- Validates app is installed before launch
- Clear error messages if app not found
- Suggests `simulator_install_app` if app missing

## Usage Patterns

### Pattern 1: Composable Development Loop

Enable **xc-build** + **xc-launch** together (~1000 tokens total):

```typescript
// Step 1: Build (xc-build MCP)
xcode_build({ scheme: "MyApp", configuration: "Debug" })

// Step 2: Install (xc-launch MCP)
simulator_install_app({
  app_path: "/path/to/Build/Products/Debug-iphonesimulator/MyApp.app"
})

// Step 3: Launch (xc-launch MCP)
simulator_launch_app({ app_identifier: "com.example.MyApp" })
```

### Pattern 2: Retry Individual Steps

When one step fails, retry only that step:

```typescript
// Build failed? Just rebuild (xc-build)
xcode_build({ scheme: "MyApp" })

// Install failed? Just reinstall (xc-launch)
simulator_install_app({ app_path: "..." })

// Launch failed? Just relaunch (xc-launch)
simulator_launch_app({ app_identifier: "..." })
```

### Pattern 3: Test Installation Only

Test app installation without rebuilding:

```typescript
// App already built, just install and launch
simulator_install_app({ app_path: "/path/to/existing/MyApp.app" })
simulator_launch_app({ app_identifier: "com.example.MyApp" })
```

## Error Handling

Both tools provide structured error responses with actionable suggestions:

### No Simulator Running
```json
{
  "success": false,
  "error": {
    "code": "NO_BOOTED_DEVICE",
    "message": "No booted simulator found",
    "suggestions": [
      "Boot a simulator: simulator_boot (xc-setup MCP)",
      "List available simulators: simulator_list (xc-setup MCP)"
    ]
  }
}
```

### App Not Found (Launch)
```json
{
  "success": false,
  "error": {
    "code": "APP_NOT_INSTALLED",
    "message": "App 'com.example.MyApp' is not installed",
    "suggestions": [
      "Install first: simulator_install_app",
      "Check bundle ID is correct"
    ]
  }
}
```

### Invalid Path (Install)
```json
{
  "success": false,
  "error": {
    "code": "INVALID_APP_PATH",
    "message": "App bundle not found at path",
    "suggestions": [
      "Build app first: xcode_build (xc-build MCP)",
      "Check app_path is correct .app bundle"
    ]
  }
}
```

## Comparison: xc-launch vs xc-all

| Feature | xc-launch | xc-all |
|---------|-----------|--------|
| **Token Cost** | ~400 | ~3500 |
| **Tools** | 2 (install, launch) | 24 (all tools) |
| **Best For** | Development loop with xc-build | Complex multi-step workflows |
| **Xcode Build** | ❌ (use xc-build) | ✅ (includes xcode_build) |
| **One-Step Build+Launch** | ❌ | ✅ (xcode_build_and_launch) |
| **Composable** | ✅ | ❌ (monolithic) |

## Development

### Build

```bash
npm run build
```

### Test

```bash
npm run test
```

### Local Development

```bash
npm run watch  # Watch mode for rapid iteration
```

## Requirements

- macOS 13.0+
- Xcode 15.0+
- Node.js 18+
- Active iOS Simulator (for operations)

## Related MCPs

- **xc-build** - Build, clean, list schemes (pairs with xc-launch)
- **xc-setup** - Boot simulators, create devices, health checks
- **xc-interact** - UI automation after app is launched
- **xc-all** - All 24 tools including one-step build and launch

## License

MIT
