# Accessibility-First Workflow Guide

## Overview

The accessibility-first approach revolutionizes iOS UI automation by prioritizing the accessibility tree over visual screenshots. This strategy delivers 3-4x faster execution, 80% cost reduction, and more reliable tests that survive theme changes and visual updates.

### What Makes This Approach Transformative

Modern iOS apps expose comprehensive accessibility information through the UIAccessibility APIs. By querying this structured data first, we can locate UI elements, extract their coordinates, and perform interactions without the overhead of visual processing.

**Traditional Screenshot-Based Approach:**

1. Capture screenshot (~2000ms)
2. Process image with vision model (~170 tokens)
3. Extract coordinates from visual analysis
4. Perform tap action

**Accessibility-First Approach:**

1. Query accessibility tree (~120ms)
2. Find element by label (~50 tokens)
3. Extract coordinates from tree data
4. Perform tap action

The accessibility tree provides structured JSON with precise coordinates, labels, identifiers, and state information—everything needed for robust automation.

---

## The Accessibility-First Strategy

### Why Accessibility First

**Performance Benefits:**

- **Speed**: 120ms vs 2000ms (16x faster)
- **Cost**: ~50 tokens vs ~170 tokens (3.4x cheaper)
- **Reliability**: Survives theme changes, animations, and visual updates
- **Offline**: No visual processing or model inference required

**Quality Benefits:**

- **Precision**: Exact coordinates from UI framework
- **State Awareness**: Know if elements are enabled, visible, focused
- **Hierarchy Understanding**: Parent-child relationships preserved
- **Semantic Labels**: Natural language element descriptions

**Developer Experience:**

- **Faster Feedback**: Tests run 3-4x faster
- **Easier Debugging**: Readable JSON output vs image analysis
- **Lower Costs**: Reduced token consumption and API calls
- **Better Test Stability**: Less flakiness from visual changes

### When Accessibility Tree Falls Short

The accessibility tree isn't always sufficient. Use screenshots when:

- **Poor Accessibility Labels**: Elements lack identifiers or meaningful labels
- **Custom Rendering**: Canvas-based or WebGL content without accessibility markup
- **Visual Verification**: Need to verify actual rendered appearance
- **Complex Layouts**: Dynamic layouts where tree structure is unclear
- **Legacy Apps**: Older apps with minimal accessibility support

---

## When to Use Each Approach

### Decision Tree

```
START: Need to interact with UI element
│
├─ 1. Can you identify element by text/label?
│   ├─ YES → Use idb-ui-find-element
│   │         ├─ Found? → Extract coordinates → Tap
│   │         └─ Not found? → Continue to Step 2
│   │
│   └─ NO → Continue to Step 2
│
├─ 2. Query full accessibility tree
│     (idb-ui-describe operation: all)
│     │
│     ├─ Element found with coordinates?
│     │   └─ YES → Extract coordinates → Tap
│     │
│     └─ NO → Continue to Step 3
│
├─ 3. Check accessibility quality
│     (accessibility-quality-check)
│     │
│     ├─ Quality score > 70%?
│     │   ├─ YES → Manual tree traversal
│     │   │         └─ Found? → Extract coordinates → Tap
│     │   │
│     │   └─ NO → Continue to Step 4
│     │
│     └─ Quality score ≤ 70%
│
└─ 4. FALLBACK: Use screenshot
      (screenshot + visual analysis)
      └─ Extract coordinates → Tap
```

### Strategy Selection Guide

**Use find-element when:**

- Element has clear, unique label or identifier
- You know the approximate text (e.g., "Login", "Submit", "Cancel")
- Quick single-element lookup needed
- **Example**: Finding a "Sign In" button

**Use describe (operation: all) when:**

- Need to explore multiple elements
- Building automation for new screen
- Element label unknown but structure is clear
- Need parent-child relationship information
- **Example**: Mapping out a complex form

**Use accessibility-quality-check when:**

- Unsure if accessibility data is sufficient
- Debugging test failures
- Evaluating app for automation readiness
- Before committing to accessibility-first approach
- **Example**: Pre-testing a new feature screen

**Use screenshot when:**

- Quality check returns < 70% score
- Visual verification required (colors, images, layout)
- Element lacks accessibility labels
- Canvas or WebGL content
- **Example**: Verifying rendered chart appearance

---

## Core Workflow Steps

