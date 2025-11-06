# 04 - Skills Architecture

**Purpose**: Define the five procedural Skills with activation conditions, content structure, and executable scripts.

## Skills Philosophy

Skills provide **unbounded procedural knowledge** with **minimal context overhead**:
- **30-50 tokens** at startup (YAML metadata only)
- **5-10k tokens** full content (loaded on-demand via filesystem)
- **Executable scripts** included without context penalty
- **Progressive disclosure** - only load when relevant

## Skill Structure Standard

Every skill follows this structure:
```
skill-name/
├── skill.yaml           # Metadata (30-50 tokens)
├── SKILL.md             # Full documentation (5-10k tokens)
├── scripts/             # Executable automation
│   ├── script1.py
│   ├── script2.py
│   └── requirements.txt
└── examples/            # Reference examples
    ├── example1.md
    └── example2.md
```

## skill.yaml Format

```yaml
name: Skill Display Name
description: Brief description for activation (30-50 tokens max)
version: 1.0.0

activation_conditions:
  keywords:
    - keyword1
    - keyword2
    - keyword3
  file_patterns:
    - "*.swift"
    - "*Test.swift"
  contexts:
    - context1
    - context2

capabilities:
  - capability_1
  - capability_2
  - capability_3

dependencies:
  python: ">=3.10"
  packages:
    - package1
    - package2

metadata:
  author: Author Name
  license: MIT
  documentation: https://github.com/conorluddy/xc-plugin
```

## SKILL.md Format

```markdown
# Skill Name

## Quick Reference
[100-200 token summary of key capabilities and when to use this skill]

## Overview
[Comprehensive introduction to the skill's purpose and scope]

## Prerequisites
[Required tools, knowledge, or setup]

## Section 1: [Primary Capability]
[Detailed procedures, step-by-step guides]

### Subsection 1.1
[Specific techniques or patterns]

```code
[Example code or commands]
```

## Section 2: [Secondary Capability]
[More detailed content]

## Integration with MCP Tools
[How this skill works with the three dispatchers]

## Scripts Reference
[Documentation for included Python/Bash scripts]

## Examples
[Real-world usage examples]

## Troubleshooting
[Common issues and solutions]

## Best Practices
[Recommendations and tips]

## References
[External documentation links]
```

---

## Skill 1: ios-testing-workflow

### skill.yaml
```yaml
name: iOS Testing Workflow
description: Complete testing procedures from setup through execution, analysis, and debugging. Includes unit tests, UI tests, and accessibility testing workflows.
version: 1.0.0

activation_conditions:
  keywords:
    - test
    - testing
    - unit test
    - ui test
    - xctest
    - xctestrun
    - test plan
    - test failure
    - flaky test
  file_patterns:
    - "*Tests.swift"
    - "*Test.swift"
    - "*.xctestplan"
  contexts:
    - testing
    - qa
    - quality assurance
    - test automation
    - ci/cd testing

capabilities:
  - test_setup
  - test_execution
  - result_analysis
  - failure_debugging
  - coverage_reporting
  - performance_testing
  - ui_testing_with_accessibility

dependencies:
  python: ">=3.10"
  packages:
    - beautifulsoup4
    - lxml

metadata:
  author: XC Plugin Team
  license: MIT
  documentation: https://github.com/conorluddy/xc-plugin/tree/main/skills/ios-testing-workflow
```

### SKILL.md Structure
```markdown
# iOS Testing Workflow

## Quick Reference

This skill guides complete iOS testing workflows:
- **Setup**: Create test plans, configure schemes, set up test devices
- **Execution**: Run unit tests, UI tests, with parallel execution support
- **Analysis**: Parse xcresult bundles, identify failure patterns
- **Debugging**: Reproduce failures, diagnose flaky tests
- **Coverage**: Generate and interpret code coverage reports
- **Performance**: Profile test execution times

Use this skill when: writing new tests, debugging test failures, setting up CI testing, or analyzing test results.

## Test Setup Procedures

### Creating Test Plans

Test plans (.xctestplan) organize and configure test execution:

1. **Create test plan in Xcode**:
   - Product → Test Plan → New Test Plan
   - Name it descriptively (e.g., "UnitTests", "UITests-iPhone", "RegressionSuite")

2. **Configure test plan via MCP**:
```bash
# List available test plans
execute_build_command(
  operation="list-schemes",
  project_path="MyApp.xcworkspace"
)

