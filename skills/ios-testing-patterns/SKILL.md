---
name: ios-testing-patterns
description: XCTest and XCUITest execution workflows and flaky test detection patterns
version: 0.0.1
token_cost: ~40
---

# iOS Testing Patterns Skill

**Comprehensive guide to XCTest and XCUITest execution, analysis, and flaky test detection**

## Overview

This skill provides patterns and workflows for executing iOS tests using XCTest and XCUITest frameworks. It covers test execution strategies, result analysis, flaky test detection, and troubleshooting common test failures.

**Use this skill when:**

- Running unit tests or UI tests
- Analyzing test failures
- Detecting and debugging flaky tests
- Optimizing test execution performance
- Setting up CI/CD test pipelines

## Quick Reference

| Task               | Operation | Key Parameters         |
| ------------------ | --------- | ---------------------- |
| Run all tests      | `test`    | scheme, destination    |
| Run specific test  | `test`    | scheme, only_testing   |
| Skip tests         | `test`    | scheme, skip_testing   |
| Use test plan      | `test`    | scheme, test_plan      |
| Parallel execution | `test`    | destination (multiple) |

## When to Use This Skill

**Use ios-testing-patterns when:**

- Executing XCTest unit tests
- Running XCUITest UI automation tests
- Investigating test failures
- Detecting intermittent test failures (flaky tests)
- Analyzing test performance and execution time
- Setting up test schemes and test plans
- Configuring parallel test execution
- Debugging test-specific simulator issues

**Related Skills:**

- **xcode-workflows**: For general build and test operations
- **simulator-workflows**: For managing test simulators
- **ui-automation-workflows**: For UI test interaction patterns

## Key Concepts

### XCTest vs XCUITest

**XCTest (Unit/Integration Tests):**

- Fast execution (milliseconds to seconds)
- Tests individual components in isolation
- Direct access to app internals
- No UI interaction required
- Runs in same process as app code

**XCUITest (UI Tests):**

- Slower execution (seconds to minutes)
- Tests user-facing workflows
- Black-box testing (no app internals)
- Requires simulator/device UI
- Runs in separate process

### Test Execution Strategies

**Sequential Execution:**

- Tests run one after another
- Predictable, repeatable results
- Slower overall execution
- Better for debugging

**Parallel Execution:**

- Tests run simultaneously on multiple simulators
- Faster overall execution
- Requires more system resources
- May expose race conditions

**Test Sharding:**

- Split test suite across multiple destinations
- Optimal for CI/CD pipelines
- Reduces total execution time
- Requires careful test isolation

## Workflows

### 1. Running Unit Tests

**Basic Unit Test Execution:**

```json
{
  "operation": "test",
  "scheme": "MyApp",
  "destination": "platform=iOS Simulator,name=iPhone 15,OS=18.0"
}
```

**Note:** The destination parameter now supports auto-resolution! You can omit the OS version (e.g., `"platform=iOS Simulator,name=iPhone 15"`) and the tool will automatically select the latest available OS version for that device.

**Run Specific Test Class:**

```json
{
  "operation": "test",
  "scheme": "MyApp",
  "destination": "platform=iOS Simulator,name=iPhone 15,OS=18.0",
  "options": {
    "only_testing": ["MyAppTests/NetworkTests"]
  }
}
```

**Run Specific Test Method:**

```json
{
  "operation": "test",
  "scheme": "MyApp",
  "destination": "platform=iOS Simulator,name=iPhone 15,OS=18.0",
  "options": {
    "only_testing": ["MyAppTests/NetworkTests/testAPIRequest"]
  }
}
```

### 2. Running UI Tests

**Basic UI Test Execution:**

```json
{
  "operation": "test",
  "scheme": "MyAppUITests",
  "destination": "platform=iOS Simulator,name=iPhone 15"
}
```

**UI Tests with Specific Device:**

```json
{
  "operation": "test",
  "scheme": "MyAppUITests",
  "destination": "platform=iOS Simulator,name=iPad Pro (12.9-inch)"
}
```

**UI Tests with Test Plan:**

```json
{
  "operation": "test",
  "scheme": "MyApp",
  "destination": "platform=iOS Simulator,name=iPhone 15",
  "options": {
    "test_plan": "SmokeTests"
  }
}
```

### 3. Parallel Test Execution

**Multiple Destinations:**

Run tests on multiple simulators simultaneously:

```json
{
  "operation": "test",
  "scheme": "MyApp",
  "destination": [
    "platform=iOS Simulator,name=iPhone 15",
    "platform=iOS Simulator,name=iPhone SE (3rd generation)"
  ],
  "options": {
    "parallel": true
  }
}
```

**Parallel Test Benefits:**

- Reduces total execution time
- Tests across multiple device types
- Exposes device-specific issues
- Better CI/CD performance

