# Simulator Operations Reference

Complete reference for iOS Simulator control operations via `execute_simulator_command`.

## Overview

The simulator dispatcher consolidates all simctl operations into a single unified tool. Each operation category handles specific aspects of simulator and app lifecycle management.

**Tool Name:** `execute_simulator_command`

**Token Cost:** ~400 tokens (vs ~5k for separate tools)

**Progressive Disclosure:** Large outputs (device lists, logs) return cache IDs for on-demand detail retrieval.

## Tool: execute_simulator_command

### Required Parameters

- `operation` (required): Operation category to execute

### Optional Parameters

- `device_id`: Device UDID or name (e.g., "iPhone 15" or full UDID)
- `sub_operation`: Specific action within operation category
- `app_identifier`: App bundle identifier (e.g., "com.example.MyApp")
- `parameters`: Operation-specific parameters (object)

### Equivalent Commands

This tool wraps Apple's `simctl` command-line utility:

```bash
# Direct simctl equivalents shown for each operation
xcrun simctl <operation> [options]
```

## Operations

### device-lifecycle

Manage simulator device lifecycle (boot, shutdown, create, delete, erase, clone).

**Required Parameters:**

- `operation`: "device-lifecycle"
- `sub_operation`: One of: boot, shutdown, create, delete, erase, clone

**Optional Parameters:**

- `device_id`: Target device UDID or name
- `parameters.device_type`: Device type for create (e.g., "iPhone 15")
- `parameters.runtime`: iOS runtime for create (e.g., "iOS-17-0")
- `parameters.wait_for_boot`: Wait for boot completion (boolean, default: true)
- `parameters.erase`: Erase data during delete (boolean)
- `parameters.new_name`: New name for clone operation

#### Sub-operation: boot

Start a simulator device.

**Parameters:**

- `device_id` (required): Device to boot
- `parameters.wait_for_boot` (optional): Wait for boot completion

**Example:**

```json
{
  "operation": "device-lifecycle",
  "sub_operation": "boot",
  "device_id": "iPhone 15",
  "parameters": {
    "wait_for_boot": true
  }
}
```

**Equivalent Command:**

```bash
xcrun simctl boot "iPhone 15"
```

**Returns:**

```json
{
  "success": true,
  "data": {
    "message": "Device booted successfully",
    "sub_operation": "boot",
    "device_id": "A1B2C3D4-1234-5678-9ABC-DEF012345678",
    "status": "Booted"
  }
}
```

**Common Errors:**

- "Device already booted" - Device is already running
- "Device not found" - Invalid device_id
- "Unable to boot device" - CoreSimulator framework issues

#### Sub-operation: shutdown

Stop a running simulator device.

**Parameters:**

- `device_id` (required): Device to shutdown

**Example:**

```json
{
  "operation": "device-lifecycle",
  "sub_operation": "shutdown",
  "device_id": "iPhone 15"
}
```

**Equivalent Command:**

```bash
xcrun simctl shutdown "iPhone 15"
```

**Returns:**

```json
{
  "success": true,
  "data": {
    "message": "Device shutdown successfully",
    "sub_operation": "shutdown",
    "device_id": "A1B2C3D4-1234-5678-9ABC-DEF012345678",
    "status": "Shutdown"
  }
}
```

**Common Errors:**

- "Device not found" - Invalid device_id
- "Device not booted" - Device is already shutdown

#### Sub-operation: create

Create a new simulator device.

**Parameters:**

- `parameters.new_name` (required): Name for the new device
- `parameters.device_type` (required): Device type identifier
- `parameters.runtime` (required): iOS runtime identifier

**Example:**

```json
{
  "operation": "device-lifecycle",
  "sub_operation": "create",
  "parameters": {
    "new_name": "Test iPhone 15",
    "device_type": "iPhone 15",
    "runtime": "iOS-17-0"
  }
}
```

**Equivalent Command:**

```bash
xcrun simctl create "Test iPhone 15" "iPhone 15" "iOS-17-0"
```

**Returns:**

```json
{
  "success": true,
  "data": {
    "message": "Device created successfully",
    "sub_operation": "create",
    "device_id": "NEW-UDID-HERE",
    "note": "Device created but not booted. Use boot operation to start."
  }
}
```

**Common Errors:**

- "Invalid device type" - Device type not found
- "Invalid runtime" - Runtime not available
- "Name already exists" - Device with that name exists

