# 03 - Tool Specifications

**Purpose**: Complete operational specifications for all three MCP dispatchers including parameters, responses, and examples.

## Tool 1: execute_build_command

### Operations Reference

#### build
**Purpose**: Compile the Xcode project

**Required Parameters**:
- `project_path`: Path to .xcodeproj or .xcworkspace
- `scheme`: Scheme name to build

**Optional Parameters**:
- `configuration`: "Debug" or "Release" (default: "Debug")
- `destination`: Build destination string
- `options.clean_before_build`: Clean before building
- `options.parallel`: Enable parallel builds
- `options.quiet`: Suppress output
- `options.sdk`: SDK to use
- `options.arch`: Architecture to build for

**Response**:
```json
{
  "success": true,
  "summary": "Build succeeded with 0 errors and 2 warnings in 45.2s",
  "output_file": "/tmp/xc-plugin/build_1699564123.log",
  "cache_id": "a3f5e8c9d2b1",
  "metadata": {
    "warnings": 2,
    "errors": 0,
    "duration": "45.2s",
    "configuration": "Debug"
  }
}
```

**Example**:
```typescript
await mcp.execute('execute_build_command', {
  operation: 'build',
  project_path: './MyApp.xcworkspace',
  scheme: 'MyApp',
  configuration: 'Debug',
  destination: 'platform=iOS Simulator,name=iPhone 15',
  output_format: 'file'
});
```

#### test
**Purpose**: Run unit and UI tests

**Required Parameters**:
- `project_path`: Path to project
- `scheme`: Scheme containing tests

**Optional Parameters**:
- `destination`: Test destination
- `options.only_testing`: Array of specific tests to run
- `options.skip_testing`: Array of tests to skip
- `options.parallel`: Run tests in parallel
- `options.result_bundle_path`: Custom path for .xcresult

**Response**:
```json
{
  "success": true,
  "summary": "45 tests passed, 3 failed in 120.5s",
  "output_file": "/tmp/xc-plugin/test_results_1699564234.json",
  "cache_id": "b4e6f9d0c3a2",
  "metadata": {
    "passed": 45,
    "failed": 3,
    "skipped": 2,
    "duration": "120.5s",
    "failures": [
      {
        "test": "MyAppTests.testUserLogin",
        "message": "Timeout waiting for element"
      }
    ]
  }
}
```

#### clean
**Purpose**: Remove build artifacts

**Required Parameters**:
- `project_path`: Path to project

**Optional Parameters**:
- `scheme`: Specific scheme to clean

**Response**:
```json
{
  "success": true,
  "summary": "Cleaned build directory",
  "metadata": {
    "freed_space": "1.2 GB"
  }
}
```

#### list-schemes
**Purpose**: List available schemes in project

**Required Parameters**:
- `project_path`: Path to project

**Response**:
```json
{
  "success": true,
  "summary": "Found 3 schemes: MyApp, MyApp-Tests, MyApp-UITests",
  "output_file": "/tmp/xc-plugin/schemes_1699564345.json",
  "metadata": {
    "schemes": ["MyApp", "MyApp-Tests", "MyApp-UITests"]
  }
}
```

#### show-build-settings
**Purpose**: Display build settings for scheme

**Required Parameters**:
- `project_path`: Path to project
- `scheme`: Scheme name

**Optional Parameters**:
- `configuration`: "Debug" or "Release"

**Response**: File-based (typically 10k+ tokens)
```json
{
  "success": true,
  "summary": "Build settings for MyApp (Debug configuration)",
  "output_file": "/tmp/xc-plugin/build_settings_1699564456.json",
  "cache_id": "c5f7g0e1d4b3",
  "metadata": {
    "total_settings": 847,
    "configuration": "Debug"
  }
}
```

#### validate-project
**Purpose**: Check project for common issues

**Required Parameters**:
- `project_path`: Path to project

**Response**:
```json
{
  "success": true,
  "summary": "Project validation found 2 warnings",
  "metadata": {
    "issues": [
      {
        "severity": "warning",
        "type": "signing",
        "message": "No provisioning profile specified"
      },
      {
        "severity": "warning",
        "type": "capabilities",
        "message": "Push Notifications enabled but not configured"
      }
    ]
  }
}
```

