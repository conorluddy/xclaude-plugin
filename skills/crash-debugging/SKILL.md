---
name: crash-debugging
description: Crash log analysis, symbolication, and debugging workflows for iOS apps. Use when investigating app crashes, analyzing crash reports, symbolicating stack traces, or identifying root causes. Covers crash log retrieval, symbolication with dSYM files, stack trace analysis, and common crash patterns.
version: 0.0.1
token_cost: ~40
---

# Crash Debugging Skill

**Comprehensive guide to iOS crash analysis and debugging**

## Quick Reference

| Task | Tool/Command | Location |
|------|--------------|----------|
| View crash logs | Console.app | macOS Application |
| Retrieve simulator crashes | ~/Library/Logs/DiagnosticReports/ | File system |
| Symbolicate crash | atos | Command line |
| Find dSYM files | Xcode Organizer / DerivedData | Xcode |
| Analyze crash type | Stack trace patterns | Crash log |

## Overview

Crash debugging transforms cryptic crash logs into actionable insights. This skill covers:
- Retrieving crash logs from simulators and devices
- Understanding crash log structure
- Symbolicating stack traces for readable function names
- Identifying common crash patterns
- Determining root causes

## When to Use This Skill

**Use this skill when:**
- App crashes during testing or development
- Received crash reports from users or TestFlight
- CI/CD pipeline reports test crashes
- Need to symbolicate production crash logs
- Investigating memory issues or crashes

**Don't use for:**
- Build failures (see xcode-workflows)
- Test assertion failures (see ios-testing-patterns)
- UI debugging (see ui-automation-workflows)

## Key Concepts

### Crash Logs vs Diagnostic Reports

**Crash Logs:**
- Generated when app terminates unexpectedly
- Include exception type, stack trace, register state
- Stored in DiagnosticReports directory
- Named: `AppName_YYYY-MM-DD-HHMMSS_DeviceName.crash`

**Diagnostic Reports:**
- Broader category including crashes, spins, hangs
- May include system diagnostics
- Same location as crash logs

### Symbolication Process

**Unsymbolicated:**
```
0   MyApp    0x0000000102a3c4f8 0x102a38000 + 17656
1   MyApp    0x0000000102a3d1a4 0x102a38000 + 20900
```

**Symbolicated:**
```
0   MyApp    0x0000000102a3c4f8 ViewController.loginButtonTapped() + 120
1   MyApp    0x0000000102a3d1a4 ViewController.viewDidLoad() + 84
```

**Symbolication Requirements:**
1. **dSYM file** matching the build UUID
2. **Binary** (MyApp.app/MyApp)
3. **Crash log** with memory addresses

### Stack Traces and Debugging Symbols

**Stack Trace:**
- List of function calls leading to crash
- Ordered from crash point (top) to app entry (bottom)
- Each line contains: frame number, binary name, address, symbol + offset

**Debugging Symbols (dSYM):**
- Separate file containing symbol information
- Maps memory addresses to function names
- Generated during build (if "Debug Information Format" = "DWARF with dSYM")
- Essential for crash analysis

### Common Crash Types

| Exception Type | Meaning | Common Cause |
|----------------|---------|--------------|
| EXC_BAD_ACCESS | Invalid memory access | Dangling pointer, use-after-free |
| SIGABRT | Process aborted | Assertion failure, force unwrap nil |
| EXC_BREAKPOINT | Breakpoint hit | Swift runtime error, fatal error |
| SIGILL | Illegal instruction | Corrupted code, wrong architecture |
| SIGSEGV | Segmentation fault | Memory corruption |
| SIGBUS | Bus error | Unaligned memory access |

## Workflows

### Workflow 1: Crash Log Retrieval

#### From Simulator

**Step 1: Locate Crash Logs**

```bash
open ~/Library/Logs/DiagnosticReports/
```

**Directory Structure:**
```
DiagnosticReports/
├── MyApp_2025-11-06-143022_Conors-MacBook.crash
├── MyApp_2025-11-06-140511_Conors-MacBook.crash
└── ...
```

**Step 2: Identify Recent Crash**

Sort by date modified, or filter by app name:

```bash
ls -lt ~/Library/Logs/DiagnosticReports/ | grep MyApp | head -5
```

**Step 3: Read Crash Log**

```bash
cat ~/Library/Logs/DiagnosticReports/MyApp_2025-11-06-143022_Conors-MacBook.crash
```

#### From Console.app (Recommended)

**Step 1: Open Console.app**

```bash
open -a Console
```