#### Sub-operation: delete

Delete a simulator device.

**Parameters:**

- `device_id` (required): Device to delete

**Example:**

```json
{
  "operation": "device-lifecycle",
  "sub_operation": "delete",
  "device_id": "A1B2C3D4-1234-5678-9ABC-DEF012345678"
}
```

**Equivalent Command:**

```bash
xcrun simctl delete "A1B2C3D4-1234-5678-9ABC-DEF012345678"
```

**Returns:**

```json
{
  "success": true,
  "data": {
    "message": "Device deleted successfully",
    "sub_operation": "delete"
  }
}
```

**Common Errors:**

- "Device not found" - Invalid device_id
- "Device is running" - Shutdown device before deleting

#### Sub-operation: erase

Erase all data from a simulator device (reset to factory state).

**Parameters:**

- `device_id` (required): Device to erase

**Example:**

```json
{
  "operation": "device-lifecycle",
  "sub_operation": "erase",
  "device_id": "iPhone 15"
}
```

**Equivalent Command:**

```bash
xcrun simctl erase "iPhone 15"
```

**Returns:**

```json
{
  "success": true,
  "data": {
    "message": "Device erased successfully",
    "sub_operation": "erase",
    "device_id": "A1B2C3D4-1234-5678-9ABC-DEF012345678",
    "note": "All data removed. Device reset to factory state."
  }
}
```

**Common Errors:**

- "Device not found" - Invalid device_id
- "Device is running" - Shutdown device before erasing

#### Sub-operation: clone

Clone an existing simulator device.

**Parameters:**

- `device_id` (required): Source device to clone
- `parameters.new_name` (required): Name for the cloned device

**Example:**

```json
{
  "operation": "device-lifecycle",
  "sub_operation": "clone",
  "device_id": "iPhone 15",
  "parameters": {
    "new_name": "iPhone 15 Clone"
  }
}
```

**Equivalent Command:**

```bash
xcrun simctl clone "iPhone 15" "iPhone 15 Clone"
```

**Returns:**

```json
{
  "success": true,
  "data": {
    "message": "Device cloned successfully",
    "sub_operation": "clone",
    "device_id": "NEW-CLONE-UDID"
  }
}
```

**Common Errors:**

- "Device not found" - Invalid source device_id
- "Name already exists" - A device with new_name already exists

---

### app-lifecycle

Manage app installation and lifecycle (install, uninstall, launch, terminate).

**Required Parameters:**

- `operation`: "app-lifecycle"
- `sub_operation`: One of: install, uninstall, launch, terminate
- `app_identifier`: Bundle identifier (e.g., "com.example.MyApp")

**Optional Parameters:**

- `device_id`: Target device (defaults to booted device)
- `parameters.app_path`: Path to .app bundle (for install)
- `parameters.arguments`: Launch arguments array (for launch)
- `parameters.environment`: Environment variables object (for launch)

#### Sub-operation: install

Install an app bundle on a simulator.

**Parameters:**

- `device_id` (optional): Target device
- `app_identifier` (required): App bundle identifier
- `parameters.app_path` (required): Path to .app bundle

**Example:**

```json
{
  "operation": "app-lifecycle",
  "sub_operation": "install",
  "device_id": "iPhone 15",
  "app_identifier": "com.example.MyApp",
  "parameters": {
    "app_path": "/path/to/MyApp.app"
  }
}
```

**Equivalent Command:**

```bash
xcrun simctl install "iPhone 15" "/path/to/MyApp.app"
```

**Returns:**

```json
{
  "success": true,
  "data": {
    "message": "App installed successfully",
    "sub_operation": "install",
    "app_identifier": "com.example.MyApp",
    "status": "installed"
  }
}
```

**Common Errors:**

- "App bundle not found" - Invalid app_path
- "Device not booted" - Boot device first
- "Installation failed" - Invalid or corrupt app bundle

#### Sub-operation: uninstall

Remove an installed app from a simulator.

**Parameters:**

- `device_id` (optional): Target device
- `app_identifier` (required): App bundle identifier

**Example:**

```json
{
  "operation": "app-lifecycle",
  "sub_operation": "uninstall",
  "device_id": "iPhone 15",
  "app_identifier": "com.example.MyApp"
}
```

**Equivalent Command:**

```bash
xcrun simctl uninstall "iPhone 15" "com.example.MyApp"
```