# View test plan configuration
execute_build_command(
  operation="show-build-settings",
  project_path="MyApp.xcworkspace",
  scheme="MyApp-Tests"
)
```

3. **Test plan best practices**:
   - Separate unit tests from UI tests
   - Create device-specific plans for UI tests
   - Configure language/region testing
   - Set appropriate timeouts

### Configuring Test Schemes

Schemes control test execution environment:

**Key settings**:
- **Build Configuration**: Debug (default for tests)
- **Code Coverage**: Enable for coverage reports
- **Test Language**: Set locale for internationalization
- **Arguments**: Pass launch arguments to app under test
- **Environment Variables**: Configure test environment

**Via MCP**:
```bash
# Validate test scheme configuration
execute_build_command(
  operation="validate-project",
  project_path="MyApp.xcworkspace"
)
```

### Setting Up Test Simulators

Prepare simulator environment for consistent testing:

1. **Create clean simulator**:
```bash
execute_simulator_command(
  operation="create",
  device_id="iPhone 15 Test",
  options={
    device_type: "iPhone 15",
    runtime: "iOS 17.2"
  }
)
```

2. **Configure simulator for testing**:
```bash
# Disable animations for faster tests
execute_simulator_command(
  operation="ui-appearance",
  device_id="iPhone 15 Test",
  options={ reduceMotion: true }
)

# Reset privacy settings
execute_simulator_command(
  operation="privacy",
  device_id="iPhone 15 Test",
  options={ 
    privacy_action: "reset"
  }
)
```

3. **Grant necessary permissions**:
```bash
# Grant all common permissions upfront
for service in ["photos", "camera", "location", "contacts"]:
  execute_simulator_command(
    operation="privacy",
    device_id="iPhone 15 Test",
    app_identifier="com.example.MyApp",
    options={
      privacy_action: "grant",
      privacy_service: service
    }
  )
```

## Test Execution Patterns

### Unit Tests

**Standard execution**:
```bash
execute_build_command(
  operation="test",
  project_path="MyApp.xcworkspace",
  scheme="MyApp-UnitTests",
  destination="platform=iOS Simulator,name=iPhone 15",
  options={
    parallel: true,
    result_bundle_path: "./test-results/"
  },
  output_format="file"
)
```

**Selective testing**:
```bash
# Run specific test class
execute_build_command(
  operation="test",
  scheme="MyApp-UnitTests",
  options={
    only_testing: ["MyAppTests.LoginTests"]
  }
)