**Step 2: Filter Logs**
- Click "Crash Reports" in sidebar
- Search for app name
- Click crash report to view

**Advantages:**
- Real-time monitoring
- Better filtering and search
- Automatic refresh

#### From Device (via Xcode)

**Step 1: Connect Device**

**Step 2: Open Devices and Simulators**
- Xcode → Window → Devices and Simulators
- Select device

**Step 3: View Device Logs**
- Click "View Device Logs"
- Find crash report
- Right-click → Export

### Workflow 2: Symbolication

#### Automatic Symbolication (Xcode)

**Step 1: Locate dSYM**

Xcode automatically symbolicates if:
1. dSYM is in Spotlight index
2. dSYM UUID matches crash log

**Check dSYM UUID:**

```bash
dwarfdump --uuid /path/to/MyApp.app.dSYM
```

**Check Crash Log UUID:**

```
Binary Images:
0x102a38000 - 0x102a4bfff MyApp arm64  <12345678-1234-1234-1234-123456789abc>
```

UUIDs must match for symbolication.

**Step 2: Import to Xcode**

If auto-symbolication fails:
1. Xcode → Window → Organizer
2. Select "Crashes" tab
3. Drag crash log into window
4. Xcode symbolicates automatically (if dSYM available)

#### Manual Symbolication (atos)

**Step 1: Find Required Files**

```bash
# App binary
APP_BINARY="/path/to/MyApp.app/MyApp"

# dSYM file
DSYM_FILE="/path/to/MyApp.app.dSYM/Contents/Resources/DWARF/MyApp"

# Load address (from crash log "Binary Images" section)
LOAD_ADDRESS="0x102a38000"
```

**Step 2: Symbolicate Address**

```bash
atos -arch arm64 -o "$DSYM_FILE" -l "$LOAD_ADDRESS" 0x0000000102a3c4f8
```

**Output:**
```
ViewController.loginButtonTapped() (in MyApp) (ViewController.swift:45)
```

**Step 3: Symbolicate Multiple Addresses**

```bash
atos -arch arm64 -o "$DSYM_FILE" -l "$LOAD_ADDRESS" \
  0x0000000102a3c4f8 \
  0x0000000102a3d1a4 \
  0x0000000102a3e220
```

#### Batch Symbolication (symbolicatecrash)

**Symbolicate Entire Crash Log:**

```bash
export DEVELOPER_DIR="/Applications/Xcode.app/Contents/Developer"

symbolicatecrash MyApp.crash MyApp.app.dSYM > MyApp_symbolicated.crash
```

**Verify Symbolication:**

```bash
grep -A 10 "Thread 0 Crashed" MyApp_symbolicated.crash
```

Should show function names, not just addresses.

### Workflow 3: Stack Trace Analysis

#### Reading a Crash Log

**Crash Log Structure:**

```
Incident Identifier: 12345678-1234-1234-1234-123456789ABC
CrashReporter Key:   ABCDEF1234567890
Hardware Model:      iPhone15,2
Process:             MyApp [12345]
Path:                /private/var/containers/Bundle/Application/.../MyApp.app/MyApp
Identifier:          com.example.MyApp
Version:             1.0 (1)
Code Type:           ARM-64
Parent Process:      launchd [1]

Date/Time:           2025-11-06 14:30:22.123 +0000
OS Version:          iOS 17.0 (21A5326a)
Report Version:      104

Exception Type:      EXC_BAD_ACCESS (SIGSEGV)
Exception Subtype:   KERN_INVALID_ADDRESS at 0x0000000000000000
Termination Reason:  SIGNAL 11 Segmentation fault: 11
Terminating Process: exc handler [12345]

Triggered by Thread: 0

Thread 0 Crashed:
0   MyApp              0x0000000102a3c4f8 ViewController.loginButtonTapped() + 120
1   MyApp              0x0000000102a3d1a4 ViewController.viewDidLoad() + 84
2   UIKitCore          0x00000001b2e4c3a0 -[UIViewController loadViewIfRequired] + 928
...

Thread 1:
0   libsystem_kernel.dylib  0x00000001a2b3c4a8 __workq_kernreturn + 8
...

Binary Images:
0x102a38000 - 0x102a4bfff MyApp arm64  <12345678-1234-1234-1234-123456789abc>
...
```

#### Key Sections to Analyze

**1. Exception Type**

```
Exception Type:      EXC_BAD_ACCESS (SIGSEGV)
Exception Subtype:   KERN_INVALID_ADDRESS at 0x0000000000000000
```

