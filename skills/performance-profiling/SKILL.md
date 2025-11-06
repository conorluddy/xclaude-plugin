---
name: performance-profiling
description: Instruments integration and performance analysis workflows for iOS apps. Use when profiling CPU usage, memory allocation, network activity, or energy consumption. Covers Time Profiler, Allocations, Leaks, Network instruments, and performance optimization strategies.
version: 0.0.1
token_cost: ~40
---

# Performance Profiling Skill

**Comprehensive guide to iOS performance analysis and optimization**

## Overview

Performance profiling is the systematic analysis of an iOS app's runtime behavior to identify bottlenecks, memory issues, network inefficiencies, and energy consumption patterns. This Skill guides you through using Instruments templates, interpreting profiling data, and applying optimization strategies.

**Key Tools:**
- Instruments (Xcode's profiling suite)
- xcodebuild for profiling builds
- Performance metrics analysis
- Memory graph debugging

## When to Use This Skill

Use performance profiling when:

1. **App Performance Issues**
   - Slow app launch times
   - Choppy scrolling or animations
   - UI freezing or unresponsiveness
   - High CPU usage

2. **Memory Problems**
   - Memory leaks detected
   - Growing memory footprint
   - Memory warnings
   - App crashes due to memory pressure

3. **Network Inefficiencies**
   - Slow data loading
   - Excessive network requests
   - Large payload sizes
   - Poor offline handling

4. **Energy Consumption**
   - Battery drain complaints
   - Background processing issues
   - Thermal throttling
   - Energy impact reports

5. **Pre-Release Optimization**
   - Performance regression detection
   - Baseline performance establishment
   - Release candidate validation
   - Performance budget enforcement

## Key Concepts

### Instruments Templates

**Time Profiler**
- Measures CPU usage and call stacks
- Identifies hot paths in code
- Shows function-level performance
- Best for: CPU-bound operations, algorithm optimization

**Allocations**
- Tracks memory allocations and deallocations
- Shows object lifetime and retention
- Identifies memory growth patterns
- Best for: Memory footprint analysis, allocation hotspots

**Leaks**
- Detects memory leaks in real-time
- Shows leaked objects and their origins
- Identifies retain cycles
- Best for: Finding memory leaks, debugging reference cycles

**Network**
- Monitors HTTP/HTTPS traffic
- Shows request/response timing
- Tracks payload sizes
- Best for: API optimization, bandwidth analysis

**Energy Log**
- Measures energy consumption
- Shows CPU, network, display impact
- Identifies battery drain sources
- Best for: Battery life optimization

**Core Animation**
- Analyzes frame rate and rendering
- Shows layer composition issues
- Identifies off-screen rendering
- Best for: Animation optimization, scrolling performance

### Profiling Strategies

**Sampling vs Tracing**

**Sampling (Time Profiler):**
- Periodically captures call stacks
- Low overhead (~5-10%)
- May miss short-lived operations
- Best for: Production-like scenarios

**Tracing (Most other instruments):**
- Records every event
- Higher overhead (10-50%)
- Complete event history
- Best for: Detailed analysis

### Performance Metrics

**Launch Time**
- Pre-main time: Dynamic library loading, +load methods
- Main to first frame: App initialization, first view load
- Target: < 400ms total on device

**Scrolling Performance**
- Frame rate: 60 FPS (16.67ms per frame)
- Hitch ratio: < 5ms hitches per second
- Target: 60 FPS sustained during scrolling

**Memory Footprint**
- Resident memory: Actual physical RAM used
- Dirty memory: Memory written to by app
- Target: Depends on device (< 150MB for low-end devices)

**Network Efficiency**
- Request latency: Time to first byte
- Transfer size: Payload + overhead
- Request frequency: Requests per minute
- Target: < 100KB per request, batch when possible

**Energy Impact**
- CPU time: Processor usage
- Network bytes: Data transferred
- Display time: Screen on time
- Target: "Low" or "Medium" energy impact rating

## Workflows

### CPU Profiling (Time Profiler)

**Goal:** Identify CPU-intensive operations and optimize hot paths

**Step 1: Build for Profiling**

```json
{
  "operation": "build",
  "scheme": "MyApp",
  "configuration": "Release",
  "destination": "platform=iOS,id=<device-udid>",
  "options": {
    "archive_for_profiling": true
  }
}
```

**Why Release Configuration?**
- Enables optimizations
- Reflects production performance
- Removes debug overhead

**Device vs Simulator:**
- Always profile on device for accurate CPU measurements
- Simulator runs on Mac CPU (not representative)

**Step 2: Profile with Instruments**

```bash
# Launch Instruments with Time Profiler template
instruments -t "Time Profiler" \
  -D /path/to/trace.trace \
  -w <device-udid> \
  com.example.MyApp
```

**Manual Approach:**
1. Open Instruments (Xcode → Open Developer Tool → Instruments)
2. Select "Time Profiler" template
3. Choose device and app
4. Click record, perform problematic operations
5. Stop recording

**Step 3: Analyze Call Tree**

**Call Tree Settings:**
- Enable "Separate by Thread"
- Enable "Hide System Libraries" (initially)
- Show "Heaviest Stack Trace"

**Interpret Results:**
- **Self Time**: Time spent in function itself
- **Total Time**: Time including called functions
- **Call Count**: Number of times function called

**Red Flags:**
- Self time > 50ms for UI operations
- High call count for expensive operations
- Unexpected functions in hot path

**Step 4: Optimize**

**Common Optimizations:**
- Reduce algorithm complexity (O(n²) → O(n log n))
- Cache expensive computations
- Move work off main thread
- Use lazy evaluation

**Verification:**
- Profile again after changes
- Compare before/after traces
- Ensure optimization didn't break functionality

### Memory Profiling (Allocations & Leaks)

**Goal:** Identify memory leaks and reduce memory footprint

**Step 1: Build for Profiling**

```json
{
  "operation": "build",
  "scheme": "MyApp",
  "configuration": "Debug",
  "destination": "platform=iOS Simulator,name=iPhone 15",
  "options": {
    "enable_memory_debugging": true
  }
}
```

**Note:** Use Debug for better stack traces, Simulator acceptable for memory profiling

**Step 2: Profile with Allocations**

```bash
# Launch Instruments with Allocations template
instruments -t "Allocations" \
  -D /path/to/allocations.trace \
  -w <simulator-udid> \
  com.example.MyApp
```

**Step 3: Identify Memory Growth**

**Heap Growth Analysis:**
1. Take memory snapshot (Mark Generation)
2. Perform operation (e.g., open/close view controller)
3. Take another snapshot
4. View "Growth" column

**Expected:** Minimal growth after repeated operations
**Red Flag:** Continuous growth with each iteration

**Step 4: Find Leaks**

**Switch to Leaks Instrument:**
```bash
instruments -t "Leaks" \
  -D /path/to/leaks.trace \
  -w <simulator-udid> \
  com.example.MyApp
```

**Interpret Results:**
- Leaks shown in red
- Click leak → See responsible stack trace
- Common causes: Retain cycles, unregistered observers

**Step 5: Debug Retain Cycles**

**Memory Graph Debugger:**
1. Run app in Xcode
2. Click "Debug Memory Graph" button
3. Filter by leaked objects
4. Inspect retain cycle paths

**Common Patterns:**
- Closure capturing self strongly
- Delegate not marked weak
- NSNotificationCenter observers not removed
- Timer retaining target

**Solutions:**
- Use `[weak self]` in closures
- Mark delegates as `weak`
- Remove observers in deinit
- Invalidate timers properly

### Network Profiling

**Goal:** Optimize network requests and reduce data usage

**Step 1: Profile with Network Instrument**

```bash
instruments -t "Network" \
  -D /path/to/network.trace \
  -w <device-udid> \
  com.example.MyApp
```

**Step 2: Analyze Network Activity**

**Key Metrics:**
- **Request Count**: Total number of requests
- **Bytes Transferred**: Upload + download size
- **Duration**: Time from request to completion
- **HTTP Status**: Success/failure codes

**Red Flags:**
- Many small requests (should batch)
- Large payloads (should paginate)
- Sequential requests (should parallelize)
- Redundant requests (should cache)

**Step 3: Optimize Requests**

**Batching:**
```swift
// Before: 10 separate requests
for item in items {
    fetchDetails(for: item)
}

// After: 1 batched request
fetchDetails(for: items)
```

**Pagination:**
```swift
// Fetch 20 items at a time
func fetchItems(page: Int, pageSize: Int = 20) {
    let offset = page * pageSize
    api.fetch(limit: pageSize, offset: offset)
}
```

**Caching:**
```swift
// Use URLCache or custom cache
let cache = URLCache.shared
cache.diskCapacity = 50 * 1024 * 1024 // 50MB
```

**Compression:**
```swift
// Enable gzip compression
request.setValue("gzip", forHTTPHeaderField: "Accept-Encoding")
```

### Energy Profiling

**Goal:** Reduce battery drain and thermal impact

**Step 1: Profile with Energy Log**

```bash
instruments -t "Energy Log" \
  -D /path/to/energy.trace \
  -w <device-udid> \
  com.example.MyApp
```

**Step 2: Analyze Energy Impact**

**Energy Sources:**
- **CPU**: Processing time
- **Network**: Data transfer
- **Display**: Screen updates
- **Location**: GPS usage
- **Background**: Background processing

**Energy Levels:**
- **Low**: 0-10 energy units
- **Medium**: 10-40 energy units
- **High**: > 40 energy units

**Target:** Stay in "Low" or "Medium" most of the time

**Step 3: Optimize Energy Usage**

**CPU Optimization:**
- Reduce background processing
- Use efficient algorithms
- Defer non-critical work

**Network Optimization:**
- Batch requests
- Use compression
- Schedule background transfers

**Display Optimization:**
- Reduce animation complexity
- Dim screen when possible
- Pause animations when offscreen

**Location Optimization:**
- Use lowest accuracy needed
- Stop updates when not needed
- Use significant location changes

## Common Profiling Patterns

### Launch Time Optimization

**Measurement Approach:**

1. **Profile App Launch**
```bash
instruments -t "App Launch" \
  -D /path/to/launch.trace \
  -w <device-udid> \
  com.example.MyApp
```

2. **Analyze Pre-Main Time**
   - Dynamic library loading
   - Objective-C class registration
   - +load method execution

**Optimization Strategies:**
- Reduce number of dynamic libraries
- Move +load work to +initialize
- Lazy load unnecessary frameworks

3. **Analyze Main to First Frame**
   - UIApplicationMain execution
   - didFinishLaunching execution
   - First view controller load

**Optimization Strategies:**
- Defer heavy initialization
- Load critical UI first
- Use placeholders for slow content

**Target:** < 400ms total launch time on device

### Scroll Performance Analysis

**Measurement Approach:**

1. **Profile Scrolling**
```bash
instruments -t "Core Animation" \
  -D /path/to/scroll.trace \
  -w <device-udid> \
  com.example.MyApp
```

2. **Check Frame Rate**
   - Target: 60 FPS (16.67ms per frame)
   - Acceptable: 50-60 FPS
   - Poor: < 50 FPS

3. **Identify Frame Drops**
   - Look for red/yellow bars in timeline
   - Check "Time Profiler" for main thread work

**Optimization Strategies:**

**Cell Reuse:**
```swift
// Proper cell reuse
func tableView(_ tableView: UITableView,
               cellForRowAt indexPath: IndexPath) -> UITableViewCell {
    let cell = tableView.dequeueReusableCell(withIdentifier: "Cell", for: indexPath)
    configure(cell: cell, with: data[indexPath.row])
    return cell
}
```

**Image Optimization:**
```swift
// Downsize images to display size
let size = imageView.bounds.size
let downsizedImage = image.resized(to: size)
imageView.image = downsizedImage
```

**Layout Caching:**
```swift
// Cache calculated heights
private var heightCache: [IndexPath: CGFloat] = [:]

func tableView(_ tableView: UITableView,
               heightForRowAt indexPath: IndexPath) -> CGFloat {
    if let height = heightCache[indexPath] {
        return height
    }
    let height = calculateHeight(for: indexPath)
    heightCache[indexPath] = height
    return height
}
```

**Off-Main-Thread Work:**
```swift
// Move image processing off main thread
DispatchQueue.global(qos: .userInitiated).async {
    let processedImage = self.processImage(image)
    DispatchQueue.main.async {
        self.imageView.image = processedImage
    }
}
```

### Memory Leak Detection

**Systematic Approach:**

1. **Identify Suspect Feature**
   - Feature that shows memory growth
   - Example: Opening/closing profile view

2. **Create Reproduction Steps**
   ```
   1. Launch app
   2. Open profile view
   3. Close profile view
   4. Repeat 10 times
   ```

3. **Profile with Leaks**
   - Use Leaks instrument
   - Follow reproduction steps
   - Check for leaks after each iteration

4. **Analyze Leak Origin**
   - Click leaked object
   - View "Responsible Caller"
   - Trace back to source code

5. **Identify Leak Pattern**
   - Closure capture: `[weak self]` missing
   - Delegate: Not marked `weak`
   - Notification: Observer not removed
   - Timer: Not invalidated

6. **Fix and Verify**
   - Apply fix
   - Profile again
   - Confirm leak eliminated

### Network Request Optimization

**Analysis Workflow:**

1. **Baseline Measurement**
   - Profile typical user session
   - Count total requests
   - Measure total bytes transferred

2. **Identify Inefficiencies**
   - **Too many requests**: Batch or consolidate
   - **Large payloads**: Compress or paginate
   - **Redundant data**: Implement caching
   - **Sequential requests**: Parallelize when possible

3. **Optimization Strategies**

**Request Batching:**
```swift
// Batch multiple IDs into single request
func fetchUsers(ids: [String]) {
    let batchedIDs = ids.joined(separator: ",")
    api.get("/users?ids=\(batchedIDs)")
}
```

**Response Pagination:**
```swift
// Implement cursor-based pagination
func fetchFeed(cursor: String? = nil, limit: Int = 20) {
    var params = ["limit": limit]
    if let cursor = cursor {
        params["cursor"] = cursor
    }
    api.get("/feed", parameters: params)
}
```

**Intelligent Caching:**
```swift
// Cache with expiration
class APICache {
    private var cache: [String: CachedResponse] = [:]

    func get(url: String) -> Data? {
        guard let cached = cache[url],
              !cached.isExpired else { return nil }
        return cached.data
    }

    func set(url: String, data: Data, ttl: TimeInterval = 300) {
        cache[url] = CachedResponse(data: data, expiry: Date() + ttl)
    }
}
```

**Request Coalescing:**
```swift
// Prevent duplicate in-flight requests
class RequestCoalescer {
    private var inFlightRequests: [String: Task<Data, Error>] = [:]

    func request(url: String) async throws -> Data {
        if let existing = inFlightRequests[url] {
            return try await existing.value
        }

        let task = Task {
            let data = try await performRequest(url)
            inFlightRequests[url] = nil
            return data
        }

        inFlightRequests[url] = task
        return try await task.value
    }
}
```

## Analysis Techniques

### Call Tree Interpretation

**Understanding Call Tree Structure:**

```
Total Time | Self Time | Symbol
-----------|-----------|--------
  1000ms   |   10ms    | -[UITableView reloadData]
   800ms   |   50ms    |  └─ -[MyCell configure]
   700ms   |  700ms    |     └─ -[ImageProcessor processImage]
```

**Reading:**
- `reloadData` took 1000ms total
- 10ms in `reloadData` itself
- 800ms in `configure` (called from `reloadData`)
- 700ms in `processImage` (called from `configure`)

**Optimization Target:** `processImage` (700ms self time)

**Call Tree Filters:**

**Separate by Thread:**
- Shows which threads are busy
- Identify main thread bottlenecks

**Hide System Libraries:**
- Focus on your code
- Re-enable to see system call overhead

**Flatten Recursion:**
- Collapses recursive calls
- Shows total time in recursive function

**Show Obj-C Only / Swift Only:**
- Filter by language
- Useful in mixed codebases

### Flame Graph Reading

**Visual Representation:**
- Width = Time spent
- Height = Call stack depth
- Color = Different functions

**Interpretation:**
- **Wide sections** = Hot spots (spend optimization time here)
- **Tall stacks** = Deep call chains (consider flattening)
- **Repeated patterns** = Loop opportunities

**Example:**
```
[                    main                    ] ← 100% of time
[       viewDidLoad       ][    updateUI    ] ← 50% each
[loadData][parseJSON]      [layout][render] ← Breakdown
```

**Optimization Strategy:**
- Focus on widest sections first
- Consider parallelizing separate wide sections
- Optimize functions appearing multiple times

### Memory Graph Debugging

**Workflow:**

1. **Capture Memory Graph**
   - Run app in Xcode
   - Click "Debug Memory Graph" button (or ⌘⌥M)

2. **Filter View**
   - Filter by "Leaks" to see leaked objects
   - Filter by class name to find specific objects

3. **Inspect Object**
   - Select object in left panel
   - View properties in right panel
   - See references in reference inspector

4. **Trace Retain Cycle**
   - Follow strong references
   - Identify circular paths
   - Note where `weak` should be used

**Example Cycle:**
```
ViewController → (strong) Closure → (strong) ViewController
```

**Fix:**
```swift
// Before (leak)
viewModel.onUpdate = {
    self.updateUI()
}

// After (no leak)
viewModel.onUpdate = { [weak self] in
    self?.updateUI()
}
```

### Performance Regression Detection

**Continuous Performance Testing:**

1. **Establish Baseline**
   - Profile app on reference device
   - Record key metrics (launch time, memory, FPS)
   - Store baseline measurements

2. **Automated Performance Tests**
```swift
func testLaunchPerformance() throws {
    measure(metrics: [XCTApplicationLaunchMetric()]) {
        XCUIApplication().launch()
    }
}

func testScrollPerformance() throws {
    let app = XCUIApplication()
    app.launch()

    measure(metrics: [XCTOSSignpostMetric.scrollDecelerationMetric]) {
        app.tables.firstMatch.swipeUp()
    }
}
```

3. **CI Integration**
   - Run performance tests in CI
   - Compare results to baseline
   - Fail build if regression > threshold

4. **Regression Analysis**
   - When regression detected, profile locally
   - Use Time Profiler to find changed code
   - Optimize or adjust baseline if intentional

**Baseline Format:**
```json
{
  "launch_time_ms": 350,
  "memory_mb": 120,
  "scroll_fps": 59,
  "thresholds": {
    "launch_time_ms": 450,
    "memory_mb": 150,
    "scroll_fps": 55
  }
}
```

## Troubleshooting

### High CPU Usage Causes

**Symptoms:**
- App feels sluggish
- Device gets hot
- Battery drains quickly
- Fans spin up (Mac Catalyst)

**Common Causes:**

**1. Main Thread Blocking**
```swift
// Problem: Heavy work on main thread
DispatchQueue.main.async {
    let result = expensiveCalculation() // Blocks UI
    updateUI(with: result)
}

// Solution: Move work off main thread
DispatchQueue.global(qos: .userInitiated).async {
    let result = expensiveCalculation()
    DispatchQueue.main.async {
        updateUI(with: result)
    }
}
```

**2. Polling/Tight Loops**
```swift
// Problem: Constant polling
Timer.scheduledTimer(withTimeInterval: 0.01, repeats: true) { _ in
    checkForUpdates() // Called 100 times per second!
}

// Solution: Reasonable interval or event-driven
Timer.scheduledTimer(withTimeInterval: 1.0, repeats: true) { _ in
    checkForUpdates() // Called once per second
}
```

**3. Inefficient Algorithms**
```swift
// Problem: O(n²) complexity
for item in items {
    for other in items {
        compare(item, other) // n² comparisons
    }
}

// Solution: O(n log n) or O(n)
let sorted = items.sorted()
for (item, other) in zip(sorted, sorted.dropFirst()) {
    compare(item, other) // n comparisons
}
```

### Memory Growth Patterns

**Symptoms:**
- Memory usage increases over time
- Memory warnings
- App crashes after extended use

**Common Patterns:**

**1. Unbounded Cache Growth**
```swift
// Problem: Cache grows indefinitely
class ImageCache {
    private var cache: [URL: UIImage] = [:] // Never clears!
}

// Solution: Use NSCache (auto-eviction)
class ImageCache {
    private let cache = NSCache<NSURL, UIImage>()

    init() {
        cache.countLimit = 100 // Max 100 images
    }
}
```

**2. Event Listener Accumulation**
```swift
// Problem: Listeners never removed
override func viewWillAppear(_ animated: Bool) {
    NotificationCenter.default.addObserver(/* ... */) // Added every time!
}

// Solution: Remove in viewWillDisappear
override func viewWillDisappear(_ animated: Bool) {
    NotificationCenter.default.removeObserver(self)
}
```

**3. Large Object Retention**
```swift
// Problem: Keeping large objects in memory
class ViewController: UIViewController {
    var cachedImage: UIImage? // Large image retained
}

// Solution: Cache only when needed, clear when done
class ViewController: UIViewController {
    private var cachedImage: UIImage?

    override func didReceiveMemoryWarning() {
        cachedImage = nil // Release when memory pressure
    }
}
```

### Network Inefficiencies

**Symptoms:**
- Slow data loading
- High data usage
- Poor offline experience

**Common Issues:**

**1. Waterfall Requests**
```swift
// Problem: Sequential dependent requests
func loadProfile() async {
    let user = await fetchUser() // Wait...
    let posts = await fetchPosts(for: user) // Wait...
    let comments = await fetchComments(for: posts) // Wait...
}

// Solution: Parallel independent requests
func loadProfile() async {
    async let user = fetchUser()
    async let followers = fetchFollowers()
    async let settings = fetchSettings()

    let (u, f, s) = await (user, followers, settings)
}
```

**2. No Request Deduplication**
```swift
// Problem: Same request made multiple times
func loadData() {
    fetchUsers() // Request 1
    fetchUsers() // Request 2 (redundant!)
}

// Solution: Deduplicate requests
class APIClient {
    private var pendingRequests: [String: Task<Data, Error>] = [:]

    func fetch(url: String) async throws -> Data {
        if let pending = pendingRequests[url] {
            return try await pending.value // Reuse
        }

        let task = Task { try await URLSession.shared.data(from: URL(string: url)!) }
        pendingRequests[url] = task
        defer { pendingRequests[url] = nil }
        return try await task.value
    }
}
```

**3. Large Uncompressed Payloads**
```swift
// Problem: Sending/receiving uncompressed data
URLSession.shared.dataTask(with: url) // Default: no compression

// Solution: Enable compression
var request = URLRequest(url: url)
request.setValue("gzip, deflate", forHTTPHeaderField: "Accept-Encoding")
URLSession.shared.dataTask(with: request)
```

### Battery Drain Issues

**Symptoms:**
- User complaints of battery drain
- Device thermal throttling
- High energy impact in Settings

**Common Causes:**

**1. Excessive Background Activity**
```swift
// Problem: Constant background work
func applicationDidEnterBackground(_ application: UIApplication) {
    Timer.scheduledTimer(withTimeInterval: 1.0, repeats: true) { _ in
        syncData() // Drains battery in background
    }
}

// Solution: Use background tasks properly
func applicationDidEnterBackground(_ application: UIApplication) {
    let taskID = application.beginBackgroundTask {
        // Task expired, clean up
    }

    syncData {
        application.endBackgroundTask(taskID)
    }
}
```

**2. Continuous Location Updates**
```swift
// Problem: Always requesting location
locationManager.startUpdatingLocation() // Continuous GPS drain

// Solution: Use appropriate accuracy
locationManager.desiredAccuracy = kCLLocationAccuracyHundredMeters
locationManager.distanceFilter = 100 // Update every 100m
locationManager.startMonitoringSignificantLocationChanges() // Low power mode
```

**3. Rendering Offscreen Content**
```swift
// Problem: Animating hidden views
override func viewDidDisappear(_ animated: Bool) {
    // Animations keep running! Wastes CPU/battery
}

// Solution: Pause animations when offscreen
override func viewDidDisappear(_ animated: Bool) {
    animationView.layer.pauseAnimations()
}

extension CALayer {
    func pauseAnimations() {
        let pausedTime = convertTime(CACurrentMediaTime(), from: nil)
        speed = 0.0
        timeOffset = pausedTime
    }
}
```

## Best Practices

### Profile on Device vs Simulator

**Always profile on device for:**
- CPU performance (simulator uses Mac CPU)
- Memory pressure (different memory characteristics)
- Network latency (simulator uses Mac network)
- Energy consumption (no battery in simulator)
- GPU performance (different graphics hardware)

**Simulator acceptable for:**
- Initial memory leak detection
- Basic UI debugging
- Quick iteration during development

**Recommendation:** Develop on simulator, validate on device, profile on device.

### Release Configuration Profiling

**Why Profile Release Builds:**
- **Optimizations enabled**: Swift optimizations, inlining, dead code elimination
- **Debug overhead removed**: No assertions, no debug info
- **Represents production**: Users run release builds

**Debug vs Release Differences:**
- Release can be 5-10x faster
- Memory patterns differ (ARC optimizations)
- Some bugs only appear in release

**How to Profile Release:**
1. Edit scheme → Run → Build Configuration → Release
2. Enable "Debug executable" for debugging symbols
3. Build and run
4. Profile as normal

**Warning:** Some crashes only happen in release due to optimizations.

### Continuous Performance Monitoring

**Development Workflow:**
1. **Baseline establishment**: Profile app at start of sprint
2. **Feature development**: Build features normally
3. **Pre-merge profiling**: Profile before merging to main
4. **Regression check**: Compare to baseline
5. **Optimization if needed**: Fix regressions before merge

**CI Integration:**
```yaml
# .github/workflows/performance.yml
name: Performance Tests

on: [pull_request]

jobs:
  performance:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v2

      - name: Run performance tests
        run: xcodebuild test -scheme MyApp -destination 'platform=iOS Simulator,name=iPhone 15'

      - name: Check for regressions
        run: ./scripts/check_performance_baseline.sh
```

**Automated Performance Tests:**
```swift
class PerformanceTests: XCTestCase {
    func testLaunchPerformance() {
        measure(metrics: [XCTApplicationLaunchMetric()]) {
            XCUIApplication().launch()
        }
    }

    func testMemoryUsage() {
        let app = XCUIApplication()
        app.launch()

        measure(metrics: [XCTMemoryMetric()]) {
            // Perform memory-intensive operations
            for _ in 0..<100 {
                app.buttons["Load"].tap()
            }
        }
    }
}
```

### Performance Budgets

**Establish Budgets:**

```swift
// PerformanceBudgets.swift
enum PerformanceBudget {
    static let launchTime: TimeInterval = 0.4 // 400ms
    static let memoryFootprint: Int = 150 * 1024 * 1024 // 150MB
    static let scrollFrameTime: TimeInterval = 0.0167 // 16.67ms (60 FPS)
    static let networkRequestTimeout: TimeInterval = 5.0 // 5s
}

// Enforce in tests
func testLaunchBudget() {
    let launchTime = measureLaunchTime()
    XCTAssertLessThan(launchTime, PerformanceBudget.launchTime,
                      "Launch time exceeded budget: \(launchTime)s > \(PerformanceBudget.launchTime)s")
}
```

**Budget Categories:**

**Launch Time:**
- Critical: < 400ms (excellent)
- Acceptable: 400-800ms (good)
- Poor: > 800ms (needs optimization)

**Memory:**
- Low-end devices: < 100MB
- Mid-range devices: < 150MB
- High-end devices: < 200MB

**Frame Rate:**
- Scrolling: 60 FPS (16.67ms/frame)
- Animations: 60 FPS
- Acceptable: 50+ FPS

**Network:**
- API response: < 1s
- Image load: < 2s
- Timeout: 5s max

**Monitor Budgets:**
- Track metrics over time
- Alert when budget exceeded
- Review budgets quarterly

## Integration with Xcode Workflows

This Skill integrates with **xcode-workflows** Skill:

**Build for Profiling:**
```json
{
  "operation": "build",
  "scheme": "MyApp",
  "configuration": "Release",
  "destination": "platform=iOS,id=<device-udid>",
  "options": {
    "clean_before_build": true
  }
}
```

**Archive for Profiling:**
```bash
xcodebuild archive \
  -scheme MyApp \
  -configuration Release \
  -archivePath ./build/MyApp.xcarchive
```

**Export for Profiling:**
```bash
xcodebuild -exportArchive \
  -archivePath ./build/MyApp.xcarchive \
  -exportPath ./build \
  -exportOptionsPlist ExportOptions.plist
```

## Related Skills

- **xcode-workflows**: Building and configuring apps for profiling
- **crash-debugging**: Analyzing performance-related crashes
- **ios-testing-patterns**: Performance testing strategies

## Related Resources

- `xc://operations/xcode`: Xcodebuild operations for profiling builds
- `xc://reference/instruments`: Complete Instruments template reference
- `xc://reference/performance-metrics`: Key performance indicators and targets

---

**Tip: Profile on device, use Release configuration, focus on user-impacting metrics first.**