### Step 1: Query Accessibility Tree

The foundation of accessibility-first automation is querying the UI element tree.

**Full Tree Query:**

```json
{
  "name": "idb-ui-describe",
  "arguments": {
    "udid": "<target-device-udid>",
    "operation": "all",
    "screenContext": "Login screen - querying for username field",
    "purposeDescription": "Map all interactive elements for login automation"
  }
}
```

**Expected Response:**

```json
{
  "elements": [
    {
      "frame": { "x": 20, "y": 120, "width": 374, "height": 44 },
      "centerX": 207,
      "centerY": 142,
      "label": "Username",
      "identifier": "usernameField",
      "type": "TextField",
      "isEnabled": true,
      "isFocused": false,
      "value": "",
      "traits": ["TextField"]
    },
    {
      "frame": { "x": 20, "y": 180, "width": 374, "height": 44 },
      "centerX": 207,
      "centerY": 202,
      "label": "Password",
      "identifier": "passwordField",
      "type": "SecureTextField",
      "isEnabled": true,
      "isFocused": false,
      "traits": ["TextField", "Secure"]
    },
    {
      "frame": { "x": 147, "y": 250, "width": 120, "height": 50 },
      "centerX": 207,
      "centerY": 275,
      "label": "Sign In",
      "identifier": "loginButton",
      "type": "Button",
      "isEnabled": false,
      "traits": ["Button"]
    }
  ]
}
```

**Key Data Points:**

- `centerX`, `centerY`: Tap coordinates
- `label`: Human-readable element name
- `identifier`: Programmatic ID (if set by developer)
- `isEnabled`: Whether element accepts interaction
- `isFocused`: Current focus state
- `type`: Element class (Button, TextField, etc.)

### Step 2: Find Target Element

Two approaches for locating elements:

**Approach A: Semantic Search (Fastest)**

```json
{
  "name": "idb-ui-find-element",
  "arguments": {
    "udid": "<target-device-udid>",
    "query": "Sign In button"
  }
}
```

**Response:**

```json
{
  "element": {
    "centerX": 207,
    "centerY": 275,
    "label": "Sign In",
    "identifier": "loginButton",
    "type": "Button",
    "isEnabled": false
  }
}
```

**Approach B: Manual Tree Traversal**
From the full tree query, filter by:

- `label` matching target text
- `type` matching expected element class
- `identifier` matching known ID
- `traits` containing expected characteristics

```javascript
// Pseudo-code for manual filtering
const loginButton = elements.find((el) => el.label === 'Sign In' && el.type === 'Button');
```

### Step 3: Extract Coordinates

From either approach, extract tap coordinates:

```javascript
const tapX = element.centerX; // 207
const tapY = element.centerY; // 275
```

**Important Coordinate Considerations:**

- Coordinates are in logical points, not pixels
- Origin (0,0) is top-left corner
- `centerX`/`centerY` provide best tap target
- Safe area insets already accounted for
- Rotation changes coordinates automatically

### Step 4: Perform Interaction

**Tap Action:**

```json
{
  "name": "idb-ui-tap",
  "arguments": {
    "udid": "<target-device-udid>",
    "x": 207,
    "y": 275,
    "actionName": "Tap Sign In button",
    "expectedOutcome": "Navigate to home screen or show validation error",
    "screenContext": "Login screen",
    "testScenario": "User login flow"
  }
}
```

**Text Input:**

```json
{
  "name": "idb-ui-input",
  "arguments": {
    "udid": "<target-device-udid>",
    "operation": "text",
    "text": "user@example.com",
    "actionName": "Enter username",
    "fieldContext": "Username field on login screen",
    "expectedOutcome": "Username populated, Sign In button enabled"
  }
}
```

**Key Press:**

```json
{
  "name": "idb-ui-input",
  "arguments": {
    "udid": "<target-device-udid>",
    "operation": "key",
    "key": "return",
    "actionName": "Submit form via return key"
  }
}
```

---

## Complete Example Workflows

### Workflow 1: Login Automation

**Scenario:** Automate login with username/password, handle validation errors.

**Step-by-Step Execution:**

**1. Query Initial Screen:**

```json
{
  "name": "idb-ui-describe",
  "arguments": {
    "udid": "booted",
    "operation": "all",
    "screenContext": "Login screen - initial load",
    "purposeDescription": "Map login form elements"
  }
}
```