- **EXC_BAD_ACCESS**: Memory access violation
- **KERN_INVALID_ADDRESS**: Address doesn't exist (null pointer)
- **0x0000000000000000**: Accessing address zero (dereferencing nil)

**2. Crashed Thread**

```
Thread 0 Crashed:
0   MyApp              0x102a3c4f8 ViewController.loginButtonTapped() + 120
1   MyApp              0x102a3d1a4 ViewController.viewDidLoad() + 84
```

- Frame 0 is crash location
- Read from top to bottom (most recent to oldest)
- Identify last app frame before system frames

**3. Binary Images**

```
0x102a38000 - 0x102a4bfff MyApp arm64  <12345678-1234-1234-1234-123456789abc>
```

- Load address: `0x102a38000`
- UUID: `12345678-1234-1234-1234-123456789abc`
- Architecture: `arm64`

### Workflow 4: Root Cause Identification

#### Step 1: Identify Crash Type

Match exception type to common patterns (see below).

#### Step 2: Locate Crash Point

Find the topmost frame in your app's code:

```
Thread 0 Crashed:
0   MyApp              0x102a3c4f8 ViewController.loginButtonTapped() + 120  ← START HERE
1   MyApp              0x102a3d1a4 ViewController.viewDidLoad() + 84
```

#### Step 3: Analyze Code Path

1. Open file at crash location (ViewController.swift:45)
2. Examine function `loginButtonTapped()`
3. Check for:
   - Optional unwrapping (`!` or `?`)
   - Array/dictionary access
   - Object references
   - Memory management

#### Step 4: Reproduce Locally

1. Set breakpoint at crash location
2. Follow stack trace path
3. Inspect variables and state
4. Identify null/invalid values

#### Step 5: Validate Fix

1. Apply fix
2. Build and test
3. Verify no regression
4. Monitor for related crashes

## Common Crash Patterns

### EXC_BAD_ACCESS (Memory Issues)

**Signature:**
```
Exception Type:  EXC_BAD_ACCESS (SIGSEGV)
Exception Codes: KERN_INVALID_ADDRESS at 0x0000000000000000
```

**Common Causes:**

**1. Dereferencing Nil (Swift)**

```swift
// Crash:
let user: User? = nil
let name = user!.name  // EXC_BAD_ACCESS

// Fix:
if let name = user?.name {
    // Use name safely
}
```

**2. Dangling Pointer (Objective-C)**

```objc
// Crash:
@property (nonatomic, unsafe_unretained) id delegate;  // Dangerous
[self.delegate callMethod];  // Delegate deallocated → EXC_BAD_ACCESS

// Fix:
@property (nonatomic, weak) id<MyDelegate> delegate;
```

**3. Use-After-Free**

```swift
// Crash:
var buffer = UnsafeMutablePointer<Int>.allocate(capacity: 10)
buffer.deallocate()
buffer[0] = 42  // EXC_BAD_ACCESS

// Fix:
buffer[0] = 42
buffer.deallocate()
```

**Debugging:**
- Enable Address Sanitizer (Scheme → Diagnostics → Address Sanitizer)
- Check for `weak` vs `unsafe_unretained` references
- Verify object lifecycle

### SIGABRT (Assertion Failures)

**Signature:**
```
Exception Type:  EXC_CRASH (SIGABRT)
Exception Codes: 0x0000000000000000, 0x0000000000000000
Termination Reason: Namespace SIGNAL, Code 6 Abort trap: 6
```

**Common Causes:**

**1. Force Unwrap Nil (Swift)**

```swift
// Crash:
let value = dictionary["key"]!  // key doesn't exist → SIGABRT

// Stack trace shows:
Fatal error: Unexpectedly found nil while unwrapping an Optional value

// Fix:
if let value = dictionary["key"] {
    // Use value
}
```

**2. Array Index Out of Bounds**

```swift
// Crash:
let items = [1, 2, 3]
let item = items[10]  // Index out of range → SIGABRT

// Fix:
if items.indices.contains(10) {
    let item = items[10]
}
```

**3. NSException (Objective-C)**

```objc
// Crash:
[NSException raise:@"InvalidState" format:@"Unexpected condition"];

// Stack trace shows:
*** Terminating app due to uncaught exception 'InvalidState'
```

**Debugging:**
- Read error message in crash log (very descriptive)
- Check preconditions and assertions
- Validate input data

### EXC_BREAKPOINT (Swift Errors)

**Signature:**
```
Exception Type:  EXC_BREAKPOINT (SIGTRAP)
Exception Codes: 0x0000000000000001, 0x00000001a2b4c8d0
```

**Common Causes:**

**1. Fatal Error**