**Returns:**

```json
{
  "success": true,
  "data": {
    "message": "App uninstalled successfully",
    "sub_operation": "uninstall",
    "app_identifier": "com.example.MyApp",
    "status": "uninstalled"
  }
}
```

**Common Errors:**

- "App not installed" - Bundle identifier not found on device
- "Device not booted" - Boot device first

#### Sub-operation: launch

Launch an installed app.

**Parameters:**

- `device_id` (optional): Target device
- `app_identifier` (required): App bundle identifier
- `parameters.arguments` (optional): Launch arguments array
- `parameters.environment` (optional): Environment variables

**Example:**

```json
{
  "operation": "app-lifecycle",
  "sub_operation": "launch",
  "device_id": "iPhone 15",
  "app_identifier": "com.example.MyApp",
  "parameters": {
    "arguments": ["--debug", "--verbose"],
    "environment": {
      "API_BASE_URL": "https://staging.example.com",
      "DEBUG_MODE": "true"
    }
  }
}
```

**Equivalent Command:**

```bash
xcrun simctl launch "iPhone 15" "com.example.MyApp" --debug --verbose
```

**Returns:**

```json
{
  "success": true,
  "data": {
    "message": "App launched successfully",
    "sub_operation": "launch",
    "app_identifier": "com.example.MyApp",
    "status": "running"
  }
}
```

**Common Errors:**

- "App not installed" - Install app first
- "Launch failed" - App crashed on launch
- "Device not booted" - Boot device first

#### Sub-operation: terminate

Stop a running app.

**Parameters:**

- `device_id` (optional): Target device
- `app_identifier` (required): App bundle identifier

**Example:**

```json
{
  "operation": "app-lifecycle",
  "sub_operation": "terminate",
  "device_id": "iPhone 15",
  "app_identifier": "com.example.MyApp"
}
```

**Equivalent Command:**

```bash
xcrun simctl terminate "iPhone 15" "com.example.MyApp"
```

**Returns:**

```json
{
  "success": true,
  "data": {
    "message": "App terminated successfully",
    "sub_operation": "terminate",
    "app_identifier": "com.example.MyApp",
    "status": "terminated"
  }
}
```

**Common Errors:**

- "App not running" - App is not currently running
- "Device not booted" - Boot device first

---

### io

Capture screenshots and record videos from simulators.

**Required Parameters:**

- `operation`: "io"
- `sub_operation`: One of: screenshot, video
- `device_id`: Target device

**Optional Parameters:**

- `parameters.output_path`: Path to save file (auto-generated if omitted)
- `parameters.duration`: Recording duration in seconds (for video)

#### Sub-operation: screenshot

Capture a screenshot from a simulator.

**Parameters:**

- `device_id` (required): Target device
- `parameters.output_path` (optional): Output file path

**Example:**

```json
{
  "operation": "io",
  "sub_operation": "screenshot",
  "device_id": "iPhone 15",
  "parameters": {
    "output_path": "/tmp/screenshot.png"
  }
}
```

**Equivalent Command:**

```bash
xcrun simctl io "iPhone 15" screenshot /tmp/screenshot.png
```

**Returns:**

```json
{
  "success": true,
  "data": {
    "message": "Screenshot captured successfully",
    "sub_operation": "screenshot",
    "params": {
      "output_path": "/tmp/screenshot.png"
    }
  }
}
```

**Common Errors:**

- "Device not booted" - Boot device first
- "Invalid output path" - Path not writable

#### Sub-operation: video

Record video from a simulator.

**Parameters:**

- `device_id` (required): Target device
- `parameters.output_path` (optional): Output file path
- `parameters.duration` (optional): Recording duration in seconds

**Example:**

```json
{
  "operation": "io",
  "sub_operation": "video",
  "device_id": "iPhone 15",
  "parameters": {
    "output_path": "/tmp/recording.mp4",
    "duration": 10
  }
}
```

**Equivalent Command:**

```bash
xcrun simctl io "iPhone 15" recordVideo /tmp/recording.mp4
```

**Returns:**

```json
{
  "success": true,
  "data": {
    "message": "Video recording started",
    "sub_operation": "video",
    "params": {
      "output_path": "/tmp/recording.mp4",
      "duration": 10
    },
    "note": "Recording for 10 seconds"
  }
}
```

**Common Errors:**