**2. Find Username Field:**

```json
{
  "name": "idb-ui-find-element",
  "arguments": {
    "udid": "booted",
    "query": "Username field"
  }
}
```

**Result:** `centerX: 207, centerY: 142`

**3. Tap Username Field:**

```json
{
  "name": "idb-ui-tap",
  "arguments": {
    "udid": "booted",
    "x": 207,
    "y": 142,
    "actionName": "Focus username field",
    "expectedOutcome": "Keyboard appears, field gains focus"
  }
}
```

**4. Enter Username:**

```json
{
  "name": "idb-ui-input",
  "arguments": {
    "udid": "booted",
    "operation": "text",
    "text": "testuser@example.com",
    "fieldContext": "Username field - entering valid email"
  }
}
```

**5. Find Password Field:**

```json
{
  "name": "idb-ui-find-element",
  "arguments": {
    "udid": "booted",
    "query": "Password field"
  }
}
```

**Result:** `centerX: 207, centerY: 202`

**6. Tap Password Field:**

```json
{
  "name": "idb-ui-tap",
  "arguments": {
    "udid": "booted",
    "x": 207,
    "y": 202,
    "actionName": "Focus password field"
  }
}
```

**7. Enter Password:**

```json
{
  "name": "idb-ui-input",
  "arguments": {
    "udid": "booted",
    "operation": "text",
    "text": "SecureP@ssw0rd",
    "isSensitive": true,
    "fieldContext": "Password field - secure entry"
  }
}
```

**8. Find Sign In Button:**

```json
{
  "name": "idb-ui-find-element",
  "arguments": {
    "udid": "booted",
    "query": "Sign In button"
  }
}
```

**Result:** `centerX: 207, centerY: 275, isEnabled: true`

**9. Tap Sign In:**

```json
{
  "name": "idb-ui-tap",
  "arguments": {
    "udid": "booted",
    "x": 207,
    "y": 275,
    "actionName": "Submit login credentials",
    "expectedOutcome": "Navigate to home screen or display error"
  }
}
```

**10. Verify Result:**

```json
{
  "name": "idb-ui-describe",
  "arguments": {
    "udid": "booted",
    "operation": "all",
    "screenContext": "Post-login - verifying navigation",
    "purposeDescription": "Confirm home screen loaded successfully"
  }
}
```

**Total Time:** ~600ms (vs ~10+ seconds with screenshots)

---

### Workflow 2: Tab Navigation

**Scenario:** Navigate through tab bar to reach profile screen.

**1. Query Tab Bar:**

```json
{
  "name": "idb-ui-describe",
  "arguments": {
    "udid": "booted",
    "operation": "all",
    "screenContext": "Home screen with tab bar",
    "purposeDescription": "Locate tab bar items"
  }
}
```

**Response Excerpt:**

```json
{
  "elements": [
    {
      "label": "Home",
      "type": "TabBarItem",
      "centerX": 78,
      "centerY": 806,
      "isEnabled": true,
      "traits": ["Button", "Selected"]
    },
    {
      "label": "Search",
      "type": "TabBarItem",
      "centerX": 234,
      "centerY": 806,
      "isEnabled": true,
      "traits": ["Button"]
    },
    {
      "label": "Profile",
      "type": "TabBarItem",
      "centerX": 390,
      "centerY": 806,
      "isEnabled": true,
      "traits": ["Button"]
    }
  ]
}
```

**2. Tap Profile Tab:**

```json
{
  "name": "idb-ui-tap",
  "arguments": {
    "udid": "booted",
    "x": 390,
    "y": 806,
    "actionName": "Navigate to Profile tab",
    "expectedOutcome": "Profile screen loads"
  }
}
```

**3. Verify Navigation:**

```json
{
  "name": "idb-ui-find-element",
  "arguments": {
    "udid": "booted",
    "query": "Profile header"
  }
}
```

**Total Time:** ~240ms for complete tab navigation

---

### Workflow 3: Form Filling

**Scenario:** Complete multi-field registration form.

**1. Map Form Structure:**

```json
{
  "name": "idb-ui-describe",
  "arguments": {
    "udid": "booted",
    "operation": "all",
    "screenContext": "Registration form",
    "purposeDescription": "Identify all form fields and their order"
  }
}
```

**2. Fill First Name:**