**Parallel Test Considerations:**

- Requires multiple simulators
- Higher CPU/memory usage
- May expose race conditions
- Test isolation critical

### 4. Test Filtering

**Skip Specific Tests:**

```json
{
  "operation": "test",
  "scheme": "MyApp",
  "destination": "platform=iOS Simulator,name=iPhone 15",
  "options": {
    "skip_testing": [
      "MyAppUITests/SlowTests",
      "MyAppTests/NetworkTests/testLargeDownload"
    ]
  }
}
```

**Run Only Fast Tests:**

```json
{
  "operation": "test",
  "scheme": "MyApp",
  "destination": "platform=iOS Simulator,name=iPhone 15",
  "options": {
    "only_testing": ["MyAppTests/UnitTests"],
    "skip_testing": ["MyAppTests/UnitTests/testSlowOperation"]
  }
}
```

### 5. Test Result Analysis

**Success Response:**

```json
{
  "success": true,
  "tests_run": 45,
  "tests_passed": 45,
  "tests_failed": 0,
  "execution_time": "12.4s",
  "scheme": "MyApp"
}
```

**Failure Response:**

```json
{
  "success": false,
  "tests_run": 45,
  "tests_passed": 43,
  "tests_failed": 2,
  "failures": [
    {
      "test": "MyAppTests.LoginTests.testInvalidPassword",
      "message": "XCTAssertEqual failed: (\"error\") is not equal to (\"invalid\")",
      "file": "LoginTests.swift",
      "line": 42
    },
    {
      "test": "MyAppUITests.CheckoutTests.testPaymentFlow",
      "message": "Failed to find button \"Confirm\"",
      "file": "CheckoutTests.swift",
      "line": 78
    }
  ],
  "execution_time": "18.7s"
}
```

**Analyzing Test Results:**

1. Check `success` status
2. Review `tests_failed` count
3. Examine `failures` array for details
4. Check `execution_time` for performance issues
5. Look for patterns in failure messages

### 6. Flaky Test Detection

**What are Flaky Tests?**

Tests that intermittently pass or fail without code changes:

- Timing-dependent assertions
- Race conditions
- Async operation issues
- Shared state between tests
- Network-dependent tests
- UI animation timing issues

**Detection Strategy 1: Multiple Runs**

Run tests multiple times to detect flakiness:

```bash
# Run tests 5 times and compare results
for i in {1..5}; do
  execute_xcode_command(test, scheme, destination)
  # Record results
done
```

**Detection Strategy 2: Pattern Analysis**

Look for common flaky test patterns:

```json
{
  "operation": "test",
  "scheme": "MyApp",
  "destination": "platform=iOS Simulator,name=iPhone 15",
  "options": {
    "only_testing": ["MyAppTests/SuspectedFlakyTest"]
  }
}
```

**Flaky Test Indicators:**

1. **Timeout failures**: "Exceeded timeout of 30 seconds"
2. **Element not found**: "Failed to find button..." (UI tests)
3. **Race conditions**: "Expected 5 but got 4"
4. **Async timing**: "Asynchronous wait failed"
5. **Network failures**: "Request timed out"

**Flaky Test Workflow:**

```
1. Identify suspect test (intermittent failures)
2. Run test 10+ times in isolation
3. Analyze failure patterns
4. Check for:
   - Hard-coded waits (sleep/wait)
   - Expectation timeouts too short
   - Shared mutable state
   - Network dependencies
   - Animation timing assumptions
5. Fix root cause
6. Verify with repeated runs
```

### 7. Test Isolation

**Clean State Before Tests:**

```json
{
  "operation": "test",
  "scheme": "MyApp",
  "destination": "platform=iOS Simulator,name=iPhone 15",
  "options": {
    "clean_before_build": true
  }
}
```

**Reset Simulator State:**

```bash
# Use simulator-workflows skill
execute_simulator_command(operation: "erase", udid: <device-udid>)
```

**Test Isolation Best Practices:**

1. Use `setUp()` and `tearDown()` methods
2. Clear app state between tests
3. Use unique test data per test
4. Avoid shared static state
5. Reset UserDefaults in setUp
6. Clear keychain data
7. Reset app permissions

## Common Patterns

### Test Scheme Configuration

**Typical Test Scheme Setup:**

- **Build Configuration**: Debug (faster builds)
- **Test Plans**: Separate unit/UI/smoke tests
- **Coverage**: Enable code coverage collection
- **Diagnostics**: Enable thread sanitizer for threading issues

**Multiple Test Plans:**

```
UnitTests.xctestplan       → Fast unit tests only
UITests.xctestplan         → UI automation tests
SmokeTests.xctestplan      → Critical path tests
RegressionTests.xctestplan → Full test suite
```

### Test Data Management