- "Device not booted" - Boot device first
- "Invalid output path" - Path not writable
- "Recording already in progress" - Stop current recording first

---

### push

Send push notifications to a simulator.

**Required Parameters:**

- `operation`: "push"
- `app_identifier`: Target app bundle identifier
- `parameters.payload`: JSON payload (string or object)

**Optional Parameters:**

- `device_id`: Target device (defaults to booted device)

**Example:**

```json
{
  "operation": "push",
  "device_id": "iPhone 15",
  "app_identifier": "com.example.MyApp",
  "parameters": {
    "payload": {
      "aps": {
        "alert": {
          "title": "Test Notification",
          "body": "This is a test push notification"
        },
        "badge": 1,
        "sound": "default"
      },
      "custom_data": {
        "action": "open_detail",
        "item_id": "12345"
      }
    }
  }
}
```

**Equivalent Command:**

```bash
xcrun simctl push "iPhone 15" "com.example.MyApp" notification.json
```

**Payload Format:**

Standard APNs payload structure:

```json
{
  "aps": {
    "alert": {
      "title": "Notification Title",
      "subtitle": "Optional Subtitle",
      "body": "Notification body text"
    },
    "badge": 1,
    "sound": "default",
    "category": "NOTIFICATION_CATEGORY",
    "thread-id": "thread-identifier"
  },
  "custom_key": "custom_value"
}
```

**Returns:**

```json
{
  "success": true,
  "data": {
    "message": "Push notification sent successfully",
    "sub_operation": "install",
    "app_identifier": "com.example.MyApp"
  }
}
```

**Common Errors:**

- "App not installed" - Install app first
- "Device not booted" - Boot device first
- "Invalid payload" - Malformed JSON payload

---

### openurl

Open a URL in the simulator (deep links, universal links, web URLs).

**Required Parameters:**

- `operation`: "openurl"
- `parameters.url`: URL to open

**Optional Parameters:**

- `device_id`: Target device (defaults to booted device)

**Example (Deep Link):**

```json
{
  "operation": "openurl",
  "device_id": "iPhone 15",
  "parameters": {
    "url": "myapp://profile/12345"
  }
}
```

**Example (Universal Link):**

```json
{
  "operation": "openurl",
  "device_id": "iPhone 15",
  "parameters": {
    "url": "https://example.com/product/67890"
  }
}
```

**Example (Web URL):**

```json
{
  "operation": "openurl",
  "device_id": "iPhone 15",
  "parameters": {
    "url": "https://apple.com"
  }
}
```

**Equivalent Command:**

```bash
xcrun simctl openurl "iPhone 15" "myapp://profile/12345"
```

**URL Schemes:**

Common URL scheme patterns:

- **Deep Links:** `myapp://path/to/content`
- **Universal Links:** `https://domain.com/path` (if app has associated domain)
- **Web URLs:** `https://domain.com` or `http://domain.com`
- **SMS:** `sms:+1234567890`
- **Phone:** `tel:+1234567890`
- **Email:** `mailto:user@example.com`
- **Maps:** `maps://` or `http://maps.apple.com/`
- **Settings:** `app-settings:` (iOS settings)

**Returns:**

```json
{
  "success": true,
  "data": {
    "message": "URL opened successfully",
    "sub_operation": "launch",
    "params": {
      "url": "myapp://profile/12345"
    }
  }
}
```

**Common Errors:**

- "Invalid URL" - Malformed URL string
- "Device not booted" - Boot device first
- "No app to handle URL" - No app registered for URL scheme

---

### list

List all available simulators with progressive disclosure.

**Required Parameters:**

- `operation`: "list"

**Optional Parameters:**

- `parameters.runtime`: Filter by runtime (e.g., "iOS-17-0")
- `parameters.state`: Filter by state ("Booted", "Shutdown")
- `parameters.device_type`: Filter by device type

**Example:**

```json
{
  "operation": "list"
}
```

**Equivalent Command:**

```bash
xcrun simctl list devices --json
```

**Returns (Initial - Progressive Disclosure):**

```json
{
  "success": true,
  "data": {
    "message": "Device list retrieved",
    "note": "Summary returned. Use cache_id to get full details."
  },
  "summary": "Found 12 devices: 3 booted, 9 shutdown",
  "cache_id": "list_abc123def456"
}
```

**Progressive Disclosure - Get Full Details:**