```json
{
  "name": "idb-ui-find-element",
  "arguments": {"udid": "booted", "query": "First Name"}
}
// Result: centerX: 207, centerY: 150

{
  "name": "idb-ui-tap",
  "arguments": {"udid": "booted", "x": 207, "y": 150}
}

{
  "name": "idb-ui-input",
  "arguments": {
    "udid": "booted",
    "operation": "text",
    "text": "John"
  }
}
```

**3. Navigate to Next Field (Tab Key):**

```json
{
  "name": "idb-ui-input",
  "arguments": {
    "udid": "booted",
    "operation": "key",
    "key": "tab"
  }
}
```

**4. Fill Last Name:**

```json
{
  "name": "idb-ui-input",
  "arguments": {
    "udid": "booted",
    "operation": "text",
    "text": "Doe"
  }
}
```

**5. Fill Email (Direct Tap):**

```json
{
  "name": "idb-ui-find-element",
  "arguments": {"udid": "booted", "query": "Email"}
}

{
  "name": "idb-ui-tap",
  "arguments": {"udid": "booted", "x": 207, "y": 250}
}

{
  "name": "idb-ui-input",
  "arguments": {
    "udid": "booted",
    "operation": "text",
    "text": "john.doe@example.com"
  }
}
```

**6. Submit Form:**

```json
{
  "name": "idb-ui-find-element",
  "arguments": {"udid": "booted", "query": "Submit"}
}

{
  "name": "idb-ui-tap",
  "arguments": {
    "udid": "booted",
    "x": 207,
    "y": 450,
    "actionName": "Submit registration form"
  }
}
```

**Total Time:** ~800ms for 3-field form

---

### Workflow 4: List Scrolling and Selection

**Scenario:** Scroll through list, find specific item, tap to open details.

**1. Query Initial List State:**

```json
{
  "name": "idb-ui-describe",
  "arguments": {
    "udid": "booted",
    "operation": "all",
    "screenContext": "Product list - initial view",
    "purposeDescription": "Get visible list items"
  }
}
```

**Response Excerpt:**

```json
{
  "elements": [
    {
      "label": "Product A - $29.99",
      "type": "Cell",
      "centerX": 207,
      "centerY": 150
    },
    {
      "label": "Product B - $39.99",
      "type": "Cell",
      "centerX": 207,
      "centerY": 230
    },
    {
      "label": "Product C - $49.99",
      "type": "Cell",
      "centerX": 207,
      "centerY": 310
    }
  ]
}
```

**2. Check if Target Item Visible:**

```javascript
// Looking for "Product X - $99.99"
const targetItem = elements.find((el) => el.label.includes('Product X'));
if (!targetItem) {
  // Need to scroll
}
```

**3. Scroll Down:**

```json
{
  "name": "idb-ui-gesture",
  "arguments": {
    "udid": "booted",
    "operation": "swipe",
    "direction": "up",
    "startX": 207,
    "startY": 600,
    "endX": 207,
    "endY": 200,
    "duration": 200
  }
}
```

**4. Query Again After Scroll:**

```json
{
  "name": "idb-ui-describe",
  "arguments": {
    "udid": "booted",
    "operation": "all",
    "screenContext": "Product list - after scroll"
  }
}
```

**5. Find Target Item:**

```json
{
  "name": "idb-ui-find-element",
  "arguments": {
    "udid": "booted",
    "query": "Product X"
  }
}
```

**6. Tap Item:**

```json
{
  "name": "idb-ui-tap",
  "arguments": {
    "udid": "booted",
    "x": 207,
    "y": 270,
    "actionName": "Open Product X details"
  }
}
```

**Total Time:** ~400ms (with 1 scroll)

---

## Progressive Enhancement Pattern

Start with the simplest, fastest approach and progressively add complexity only when needed.

### Level 1: Direct Element Search (Fastest)

**When:** Element has clear, unique label
**Time:** ~80ms
**Cost:** ~30 tokens

```json
{
  "name": "idb-ui-find-element",
  "arguments": {
    "udid": "booted",
    "query": "Submit button"
  }
}
```

**If successful:** Extract coordinates, tap immediately
**If fails:** Move to Level 2

### Level 2: Full Tree Query

**When:** Element label unclear or multiple matches possible
**Time:** ~120ms
**Cost:** ~50 tokens