# Skip slow tests
execute_build_command(
  operation="test",
  scheme="MyApp-UnitTests",
  options={
    skip_testing: ["MyAppTests.IntegrationTests"]
  }
)
```

### UI Tests with Accessibility

**Accessibility-first approach** (faster, more reliable):

```bash
# Launch app with accessibility enabled
execute_simulator_command(
  operation="launch",
  device_id="iPhone 15",
  app_identifier="com.example.MyApp",
  options={
    use_accessibility: true,
    wait_for_launch: true
  }
)
```

This returns accessibility tree showing all UI elements:
```json
{
  "initial_screen": {
    "title": "Welcome",
    "elements": [
      {
        "label": "Email",
        "type": "textField",
        "identifier": "emailTextField"
      },
      {
        "label": "Sign In",
        "type": "button",
        "identifier": "signInButton"
      }
    ]
  }
}
```

**Screenshot-based approach** (fallback):
```bash
# Capture screen for visual verification
execute_simulator_command(
  operation="io-screenshot",
  device_id="iPhone 15",
  options={
    output_path: "./screenshots/login-screen.png"
  }
)
```

### Parallel Test Execution

Run tests faster with parallelization:

```bash
# Enable parallel testing
execute_build_command(
  operation="test",
  scheme="MyApp-Tests",
  options={
    parallel: true,
    max_parallel_testing_workers: 4
  }
)
```

**Parallel testing considerations**:
- Tests must be independent (no shared state)
- Requires multiple simulators
- May increase flakiness if tests have race conditions
- Monitor resource usage (CPU/memory)

## Result Analysis

### Using the Analyzer Script

The `analyze_results.py` script parses xcresult bundles efficiently:

```bash
# After test execution returns file path
python scripts/analyze_results.py /tmp/xc-plugin/test_results_123.json
```

**Script output**:
```json
{
  "summary": {
    "total": 50,
    "passed": 45,
    "failed": 3,
    "skipped": 2,
    "duration": "120.5s"
  },
  "failures": [
    {
      "test": "LoginTests.testInvalidCredentials",
      "file": "LoginTests.swift",
      "line": 45,
      "message": "Expected error message not displayed",
      "type": "assertion_failure"
    }
  ],
  "slow_tests": [
    {
      "test": "IntegrationTests.testAPIConnection",
      "duration": "15.3s"
    }
  ],
  "flaky_indicators": [
    {
      "test": "NetworkTests.testDownload",
      "reason": "Timeout in 2 of last 5 runs"
    }
  ]
}
```

### Interpreting Results

**Success metrics**:
- Pass rate: >95% for stable suite
- Duration: Track trends, investigate sudden increases
- Coverage: Aim for >70% (80%+ for critical paths)

**Failure categorization**:
1. **True failures**: Code defects, fix immediately
2. **Flaky tests**: Intermittent, needs investigation
3. **Environment issues**: Simulator state, network, etc.
4. **Timeout failures**: Performance regression or slow tests

## Debugging Test Failures

### Reproducing Failures

1. **Run failed test in isolation**:
```bash
execute_build_command(
  operation="test",
  scheme="MyApp-Tests",
  options={
    only_testing: ["LoginTests.testInvalidCredentials"]
  }
)
```

2. **Enable verbose logging**:
```bash
execute_build_command(
  operation="test",
  scheme="MyApp-Tests",
  options={
    verbose: true,
    only_testing: ["LoginTests.testInvalidCredentials"]
  }
)
```

3. **Capture diagnostics**:
```bash
execute_advanced_operation(
  category="workflow",
  operation="capture-diagnostics",
  target="iPhone 15",
  parameters={
    include: ["logs", "screenshots", "accessibility-tree"]
  }
)
```

### Common Failure Patterns

#### Timeout Failures

**Symptoms**: Test fails at 120s (default timeout)

**Root causes**:
- Network requests taking too long
- Animations not disabled
- Wait conditions too aggressive
- Deadlock or infinite loop

**Solutions**:
```swift
// Increase timeout for specific waits
let element = app.buttons["Submit"]
XCTAssertTrue(element.waitForExistence(timeout: 30))