**Pattern 1: Test Fixtures**

```swift
class TestData {
    static let validUser = User(name: "Test", email: "test@example.com")
    static let invalidUser = User(name: "", email: "invalid")
}
```

**Pattern 2: Factory Methods**

```swift
extension User {
    static func makeTestUser(name: String = "Test") -> User {
        return User(name: name, email: "\(name)@test.com")
    }
}
```

**Pattern 3: Test Database**

```swift
class TestDatabase {
    func setupTestData() {
        // Create known test data
    }

    func teardownTestData() {
        // Clean up after tests
    }
}
```

### Screenshot Capture on Failure

**UI Test Screenshot Pattern:**

```swift
override func setUp() {
    continueAfterFailure = false
}

override func tearDown() {
    if let testRun = testRun, testRun.failureCount > 0 {
        let screenshot = XCUIScreen.main.screenshot()
        let attachment = XCTAttachment(screenshot: screenshot)
        attachment.lifetime = .keepAlways
        add(attachment)
    }
}
```

**Execute Tests with Screenshots:**

```json
{
  "operation": "test",
  "scheme": "MyAppUITests",
  "destination": "platform=iOS Simulator,name=iPhone 15",
  "options": {
    "result_bundle_path": "./TestResults.xcresult"
  }
}
```

### Performance Testing

**XCTest Performance Measurement:**

```swift
func testPerformance() {
    measure {
        // Code to measure
        performExpensiveOperation()
    }
}
```

**Performance Test Execution:**

```json
{
  "operation": "test",
  "scheme": "MyApp",
  "destination": "platform=iOS Simulator,name=iPhone 15",
  "options": {
    "only_testing": ["MyAppTests/PerformanceTests"]
  }
}
```

## Troubleshooting

### Common Test Failures

#### 1. "Test crashed with signal SIGABRT"

**Causes:**

- Force unwrapping nil values
- Array index out of bounds
- Precondition/assertion failures
- Fatal errors in app code

**Solutions:**

1. Check crash logs for stack trace
2. Run test in debugger (Xcode)
3. Add breakpoints at crash location
4. Review force unwraps in test path

#### 2. "Failed to find element/button"

**Causes:**

- Element not yet rendered
- Animation not complete
- Incorrect accessibility identifier
- Element off-screen

**Solutions:**

1. Increase timeout for element queries
2. Wait for animations to complete
3. Verify accessibility identifiers
4. Scroll element into view
5. Check element existence before interaction

**Example Fix:**

```swift
// Bad: Immediate query may fail
app.buttons["Submit"].tap()

// Good: Wait for element
let submitButton = app.buttons["Submit"]
XCTAssert(submitButton.waitForExistence(timeout: 5))
submitButton.tap()
```

#### 3. "Exceeded timeout of X seconds"

**Causes:**

- Network requests too slow
- Async operations not completing
- Deadlocks or infinite loops
- Expectations never fulfilled

**Solutions:**

1. Increase expectation timeout
2. Mock network requests
3. Check for deadlocks
4. Verify expectation fulfillment
5. Use proper async testing patterns

**Example Fix:**

```swift
// Bad: May timeout
wait(for: [expectation], timeout: 1.0)

// Good: Reasonable timeout
wait(for: [expectation], timeout: 10.0)
```

#### 4. "Test failed due to app termination"

**Causes:**

- Memory pressure
- Watchdog timeout (app hung)
- Background task limits
- System resource constraints

**Solutions:**

1. Profile memory usage
2. Optimize test efficiency
3. Break up long-running tests
4. Check for memory leaks
5. Reduce simulator load

### Timeout Issues

**UI Test Timeouts:**

```json
{
  "operation": "test",
  "scheme": "MyAppUITests",
  "destination": "platform=iOS Simulator,name=iPhone 15",
  "options": {
    "test_timeout": 600
  }
}
```

**Common Timeout Scenarios:**

1. **App Launch Timeout**: App takes too long to launch
   - Solution: Optimize app startup, increase timeout

2. **Element Query Timeout**: UI element not found
   - Solution: Wait for element existence, check identifiers

3. **Network Timeout**: API requests fail
   - Solution: Mock network, increase timeout, fix connectivity

4. **Animation Timeout**: Waiting for animation
   - Solution: Disable animations in tests, use proper waits

### Simulator State Problems

**Symptom:** Tests fail due to simulator state

**Common Issues:**

1. Previous app installation interfering
2. Simulator storage full
3. Corrupt simulator data
4. Multiple tests modifying shared state

**Solutions:**

```bash
# Erase simulator before tests
execute_simulator_command({
  "operation": "erase",
  "udid": "<simulator-udid>"
})

# Then run tests
execute_xcode_command({
  "operation": "test",
  "scheme": "MyApp",
  "destination": "platform=iOS Simulator,name=iPhone 15"
})
```