```swift
// Crash:
guard let user = currentUser else {
    fatalError("User must be logged in")  // EXC_BREAKPOINT
}

// Stack trace shows:
Fatal error: User must be logged in

// Fix:
guard let user = currentUser else {
    print("Error: User not logged in")
    return
}
```

**2. Type Cast Failure (as!)**

```swift
// Crash:
let value = anyValue as! String  // Value is not String → EXC_BREAKPOINT

// Fix:
if let value = anyValue as? String {
    // Use value
}
```

**3. Precondition Failure**

```swift
// Crash:
precondition(array.count > 0, "Array must not be empty")

// Fix:
if array.count > 0 {
    // Proceed safely
}
```

**Debugging:**
- Read fatal error message in crash log
- Review force casts (`as!`)
- Check preconditions and guards

### Timeout Crashes (Watchdog)

**Signature:**
```
Exception Type:  EXC_CRASH (SIGKILL)
Exception Codes: 0x0000000000000000, 0x0000000000000000
Termination Reason: Namespace SPRINGBOARD, Code 0x8badf00d
```

**0x8badf00d = "ate bad food" = Watchdog timeout**

**Common Causes:**

**1. Main Thread Blocking**

```swift
// Crash:
func viewDidLoad() {
    super.viewDidLoad()
    Thread.sleep(forTimeInterval: 30)  // Blocks main thread → Watchdog kills app
}

// Fix:
func viewDidLoad() {
    super.viewDidLoad()
    DispatchQueue.global().async {
        Thread.sleep(forTimeInterval: 30)
    }
}
```

**2. Launch Time Timeout**

App takes too long to launch (>20 seconds).

**Fix:**
- Defer heavy initialization
- Use background queues
- Profile launch time

**3. Suspend/Resume Timeout**

App doesn't respond to backgrounding/foregrounding.

**Fix:**
- Implement `applicationDidEnterBackground` quickly
- Move long operations to background

**Debugging:**
- Instrument Time Profiler
- Check main thread operations
- Review app lifecycle methods

### Memory Issues (JETSAM)

**Signature:**
```
Exception Type:  EXC_RESOURCE
Exception Subtype: MEMORY
Exception Codes: 0x0000000000000000, 0x0000000000000000
Termination Reason: Namespace JETSAM, Code 0xdead10cc
```

**Common Causes:**

**1. Memory Leak**

```swift
// Leak:
class ViewController {
    var closure: (() -> Void)?

    func setup() {
        closure = {
            self.doSomething()  // Retain cycle
        }
    }
}

// Fix:
closure = { [weak self] in
    self?.doSomething()
}
```

**2. Large Allocations**

```swift
// Crash:
let hugeArray = Array(repeating: Data(count: 1_000_000), count: 1000)

// Fix:
// Process in chunks, release memory incrementally
```

**Debugging:**
- Instruments → Allocations
- Instruments → Leaks
- Memory Graph Debugger (Xcode)

## Troubleshooting

### Missing Symbols

**Problem:** Stack trace shows addresses, not function names

**Cause:** Missing or mismatched dSYM file

**Solutions:**

1. **Find Correct dSYM**

```bash
# List all dSYMs in DerivedData
find ~/Library/Developer/Xcode/DerivedData -name "*.dSYM" -type d

# Check UUID
dwarfdump --uuid /path/to/MyApp.app.dSYM
```

2. **Match UUID**

Compare dSYM UUID with crash log Binary Images UUID. They must match exactly.

3. **Archive dSYMs**

Enable "Archive" in scheme settings to preserve dSYMs for releases.

4. **Download from Xcode Organizer**

For App Store builds:
- Xcode → Window → Organizer
- Select archive
- Download dSYMs

### Partial Stack Traces

**Problem:** Stack trace incomplete or truncated

**Causes:**
- Tail call optimization
- Inline functions
- Missing debug symbols

**Solutions:**

1. **Disable Optimizations**

Build Settings:
- Optimization Level: None [-O0]
- Debug Information Format: DWARF with dSYM File

2. **Build with Debug Configuration**

```json
{
  "operation": "build",
  "scheme": "MyApp",
  "configuration": "Debug"
}
```

3. **Disable Inlining**

Add `-Xswiftc -Ounchecked` to reduce optimizations.

### System Framework Crashes

**Problem:** Crash in UIKit, Foundation, or other system framework

**Stack Trace:**
```
Thread 0 Crashed:
0   UIKitCore          0x00001b2e4c3a0 -[UIView layoutSubviews] + 928
1   UIKitCore          0x00001b2e5d1c4 -[UIView setNeedsLayout] + 84
2   MyApp              0x00102a3c4f8 ViewController.updateUI() + 45
```