---

## Tool 2: execute_simulator_command

### Operations Reference

#### list
**Purpose**: List all available simulators

**Optional Parameters**:
- `options.available_only`: Show only available devices
- `options.runtime`: Filter by runtime (e.g., "iOS 17.0")

**Response**: File-based (can be 5k+ tokens)
```json
{
  "success": true,
  "summary": "Found 23 devices across 4 runtimes",
  "output_file": "/tmp/xc-plugin/simulators_1699564567.json",
  "cache_id": "d6g8h1f2e5c4",
  "metadata": {
    "total_devices": 23,
    "booted_devices": 1,
    "runtimes": ["iOS 17.2", "iOS 17.0", "iOS 16.4", "watchOS 10.2"]
  }
}
```

Full data structure in file:
```json
{
  "devices": {
    "iOS 17.2": [
      {
        "udid": "ABC123-DEF456-...",
        "name": "iPhone 15",
        "state": "Shutdown",
        "isAvailable": true,
        "deviceTypeIdentifier": "com.apple.CoreSimulator.SimDeviceType.iPhone-15"
      }
    ]
  }
}
```

#### boot
**Purpose**: Boot a simulator device

**Required Parameters**:
- `device_id`: UDID or device name

**Optional Parameters**:
- `options.wait_for_boot`: Wait until fully booted (default: true)

**Response**:
```json
{
  "success": true,
  "summary": "iPhone 15 booted successfully",
  "metadata": {
    "device_id": "ABC123-DEF456-...",
    "boot_time": "8.3s"
  }
}
```

#### install
**Purpose**: Install app on simulator

**Required Parameters**:
- `device_id`: Target device
- `app_identifier`: Path to .app bundle

**Response**:
```json
{
  "success": true,
  "summary": "Installed MyApp.app on iPhone 15",
  "metadata": {
    "bundle_id": "com.example.MyApp",
    "install_size": "45.2 MB"
  }
}
```

#### launch
**Purpose**: Launch app on simulator

**Required Parameters**:
- `device_id`: Target device
- `app_identifier`: Bundle ID to launch

**Optional Parameters**:
- `options.use_accessibility`: Use accessibility-based navigation (default: true)
- `options.wait_for_launch`: Wait for app to launch
- `options.arguments`: Array of launch arguments
- `options.environment`: Environment variables

**Response**:
```json
{
  "success": true,
  "summary": "Launched com.example.MyApp using accessibility navigation",
  "metadata": {
    "method": "accessibility",
    "pid": 12345,
    "launch_time": "2.1s"
  }
}
```

With accessibility enabled, response includes:
```json
{
  "success": true,
  "summary": "Launched com.example.MyApp",
  "metadata": {
    "method": "accessibility",
    "pid": 12345,
    "accessibility_tree_available": true,
    "initial_screen": {
      "title": "Welcome",
      "elements_count": 8,
      "interactive_elements": 3
    }
  }
}
```

#### io-screenshot
**Purpose**: Capture simulator screen

**Required Parameters**:
- `device_id`: Target device

**Optional Parameters**:
- `options.output_path`: Custom save location
- `options.type`: "png" or "jpeg"
- `options.display`: Which display to capture (for multi-display)
- `options.mask`: Mask option for privacy

**Response**:
```json
{
  "success": true,
  "summary": "Screenshot captured",
  "metadata": {
    "screenshot_path": "/tmp/xc-plugin/screenshot_1699564678.png",
    "resolution": "1170x2532",
    "size": "2.4 MB"
  }
}
```

#### privacy
**Purpose**: Manage app privacy permissions

**Required Parameters**:
- `device_id`: Target device
- `app_identifier`: Bundle ID
- `options.privacy_action`: "grant", "revoke", or "reset"
- `options.privacy_service`: Service to modify

**Privacy Services**:
- `photos`: Photo library access
- `camera`: Camera access
- `contacts`: Contacts access
- `location`: Location services
- `microphone`: Microphone access
- `calendars`: Calendar access
- `reminders`: Reminders access
- `medialibrary`: Media library access