To retrieve the complete device list, use the cache_id in a follow-up request:

```json
{
  "operation": "get-details",
  "parameters": {
    "cache_id": "list_abc123def456"
  }
}
```

**Returns (Full Details):**

```json
{
  "success": true,
  "data": {
    "devices": [
      {
        "name": "iPhone 15",
        "udid": "A1B2C3D4-1234-5678-9ABC-DEF012345678",
        "state": "Booted",
        "runtime": "iOS 17.0"
      },
      {
        "name": "iPhone 15 Pro",
        "udid": "B2C3D4E5-2345-6789-ABCD-EF0123456789",
        "state": "Shutdown",
        "runtime": "iOS 17.0"
      },
      {
        "name": "iPad Pro 11-inch",
        "udid": "C3D4E5F6-3456-789A-BCDE-F01234567890",
        "state": "Booted",
        "runtime": "iOS 17.0"
      }
    ]
  }
}
```

**Filtered Example:**

```json
{
  "operation": "list",
  "parameters": {
    "state": "Booted",
    "runtime": "iOS-17-0"
  }
}
```

**Common Errors:**

- "No devices found" - No simulators match criteria
- "Invalid runtime" - Runtime identifier not recognized

---

### health-check

Validate iOS development environment and simulator availability.

**Required Parameters:**

- `operation`: "health-check"

**Parameters:** None

**Example:**

```json
{
  "operation": "health-check"
}
```

**Equivalent Command:**

```bash
xcodebuild -version && xcrun simctl list
```

**Returns (Healthy):**

```json
{
  "success": true,
  "data": {
    "message": "iOS development environment is healthy",
    "xcode_installed": true,
    "xcode_version": "15.0",
    "simctl_available": true,
    "issues": []
  }
}
```

**Returns (Issues Detected):**

```json
{
  "success": true,
  "data": {
    "message": "iOS development environment has issues",
    "xcode_installed": true,
    "xcode_version": "15.0",
    "simctl_available": false,
    "issues": ["Command line tools not installed", "CoreSimulator framework not found"],
    "note": "Run 'xcode-select --install' to install command line tools"
  }
}
```

**Checks Performed:**

1. **Xcode Installation:** Verifies Xcode.app is installed
2. **Xcode Version:** Checks Xcode version and build number
3. **Command Line Tools:** Validates command line tools installation
4. **simctl Availability:** Tests simctl command access
5. **CoreSimulator Framework:** Checks CoreSimulator framework

**Common Issues:**

- "Xcode not installed" - Install Xcode from App Store
- "Command line tools not installed" - Run `xcode-select --install`
- "simctl not available" - Reinstall command line tools
- "CoreSimulator not found" - Reinstall Xcode

---

### get-app-container

Get filesystem path to an app's container directory on a simulator.

**Required Parameters:**

- `operation`: "get-app-container"
- `device_id`: Target device
- `app_identifier`: App bundle identifier

**Optional Parameters:**

- `parameters.container_type`: Container type (default: "data")

**Container Types:**

- **data:** App's data container (Documents, Library, tmp)
- **bundle:** App's .app bundle directory
- **group:** Shared app group container

**Example (Data Container):**

```json
{
  "operation": "get-app-container",
  "device_id": "iPhone 15",
  "app_identifier": "com.example.MyApp",
  "parameters": {
    "container_type": "data"
  }
}
```

**Equivalent Command:**

```bash
xcrun simctl get_app_container "iPhone 15" "com.example.MyApp" data
```

**Returns:**

```json
{
  "success": true,
  "data": {
    "message": "App container path retrieved",
    "sub_operation": "install",
    "app_identifier": "com.example.MyApp",
    "params": {
      "container_path": "/Users/user/Library/Developer/CoreSimulator/Devices/UDID/data/Containers/Data/Application/APP-UDID"
    }
  }
}
```

**Example (Bundle Container):**

```json
{
  "operation": "get-app-container",
  "device_id": "iPhone 15",
  "app_identifier": "com.example.MyApp",
  "parameters": {
    "container_type": "bundle"
  }
}
```

**Returns:**

```json
{
  "success": true,
  "data": {
    "message": "App container path retrieved",
    "sub_operation": "install",
    "app_identifier": "com.example.MyApp",
    "params": {
      "container_path": "/Users/user/Library/Developer/CoreSimulator/Devices/UDID/data/Containers/Bundle/Application/APP-UDID/MyApp.app"
    }
  }
}
```

