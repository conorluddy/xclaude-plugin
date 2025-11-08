---
name: xcode-workflows
description: Xcode build system guidance for xcodebuild operations. Use when building iOS projects, running tests, analyzing build failures, or configuring schemes. Covers build/clean/test operations, interpreting xcodebuild output, and troubleshooting common build errors.
---

# Xcode Workflows

**Use the `execute_xcode_command` MCP tool for all iOS build operations**

The xclaude-plugin provides the `execute_xcode_command` MCP tool which consolidates all xcodebuild operations into a single, token-efficient dispatcher.

## ⚠️ CRITICAL: Always Use MCP Tools First

**This is the most important rule:** When working with iOS builds, you MUST use the `execute_xcode_command` MCP tool.

- ✅ **DO**: Invoke `execute_xcode_command` for all build/test/clean operations
- ✅ **DO**: If the MCP tool fails, adjust parameters and retry
- ✅ **DO**: Read error messages and debug the parameters
- ❌ **NEVER**: Fall back to bash `xcodebuild` commands
- ❌ **NEVER**: Use `xcodebuild` directly in bash
- ❌ **NEVER**: Run `xcrun xcodebuild` in a terminal

**Why?** The MCP tool provides:

- Structured error handling
- Token efficiency (consolidated into 1 tool vs. verbose bash output)
- Proper integration with the xclaude-plugin architecture
- Consistent response formatting

If `execute_xcode_command` fails, the issue is with parameters or the project - not that you should use bash.

## When to Use Bash (And When NOT to)

### ❌ NEVER Use Bash For These (Use MCP Tools Instead)

| Task           | ❌ WRONG (Bash)              | ✅ RIGHT (MCP Tool)                   |
| -------------- | ---------------------------- | ------------------------------------- |
| List schemes   | `xcodebuild -list`           | `execute_xcode_command` op: "list"    |
| Build app      | `xcodebuild -scheme...`      | `execute_xcode_command` op: "build"   |
| Run tests      | `xcodebuild -scheme... test` | `execute_xcode_command` op: "test"    |
| Clean build    | `xcodebuild clean`           | `execute_xcode_command` op: "clean"   |
| Get Xcode info | `xcodebuild -version`        | `execute_xcode_command` op: "version" |

### ✅ Bash is Acceptable For (Non-Build Tasks)

- File operations: `mkdir`, `cp`, `rm`, `ls`, etc.
- Text inspection: `grep`, `find`, `cat`, etc.
- Git operations: `git status`, `git log`, etc.
- Environment checks: `which`, `xcode-select --version`, etc.
- Project exploration: `find . -name "*.swift"`, etc.

### The Rule: If it's about Xcode building/testing → Use MCP tool, not bash

## Quick Reference

| Task                | MCP Tool                | Operation | Key Parameters                             |
| ------------------- | ----------------------- | --------- | ------------------------------------------ |
| Build for simulator | `execute_xcode_command` | `build`   | scheme, configuration:Debug                |
| Build for device    | `execute_xcode_command` | `build`   | scheme, configuration:Release, destination |
| Run tests           | `execute_xcode_command` | `test`    | scheme, destination                        |
| Clean build         | `execute_xcode_command` | `clean`   | scheme                                     |
| List schemes        | `execute_xcode_command` | `list`    | -                                          |
| Get Xcode info      | `execute_xcode_command` | `version` | -                                          |

## Standard Workflows

### 1. Building an App

**Step 1: Discover Schemes - Use `execute_xcode_command` with operation: "list"**

Invoke the `execute_xcode_command` MCP tool:

```json
{
  "operation": "list",
  "project_path": "/path/to/Project.xcodeproj"
}
```

**Note:** `project_path` is optional - auto-detected from current directory.

**Returns:**

```json
{
  "schemes": ["MyApp", "MyAppTests", "MyAppUITests"],
  "targets": ["MyApp", "MyAppKit", "MyAppTests"]
}
```

**Step 2: Build - Use `execute_xcode_command` with operation: "build"**

Invoke the `execute_xcode_command` MCP tool with build parameters:

```json
{
  "operation": "build",
  "scheme": "MyApp",
  "configuration": "Debug",
  "destination": "platform=iOS Simulator,name=iPhone 15"
}
```