**Response**:
```json
{
  "success": true,
  "summary": "Granted photos permission to com.example.MyApp",
  "metadata": {
    "service": "photos",
    "action": "grant",
    "bundle_id": "com.example.MyApp"
  }
}
```

#### ui-appearance
**Purpose**: Set device appearance (light/dark mode)

**Required Parameters**:
- `device_id`: Target device
- `options.appearance`: "light" or "dark"

**Response**:
```json
{
  "success": true,
  "summary": "Set appearance to dark mode",
  "metadata": {
    "appearance": "dark",
    "device_id": "ABC123-..."
  }
}
```

#### diagnose
**Purpose**: Collect diagnostic information

**Required Parameters**:
- `device_id`: Target device

**Response**: File-based (contains logs, system info, etc.)
```json
{
  "success": true,
  "summary": "Diagnostics collected",
  "output_file": "/tmp/xc-plugin/diagnostics_1699564789.json",
  "metadata": {
    "logs_size": "15.3 MB",
    "crash_reports": 2,
    "system_logs": true
  }
}
```

---

## Tool 3: execute_advanced_operation

### IDB Category Operations

#### list-targets
**Purpose**: List IDB-compatible devices and simulators

**Response**:
```json
{
  "success": true,
  "summary": "Found 3 IDB targets",
  "metadata": {
    "targets": [
      {
        "udid": "ABC123-...",
        "name": "iPhone 15",
        "type": "simulator",
        "state": "Booted"
      },
      {
        "udid": "DEF456-...",
        "name": "My iPhone",
        "type": "device",
        "state": "Connected"
      }
    ]
  }
}
```

#### debugserver
**Purpose**: Start debug server for app

**Required Parameters**:
- `target`: Device UDID
- `parameters.bundle_id`: App to debug

**Response**:
```json
{
  "success": true,
  "summary": "Debug server started on port 12345",
  "metadata": {
    "port": 12345,
    "pid": 67890,
    "bundle_id": "com.example.MyApp"
  }
}
```

#### pull
**Purpose**: Pull file from device/simulator

**Required Parameters**:
- `target`: Device UDID
- `parameters.src_path`: Source path on device
- `parameters.dst_path`: Destination path on host

**Response**:
```json
{
  "success": true,
  "summary": "Pulled file successfully",
  "metadata": {
    "src_path": "/var/mobile/Containers/Data/Application/.../Documents/data.db",
    "dst_path": "/tmp/data.db",
    "size": "1.2 MB"
  }
}
```

#### crash-list
**Purpose**: List crash logs

**Required Parameters**:
- `target`: Device UDID

**Response**: File-based if many crashes
```json
{
  "success": true,
  "summary": "Found 3 crash reports",
  "output_file": "/tmp/xc-plugin/crashes_1699564890.json",
  "metadata": {
    "crash_count": 3,
    "most_recent": {
      "name": "MyApp_2024-11-01_12-34-56.crash",
      "date": "2024-11-01T12:34:56Z",
      "exception": "EXC_BAD_ACCESS"
    }
  }
}
```

### Cache Category Operations

#### get-cached-result
**Purpose**: Retrieve cached operation result

**Required Parameters**:
- `target`: Cache ID from previous operation

**Response**:
```json
{
  "success": true,
  "summary": "Cache hit",
  "metadata": {
    "cache_id": "a3f5e8c9d2b1",
    "cached_at": "2024-11-01T12:00:00Z",
    "age": "5 minutes"
  },
  "data": {
    // Original operation result
  }
}
```

#### cache-statistics
**Purpose**: Get cache performance metrics

**Response**:
```json
{
  "success": true,
  "summary": "Cache statistics",
  "metadata": {
    "hit_rate": 0.85,
    "total_requests": 1234,
    "cache_hits": 1049,
    "cache_misses": 185,
    "total_size": "125 MB",
    "oldest_entry": "2024-10-15T08:30:00Z"
  }
}
```

#### invalidate-cache
**Purpose**: Clear specific cache entry or all cache

**Optional Parameters**:
- `target`: Specific cache ID (omit for full clear)