// Disable animations
execute_simulator_command(
  operation="ui-appearance",
  options={ reduceMotion: true }
)
```

#### Element Not Found

**Symptoms**: `Element not found` or `Failed to scroll to element`

**Root causes**:
- Element not yet visible
- Identifier changed
- Element rendered differently
- Timing issue

**Debug with accessibility**:
```bash
# Get current accessibility tree
execute_simulator_command(
  operation="launch",
  options={ use_accessibility: true }
)
# Examine returned tree for actual element identifiers
```

#### Flaky Tests

**Symptoms**: Passes locally, fails in CI, or intermittent

**Investigation**:
1. Run test 10 times: `for i in {1..10}; do run_test; done`
2. Check for race conditions (async code)
3. Verify test independence (clean state between tests)
4. Check environment dependencies (network, time, random)

**Common fixes**:
- Add explicit waits
- Mock network requests
- Reset app state between tests
- Use deterministic data

## Code Coverage

### Generating Coverage Reports

```bash
# Enable coverage in test execution
execute_build_command(
  operation="test",
  scheme="MyApp-Tests",
  options={
    enable_code_coverage: true
  },
  output_format="file"
)
```

### Interpreting Coverage

**Coverage metrics**:
- **Line coverage**: % of lines executed
- **Function coverage**: % of functions called
- **Branch coverage**: % of conditional branches taken

**Target coverage levels**:
- Critical paths: 90%+
- Business logic: 80%+
- UI code: 60%+
- Overall: 70%+

**Coverage gaps to prioritize**:
1. Error handling paths
2. Edge cases
3. Complex conditionals
4. New feature code

## Performance Testing

### Measuring Test Duration

```python
# Use analyze_results.py to identify slow tests
python scripts/analyze_results.py --performance-report test_results.json
```

### Optimizing Test Performance

**Strategies**:
1. **Parallel execution**: Run independent tests concurrently
2. **Mock external dependencies**: Avoid network calls
3. **Disable animations**: Speed up UI tests
4. **Minimize app launches**: Reset state instead
5. **Use accessibility over screenshots**: 10x faster

**Before optimization**:
```bash
# UI test suite: 300s
execute_build_command(operation="test", scheme="UITests")
```

**After optimization**:
```bash
# Same coverage: 60s (5x improvement)
- Parallel execution enabled
- Animations disabled
- Accessibility-based navigation
- Mocked network calls
```

## Integration with MCP Tools

This skill works with all three MCP dispatchers:

**execute_build_command**:
- Run tests: `operation="test"`
- Validate setup: `operation="validate-project"`
- Check schemes: `operation="list-schemes"`

**execute_simulator_command**:
- Prepare device: `operation="create"`, `boot`, `privacy`
- Launch app: `operation="launch"` with `use_accessibility: true`
- Capture diagnostics: `operation="io-screenshot"`, `diagnose`

**execute_advanced_operation**:
- Complete workflow: `category="workflow"`, `operation="run-test-suite"`
- Cache results: `category="cache"`
- Diagnostics bundle: `category="workflow"`, `operation="capture-diagnostics"`

## Scripts Reference

### analyze_results.py

**Purpose**: Parse xcresult bundles and extract key findings

**Usage**:
```bash
python scripts/analyze_results.py <results_file> [options]
```

**Options**:
- `--performance-report`: Focus on slow tests
- `--failures-only`: Show only failed tests
- `--flaky-detection`: Analyze historical data for flaky tests
- `--coverage-threshold <n>`: Warn if coverage below n%

**Output**: JSON summary for further processing or human-readable report

### run_tests.py

**Purpose**: Orchestrate complete test workflow

**Usage**:
```bash
python scripts/run_tests.py --scheme MyApp-Tests --device "iPhone 15"
```

**What it does**:
1. Clean build directory
2. Build for testing
3. Boot simulator
4. Configure simulator (animations off, permissions granted)
5. Run tests
6. Collect results
7. Generate coverage report
8. Analyze results
9. Upload to CI (if configured)

## Examples

### Example 1: Complete Unit Test Workflow

```bash
# 1. Setup
execute_simulator_command(operation="create", device_id="Test iPhone")
execute_simulator_command(operation="boot", device_id="Test iPhone")

# 2. Build and test
execute_build_command(
  operation="test",
  scheme="MyApp-UnitTests",
  destination="platform=iOS Simulator,name=Test iPhone",
  options={ parallel: true, enable_code_coverage: true },
  output_format="file"
)

# 3. Analyze results
python scripts/analyze_results.py /tmp/xc-plugin/test_results_<timestamp>.json

# 4. Check coverage
# (Results include coverage percentage in metadata)
```

### Example 2: UI Test with Accessibility

```bash
# 1. Launch app
response = execute_simulator_command(
  operation="launch",
  device_id="iPhone 15",
  app_identifier="com.example.MyApp",
  options={ use_accessibility: true }
)

# 2. Use accessibility tree to verify UI
# response.metadata.initial_screen contains all visible elements

# 3. Capture screenshot for visual record
execute_simulator_command(
  operation="io-screenshot",
  device_id="iPhone 15"
)

# 4. Run UI tests
execute_build_command(
  operation="test",
  scheme="MyApp-UITests",
  destination="platform=iOS Simulator,name=iPhone 15"
)
```

### Example 3: Debugging Flaky Test

```bash
# 1. Run test 10 times
for i in range(10):
    result = execute_build_command(
        operation="test",
        options={ only_testing: ["FlakyTests.testNetworkRequest"] }
    )
    log_result(i, result.success)

# 2. Capture diagnostics on failure
if not result.success:
    execute_advanced_operation(
        category="workflow",
        operation="capture-diagnostics",
        target="iPhone 15"
    )