**Common Destinations:**

- iOS Simulator (explicit - recommended): `"platform=iOS Simulator,name=iPhone 15,OS=18.0"`
- iOS Simulator (auto-resolve): `"platform=iOS Simulator,name=iPhone 15"` (will auto-detect latest OS)
- iOS Device: `"platform=iOS,id=<device-udid>"`
- Any Simulator: `"platform=iOS Simulator,name=Any iOS Simulator Device"`
- macOS: `"platform=macOS"`

**Note:** The destination parameter now supports auto-resolution! If you omit the OS version, the tool will automatically query available simulators and select the latest OS version for the specified device name. For explicit control, include the OS version in your destination string.

### 2. Running Tests

**Unit Tests:**

```json
{
  "operation": "test",
  "scheme": "MyApp",
  "destination": "platform=iOS Simulator,name=iPhone 15"
}
```

**Specific Test Plan:**

```json
{
  "operation": "test",
  "scheme": "MyApp",
  "destination": "platform=iOS Simulator,name=iPhone 15",
  "options": {
    "test_plan": "UnitTests"
  }
}
```

**Run Specific Tests:**

```json
{
  "operation": "test",
  "scheme": "MyApp",
  "destination": "platform=iOS Simulator,name=iPhone 15",
  "options": {
    "only_testing": [
      "MyAppTests/LoginTests/testSuccessfulLogin",
      "MyAppTests/LoginTests/testInvalidCredentials"
    ]
  }
}
```

**Skip Specific Tests:**

```json
{
  "operation": "test",
  "scheme": "MyApp",
  "destination": "platform=iOS Simulator,name=iPhone 15",
  "options": {
    "skip_testing": ["MyAppUITests"]
  }
}
```

### 3. Clean Build

**When to Clean:**

- Build artifacts corrupted
- Switching branches significantly
- Mysterious build failures
- Before release builds

```json
{
  "operation": "clean",
  "scheme": "MyApp"
}
```

**Clean + Build Pattern:**

```json
{
  "operation": "build",
  "scheme": "MyApp",
  "configuration": "Debug",
  "options": {
    "clean_before_build": true
  }
}
```

## Configurations

### Debug vs Release

**Debug (Default):**

- Optimizations disabled
- Debug symbols included
- Faster compile time
- Larger binary
- Use for: Development, testing

**Release:**

- Optimizations enabled
- Debug symbols optional
- Slower compile time
- Smaller binary
- Use for: Production, App Store, performance testing

```json
{
  "operation": "build",
  "scheme": "MyApp",
  "configuration": "Release"
}
```

## Build Options

### Common Options

```json
{
  "operation": "build",
  "scheme": "MyApp",
  "options": {
    "clean_before_build": true,
    "parallel": true,
    "sdk": "iphoneos17.0",
    "arch": "arm64",
    "quiet": false
  }
}
```

**Options Explained:**

- **clean_before_build**: Clean before building (ensures fresh build)
- **parallel**: Enable parallel builds (faster on multi-core)
- **sdk**: Specific SDK version (usually auto-selected)
- **arch**: Target architecture (arm64 for devices, x86_64 for old simulators)
- **quiet**: Reduce build output verbosity

## Interpreting Build Results

### Success Response

```json
{
  "success": true,
  "summary": "Build succeeded",
  "warnings": 3,
  "build_time": "45.2s",
  "scheme": "MyApp",
  "configuration": "Debug"
}
```

### Failure Response

```json
{
  "success": false,
  "error": "Build failed",
  "errors": 2,
  "warnings": 5,
  "failure_reason": "Compilation errors in ViewController.swift"
}
```

### Progressive Disclosure

Large build logs use progressive disclosure:

```json
{
  "success": true,
  "summary": "Build succeeded with 15 warnings",
  "cache_id": "build-abc123",
  "quick_stats": {
    "warnings": 15,
    "build_time": "62.3s"
  },
  "next_steps": [
    "Use cache_id to get full build log if needed",
    "Review warnings for potential issues"
  ]
}
```

## Common Build Errors

### Error: "No scheme named 'X' found"

**Cause:** Scheme doesn't exist or isn't shared

**Solution:**