```json
{
  "name": "idb-ui-describe",
  "arguments": {
    "udid": "booted",
    "operation": "all"
  }
}
```

**If successful:** Filter tree manually, extract coordinates
**If fails:** Move to Level 3

### Level 3: Accessibility Quality Check

**When:** Unsure if accessibility data is sufficient
**Time:** ~80ms
**Cost:** ~40 tokens

```json
{
  "name": "accessibility-quality-check",
  "arguments": {
    "udid": "booted",
    "screenContext": "Current screen description"
  }
}
```

**Response Analysis:**

- **Score > 80%:** High confidence - retry Level 2 with better filters
- **Score 60-80%:** Moderate - consider point query or screenshot
- **Score < 60%:** Low quality - move to Level 4

### Level 4: Screenshot Fallback (Slowest)

**When:** Accessibility data insufficient
**Time:** ~2000ms
**Cost:** ~170 tokens

```json
{
  "name": "screenshot",
  "arguments": {
    "udid": "booted",
    "size": "full",
    "enableCoordinateCaching": true
  }
}
```

**Use visual analysis to locate element and extract coordinates.**

### Progressive Enhancement Decision Matrix

| Scenario                        | Start Level | Expected Success Rate |
| ------------------------------- | ----------- | --------------------- |
| Standard button with label      | Level 1     | 95%                   |
| Form field with placeholder     | Level 1     | 90%                   |
| Custom control with identifier  | Level 2     | 85%                   |
| Dynamic list item               | Level 2     | 80%                   |
| Canvas-based UI                 | Level 4     | 100%                  |
| Legacy app (poor accessibility) | Level 3 → 4 | 50%                   |

---

## Performance Optimization

### Cache Tree Queries

Query the tree once, reuse for multiple operations:

```javascript
// Single query
const tree = await idbUiDescribe({ operation: 'all' });

// Extract multiple coordinates
const submitButton = findElement(tree, 'Submit');
const cancelButton = findElement(tree, 'Cancel');
const emailField = findElement(tree, 'Email');

// Perform all taps without re-querying
await tap(submitButton.centerX, submitButton.centerY);
```

**Benefit:** 360ms saved per avoided query

### Batch Coordinate Lookups

For multi-step workflows, extract all coordinates upfront:

```javascript
const coords = {
  username: findElement(tree, 'Username'),
  password: findElement(tree, 'Password'),
  submit: findElement(tree, 'Sign In'),
};

// Execute rapidly without queries
await tap(coords.username.centerX, coords.username.centerY);
await input('user@example.com');
await tap(coords.password.centerX, coords.password.centerY);
await input('password');
await tap(coords.submit.centerX, coords.submit.centerY);
```

### Reuse Target Connections

IDB maintains persistent connections to simulators:

```json
{
  "name": "idb-targets",
  "arguments": {
    "operation": "connect",
    "udid": "specific-device-udid"
  }
}
```

Subsequent operations on the same UDID reuse this connection, eliminating connection overhead.

### Minimize Describe Calls

**Anti-pattern:**

```javascript
// Querying 5 times (600ms total)
await findElement('Username');
await findElement('Password');
await findElement('Remember Me');
await findElement('Forgot Password');
await findElement('Sign In');
```

**Optimized:**

```javascript
// Query once (120ms total)
const tree = await describe({ operation: 'all' });
const elements = {
  username: filterTree(tree, 'Username'),
  password: filterTree(tree, 'Password'),
  rememberMe: filterTree(tree, 'Remember Me'),
  forgotPassword: filterTree(tree, 'Forgot Password'),
  signIn: filterTree(tree, 'Sign In'),
};
```

**Savings:** 480ms (80% reduction)

---

## Common Pitfalls

### Pitfall 1: Not Checking Element Visibility

**Problem:** Tapping coordinates of off-screen or hidden elements.

**Wrong:**

```javascript
const element = findElement(tree, 'Submit');
await tap(element.centerX, element.centerY); // May be hidden!
```

**Correct:**

```javascript
const element = findElement(tree, 'Submit');
if (element.isEnabled && element.frame.width > 0) {
  await tap(element.centerX, element.centerY);
} else {
  console.log('Element not visible or disabled');
}
```

### Pitfall 2: Using Stale Coordinates

**Problem:** UI changes after query, coordinates no longer valid.

**Wrong:**