**Example (Group Container):**

```json
{
  "operation": "get-app-container",
  "device_id": "iPhone 15",
  "app_identifier": "com.example.MyApp",
  "parameters": {
    "container_type": "group"
  }
}
```

**Common Errors:**

- "App not installed" - Install app first
- "Device not found" - Invalid device_id
- "Invalid container type" - Use: data, bundle, or group

**Use Cases:**

1. **Inspect App Data:** Access Documents, Library directories
2. **Debug File Operations:** Verify file creation/modification
3. **Test Data Migration:** Examine SQLite databases, Core Data stores
4. **Read Logs:** Access app-generated log files
5. **Shared Data:** Inspect app group containers for extensions

---

## Common Patterns

### Pattern 1: Create, Boot, and Install App

```json
// 1. Create device
{
  "operation": "device-lifecycle",
  "sub_operation": "create",
  "parameters": {
    "new_name": "Test Device",
    "device_type": "iPhone 15",
    "runtime": "iOS-17-0"
  }
}

// 2. Boot device (use returned device_id)
{
  "operation": "device-lifecycle",
  "sub_operation": "boot",
  "device_id": "NEW-DEVICE-UDID",
  "parameters": {
    "wait_for_boot": true
  }
}

// 3. Install app
{
  "operation": "app-lifecycle",
  "sub_operation": "install",
  "device_id": "NEW-DEVICE-UDID",
  "app_identifier": "com.example.MyApp",
  "parameters": {
    "app_path": "/path/to/MyApp.app"
  }
}

// 4. Launch app
{
  "operation": "app-lifecycle",
  "sub_operation": "launch",
  "device_id": "NEW-DEVICE-UDID",
  "app_identifier": "com.example.MyApp"
}
```

### Pattern 2: Clean Test Environment

```json
// 1. Shutdown device
{
  "operation": "device-lifecycle",
  "sub_operation": "shutdown",
  "device_id": "iPhone 15"
}

// 2. Erase device data
{
  "operation": "device-lifecycle",
  "sub_operation": "erase",
  "device_id": "iPhone 15"
}

// 3. Boot device
{
  "operation": "device-lifecycle",
  "sub_operation": "boot",
  "device_id": "iPhone 15",
  "parameters": {
    "wait_for_boot": true
  }
}
```

### Pattern 3: Test Push Notifications

```json
// 1. Ensure device is booted
{
  "operation": "device-lifecycle",
  "sub_operation": "boot",
  "device_id": "iPhone 15"
}

// 2. Launch app (if not running)
{
  "operation": "app-lifecycle",
  "sub_operation": "launch",
  "device_id": "iPhone 15",
  "app_identifier": "com.example.MyApp"
}

// 3. Send push notification
{
  "operation": "push",
  "device_id": "iPhone 15",
  "app_identifier": "com.example.MyApp",
  "parameters": {
    "payload": {
      "aps": {
        "alert": {
          "title": "Test",
          "body": "Test notification"
        },
        "badge": 1
      }
    }
  }
}
```

### Pattern 4: Capture Screenshot After Action

```json
// 1. Perform action (e.g., open URL)
{
  "operation": "openurl",
  "device_id": "iPhone 15",
  "parameters": {
    "url": "myapp://feature"
  }
}

// 2. Capture screenshot
{
  "operation": "io",
  "sub_operation": "screenshot",
  "device_id": "iPhone 15",
  "parameters": {
    "output_path": "/tmp/feature-screen.png"
  }
}
```

### Pattern 5: Progressive Device List Query

```json
// 1. Request device list (returns summary)
{
  "operation": "list"
}

// Response includes cache_id
{
  "success": true,
  "summary": "Found 12 devices: 3 booted, 9 shutdown",
  "cache_id": "list_abc123"
}

// 2. Get full details if needed
{
  "operation": "get-details",
  "parameters": {
    "cache_id": "list_abc123"
  }
}
```

---

## Error Handling

### Error Response Format

All errors return consistent structure:

```json
{
  "success": false,
  "error": "Error message describing the issue",
  "operation": "operation-name"
}
```

### Common Error Categories

#### Device Errors

- **Device not found**: Invalid device_id or name
- **Device already booted**: Attempting to boot running device
- **Device not booted**: Operation requires booted device
- **Unable to boot device**: CoreSimulator framework issues