1. Run `list` operation to see available schemes
2. Check if scheme is shared (Xcode → Product → Scheme → Manage Schemes)

### Error: "Code signing identity not found"

**Cause:** Missing or invalid signing certificate

**Solution:**

1. Check Team ID in project settings
2. Verify certificates in Keychain
3. Use automatic signing if possible

```json
{
  "operation": "build",
  "scheme": "MyApp",
  "options": {
    "code_sign_identity": "Apple Development",
    "development_team": "TEAM_ID_HERE"
  }
}
```

### Error: "SDK not found"

**Cause:** Requesting unavailable SDK version

**Solution:**

1. Run `version` operation to see available SDKs
2. Update `sdk` option or remove to use latest

### Error: "Destination not found"

**Cause:** Invalid destination specifier

**Solution:**

1. Use `execute_simulator_command` with operation "list" to see available devices
2. Check device name spelling
3. Ensure device/simulator is available

## Testing Workflows

### Complete Test Suite

```
1. list → Get test scheme
2. clean → Ensure fresh state
3. test → Run all tests
4. Analyze results → Check for failures
```

### Flaky Test Detection

Run tests multiple times:

```json
{
  "operation": "test",
  "scheme": "MyApp",
  "options": {
    "test_iterations": 5,
    "retry_on_failure": true
  }
}
```

**Note:** Test iteration support depends on Xcode version.

### Test Result Analysis

Tests return:

```json
{
  "success": false,
  "tests_run": 45,
  "tests_passed": 43,
  "tests_failed": 2,
  "failures": [
    {
      "test": "MyAppTests.LoginTests.testInvalidPassword",
      "message": "XCTAssertEqual failed: (\"error\") is not equal to (\"invalid\")"
    }
  ]
}
```

## Project Auto-Detection

**xcodebuild operations auto-detect project files:**

1. Searches current directory for `.xcworkspace`
2. Falls back to `.xcodeproj`
3. Returns error if multiple or none found

**Explicit Path:**

```json
{
  "operation": "build",
  "project_path": "/path/to/specific/Project.xcodeproj",
  "scheme": "MyApp"
}
```

## Build Performance Tips

### 1. Enable Parallel Builds

```json
{
  "options": {
    "parallel": true
  }
}
```

### 2. Incremental Builds

Don't clean unless necessary - incremental builds are much faster.

### 3. Reduce Verbosity

For CI/automated builds:

```json
{
  "options": {
    "quiet": true
  }
}
```

### 4. Use Derived Data Caching

Default behavior - xcodebuild uses DerivedData for caching.

## CI/CD Integration

### GitHub Actions Pattern

```
1. version → Verify Xcode installation
2. list → Validate scheme exists
3. clean → Ensure fresh build
4. build → Compile project
5. test → Run test suite
6. Analyze results → Fail pipeline if tests fail
```

### Build Artifacts

Build produces:

- `.app` bundle in DerivedData
- `.xcresult` test results bundle
- Build logs (via progressive disclosure)

## Advanced: Build Settings

Query build settings:

```json
{
  "operation": "list",
  "project_path": "/path/to/Project.xcodeproj"
}
```

**Returns scheme/target info.** For detailed build settings, use Resource:

`xc://reference/build-settings`

## Scheme Management

### Shared vs User Schemes

**Shared Schemes:**

- Checked into source control
- Available to all users
- Recommended for team projects

**User Schemes:**

- Local to your machine
- Not visible to xcodebuild by default

**Best Practice:** Share schemes used for CI/CD.

## Integration with MCP Tools

This Skill works with `execute_xcode_command` tool:

- All operations use the `execute_xcode_command` tool
- Tool handles xcodebuild execution and output parsing
- Tool provides progressive disclosure for large outputs
- This Skill teaches WHEN and HOW to use operations

## Related Skills

- **ios-testing-patterns**: Advanced test strategies and analysis
- **simulator-workflows**: Device management for testing
- **crash-debugging**: Analyzing build crashes

## Related Resources

- `xc://operations/xcode`: Complete xcodebuild operations reference
- `xc://reference/build-settings`: Build settings dictionary
- `xc://reference/error-codes`: Common error codes and solutions

---

**Tip: Use `list` to discover, `build` to compile, `test` to validate. Clean only when needed.**