```javascript
const tree = await describe({ operation: 'all' });
await someActionThatChangesUI();
// Coordinates from old tree are now wrong!
await tap(tree.submit.centerX, tree.submit.centerY);
```

**Correct:**

```javascript
await someActionThatChangesUI();
// Re-query after UI change
const newTree = await describe({ operation: 'all' });
await tap(newTree.submit.centerX, newTree.submit.centerY);
```

### Pitfall 3: Ignoring isEnabled Property

**Problem:** Attempting to interact with disabled elements.

**Wrong:**

```javascript
const submitButton = findElement(tree, 'Submit');
await tap(submitButton.centerX, submitButton.centerY);
// Button might be disabled!
```

**Correct:**

```javascript
const submitButton = findElement(tree, 'Submit');
if (!submitButton.isEnabled) {
  console.log('Submit button is disabled - check form validation');
  // Fill required fields first
} else {
  await tap(submitButton.centerX, submitButton.centerY);
}
```

### Pitfall 4: Over-Relying on Screenshots

**Problem:** Defaulting to screenshots when accessibility tree would suffice.

**Wrong:**

```javascript
// Always using screenshot (2000ms)
const screenshot = await captureScreen();
const coordinates = await analyzeImage(screenshot);
await tap(coordinates.x, coordinates.y);
```

**Correct:**

```javascript
// Try accessibility first (120ms)
try {
  const element = await findElement('Submit');
  await tap(element.centerX, element.centerY);
} catch (error) {
  // Fallback to screenshot only if needed
  const screenshot = await captureScreen();
  // ...
}
```

### Pitfall 5: Ambiguous Element Queries

**Problem:** Query matches multiple elements.

**Wrong:**

```javascript
const button = findElement(tree, 'Button');
// Multiple buttons exist!
```

**Correct:**

```javascript
// Be specific with labels
const submitButton = findElement(tree, 'Submit');
// Or filter by multiple properties
const submitButton = tree.elements.find(
  (el) => el.label === 'Submit' && el.type === 'Button' && el.isEnabled === true
);
```

---

## Migration from Screenshot-Based Automation

### Assessment Phase

**Step 1: Audit Current Screenshot Usage**

- Identify all screenshot calls in test suite
- Measure total execution time
- Calculate token consumption
- Document why screenshots are used

**Step 2: Run Accessibility Quality Check**

```json
{
  "name": "accessibility-quality-check",
  "arguments": {
    "udid": "booted",
    "screenContext": "Screen name from test"
  }
}
```

For each screen with score > 70%, mark as migration candidate.

### Migration Phase

**Before (Screenshot-Based):**

```javascript
async function loginUser(username, password) {
  // Screenshot 1: Find username field
  const screen1 = await captureScreen();
  const usernameCoords = await analyzeImage(screen1, 'username field');
  await tap(usernameCoords.x, usernameCoords.y);

  await input(username);

  // Screenshot 2: Find password field
  const screen2 = await captureScreen();
  const passwordCoords = await analyzeImage(screen2, 'password field');
  await tap(passwordCoords.x, passwordCoords.y);

  await input(password);

  // Screenshot 3: Find login button
  const screen3 = await captureScreen();
  const buttonCoords = await analyzeImage(screen3, 'login button');
  await tap(buttonCoords.x, buttonCoords.y);
}

// Total time: ~6000ms
// Total cost: ~510 tokens
```

**After (Accessibility-First):**

```javascript
async function loginUser(username, password) {
  // Single tree query
  const tree = await describe({ operation: 'all' });

  // Extract all coordinates
  const usernameField = findElement(tree, 'Username');
  const passwordField = findElement(tree, 'Password');
  const loginButton = findElement(tree, 'Sign In');

  // Execute rapidly
  await tap(usernameField.centerX, usernameField.centerY);
  await input(username);

  await tap(passwordField.centerX, passwordField.centerY);
  await input(password);

  await tap(loginButton.centerX, loginButton.centerY);
}

// Total time: ~600ms (10x faster)
// Total cost: ~50 tokens (10x cheaper)
```

### Hybrid Approach for Partial Migration

Keep screenshots for specific scenarios:

