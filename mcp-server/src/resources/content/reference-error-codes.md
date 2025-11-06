# Error Codes Reference

## Overview

This reference provides comprehensive documentation of error codes and failure modes across the iOS development toolchain: xcodebuild, simctl, and IDB. Each error includes diagnostic steps, common causes, and actionable solutions.

**Quick Navigation:**

- [xcodebuild Error Codes](#xcodebuild-error-codes)
- [simctl Error Codes](#simctl-error-codes)
- [IDB Error Codes](#idb-error-codes)
- [Common Error Patterns](#common-error-patterns)
- [Troubleshooting Workflow](#troubleshooting-workflow)
- [Error Code Quick Reference](#error-code-quick-reference-table)

---

## xcodebuild Error Codes

### Build Errors

#### Exit Code 65: Build Failed

**What it means:**
The build process encountered compilation, linking, or other build-time errors that prevented successful completion.

**Common causes:**

1. Compilation errors in Swift or Objective-C code
2. Missing dependencies or frameworks
3. Code signing configuration issues
4. Invalid build settings or configurations
5. Workspace/project file corruption

**How to diagnose:**

```bash
# Get detailed build log
xcodebuild -project MyApp.xcodeproj \
  -scheme MyApp \
  -configuration Debug \
  build 2>&1 | tee build.log

# Search for error indicators
grep -E "error:|failed|fatal" build.log
```

**Solutions:**

1. **Check compilation errors:**
   - Review error messages in build log
   - Fix syntax errors, type mismatches, missing imports
   - Ensure all required files are included in target

2. **Verify dependencies:**

   ```bash
   # Clean and rebuild
   xcodebuild clean -project MyApp.xcodeproj -scheme MyApp

   # Update dependencies (CocoaPods)
   pod install --repo-update

   # Update dependencies (SPM)
   # In Xcode: File > Packages > Update to Latest Package Versions
   ```

3. **Reset build environment:**

   ```bash
   # Clear derived data
   rm -rf ~/Library/Developer/Xcode/DerivedData/*

   # Clear module cache
   rm -rf ~/Library/Developer/Xcode/DerivedData/ModuleCache.noindex
   ```

4. **Fix code signing:**
   - Verify signing certificate is valid and not expired
   - Check provisioning profile matches bundle identifier
   - Ensure signing settings are correct in build settings

**Prevention tips:**

- Use consistent Swift/Xcode versions across team
- Lock dependency versions in Package.swift or Podfile
- Enable "Build for Running" to catch issues early
- Run clean builds before releases

---

#### Exit Code 70: Internal Error

**What it means:**
Xcodebuild encountered an internal error, often related to tooling or system issues.

**Common causes:**

1. Corrupted Xcode installation
2. Insufficient disk space
3. Permission issues with build directories
4. Xcode command line tools mismatch
5. Corrupted project files

**How to diagnose:**

```bash
# Check disk space
df -h /

# Check Xcode installation
xcodebuild -version
xcode-select -p

# Verify command line tools
xcode-select --install
```

**Solutions:**

1. **Reset Xcode command line tools:**

   ```bash
   sudo xcode-select --reset
   sudo xcode-select --switch /Applications/Xcode.app
   xcodebuild -runFirstLaunch
   ```

2. **Clear system caches:**

   ```bash
   # Clear derived data
   rm -rf ~/Library/Developer/Xcode/DerivedData

   # Clear CoreSimulator caches
   xcrun simctl shutdown all
   xcrun simctl erase all
   ```

3. **Check permissions:**

   ```bash
   # Fix permissions on DerivedData
   chmod -R 755 ~/Library/Developer/Xcode/DerivedData

   # Fix project directory permissions
   chmod -R 755 /path/to/project
   ```

4. **Reinstall Xcode command line tools:**
   ```bash
   sudo rm -rf /Library/Developer/CommandLineTools
   xcode-select --install
   ```

**Prevention tips:**

- Keep Xcode updated to latest stable version
- Monitor disk space (keep >20GB free)
- Use version control for project files
- Backup Xcode preferences and settings

---

#### Exit Code 71: System Error

**What it means:**
A system-level error prevented the build from completing, typically related to resource exhaustion or system configuration.

**Common causes:**

1. Insufficient memory (RAM)
2. Too many parallel build tasks
3. System file permissions issues
4. Network issues (for remote builds/dependencies)
5. Corrupted system frameworks

**How to diagnose:**

```bash
# Check memory usage
vm_stat

# Check system logs
log show --predicate 'process == "xcodebuild"' --last 1h

# Monitor build process
top -pid $(pgrep xcodebuild)
```

**Solutions:**

1. **Reduce build parallelism:**

   ```bash
   # Build with fewer parallel jobs
   xcodebuild -project MyApp.xcodeproj \
     -scheme MyApp \
     -jobs 2 \
     build
   ```

2. **Increase available memory:**
   - Close unnecessary applications
   - Disable "Build for Testing" if not needed
   - Build specific architectures only during development

3. **Check network connectivity:**

   ```bash
   # Test network
   ping -c 5 github.com

   # Clear network caches
   dscacheutil -flushcache
   ```

---

### Compilation Errors

#### Swift Compilation Errors

**Error: "Command CompileSwift failed with a nonzero exit code"**

**Common causes:**

1. Syntax errors in Swift code
2. Type inference failures
3. Memory exhaustion during compilation
4. Compiler bugs (rare)

**Solutions:**

1. **Identify specific compilation error:**

   ```bash
   # Get detailed Swift compiler output
   xcodebuild -project MyApp.xcodeproj \
     -scheme MyApp \
     -derivedDataPath ./build \
     build 2>&1 | grep -A 5 "CompileSwift"
   ```

2. **Reduce compiler complexity:**
   - Break complex expressions into multiple lines
   - Add explicit type annotations
   - Simplify nested closures

3. **Adjust compiler settings:**
   - Disable "Whole Module Optimization" for Debug builds
   - Reduce optimization level to `-Onone` for Debug
   - Increase compilation mode to "Incremental" in build settings

**Prevention tips:**

- Enable "Build Time" warnings to identify slow compilation
- Use SwiftLint to catch issues early
- Keep Swift compiler version consistent

---

#### Objective-C Compilation Errors

**Error: "Undefined symbols for architecture"**

**Common causes:**

1. Missing implementation files
2. Incorrect linking of frameworks
3. Header file visibility issues
4. Mixed Swift/Objective-C bridging problems

**Solutions:**

1. **Check target membership:**
   - Verify .m files are included in target's "Compile Sources"
   - Ensure headers are in correct visibility section

2. **Fix linking:**

   ```bash
   # Verify frameworks are linked
   # In Xcode: Target > Build Phases > Link Binary With Libraries
   ```

3. **Fix bridging header:**
   - Ensure bridging header path is correct
   - Verify imports are syntactically correct
   - Check file exists at specified path

---

#### Linker Errors

**Error: "ld: library not found for -lPods"**

**What it means:**
The linker cannot find a required library or framework.

**Solutions:**

1. **For CocoaPods:**

   ```bash
   pod deintegrate
   pod install

   # Clean and rebuild
   xcodebuild clean -workspace MyApp.xcworkspace -scheme MyApp
   ```

2. **For framework search paths:**
   - Verify "Framework Search Paths" in build settings
   - Check "Library Search Paths" for static libraries
   - Ensure paths are correct and files exist

3. **For missing system frameworks:**
   - Add missing framework in "Link Binary With Libraries"
   - Verify deployment target supports framework

---

#### Code Signing Errors

**Error: "Code signing failed"**

**Common causes:**

1. Expired or invalid certificate
2. Provisioning profile mismatch
3. Bundle identifier mismatch
4. Entitlements issues
5. Keychain access problems

**How to diagnose:**

```bash
# List available signing identities
security find-identity -v -p codesigning

# Check provisioning profiles
ls -la ~/Library/MobileDevice/Provisioning\ Profiles/

# Verify certificate validity
security find-certificate -c "Apple Development" -a
```

**Solutions:**

1. **Fix certificate issues:**
   - Verify certificate is valid and not expired
   - Install certificate in login keychain
   - Allow Xcode access to keychain when prompted

2. **Fix provisioning profile:**

   ```bash
   # Download latest profiles (Xcode)
   # Preferences > Accounts > Download Manual Profiles

   # Or manually
   fastlane sigh download_all
   ```

3. **Match bundle identifier:**
   - Ensure project bundle ID matches provisioning profile
   - Check for wildcard vs. explicit app IDs
   - Verify team ID is correct

4. **Fix entitlements:**
   - Verify entitlements file exists and is valid
   - Check entitlements match provisioning profile capabilities
   - Remove unused entitlements

**Prevention tips:**

- Use automatic signing for development
- Keep certificates and profiles up to date
- Use Fastlane Match for team certificate management

---

### Test Errors

#### Test Execution Failures

**Error: "Test runner failed with exit code"**

**Common causes:**

1. Test target not building
2. Test host app not launching
3. Missing test dependencies
4. Simulator boot failures

**Solutions:**

1. **Build test target separately:**

   ```bash
   xcodebuild build-for-testing \
     -project MyApp.xcodeproj \
     -scheme MyApp \
     -destination 'platform=iOS Simulator,name=iPhone 15'
   ```

2. **Check test host configuration:**
   - Verify "Bundle Loader" points to correct app
   - Ensure "Test Host" is set correctly
   - Check test target's "Info.plist"

3. **Reset test environment:**

   ```bash
   # Erase simulator
   xcrun simctl shutdown all
   xcrun simctl erase all

   # Clear test caches
   rm -rf ~/Library/Developer/Xcode/DerivedData/*/Build/Intermediates.noindex/XCBuildData/
   ```

---

#### Test Timeout Errors

**Error: "Timed out waiting for test to start"**

**Common causes:**

1. Simulator not ready
2. App taking too long to launch
3. Test bundle not installed correctly
4. Resource constraints on CI

**Solutions:**

1. **Increase timeout:**

   ```bash
   # Use longer default timeout (seconds)
   defaults write com.apple.dt.XCTest TestTimeoutsEnabled -bool YES
   defaults write com.apple.dt.XCTest DefaultTestExecutionTimeAllowance 120
   ```

2. **Pre-boot simulator:**

   ```bash
   # Boot simulator before testing
   xcrun simctl boot "iPhone 15"
   sleep 10

   # Then run tests
   xcodebuild test -project MyApp.xcodeproj ...
   ```

3. **Optimize app launch:**
   - Reduce initialization work in app delegate
   - Use test-specific app delegate for unit tests
   - Mock heavy dependencies during testing

---

#### UI Test Specific Errors

**Error: "UI Testing failed: Unable to find element"**

**Common causes:**

1. Element not visible/doesn't exist
2. Timing issues (element not loaded)
3. Accessibility identifier missing
4. Animation/transition interference

**Solutions:**

1. **Add explicit waits:**

   ```swift
   let element = app.buttons["myButton"]
   let exists = element.waitForExistence(timeout: 5)
   XCTAssertTrue(exists, "Button should exist")
   ```

2. **Use accessibility identifiers:**

   ```swift
   // In app code
   button.accessibilityIdentifier = "loginButton"

   // In test
   app.buttons["loginButton"].tap()
   ```

3. **Disable animations:**
   ```swift
   // In test setUp()
   app.launchArguments += ["-UIAnimationsDisabled", "true"]
   ```

---

## simctl Error Codes

### Device Errors

#### Error: "Device not found"

**What it means:**
The specified device UDID or name doesn't match any available simulators.

**Common causes:**

1. UDID is incorrect or device was deleted
2. Device name mismatch (case-sensitive)
3. Runtime not installed
4. Simulator data corruption

**How to diagnose:**

```bash
# List all devices
xcrun simctl list devices

# Search for specific device
xcrun simctl list devices | grep -i "iPhone 15"

# Get device details
xcrun simctl list devices --json
```

**Solutions:**

1. **Find correct device:**

   ```bash
   # List available devices with UDIDs
   xcrun simctl list devices available

   # Create new device if needed
   xcrun simctl create "iPhone 15 Test" \
     "iPhone 15" \
     "iOS 17.0"
   ```

2. **Fix corrupted device database:**

   ```bash
   # Kill CoreSimulator service
   killall -9 com.apple.CoreSimulator.CoreSimulatorService

   # List devices again (will restart service)
   xcrun simctl list devices
   ```

3. **Reinstall runtime if missing:**

   ```bash
   # List available runtimes
   xcrun simctl list runtimes

   # Download in Xcode
   # Xcode > Preferences > Components > Simulators
   ```

**Prevention tips:**

- Store device UDIDs in configuration files
- Use device name patterns that are unlikely to change
- Regularly verify simulator inventory

---

#### Error: "Device already booted"

**What it means:**
Attempting to boot a simulator that is already in the "Booted" state.

**Solutions:**

1. **Check device state:**

   ```bash
   # Get current state
   xcrun simctl list devices | grep "Booted"

   # Get specific device state
   xcrun simctl bootstatus <UDID>
   ```

2. **Handle idempotently:**

   ```bash
   # Boot only if not already booted
   STATE=$(xcrun simctl list devices | grep <UDID> | grep -o "Booted")
   if [ -z "$STATE" ]; then
     xcrun simctl boot <UDID>
   fi
   ```

3. **Shutdown and reboot:**
   ```bash
   xcrun simctl shutdown <UDID>
   sleep 2
   xcrun simctl boot <UDID>
   ```

---

#### Error: "Boot timeout"

**What it means:**
Simulator failed to fully boot within expected timeframe.

**Common causes:**

1. System resource constraints
2. Corrupted simulator data
3. Conflicting processes
4. Xcode/CoreSimulator issues

**How to diagnose:**

```bash
# Check system logs
log stream --predicate 'process == "CoreSimulatorService"' --level debug

# Monitor boot status
xcrun simctl bootstatus <UDID> -m
```

**Solutions:**

1. **Wait for proper boot:**

   ```bash
   # Boot with monitoring
   xcrun simctl boot <UDID>
   xcrun simctl bootstatus <UDID> -m

   # Or use timeout loop
   timeout=60
   while [ $timeout -gt 0 ]; do
     if xcrun simctl list devices | grep <UDID> | grep -q "Booted"; then
       echo "Booted successfully"
       break
     fi
     sleep 1
     ((timeout--))
   done
   ```

2. **Free system resources:**
   - Close unnecessary applications
   - Shutdown other simulators
   - Restart Mac if persistent

3. **Reset simulator:**
   ```bash
   xcrun simctl shutdown <UDID>
   xcrun simctl erase <UDID>
   xcrun simctl boot <UDID>
   ```

**Prevention tips:**

- Boot simulators sequentially on CI, not in parallel
- Monitor system resources during builds
- Use pre-booted simulators for test runs

---

#### Error: "Invalid device type/runtime"

**What it means:**
The specified device type or iOS runtime is not available or not compatible.

**Solutions:**

1. **Check available combinations:**

   ```bash
   # List device types
   xcrun simctl list devicetypes

   # List runtimes
   xcrun simctl list runtimes

   # Create with valid combination
   xcrun simctl create "My Device" \
     "com.apple.CoreSimulator.SimDeviceType.iPhone-15" \
     "com.apple.CoreSimulator.SimRuntime.iOS-17-0"
   ```

2. **Download missing runtime:**
   - Open Xcode > Settings > Platforms
   - Download required iOS runtime
   - Or use xcodebuild: `xcodebuild -downloadPlatform iOS`

---

### App Errors

#### Error: "App installation failed"

**Common causes:**

1. Invalid .app bundle
2. Bundle identifier conflicts
3. Insufficient storage on simulator
4. Corrupted app data

**How to diagnose:**

```bash
# Verify app bundle
ls -la MyApp.app

# Check bundle structure
codesign -dv MyApp.app

# Get installation logs
xcrun simctl install <UDID> MyApp.app 2>&1
```

**Solutions:**

1. **Verify app bundle:**

   ```bash
   # Check Info.plist exists
   plutil -p MyApp.app/Info.plist

   # Verify bundle executable
   file MyApp.app/MyApp
   ```

2. **Uninstall existing app:**

   ```bash
   # Uninstall by bundle ID
   xcrun simctl uninstall <UDID> com.example.MyApp

   # Then install fresh
   xcrun simctl install <UDID> MyApp.app
   ```

3. **Reset simulator storage:**
   ```bash
   # Erase all contents
   xcrun simctl erase <UDID>
   ```

---

#### Error: "App launch failed"

**Common causes:**

1. App not installed
2. App crashes on launch
3. Missing entitlements or permissions
4. Invalid configuration

**How to diagnose:**

```bash
# Check if app is installed
xcrun simctl listapps <UDID> | grep "com.example.MyApp"

# Get crash logs
xcrun simctl spawn <UDID> log stream --level debug --predicate 'process == "MyApp"'

# Try manual launch with output
xcrun simctl launch --console <UDID> com.example.MyApp
```

**Solutions:**

1. **Get detailed error:**

   ```bash
   # Launch with console output
   xcrun simctl launch --console <UDID> com.example.MyApp

   # Or check system log
   xcrun simctl spawn <UDID> log show --last 5m --predicate 'process == "MyApp"'
   ```

2. **Fix common issues:**
   - Ensure app is installed: `xcrun simctl install <UDID> MyApp.app`
   - Check app bundle is valid
   - Verify simulator is booted
   - Check for missing frameworks or resources

3. **Get crash report:**

   ```bash
   # Find crash logs
   ls -lt ~/Library/Logs/DiagnosticReports/ | grep MyApp

   # Read crash log
   cat ~/Library/Logs/DiagnosticReports/MyApp-*.crash
   ```

---

#### Error: "Bundle identifier issues"

**What it means:**
Bundle identifier mismatch or invalid format.

**Common causes:**

1. Bundle ID doesn't match between build and launch
2. Invalid characters in bundle ID
3. Bundle ID collision with existing app

**Solutions:**

1. **Verify bundle identifier:**

   ```bash
   # Check app's bundle ID
   plutil -p MyApp.app/Info.plist | grep CFBundleIdentifier

   # List installed apps
   xcrun simctl listapps <UDID>
   ```

2. **Use correct bundle ID:**

   ```bash
   # Uninstall with correct ID
   xcrun simctl uninstall <UDID> com.example.MyApp

   # Install and launch with correct ID
   xcrun simctl install <UDID> MyApp.app
   xcrun simctl launch <UDID> com.example.MyApp
   ```

---

### State Errors

#### Error: "Simulator state conflicts"

**What it means:**
Simulator is in an unexpected or inconsistent state.

**Common causes:**

1. CoreSimulator service issues
2. Concurrent operations on same device
3. Interrupted shutdown/boot
4. Corrupted device data

**Solutions:**

1. **Reset simulator state:**

   ```bash
   # Shutdown all simulators
   xcrun simctl shutdown all

   # Restart CoreSimulator service
   killall -9 com.apple.CoreSimulator.CoreSimulatorService

   # Boot specific device
   xcrun simctl boot <UDID>
   ```

2. **Clean conflicting state:**

   ```bash
   # Erase device
   xcrun simctl erase <UDID>

   # Or delete and recreate
   xcrun simctl delete <UDID>
   xcrun simctl create "iPhone 15" "iPhone 15" "iOS 17.0"
   ```

---

#### Error: "CoreSimulator service errors"

**Error examples:**

- "Unable to boot device because we cannot determine the runtime bundle"
- "An error was encountered processing the command (domain=NSPOSIXErrorDomain, code=60)"
- "Failed to register as current application for device"

**Solutions:**

1. **Restart CoreSimulator service:**

   ```bash
   # Kill service
   killall -9 com.apple.CoreSimulator.CoreSimulatorService

   # Clear service caches
   rm -rf ~/Library/Saved\ Application\ State/com.apple.CoreSimulator.*

   # Restart Xcode
   killall Xcode
   ```

2. **Reset simulator environment:**

   ```bash
   # Shutdown all
   xcrun simctl shutdown all

   # Delete unavailable devices
   xcrun simctl delete unavailable

   # Clear caches
   rm -rf ~/Library/Caches/com.apple.dt.Xcode
   ```

3. **Full simulator reset (nuclear option):**

   ```bash
   # ⚠️ This deletes ALL simulators
   xcrun simctl shutdown all
   rm -rf ~/Library/Developer/CoreSimulator/Devices/*

   # Recreate devices
   xcrun simctl create "iPhone 15" "iPhone 15" "iOS 17.0"
   ```

---

## IDB Error Codes

### Connection Errors

#### Error: "Target not found"

**What it means:**
IDB cannot find or connect to the specified device/simulator.

**Common causes:**

1. Device UDID incorrect
2. IDB companion not running on device/simulator
3. Device not connected or not trusted
4. USB connection issues (physical devices)

**How to diagnose:**

```bash
# List available IDB targets
idb list-targets

# Check IDB companion status
idb describe --udid <UDID>

# Check USB devices
system_profiler SPUSBDataType | grep iPhone
```

**Solutions:**

1. **Start IDB companion:**

   ```bash
   # For simulator
   idb_companion --udid <UDID> &

   # Or boot simulator first
   xcrun simctl boot <UDID>
   sleep 5
   idb list-targets
   ```

2. **For physical devices:**
   - Ensure device is plugged in via USB
   - Trust the computer on the device
   - Check "Settings > Developer > Enable UI Automation"

3. **Connect explicitly:**

   ```bash
   # Connect to target
   idb connect <UDID>

   # Or specify host:port for remote
   idb connect localhost:10882 --udid <UDID>
   ```

**Prevention tips:**

- Keep IDB and companion versions synchronized
- Use `idb list-targets` to verify connectivity before operations
- For CI, ensure simulators are booted before IDB operations

---

#### Error: "Connection timeout"

**What it means:**
IDB cannot establish or maintain connection to target within timeout period.

**Common causes:**

1. Network issues (for remote connections)
2. IDB companion crashed or unresponsive
3. Device overloaded or slow to respond
4. Firewall blocking connection

**Solutions:**

1. **Check companion health:**

   ```bash
   # Kill and restart companion
   pkill -9 idb_companion

   # Start with verbose logging
   idb_companion --udid <UDID> --log-level DEBUG &
   ```

2. **Increase timeout:**

   ```bash
   # Set longer timeout (seconds)
   idb --timeout 60 ui describe-all --udid <UDID>
   ```

3. **Check network (remote connections):**

   ```bash
   # Test connectivity
   nc -zv <host> 10882

   # Check IDB companion is listening
   lsof -i :10882
   ```

---

#### Error: "IDB companion not running"

**What it means:**
The IDB companion process is not running on the target device/simulator.

**Solutions:**

1. **Start companion manually:**

   ```bash
   # Find companion binary
   which idb_companion

   # Start for specific device
   idb_companion --udid <UDID> --grpc-port 10882 &

   # Verify it started
   idb list-targets
   ```

2. **Install IDB companion (if missing):**

   ```bash
   # Install via Homebrew
   brew install idb-companion

   # Or build from source
   # See: https://fbidb.io/docs/installation
   ```

3. **Auto-start companion:**
   ```bash
   # Use IDB's built-in companion management
   idb boot <UDID>  # Boots simulator and starts companion
   ```

---

### UI Automation Errors

#### Error: "Element not found"

**What it means:**
The requested UI element doesn't exist in the accessibility tree.

**Common causes:**

1. Element not visible on screen
2. Incorrect query selector
3. Element not loaded yet (timing)
4. Accessibility identifiers missing

**How to diagnose:**

```bash
# Dump entire accessibility tree
idb ui describe-all --udid <UDID>

# Search for specific element
idb ui describe-all --udid <UDID> | grep -i "button"

# Get element at specific point
idb ui describe-point --x 100 --y 200 --udid <UDID>
```

**Solutions:**

1. **Verify element exists:**

   ```bash
   # Use accessibility quality check first
   # (returns confidence score)

   # Then find element
   idb ui describe-all --udid <UDID> | jq '.[] | select(.label | contains("Login"))'
   ```

2. **Add explicit waits:**
   - Use polling mechanism to wait for element
   - Check element exists before interacting
   - Allow time for animations to complete

3. **Fix accessibility:**
   In your app code:

   ```swift
   // Add accessibility identifier
   button.accessibilityIdentifier = "loginButton"

   // Ensure element is accessible
   button.isAccessibilityElement = true
   ```

---

#### Error: "Tap timeout"

**What it means:**
IDB's tap command timed out waiting for completion or response.

**Common causes:**

1. Target coordinates outside screen bounds
2. Element disabled or not interactive
3. UI thread blocked
4. Animation interference

**Solutions:**

1. **Verify coordinates:**

   ```bash
   # Get screen dimensions
   idb ui describe-all --udid <UDID> | jq '.[0].frame'

   # Ensure tap coordinates are within bounds
   # Screen coordinates: (0,0) to (width, height)
   ```

2. **Check element state:**

   ```bash
   # Describe element at tap point
   idb ui describe-point --x <X> --y <Y> --udid <UDID>

   # Verify "enabled" is true
   ```

3. **Wait for UI to settle:**

   ```bash
   # Take screenshot before tap to verify state
   idb screenshot --udid <UDID> before.png

   # Perform tap
   idb ui tap --x <X> --y <Y> --udid <UDID>

   # Take screenshot after to verify result
   idb screenshot --udid <UDID> after.png
   ```

---

#### Error: "Invalid coordinates"

**What it means:**
Tap or swipe coordinates are outside valid range or improperly formatted.

**Solutions:**

1. **Validate coordinate ranges:**

   ```bash
   # Coordinates must be:
   # - x: 0 to screen width
   # - y: 0 to screen height
   # - positive numbers

   # Get device screen size
   idb ui describe-all --udid <UDID> | jq '.[0].frame'
   ```

2. **Use element-based coordinates:**

   ```bash
   # Instead of hardcoded coordinates, query element
   ELEMENT=$(idb ui describe-all --udid <UDID> | jq '.[] | select(.label == "Login") | .frame')

   # Extract center coordinates
   X=$(echo $ELEMENT | jq '.x + (.width / 2)')
   Y=$(echo $ELEMENT | jq '.y + (.height / 2)')

   # Tap center
   idb ui tap --x $X --y $Y --udid <UDID>
   ```

---

#### Error: "Accessibility data unavailable"

**What it means:**
IDB cannot retrieve accessibility information from the app.

**Common causes:**

1. App has no accessibility elements
2. App crashed or frozen
3. Accessibility API disabled
4. IDB companion connection issue

**Solutions:**

1. **Check app state:**

   ```bash
   # Verify app is running
   idb list-apps --udid <UDID> | grep <bundle-id>

   # Check for crashes
   idb crash list --udid <UDID>
   ```

2. **Enable accessibility in app:**

   ```swift
   // Ensure views are accessible
   view.isAccessibilityElement = true
   view.accessibilityLabel = "Description"
   view.accessibilityIdentifier = "uniqueId"
   ```

3. **Restart accessibility services:**

   ```bash
   # Kill and relaunch app
   idb terminate <bundle-id> --udid <UDID>
   idb launch <bundle-id> --udid <UDID>

   # Wait and retry
   sleep 3
   idb ui describe-all --udid <UDID>
   ```

---

## Common Error Patterns

### Pattern 1: "Clean Build Doesn't Fix It"

**Symptoms:**

- Build fails consistently
- Clean build doesn't resolve
- Error persists across machines

**Root causes:**

1. Source control issue (uncommitted files)
2. External dependency problem
3. Xcode project file corruption
4. System-level configuration

**Diagnostic workflow:**

```bash
# 1. Verify all files are committed
git status

# 2. Check for uncommitted xcodeproj changes
git diff *.xcodeproj/project.pbxproj

# 3. Update dependencies
pod update  # or swift package update

# 4. Try fresh checkout
cd ..
git clone <repo-url> test-build
cd test-build
# Attempt build
```

**Solutions:**

- Commit or discard xcodeproj changes
- Update dependency lock files
- Verify build succeeds on clean checkout
- Check for system-wide Xcode configuration issues

---

### Pattern 2: "Works in Xcode, Fails in CLI"

**Symptoms:**

- Build succeeds in Xcode.app
- xcodebuild fails from terminal
- CI builds fail

**Root causes:**

1. Different Xcode version/path
2. Missing environment variables
3. Different build settings
4. Scheme configuration (shared vs. local)

**Diagnostic workflow:**

```bash
# 1. Check Xcode versions
xcodebuild -version
/Applications/Xcode.app/Contents/Developer/usr/bin/xcodebuild -version

# 2. Verify scheme exists and is shared
ls -la *.xcodeproj/xcshareddata/xcschemes/

# 3. Compare build settings
xcodebuild -project MyApp.xcodeproj -scheme MyApp -showBuildSettings > cli-settings.txt
# Compare with Xcode build settings

# 4. Check environment
env | grep -i xcode
```

**Solutions:**

1. **Share scheme:**
   - In Xcode: Product > Scheme > Manage Schemes
   - Check "Shared" for CI schemes
   - Commit xcshareddata directory

2. **Use same Xcode:**

   ```bash
   sudo xcode-select -s /Applications/Xcode.app
   ```

3. **Match build settings:**
   - Use same configuration (Debug/Release)
   - Specify same destination
   - Pass same build flags

---

### Pattern 3: "Simulator Won't Boot/Stuck"

**Symptoms:**

- Simulator stuck in "Booting" state
- Boot command hangs
- UI shows progress bar indefinitely

**Root causes:**

1. CoreSimulator service hung
2. Insufficient system resources
3. Corrupted simulator data
4. Multiple conflicting operations

**Solutions (in order of severity):**

1. **Soft reset:**

   ```bash
   xcrun simctl shutdown all
   sleep 5
   xcrun simctl boot <UDID>
   ```

2. **Service restart:**

   ```bash
   killall -9 com.apple.CoreSimulator.CoreSimulatorService
   killall -9 SimulatorTrampoline
   xcrun simctl boot <UDID>
   ```

3. **Erase simulator:**

   ```bash
   xcrun simctl shutdown <UDID>
   xcrun simctl erase <UDID>
   xcrun simctl boot <UDID>
   ```

4. **Nuclear option:**

   ```bash
   # ⚠️ Deletes all simulators
   xcrun simctl shutdown all
   rm -rf ~/Library/Developer/CoreSimulator/Devices
   rm -rf ~/Library/Caches/com.apple.CoreSimulator.SimRuntime.*

   # Recreate simulators
   xcrun simctl create "iPhone 15" "iPhone 15" "iOS 17.0"
   ```

---

### Pattern 4: "Tests Pass Locally, Fail on CI"

**Symptoms:**

- All tests green on developer machine
- CI tests fail intermittently or consistently
- Different failure patterns on CI

**Root causes:**

1. Timing/race conditions
2. Resource constraints on CI
3. Missing test data or fixtures
4. Environment differences

**Solutions:**

1. **Stabilize timing:**

   ```swift
   // Replace fixed sleeps
   sleep(2)

   // With expectations
   let expectation = XCTestExpectation(description: "Data loaded")
   viewModel.loadData {
     expectation.fulfill()
   }
   wait(for: [expectation], timeout: 5.0)
   ```

2. **Reduce CI parallelism:**

   ```bash
   # In CI configuration
   xcodebuild test \
     -parallel-testing-enabled NO \
     -maximum-parallel-testing-workers 1
   ```

3. **Match CI environment:**

   ```bash
   # Use same Xcode version
   # Use same simulator runtime
   # Use same build configuration
   ```

4. **Add retry logic:**

   ```bash
   # In CI script
   attempt=1
   max_attempts=3

   until xcodebuild test ... || [ $attempt -eq $max_attempts ]; do
     echo "Test attempt $attempt failed, retrying..."
     ((attempt++))
     sleep 10
   done
   ```

---

## Troubleshooting Workflow

### Step 1: Identify the Error Domain

```bash
# Is it a build error?
xcodebuild ... 2>&1 | grep -i "error:"

# Is it a simulator error?
xcrun simctl ... 2>&1

# Is it an IDB error?
idb ... 2>&1 | grep -i "error"
```

### Step 2: Collect Diagnostic Information

```bash
# Environment info
xcodebuild -version
xcrun simctl list runtimes
idb --version

# System state
df -h /  # Disk space
vm_stat  # Memory
top -l 1 | grep "CPU usage"  # CPU

# Recent logs
log show --predicate 'process == "xcodebuild"' --last 30m
log show --predicate 'subsystem == "com.apple.CoreSimulator"' --last 30m
```

### Step 3: Isolate the Problem

**For build errors:**

1. Does it build in Xcode.app?
2. Does a clean build fix it?
3. Does it fail on a fresh checkout?
4. Does it fail for other developers?

**For simulator errors:**

1. Does the device exist? `xcrun simctl list devices`
2. Can you boot it manually? `xcrun simctl boot <UDID>`
3. Does it work with a new simulator?
4. Does it work after erasing? `xcrun simctl erase <UDID>`

**For IDB errors:**

1. Is companion running? `idb list-targets`
2. Can you connect? `idb connect <UDID>`
3. Does describe-all work? `idb ui describe-all --udid <UDID>`
4. Does it work with a fresh app install?

### Step 4: Apply Fix

Based on error category:

- **Build errors:** Clean, reset, fix dependencies
- **Simulator errors:** Restart service, erase, recreate
- **IDB errors:** Restart companion, reconnect, verify accessibility

### Step 5: Verify Fix

```bash
# Re-run failing command
# Check logs for warnings
# Run additional validation
```

### Step 6: Prevent Recurrence

- Document solution in team wiki
- Update CI scripts with workarounds
- Add monitoring for early detection
- File radar/bug reports if Xcode/Apple issue

---

## Error Code Quick Reference Table

| Error                 | Domain     | Common Cause              | Quick Fix                                | See Section                                            |
| --------------------- | ---------- | ------------------------- | ---------------------------------------- | ------------------------------------------------------ |
| Exit 65               | xcodebuild | Build failed              | Check compilation errors, clean build    | [Build Errors](#exit-code-65-build-failed)             |
| Exit 70               | xcodebuild | Internal error            | Reset Xcode tools, clear cache           | [Build Errors](#exit-code-70-internal-error)           |
| Exit 71               | xcodebuild | System error              | Free resources, reduce parallelism       | [Build Errors](#exit-code-71-system-error)             |
| CompileSwift failed   | xcodebuild | Compilation error         | Check syntax, reduce complexity          | [Compilation Errors](#swift-compilation-errors)        |
| Code signing failed   | xcodebuild | Certificate/profile issue | Verify certificate, update profile       | [Code Signing](#code-signing-errors)                   |
| Undefined symbols     | xcodebuild | Linker error              | Check target membership, link frameworks | [Linker Errors](#linker-errors)                        |
| Test timeout          | xcodebuild | Test hung                 | Increase timeout, pre-boot simulator     | [Test Errors](#test-timeout-errors)                    |
| Device not found      | simctl     | Invalid UDID/name         | List devices, verify UDID                | [Device Errors](#error-device-not-found)               |
| Already booted        | simctl     | State conflict            | Check state, shutdown if needed          | [Device Errors](#error-device-already-booted)          |
| Boot timeout          | simctl     | Boot failed               | Wait longer, reset simulator             | [Device Errors](#error-boot-timeout)                   |
| App install failed    | simctl     | Invalid bundle            | Verify bundle, uninstall old version     | [App Errors](#error-app-installation-failed)           |
| App launch failed     | simctl     | Crash on launch           | Check logs, install app first            | [App Errors](#error-app-launch-failed)                 |
| CoreSimulator error   | simctl     | Service issue             | Kill service, clear cache                | [State Errors](#error-coresimulator-service-errors)    |
| Target not found      | IDB        | No connection             | Start companion, boot simulator          | [Connection Errors](#error-target-not-found)           |
| Connection timeout    | IDB        | Network/service           | Restart companion, increase timeout      | [Connection Errors](#error-connection-timeout)         |
| Element not found     | IDB        | Missing UI element        | Verify element exists, add wait          | [UI Automation](#error-element-not-found)              |
| Tap timeout           | IDB        | Invalid interaction       | Check coordinates, verify enabled        | [UI Automation](#error-tap-timeout)                    |
| Invalid coordinates   | IDB        | Out of bounds             | Validate range, use element center       | [UI Automation](#error-invalid-coordinates)            |
| No accessibility data | IDB        | App issue                 | Check app state, enable accessibility    | [UI Automation](#error-accessibility-data-unavailable) |

---

## Related Resources

**Skills:**

- `xcode-workflows`: Complete xcodebuild workflows and best practices
- `simulator-workflows`: simctl operations and simulator management
- `idb-automation`: IDB usage patterns and UI automation
- `troubleshooting`: Advanced debugging techniques

**References:**

- `xcode-reference`: xcodebuild flags and options
- `simulator-reference`: simctl commands and device types
- `idb-reference`: IDB commands and parameters

**External Documentation:**

- [Apple: Technical Note TN2215 - Troubleshooting Push Notifications](https://developer.apple.com/library/archive/technotes/tn2215/)
- [Apple: Debugging](https://developer.apple.com/documentation/xcode/debugging)
- [IDB Documentation](https://fbidb.io/docs/overview)

---

_Last updated: 2025-11-06_
_Part of xc-mcp - iOS Development MCP Server_