**Solutions:**

- Verify device exists with `list` operation
- Check device state before operations
- Ensure only one device boots at a time (resource limits)
- Run `health-check` to diagnose CoreSimulator issues

#### App Errors

- **App not installed**: Bundle identifier not found
- **App bundle not found**: Invalid app_path
- **Installation failed**: Corrupt or invalid app bundle
- **Launch failed**: App crashed on launch
- **App not running**: Attempting to terminate non-running app

**Solutions:**

- Use `install` operation before launch/terminate
- Verify app_path exists and is correct .app bundle
- Check app logs for crash details
- Ensure device has sufficient resources

#### Path Errors

- **Invalid output path**: Path not writable or doesn't exist
- **Permission denied**: Insufficient filesystem permissions

**Solutions:**

- Use absolute paths, not relative
- Ensure parent directory exists
- Check file/directory permissions
- Use /tmp for temporary files

#### Parameter Errors

- **Missing required parameter**: Required field omitted
- **Invalid parameter value**: Value out of range or wrong type
- **Invalid runtime**: Runtime identifier not available
- **Invalid device type**: Device type not recognized

**Solutions:**

- Check required parameters for each operation
- Use `list` to see available runtimes and device types
- Verify parameter types (string, number, boolean, object)
- Reference this documentation for valid values

---

## Best Practices

### 1. Device Identification

**Prefer device names over UDIDs for readability:**

```json
// Good - readable
{
  "device_id": "iPhone 15"
}

// Also valid - precise but verbose
{
  "device_id": "A1B2C3D4-1234-5678-9ABC-DEF012345678"
}
```

**Use UDIDs when multiple devices share the same name.**

### 2. Wait for Boot Completion

**Always wait for boot completion before app operations:**

```json
{
  "operation": "device-lifecycle",
  "sub_operation": "boot",
  "device_id": "iPhone 15",
  "parameters": {
    "wait_for_boot": true // Ensures device is ready
  }
}
```

### 3. Clean Test State

**Erase devices between test runs for consistency:**

```json
// Shutdown → Erase → Boot
{
  "operation": "device-lifecycle",
  "sub_operation": "erase",
  "device_id": "Test Device"
}
```

### 4. Progressive Disclosure

**Use cache IDs for large datasets:**

```json
// First call returns summary
{
  "operation": "list"
}

// Follow-up only if full details needed
{
  "operation": "get-details",
  "parameters": {
    "cache_id": "list_abc123"
  }
}
```

### 5. Error Handling

**Check success field in all responses:**

```typescript
if (result.success) {
  // Handle success
  console.log(result.data.message);
} else {
  // Handle error
  console.error(`Operation failed: ${result.error}`);
}
```

### 6. Resource Cleanup

**Delete test devices after use:**

```json
{
  "operation": "device-lifecycle",
  "sub_operation": "delete",
  "device_id": "Temporary Test Device"
}
```

### 7. Environment Validation

**Run health-check before automation:**

```json
{
  "operation": "health-check"
}
```

Verify environment is healthy before running tests or automation sequences.

### 8. Container Inspection

**Use get-app-container for debugging:**

```json
{
  "operation": "get-app-container",
  "device_id": "iPhone 15",
  "app_identifier": "com.example.MyApp",
  "parameters": {
    "container_type": "data"
  }
}
```

Access app's filesystem for inspecting logs, databases, or files.

### 9. URL Scheme Testing

**Test deep links and universal links:**

```json
{
  "operation": "openurl",
  "device_id": "iPhone 15",
  "parameters": {
    "url": "myapp://test/path?param=value"
  }
}
```

Verify app handles URL schemes correctly.

### 10. Push Notification Testing

**Test notification handling without backend:**

```json
{
  "operation": "push",
  "device_id": "iPhone 15",
  "app_identifier": "com.example.MyApp",
  "parameters": {
    "payload": {
      "aps": {
        "alert": "Test",
        "badge": 1
      }
    }
  }
}
```

Simulate push notifications locally for faster development.

---

## Additional Resources

- **Skill:** Use `simulator-workflows` Skill for guided device management
- **Reference:** See `xc://reference/device-specs` for available device types
- **Reference:** See `xc://reference/error-codes` for detailed error solutions
- **Apple Docs:** [simctl man page](https://www.manpagez.com/man/1/simctl/)