**Response**:
```json
{
  "success": true,
  "summary": "Invalidated 15 cache entries",
  "metadata": {
    "entries_cleared": 15,
    "space_freed": "45 MB"
  }
}
```

### Workflow Category Operations

#### run-test-suite
**Purpose**: Complete testing pipeline

**Required Parameters**:
- `target`: Project path
- `parameters.scheme`: Scheme to test

**Optional Parameters**:
- `parameters.clean_first`: Clean before testing
- `parameters.device`: Target device
- `parameters.coverage`: Generate coverage report

**Response**: File-based (complete test results)
```json
{
  "success": true,
  "summary": "Test suite completed: 45 passed, 3 failed",
  "output_file": "/tmp/xc-plugin/test_suite_1699564901.json",
  "metadata": {
    "total_tests": 50,
    "passed": 45,
    "failed": 3,
    "skipped": 2,
    "duration": "180.5s",
    "coverage": 78.5
  }
}
```

Full workflow includes:
1. Clean build directory
2. Build for testing
3. Boot simulator
4. Install app
5. Run tests
6. Collect results
7. Generate coverage
8. Capture diagnostics on failure

#### build-and-deploy
**Purpose**: Full build, install, and launch pipeline

**Required Parameters**:
- `target`: Project path
- `parameters.scheme`: Scheme to build
- `parameters.device_id`: Target device

**Response**:
```json
{
  "success": true,
  "summary": "Built and deployed successfully",
  "metadata": {
    "build_time": "45.2s",
    "install_time": "8.1s",
    "launch_time": "2.3s",
    "total_time": "55.6s",
    "app_pid": 12345
  }
}
```

#### capture-diagnostics
**Purpose**: Comprehensive diagnostic snapshot

**Required Parameters**:
- `target`: Device ID

**Optional Parameters**:
- `parameters.include`: Array of diagnostic types

**Include Options**:
- `logs`: System and app logs
- `screenshots`: Current screen state
- `accessibility-tree`: Full accessibility hierarchy
- `performance`: CPU, memory, network stats
- `crashes`: Recent crash reports

**Response**: File-based (multi-file archive)
```json
{
  "success": true,
  "summary": "Diagnostics captured",
  "output_file": "/tmp/xc-plugin/diagnostics_bundle_1699564912.zip",
  "metadata": {
    "bundle_size": "25.3 MB",
    "contents": {
      "logs": ["system.log", "app.log"],
      "screenshots": ["screen_1.png"],
      "accessibility": ["tree.json"],
      "crashes": ["MyApp_crash.txt"]
    }
  }
}
```

---

## Common Response Patterns

### Success Response
```json
{
  "success": true,
  "summary": "Human-readable summary (~300 tokens max)",
  "output_file": "/path/to/file (if large output)",
  "cache_id": "hash (for later retrieval)",
  "metadata": {
    // Operation-specific metadata
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": "Detailed error message",
  "metadata": {
    "operation": "build",
    "parameters": {...},
    "timestamp": "2024-11-01T12:34:56Z"
  }
}
```

### File-Based Response
When output exceeds token limits:
```json
{
  "success": true,
  "summary": "Compact summary with key findings",
  "output_file": "/tmp/xc-plugin/operation_timestamp.json",
  "cache_id": "hash",
  "metadata": {
    "file_size": "2.4 MB",
    "line_count": 15432,
    "token_estimate": 45000
  }
}
```

The full data is available in the file and can be:
- Read by Skills for analysis
- Cached for later reference
- Retrieved by cache_id
- Processed incrementally

---

## Token Efficiency Strategies

### 1. Default to Summaries
Most operations return 300-token summaries by default. Request `output_format: 'file'` for full data.

### 2. Progressive Disclosure
Cache IDs allow retrieval of full data without keeping it in context.

### 3. Structured Metadata
Key statistics in metadata field enable quick assessment without reading full output.

### 4. Smart Defaults
Operations use sensible defaults to minimize required parameters.

### 5. Batch Operations
Workflow operations combine multiple steps, reducing total context usage.

---

## Next Steps

Proceed to [04-skills-architecture.md](./04-skills-architecture.md) for Skills specifications.