# 3. Analyze logs for patterns
python scripts/analyze_flaky.py diagnostics_bundle.zip
```

## Troubleshooting

### Tests Not Running

**Check**:
1. Scheme includes tests: `operation="list-schemes"`
2. Simulator is booted: `operation="list"` check state
3. App is installed: `operation="list-apps"` or try install
4. Build succeeds: Run `operation="build"` first

### Tests Timing Out

**Solutions**:
1. Disable animations: `ui-appearance` with `reduceMotion: true`
2. Increase timeout in test code
3. Check for deadlocks in app code
4. Mock slow operations (network, database)

### Coverage Not Generated

**Check**:
1. Enable coverage in scheme settings
2. Pass `enable_code_coverage: true` in options
3. Check .xcresult bundle contains coverage data
4. Verify Xcode version supports coverage

## Best Practices

1. **Test independence**: Each test should run independently
2. **Fast tests**: Aim for <1s per unit test, <10s per UI test
3. **Descriptive names**: Test names should describe what they verify
4. **Accessibility first**: Use accessibility over screenshots
5. **Mock externals**: Don't depend on network, filesystem
6. **Clean state**: Reset simulator state between test runs
7. **Parallel execution**: Enable for faster feedback
8. **Coverage tracking**: Monitor trends, not absolute values
9. **Flaky test quarantine**: Isolate and fix flaky tests
10. **CI integration**: Automate test execution and reporting

## References

- [XCTest Framework](https://developer.apple.com/documentation/xctest)
- [Test Plans](https://developer.apple.com/documentation/xcode/test-plans)
- [Code Coverage](https://developer.apple.com/documentation/xcode/code-coverage)
- [UI Testing](https://developer.apple.com/documentation/xctest/user_interface_tests)
- [Accessibility Testing](https://developer.apple.com/documentation/accessibility)
```

---

## Skill 2: xcode-project-patterns

### skill.yaml
```yaml
name: Xcode Project Patterns
description: Common project configurations, build settings, troubleshooting patterns, and dependency management for iOS/macOS development.
version: 1.0.0

activation_conditions:
  keywords:
    - build settings
    - project configuration
    - signing
    - provisioning
    - dependencies
    - cocoapods
    - spm
    - swift package
    - build error
    - linker error
  file_patterns:
    - "*.xcodeproj"
    - "*.xcworkspace"
    - "project.pbxproj"
    - "Podfile"
    - "Package.swift"
  contexts:
    - project setup
    - build configuration
    - dependency management
    - troubleshooting

capabilities:
  - project_structure_guidance
  - build_settings_configuration
  - signing_setup
  - dependency_management
  - error_resolution
  - optimization_settings

dependencies:
  python: ">=3.10"
  packages: []

metadata:
  author: XC Plugin Team
  license: MIT
```

### SKILL.md Outline
```markdown
# Xcode Project Patterns

## Quick Reference
Guidance on:
- Project structure best practices
- Build settings (Debug vs Release)
- Code signing and provisioning
- Dependency management (SPM, CocoaPods, Carthage)
- Common build errors and solutions
- Optimization settings

## Project Structure Best Practices
[Folder organization, target structure, scheme configuration]

## Build Settings Reference
[Comprehensive build settings guide with common configurations]

## Code Signing and Provisioning
[Complete signing setup, troubleshooting certificate issues]

## Dependency Management
[SPM, CocoaPods, Carthage comparison and usage]

## Common Build Errors
[Error messages, root causes, solutions]

## Optimization Settings
[Release build optimizations, size reduction, performance]
```

---

## Skill 3: screenshot-analyzer

### skill.yaml
```yaml
name: Screenshot Analyzer
description: Visual testing, screenshot comparison, accessibility overlay analysis, and semantic naming patterns for iOS UI verification.
version: 1.0.0

activation_conditions:
  keywords:
    - screenshot
    - visual
    - ui test
    - visual regression
    - image comparison
    - accessibility tree
    - ui verification
  file_patterns:
    - "*.png"
    - "*.jpg"
    - "*screenshot*"
  contexts:
    - ui testing
    - visual testing
    - regression testing
    - accessibility testing

capabilities:
  - screenshot_capture
  - visual_regression_detection
  - accessibility_overlay
  - semantic_naming
  - pixel_diff_comparison

dependencies:
  python: ">=3.10"
  packages:
    - opencv-python
    - pillow
    - numpy

metadata:
  author: XC Plugin Team
  license: MIT
```

### Key Scripts