**Analysis:**
- Frame 2 is your code (start here)
- System frameworks rarely crash on their own
- Likely caused by invalid state or parameters from your code

**Solutions:**

1. **Check Parameters**

Before system call, validate:
- Non-nil objects
- Valid ranges
- Correct types

2. **Review Constraints**

Auto Layout issues often cause UIKit crashes:
- Check constraint conflicts
- Verify view hierarchy

3. **Enable Exception Breakpoint**

Xcode → Breakpoints → + → Exception Breakpoint
- Catches issues before system framework crash

### Third-Party Library Crashes

**Problem:** Crash in external library/framework

**Stack Trace:**
```
Thread 0 Crashed:
0   Alamofire          0x00001054a3c4f8 RequestAdapter.adapt() + 120
1   MyApp              0x00102a3c4f8 NetworkManager.fetchData() + 45
```

**Solutions:**

1. **Check Library Version**

Ensure compatible version:
- Update to latest stable
- Check release notes for bug fixes

2. **Review Integration**

Verify:
- Correct API usage
- Thread safety
- Initialization order

3. **Enable Library Debug Symbols**

In Podfile or SPM:
```ruby
post_install do |installer|
  installer.pods_project.targets.each do |target|
    target.build_configurations.each do |config|
      config.build_settings['DEBUG_INFORMATION_FORMAT'] = 'dwarf-with-dsym'
    end
  end
end
```

4. **Report Issue**

If library bug:
- Create minimal reproduction
- File GitHub issue
- Include crash log and steps

## Tools & Commands

### Console.app Usage

**Launch:**
```bash
open -a Console
```

**Filter by App:**
1. Click "Crash Reports" in sidebar
2. Enter app name in search
3. Select crash to view

**Export:**
Right-click crash → "Reveal in Finder" → Copy file

### atos for Symbolication

**Basic Usage:**
```bash
atos -arch arm64 \
     -o /path/to/App.app.dSYM/Contents/Resources/DWARF/App \
     -l 0x100000000 \
     0x100001234
```

**Parameters:**
- `-arch`: Architecture (arm64, x86_64)
- `-o`: Path to dSYM or binary
- `-l`: Load address from crash log
- Last argument: Address to symbolicate

**Multiple Addresses:**
```bash
atos -arch arm64 -o MyApp.dSYM -l 0x100000000 \
  0x100001234 0x100002345 0x100003456
```

### Xcode Organizer

**Access:**
Xcode → Window → Organizer

**Features:**
- View archives
- Download dSYMs for App Store builds
- View crash reports from TestFlight/App Store
- Automatic symbolication

**Crashes Tab:**
- Aggregate crashes from users
- Group by crash signature
- Filter by OS version, device

### lldb Debugging

**Set Breakpoint:**
```
(lldb) breakpoint set --name ViewController.loginButtonTapped
(lldb) breakpoint set --file ViewController.swift --line 45
```

**Examine Variables:**
```
(lldb) po user
(lldb) p user?.name
(lldb) frame variable
```

**Navigate Stack:**
```
(lldb) bt                 # Print backtrace
(lldb) frame select 2     # Switch to frame 2
(lldb) up                 # Move up stack
(lldb) down               # Move down stack
```

**Memory Inspection:**
```
(lldb) memory read 0x100001234
(lldb) register read
```

## Integration with Simulator Workflows

### Reproduce Crash in Simulator

**Workflow:**
```
1. Build app (xcode-workflows)
2. Boot simulator (simulator-workflows → boot)
3. Install app (simulator-workflows → install)
4. Launch with lldb attached (Xcode → Debug)
5. Reproduce crash
6. Analyze in debugger
```

**Retrieve Logs:**
```
1. Crash occurs in simulator
2. Console.app → Filter by app name
3. Or: ls ~/Library/Logs/DiagnosticReports/ | grep MyApp
4. Read crash log
5. Symbolicate if needed
```

## Related Skills

- **simulator-workflows**: App lifecycle and device management
- **xcode-workflows**: Building with debug symbols
- **ios-testing-patterns**: Preventing crashes through testing

## Related Resources

- `xc://reference/crash-types`: Complete crash type reference
- `xc://workflows/symbolication`: Detailed symbolication guide
- `xc://tools/debugging`: LLDB and debugging tools reference

---

**Tip: Enable Address Sanitizer and Undefined Behavior Sanitizer in scheme diagnostics to catch memory issues early.**