```javascript
async function loginWithAccessibility(username, password) {
  try {
    // Try accessibility first
    const tree = await describe({ operation: 'all' });
    const usernameField = findElement(tree, 'Username');

    if (!usernameField) {
      throw new Error('Element not found in tree');
    }

    await tap(usernameField.centerX, usernameField.centerY);
    await input(username);
    // ... continue with accessibility
  } catch (error) {
    console.log('Accessibility failed, falling back to screenshot');

    // Fallback to screenshot for this specific step
    const screen = await captureScreen();
    const coords = await analyzeImage(screen, 'username field');
    await tap(coords.x, coords.y);
    await input(username);
    // ... continue with screenshot
  }
}
```

### Measuring Migration Success

**Key Metrics:**

| Metric              | Before           | After           | Improvement          |
| ------------------- | ---------------- | --------------- | -------------------- |
| Test Execution Time | 45 seconds       | 8 seconds       | 82% faster           |
| Token Consumption   | 2,500 tokens     | 400 tokens      | 84% reduction        |
| Test Flakiness      | 15% failure rate | 3% failure rate | 80% more reliable    |
| Development Speed   | 2 hours/test     | 30 minutes/test | 75% faster authoring |

---

## Related Resources

### Workflow Skills

- **ui-automation-workflows**: Step-by-step guides for common automation patterns
- **simulator-workflows**: Device setup and management
- **testing-strategies**: Comprehensive testing approach documentation

### Tool Documentation

- **idb-ui-describe**: Full accessibility tree query reference
- **idb-ui-find-element**: Semantic element search details
- **accessibility-quality-check**: Quality scoring methodology
- **screenshot**: Screenshot capture for fallback scenarios

### External Resources

- [Apple UIAccessibility Documentation](https://developer.apple.com/documentation/uikit/accessibility)
- [WWDC: Building Accessible Apps](https://developer.apple.com/videos/accessibility)
- [WebDriverAgent Accessibility Inspector](https://github.com/appium/WebDriverAgent)

---

## Quick Reference: Decision Flowchart

```
┌─────────────────────────────────────┐
│   Need to interact with element     │
└──────────────┬──────────────────────┘
               │
               ▼
┌──────────────────────────────────────┐
│  Try idb-ui-find-element             │
│  (80ms, ~30 tokens)                  │
└──────────────┬───────────────────────┘
               │
        ┌──────┴──────┐
        │             │
        ▼             ▼
    SUCCESS       NOT FOUND
        │             │
        │             ▼
        │   ┌─────────────────────┐
        │   │ Try idb-ui-describe │
        │   │ (120ms, ~50 tokens) │
        │   └──────┬──────────────┘
        │          │
        │   ┌──────┴──────┐
        │   │             │
        │   ▼             ▼
        │ FOUND       NOT FOUND
        │   │             │
        │   │             ▼
        │   │   ┌──────────────────────────┐
        │   │   │ accessibility-quality-   │
        │   │   │ check (80ms, ~40 tokens) │
        │   │   └──────┬───────────────────┘
        │   │          │
        │   │   ┌──────┴──────┐
        │   │   │             │
        │   │   ▼             ▼
        │   │ SCORE>70%   SCORE≤70%
        │   │   │             │
        │   │   ▼             ▼
        │   │ RETRY      ┌────────────────┐
        │   │ DESCRIBE   │  screenshot    │
        │   │            │  (2000ms, 170  │
        │   │            │  tokens)       │
        │   │            └────────┬───────┘
        │   │                     │
        └───┴─────────────────────┘
            │
            ▼
    ┌───────────────────┐
    │ Extract coords &  │
    │ perform action    │
    └───────────────────┘
```

---

## Summary: Accessibility-First Benefits

**Performance:**

- 3-4x faster execution (~120ms vs ~2000ms)
- 80% cost reduction (~50 tokens vs ~170 tokens)
- Lower latency, better test suite performance

**Reliability:**

- Survives theme changes (dark mode, custom themes)
- Unaffected by animations or transitions
- Consistent across device sizes

**Developer Experience:**

- Faster test authoring
- Easier debugging with structured JSON
- Better test stability and maintainability

**When to Use:**

- Default choice for all UI automation
- Especially effective for forms, navigation, standard controls
- Production-ready for well-architected apps with accessibility support

**When to Fallback:**

- Poor accessibility labels (quality score < 70%)
- Custom rendering (canvas, WebGL)
- Visual verification requirements
- Legacy apps with minimal accessibility

---

Generated for xc://workflows/accessibility-first MCP resource