**scripts/analyze_screenshot.py**:
```python
#!/usr/bin/env python3
"""
Analyze iOS simulator screenshots with accessibility context
"""
import cv2
import numpy as np
from pathlib import Path
from typing import Dict, Any

def analyze_screenshot(
    screenshot_path: str,
    accessibility_json: str = None
) -> Dict[str, Any]:
    """
    Analyze screenshot with optional accessibility tree overlay
    
    Returns:
    - UI element positions
    - Layout issues (overlapping elements, misalignment)
    - Accessibility violations
    - Visual diff if baseline provided
    """
    # Load screenshot
    img = cv2.imread(screenshot_path)
    
    # Basic analysis
    result = {
        "resolution": f"{img.shape[1]}x{img.shape[0]}",
        "file_size": Path(screenshot_path).stat().st_size,
    }
    
    # If accessibility tree provided, overlay and analyze
    if accessibility_json:
        result["accessibility"] = analyze_with_accessibility(img, accessibility_json)
    
    return result

def compare_screenshots(baseline: str, current: str) -> Dict[str, Any]:
    """Visual regression detection"""
    img1 = cv2.imread(baseline)
    img2 = cv2.imread(current)
    
    # Compute pixel difference
    diff = cv2.absdiff(img1, img2)
    diff_percentage = (np.count_nonzero(diff) / diff.size) * 100
    
    return {
        "changed": diff_percentage > 0.1,  # 0.1% threshold
        "diff_percentage": diff_percentage,
        "diff_image": f"{current}_diff.png"
    }
```

---

## Skill 4: performance-profiling

### skill.yaml
```yaml
name: Performance Profiling
description: Memory analysis, Instruments usage, CPU profiling, and optimization workflows for iOS app performance.
version: 1.0.0

activation_conditions:
  keywords:
    - performance
    - profiling
    - memory
    - leak
    - instruments
    - cpu
    - battery
    - optimization
  contexts:
    - performance optimization
    - memory debugging
    - profiling

capabilities:
  - instruments_automation
  - memory_profiling
  - cpu_profiling
  - battery_profiling
  - performance_analysis

dependencies:
  python: ">=3.10"
  packages: []

metadata:
  author: XC Plugin Team
  license: MIT
```

---

## Skill 5: accessibility-testing

### skill.yaml
```yaml
name: Accessibility Testing
description: WCAG 2.1 compliance auditing, VoiceOver testing, color contrast checking, and inclusive design patterns for iOS apps.
version: 1.0.0

activation_conditions:
  keywords:
    - accessibility
    - voiceover
    - wcag
    - a11y
    - inclusive design
    - contrast
    - dynamic type
    - accessibility tree
  contexts:
    - accessibility
    - inclusive design
    - compliance

capabilities:
  - wcag_audit
  - voiceover_testing
  - accessibility_tree_navigation
  - contrast_checking
  - touch_target_validation

dependencies:
  python: ">=3.10"
  packages:
    - pillow
    - colour

metadata:
  author: XC Plugin Team
  license: MIT
```

### Key Scripts

**scripts/wcag_audit.py**:
```python
#!/usr/bin/env python3
"""
WCAG 2.1 automated accessibility audit
"""
from typing import Dict, List, Any

def audit_wcag_compliance(accessibility_tree: Dict) -> Dict[str, Any]:
    """
    Automated WCAG 2.1 checks on accessibility tree
    
    Checks:
    - Labels present and descriptive
    - Touch targets >= 44x44pt
    - Color contrast sufficient (if color data available)
    - Tab order logical
    - Traits appropriate
    
    Returns: violations with severity levels (A, AA, AAA)
    """
    violations = []
    
    # Check all interactive elements
    for element in accessibility_tree.get("elements", []):
        # Check 1: Label exists
        if not element.get("label") and element.get("type") in ["button", "textField"]:
            violations.append({
                "element": element.get("identifier"),
                "severity": "A",  # WCAG Level A
                "issue": "Missing accessibility label",
                "wcag": "1.1.1"
            })
        
        # Check 2: Touch target size
        frame = element.get("frame", {})
        width = frame.get("width", 0)
        height = frame.get("height", 0)
        
        if element.get("type") == "button" and (width < 44 or height < 44):
            violations.append({
                "element": element.get("identifier"),
                "severity": "AA",  # WCAG Level AA
                "issue": f"Touch target too small: {width}x{height} (minimum 44x44)",
                "wcag": "2.5.5"
            })
    
    return {
        "total_violations": len(violations),
        "by_severity": {
            "A": len([v for v in violations if v["severity"] == "A"]),
            "AA": len([v for v in violations if v["severity"] == "AA"]),
            "AAA": len([v for v in violations if v["severity"] == "AAA"]),
        },
        "violations": violations
    }
```

---

## Next Steps

Proceed to [05-plugin-manifest.md](./05-plugin-manifest.md) for complete plugin.json specification.