### Test Dependency Issues

**Symptom:** Tests pass individually but fail in suite

**Causes:**

- Test execution order dependencies
- Shared mutable state
- Singleton pollution
- Database state carryover

**Solutions:**

1. **Ensure Test Isolation:**

```swift
override func setUp() {
    super.setUp()
    // Reset all shared state
    AppState.shared.reset()
    clearDatabase()
}
```

2. **Avoid Singletons:**

```swift
// Bad: Shared state
class APIManager {
    static let shared = APIManager()
}

// Good: Dependency injection
class APIManager {
    // Inject per test
}
```

3. **Randomize Test Order:**

```json
{
  "operation": "test",
  "scheme": "MyApp",
  "options": {
    "test_order": "random"
  }
}
```

## Best Practices

### 1. Test Isolation

**Always isolate tests:**

- Each test should run independently
- No shared state between tests
- Clean up in `tearDown()`
- Use unique test data

**Example:**

```swift
class UserTests: XCTestCase {
    var sut: UserManager!

    override func setUp() {
        super.setUp()
        sut = UserManager()
    }

    override func tearDown() {
        sut = nil
        super.tearDown()
    }

    func testCreateUser() {
        // Test uses fresh sut instance
    }
}
```

### 2. Fast Test Execution

**Optimize test speed:**

- Mock network requests
- Use in-memory databases
- Disable animations in UI tests
- Avoid actual file I/O
- Use test doubles (mocks/stubs)

**UI Test Speed:**

```swift
// Disable animations for faster tests
app.launchArguments += ["DISABLE_ANIMATIONS"]
```

### 3. Readable Test Names

**Use descriptive test names:**

```swift
// Bad
func test1() { }

// Good
func testLoginWithValidCredentialsSucceeds() { }
func testLoginWithInvalidPasswordShowsError() { }
func testCheckoutWithEmptyCartDisplaysWarning() { }
```

### 4. Arrange-Act-Assert Pattern

**Structure tests clearly:**

```swift
func testAddItemToCart() {
    // Arrange
    let cart = ShoppingCart()
    let item = Product(name: "Test", price: 10)

    // Act
    cart.add(item)

    // Assert
    XCTAssertEqual(cart.items.count, 1)
    XCTAssertEqual(cart.total, 10)
}
```

### 5. Test Data Management

**Use consistent test data:**

```swift
struct TestFixtures {
    static let validEmail = "test@example.com"
    static let invalidEmail = "invalid"
    static let testUser = User(name: "Test", email: validEmail)
}
```

### 6. CI/CD Integration

**CI Test Workflow:**

```
1. Clean build environment
2. Build app for testing
3. Boot fresh simulator
4. Run test suite
5. Collect code coverage
6. Parse test results
7. Archive test artifacts
8. Report results
```

**CI Test Command:**

```json
{
  "operation": "test",
  "scheme": "MyApp",
  "destination": "platform=iOS Simulator,name=iPhone 15",
  "options": {
    "clean_before_build": true,
    "code_coverage": true,
    "result_bundle_path": "./TestResults.xcresult"
  }
}
```

### 7. Test Pyramid

**Maintain proper test distribution:**

```
      /\
     /UI\      ← Few, slow, broad
    /----\
   /Integ\     ← Some, medium, focused
  /------\
 /  Unit  \    ← Many, fast, isolated
/----------\
```

**Recommended ratio:**

- 70% Unit tests
- 20% Integration tests
- 10% UI tests

### 8. Code Coverage

**Enable coverage collection:**

```json
{
  "operation": "test",
  "scheme": "MyApp",
  "destination": "platform=iOS Simulator,name=iPhone 15",
  "options": {
    "code_coverage": true
  }
}
```

**Coverage goals:**

- Critical paths: 90%+ coverage
- Business logic: 80%+ coverage
- UI code: 60%+ coverage
- Overall: 75%+ coverage

### 9. Continuous Test Monitoring

**Track test metrics:**

- Test execution time trends
- Flaky test frequency
- Test failure rate
- Code coverage trends
- Test suite growth

**When to investigate:**

- Test execution time increases >20%
- Flaky tests appear
- Coverage drops
- Failure rate increases

## Related Skills

- **xcode-workflows**: General build and test operations
- **simulator-workflows**: Managing test simulators and devices
- **ui-automation-workflows**: Advanced UI test interaction patterns
- **crash-debugging**: Analyzing test crashes

## Related Resources

- `xc://operations/test`: Complete test operations reference
- `xc://reference/xctest`: XCTest framework documentation
- `xc://reference/xcuitest`: XCUITest framework documentation
- `xc://patterns/flaky-tests`: Flaky test detection patterns

---

**Tip: Isolate tests, mock dependencies, and run tests frequently during development.**
