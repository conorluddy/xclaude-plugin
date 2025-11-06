# IDB Operations Reference

Complete reference for iOS UI automation using IDB (iOS Development Bridge) via the `execute_idb_command` MCP tool.

## Accessibility-First Strategy

**Always prefer accessibility tree queries over screenshots for UI automation.**

### Performance Comparison

| Approach                            | Time    | Token Cost  | Reliability                      |
| ----------------------------------- | ------- | ----------- | -------------------------------- |
| **Accessibility tree** (`describe`) | ~120ms  | ~50 tokens  | Survives theme/animation changes |
| **Screenshot**                      | ~2000ms | ~170 tokens | Breaks on visual changes         |

**Result: 3-4x faster, 80% cheaper, more reliable**

### Decision Tree: When to Use Each Approach

```
Start UI Automation
    |
    v
1. Check accessibility quality (optional)
    |
    v
2. Query accessibility tree (describe → all)
    |
    v
Is element found with clear coordinates?
    |
    +--YES--> Use accessibility approach
    |         (find-element → tap)
    |
    +--NO---> Check if accessibility insufficient
              |
              v
              Run check-accessibility
              |
              v
              Quality score "poor" or "insufficient"?
              |
              +--YES--> Fallback to screenshot
              |
              +--NO---> Element may be:
                        - Off-screen (scroll first)
                        - Hidden (check visible:false)
                        - In different view (navigate)
```

### Standard Workflow Pattern

The **describe → find → tap** workflow is your primary approach:

1. **Query accessibility tree** (`describe`)
2. **Search for element** (`find-element` or manual search)
3. **Interact with element** (`tap`, `input`, etc.)
4. **Verify state** (describe again)

**Only use screenshots if accessibility data is insufficient.**

---

## Tool: execute_idb_command

Single consolidated tool for all IDB operations.

### Basic Structure

```json
{
  "operation": "operation_name",
  "target": "device_udid_or_booted",
  "parameters": {
    // Operation-specific parameters
  }
}
```

### Target Parameter

- **"booted"**: Currently running simulator (most common)
- **UDID**: Specific device UDID (from `targets` operation)
- **Omit**: Uses default/focused target

---

## Operations Reference

### Operation: tap

Tap at specific screen coordinates.

**When to use:**

- After finding element via `describe` or `find-element`
- Interacting with buttons, cells, controls
- Triggering navigation or actions

**Parameters:**

```json
{
  "operation": "tap",
  "target": "booted",
  "parameters": {
    "x": 187, // Required: X coordinate
    "y": 425, // Required: Y coordinate
    "duration": 100, // Optional: Tap duration in ms (default: 100)
    "numberOfTaps": 1 // Optional: Single or double tap (default: 1)
  }
}
```

**Coordinate System:**

- Origin (0, 0) is top-left corner
- X increases rightward
- Y increases downward
- Use `centerX` and `centerY` from accessibility tree for accuracy

**Example: Tap Login Button**

```json
{
  "operation": "tap",
  "target": "booted",
  "parameters": {
    "x": 187,
    "y": 425
  }
}
```

**Double-Tap Example:**

```json
{
  "operation": "tap",
  "target": "booted",
  "parameters": {
    "x": 187,
    "y": 425,
    "numberOfTaps": 2
  }
}
```

**Long-Press Example:**

```json
{
  "operation": "tap",
  "target": "booted",
  "parameters": {
    "x": 187,
    "y": 425,
    "duration": 1000 // 1 second press
  }
}
```

**Common Issues:**

- **Tap not registering**: Verify element is `enabled: true` and `visible: true`
- **Wrong target**: Ensure correct element coordinates (use centerX/centerY)
- **Timing issues**: Element may not be ready; wait or verify state first

---

### Operation: input

Input text or press keyboard keys.

**When to use:**

- Typing into text fields
- Pressing keyboard keys (return, delete, etc.)
- Executing key sequences

**Sub-operations:**

1. **text**: Type a string
2. **key**: Press single key
3. **key-sequence**: Press multiple keys in order

#### Input: text

Type text into currently focused field.

```json
{
  "operation": "input",
  "target": "booted",
  "parameters": {
    "text": "user@example.com"
  }
}
```

**Notes:**

- Text field must be focused first (tap it)
- Keyboard must be visible
- Special characters supported (Unicode)

**Example: Fill Email Field**

```json
// Step 1: Focus field
{
  "operation": "tap",
  "target": "booted",
  "parameters": { "x": 187, "y": 322 }
}

// Step 2: Type email
{
  "operation": "input",
  "target": "booted",
  "parameters": {
    "text": "user@example.com"
  }
}
```

#### Input: key

Press a single keyboard key.

```json
{
  "operation": "input",
  "target": "booted",
  "parameters": {
    "key": "return"
  }
}
```

**Available Keys:**

| Key      | Description      | Common Use               |
| -------- | ---------------- | ------------------------ |
| `return` | Return/Enter key | Submit forms, next field |
| `home`   | Home button      | Go to home screen        |
| `delete` | Delete/Backspace | Remove text              |
| `space`  | Space bar        | Add space                |
| `escape` | Escape key       | Cancel/dismiss           |
| `tab`    | Tab key          | Next field               |
| `up`     | Up arrow         | Navigate up              |
| `down`   | Down arrow       | Navigate down, scroll    |
| `left`   | Left arrow       | Navigate left            |
| `right`  | Right arrow      | Navigate right           |

**Example: Submit Form**

```json
{
  "operation": "input",
  "target": "booted",
  "parameters": {
    "key": "return"
  }
}
```

#### Input: key-sequence

Press multiple keys in sequence.

```json
{
  "operation": "input",
  "target": "booted",
  "parameters": {
    "key-sequence": ["tab", "tab", "return"]
  }
}
```

**Use cases:**

- Navigate through form fields
- Execute keyboard shortcuts
- Complex input patterns

**Common Patterns:**

```json
// Navigate to next field and submit
{
  "operation": "input",
  "target": "booted",
  "parameters": {
    "key-sequence": ["tab", "return"]
  }
}

// Clear field completely
{
  "operation": "input",
  "target": "booted",
  "parameters": {
    "key-sequence": ["delete", "delete", "delete"]
  }
}
```

**Common Issues:**

- **Text not appearing**: Text field may not be focused (tap first)
- **Keyboard not visible**: Field may not be a text input type
- **Wrong input**: Verify field accepts the input type (numeric, email, etc.)

---

### Operation: gesture

Perform swipe gestures or press hardware/system buttons.

**When to use:**

- Scrolling through content
- Navigating between screens
- Triggering system actions (home, lock)
- Swiping cells (delete, actions)

**Gesture Types:**

1. **swipe**: Directional swipes
2. **button**: System/hardware button presses

#### Gesture: swipe

Swipe in a direction to scroll or navigate.

```json
{
  "operation": "gesture",
  "target": "booted",
  "parameters": {
    "gesture_type": "swipe",
    "direction": "up", // up, down, left, right
    "duration": 200 // Optional: swipe duration in ms (default: 200)
  }
}
```

**Directions:**

- **up**: Scroll content down (swipe finger up)
- **down**: Scroll content up (swipe finger down)
- **left**: Navigate forward, delete cell (swipe finger left)
- **right**: Navigate back, show actions (swipe finger right)

**Swipe Duration:**

- **Fast (100-200ms)**: Quick flick, momentum scroll
- **Medium (200-500ms)**: Standard scroll
- **Slow (500-1000ms)**: Precise, controlled scroll

**Example: Scroll Down**

```json
{
  "operation": "gesture",
  "target": "booted",
  "parameters": {
    "gesture_type": "swipe",
    "direction": "up", // Swipe up to scroll down
    "duration": 200
  }
}
```

**Example: Navigate Back (Page Swipe)**

```json
{
  "operation": "gesture",
  "target": "booted",
  "parameters": {
    "gesture_type": "swipe",
    "direction": "right", // Swipe right to go back
    "duration": 300
  }
}
```

**Example: Reveal Delete Button (Cell Swipe)**

```json
{
  "operation": "gesture",
  "target": "booted",
  "parameters": {
    "gesture_type": "swipe",
    "direction": "left", // Swipe left on table cell
    "duration": 200
  }
}
```

#### Gesture: button

Press system or hardware buttons.

```json
{
  "operation": "gesture",
  "target": "booted",
  "parameters": {
    "gesture_type": "button",
    "button": "HOME"
  }
}
```

**Available Buttons:**

| Button        | Description       | Effect              |
| ------------- | ----------------- | ------------------- |
| `HOME`        | Home button       | Exit to home screen |
| `LOCK`        | Lock/Power button | Lock device, sleep  |
| `SIDE_BUTTON` | Side button       | Power menu, Siri    |
| `SIRI`        | Siri button       | Activate Siri       |
| `APPLE_PAY`   | Apple Pay button  | Trigger Apple Pay   |
| `SCREENSHOT`  | Screenshot combo  | Capture screenshot  |
| `APP_SWITCH`  | App switcher      | Show multitasking   |

**Example: Go to Home Screen**

```json
{
  "operation": "gesture",
  "target": "booted",
  "parameters": {
    "gesture_type": "button",
    "button": "HOME"
  }
}
```

**Example: Lock Device**

```json
{
  "operation": "gesture",
  "target": "booted",
  "parameters": {
    "gesture_type": "button",
    "button": "LOCK"
  }
}
```

**Example: Open App Switcher**

```json
{
  "operation": "gesture",
  "target": "booted",
  "parameters": {
    "gesture_type": "button",
    "button": "APP_SWITCH"
  }
}
```

**Common Issues:**

- **Swipe not scrolling**: Content may not be scrollable or already at edge
- **Wrong direction**: Remember swipe direction is opposite to scroll direction
- **Button not working**: Some buttons may not work in all device states

---

### Operation: describe

Query the UI accessibility tree (PREFERRED METHOD for element discovery).

**When to use:**

- Finding UI elements before interaction
- Understanding current screen state
- Verifying navigation success
- Checking element properties (enabled, visible, value)

**This is your primary tool for UI automation.** Always use this before screenshots.

**Sub-operations:**

1. **all**: Get complete accessibility tree (most common)
2. **point**: Get element at specific coordinates

#### Describe: all

Get complete accessibility tree for current screen.

```json
{
  "operation": "describe",
  "target": "booted",
  "parameters": {
    "operation": "all"
  }
}
```

**Returns:**

```json
{
  "success": true,
  "data": {
    "elements": [
      {
        "label": "Login",
        "type": "Button",
        "frame": { "x": 100, "y": 400, "width": 175, "height": 50 },
        "centerX": 187,
        "centerY": 425,
        "enabled": true,
        "visible": true,
        "identifier": "loginButton"
      },
      {
        "label": "Email",
        "type": "TextField",
        "value": "",
        "frame": { "x": 50, "y": 300, "width": 275, "height": 44 },
        "centerX": 187,
        "centerY": 322,
        "enabled": true,
        "visible": true,
        "placeholder": "Enter your email"
      },
      {
        "label": "Welcome",
        "type": "StaticText",
        "frame": { "x": 50, "y": 200, "width": 275, "height": 30 },
        "centerX": 187,
        "centerY": 215,
        "visible": true
      }
    ],
    "screenBounds": {
      "width": 375,
      "height": 812
    }
  }
}
```

**Element Properties:**

| Property      | Type    | Description                            |
| ------------- | ------- | -------------------------------------- |
| `label`       | string  | Text label or accessibility label      |
| `type`        | string  | Element type (Button, TextField, etc.) |
| `value`       | string  | Current value (for inputs, switches)   |
| `frame`       | object  | Bounding box (x, y, width, height)     |
| `centerX`     | number  | Horizontal center (use for tapping)    |
| `centerY`     | number  | Vertical center (use for tapping)      |
| `enabled`     | boolean | Can be interacted with                 |
| `visible`     | boolean | Currently visible on screen            |
| `identifier`  | string  | Accessibility identifier               |
| `placeholder` | string  | Placeholder text (text fields)         |
| `traits`      | array   | Accessibility traits                   |

**Element Types:**

- **Button**: Tappable buttons
- **TextField**: Text input fields
- **SecureTextField**: Password fields
- **StaticText**: Non-interactive text labels
- **Image**: Image views
- **Cell**: Table or collection view cells
- **ScrollView**: Scrollable containers
- **NavigationBar**: Navigation bars
- **TabBar**: Tab bars
- **Switch**: Toggle switches
- **Slider**: Value sliders
- **ProgressView**: Progress indicators
- **ActivityIndicator**: Loading spinners
- **SearchField**: Search input fields
- **Link**: Tappable links
- **Other**: Custom or unknown elements

**Example: Login Screen Analysis**

```json
{
  "operation": "describe",
  "target": "booted"
}
```

**Response Analysis:**

```javascript
// Find all text fields
const textFields = elements.filter((e) => e.type === 'TextField');
// Find "Email" field
const emailField = elements.find((e) => e.label === 'Email');
// Find enabled buttons
const buttons = elements.filter((e) => e.type === 'Button' && e.enabled);
// Find Login button
const loginButton = elements.find((e) => e.label === 'Login');
// Tap coordinates
const tapX = loginButton.centerX; // 187
const tapY = loginButton.centerY; // 425
```

#### Describe: point

Get element at specific coordinates.

```json
{
  "operation": "describe",
  "target": "booted",
  "parameters": {
    "operation": "point",
    "x": 187,
    "y": 425
  }
}
```

**Returns:**

```json
{
  "success": true,
  "data": {
    "element": {
      "label": "Login",
      "type": "Button",
      "frame": { "x": 100, "y": 400, "width": 175, "height": 50 },
      "centerX": 187,
      "centerY": 425,
      "enabled": true,
      "visible": true
    }
  }
}
```

**Use cases:**

- Verifying element before tapping
- Inspecting specific screen regions
- Debugging tap target issues

**Performance Notes:**

- **Token cost**: ~50 tokens for `describe` vs ~170 for screenshot
- **Speed**: ~120ms vs ~2000ms for screenshot
- **Caching**: Accessibility tree can be cached if UI hasn't changed

**Common Patterns:**

```javascript
// Pattern: Find and tap
1. describe → all (get tree)
2. Parse elements, find target
3. tap → centerX, centerY

// Pattern: Verify state
1. describe → all
2. Check element properties (enabled, visible, value)
3. Proceed based on state

// Pattern: Scroll until found
1. describe → all
2. If element not found → gesture (swipe)
3. describe → all (check again)
4. Repeat until found
```

---

### Operation: find-element

Semantic search for UI elements by label, identifier, or text.

**When to use:**

- Quickly finding elements by name
- Searching for buttons, fields, labels
- When you know element text but not coordinates

**This operation searches the accessibility tree, so it's fast and efficient.**

```json
{
  "operation": "find-element",
  "target": "booted",
  "parameters": {
    "query": "Login"
  }
}
```

**Returns:**

```json
{
  "success": true,
  "data": {
    "elements": [
      {
        "label": "Login",
        "type": "Button",
        "frame": { "x": 100, "y": 400, "width": 175, "height": 50 },
        "centerX": 187,
        "centerY": 425,
        "enabled": true,
        "visible": true,
        "matchScore": 1.0
      }
    ]
  }
}
```

**Query Matching:**

- **Exact match**: "Login" finds "Login" button
- **Partial match**: "Log" finds "Login", "Logout"
- **Case-insensitive**: "login" finds "Login"
- **Identifiers**: Searches both labels and accessibility identifiers

**Example: Find and Tap Submit Button**

```json
// Step 1: Find button
{
  "operation": "find-element",
  "target": "booted",
  "parameters": {
    "query": "Submit"
  }
}

// Step 2: Tap button (using coordinates from response)
{
  "operation": "tap",
  "target": "booted",
  "parameters": {
    "x": 187,
    "y": 450
  }
}
```

**Example: Find Email Field**

```json
{
  "operation": "find-element",
  "target": "booted",
  "parameters": {
    "query": "Email"
  }
}
```

**Multiple Matches:**

If multiple elements match, they're returned in order of relevance:

```json
{
  "success": true,
  "data": {
    "elements": [
      {
        "label": "Login",
        "type": "Button",
        "matchScore": 1.0 // Exact match
      },
      {
        "label": "Login with Google",
        "type": "Button",
        "matchScore": 0.8 // Partial match
      }
    ]
  }
}
```

**No Matches:**

```json
{
  "success": true,
  "data": {
    "elements": []
  }
}
```

**Common Issues:**

- **Element not found**: Element may be off-screen (scroll first) or have different label
- **Multiple matches**: Use more specific query or filter by type/properties
- **Hidden elements**: Check `visible: true` in results

**Best Practices:**

- Use specific, unique labels ("Submit Form" vs "Submit")
- Verify element is visible and enabled before tapping
- Handle multiple matches gracefully
- Fallback to `describe → all` if search fails

---

### Operation: app

Manage app installation and lifecycle.

**When to use:**

- Installing apps for testing
- Launching apps before automation
- Cleaning up test apps
- Managing app state

**Sub-operations:**

1. **install**: Install .app bundle
2. **uninstall**: Remove installed app
3. **launch**: Start an app
4. **terminate**: Stop running app

#### App: install

Install an app bundle on the simulator.

```json
{
  "operation": "app",
  "target": "booted",
  "parameters": {
    "sub_operation": "install",
    "app_path": "/path/to/MyApp.app"
  }
}
```

**Parameters:**

- `app_path`: Path to .app bundle (required)

**Example: Install and Launch**

```json
// Step 1: Install
{
  "operation": "app",
  "target": "booted",
  "parameters": {
    "sub_operation": "install",
    "app_path": "/Users/dev/MyApp.app"
  }
}

// Step 2: Launch
{
  "operation": "app",
  "target": "booted",
  "parameters": {
    "sub_operation": "launch",
    "bundle_id": "com.company.myapp"
  }
}
```

#### App: launch

Launch an installed app.

```json
{
  "operation": "app",
  "target": "booted",
  "parameters": {
    "sub_operation": "launch",
    "bundle_id": "com.company.myapp",
    "arguments": ["--test-mode"], // Optional: launch arguments
    "environment": {
      // Optional: environment variables
      "API_ENDPOINT": "https://staging.api.example.com"
    }
  }
}
```

**Parameters:**

- `bundle_id`: App bundle identifier (required)
- `arguments`: Array of launch arguments (optional)
- `environment`: Environment variables (optional)

**Example: Launch with Test Configuration**

```json
{
  "operation": "app",
  "target": "booted",
  "parameters": {
    "sub_operation": "launch",
    "bundle_id": "com.company.myapp",
    "arguments": ["--skip-onboarding", "--test-data"],
    "environment": {
      "ENV": "test",
      "MOCK_API": "true"
    }
  }
}
```

#### App: terminate

Stop a running app.

```json
{
  "operation": "app",
  "target": "booted",
  "parameters": {
    "sub_operation": "terminate",
    "bundle_id": "com.company.myapp"
  }
}
```

**Use cases:**

- Reset app state between tests
- Stop app before uninstalling
- Force quit misbehaving app

#### App: uninstall

Remove an installed app.

```json
{
  "operation": "app",
  "target": "booted",
  "parameters": {
    "sub_operation": "uninstall",
    "bundle_id": "com.company.myapp"
  }
}
```

**Example: Clean Uninstall**

```json
// Step 1: Terminate if running
{
  "operation": "app",
  "target": "booted",
  "parameters": {
    "sub_operation": "terminate",
    "bundle_id": "com.company.myapp"
  }
}

// Step 2: Uninstall
{
  "operation": "app",
  "target": "booted",
  "parameters": {
    "sub_operation": "uninstall",
    "bundle_id": "com.company.myapp"
  }
}
```

---

### Operation: list-apps

List all installed apps on the simulator.

**When to use:**

- Finding app bundle IDs
- Checking if app is installed
- Verifying installation success
- Inspecting available apps

```json
{
  "operation": "list-apps",
  "target": "booted",
  "parameters": {
    "filter_type": "user" // Optional: system, user, internal, or omit for all
  }
}
```

**Filter Types:**

| Filter     | Description          | Use Case                       |
| ---------- | -------------------- | ------------------------------ |
| `user`     | User-installed apps  | Most common, your test apps    |
| `system`   | Built-in iOS apps    | Safari, Settings, Photos, etc. |
| `internal` | Internal system apps | Rarely needed                  |
| (omit)     | All apps             | Complete list                  |

**Returns:**

```json
{
  "success": true,
  "data": {
    "apps": [
      {
        "bundleId": "com.company.myapp",
        "name": "MyApp",
        "version": "1.0.0",
        "installType": "user",
        "dataContainer": "/path/to/data",
        "bundleContainer": "/path/to/bundle"
      },
      {
        "bundleId": "com.apple.mobilesafari",
        "name": "Safari",
        "installType": "system"
      }
    ]
  }
}
```

**Example: List User Apps Only**

```json
{
  "operation": "list-apps",
  "target": "booted",
  "parameters": {
    "filter_type": "user"
  }
}
```

**Example: Check if App Installed**

```json
// List apps
{
  "operation": "list-apps",
  "target": "booted",
  "parameters": {
    "filter_type": "user"
  }
}

// Parse response
const isInstalled = apps.some(app => app.bundleId === "com.company.myapp");
```

**Common Patterns:**

```javascript
// Pattern: Verify installation
1. install app
2. list-apps (filter: user)
3. Verify bundle ID in list

// Pattern: Get bundle ID
1. list-apps
2. Find app by name
3. Extract bundle ID for launch
```

---

### Operation: check-accessibility

Assess the quality of accessibility data for current screen.

**When to use:**

- Deciding between accessibility-first vs screenshot approach
- Debugging element finding issues
- Validating app accessibility support
- Quick quality check before automation

**This operation helps you decide whether to rely on accessibility tree or fallback to screenshots.**

```json
{
  "operation": "check-accessibility",
  "target": "booted"
}
```

**Returns:**

```json
{
  "success": true,
  "data": {
    "quality": "excellent",
    "recommendation": "Use accessibility-first approach",
    "stats": {
      "totalElements": 15,
      "labeledElements": 14,
      "interactiveElements": 5,
      "visibleElements": 12,
      "coverage": 0.93
    },
    "issues": []
  }
}
```

**Quality Scores:**

| Score            | Coverage | Recommendation                       |
| ---------------- | -------- | ------------------------------------ |
| **excellent**    | 90-100%  | Accessibility-first, fast automation |
| **good**         | 70-89%   | Accessibility-first, mostly reliable |
| **fair**         | 50-69%   | Mixed approach, some manual finding  |
| **poor**         | 30-49%   | Screenshot-heavy, limited automation |
| **insufficient** | 0-29%    | Screenshot fallback, manual testing  |

**Coverage Calculation:**

```
coverage = labeledElements / totalElements
```

**Common Issues Detected:**

```json
{
  "issues": [
    "3 interactive elements missing labels",
    "2 buttons missing accessibility identifiers",
    "1 text field has unclear label"
  ]
}
```

**Decision Logic:**

```javascript
if (quality === 'excellent' || quality === 'good') {
  // Use accessibility-first approach
  // 1. describe → all
  // 2. find-element
  // 3. tap
} else if (quality === 'fair') {
  // Mixed approach
  // Try accessibility first, fallback to screenshot
} else {
  // Screenshot-heavy approach
  // Use screenshots for element finding
}
```

**Example: Pre-Automation Check**

```json
// Step 1: Check quality
{
  "operation": "check-accessibility",
  "target": "booted"
}

// Step 2: Decide approach based on response
// If excellent/good → describe → find → tap
// If poor → screenshot → manual
```

**Performance:**

- **Time**: ~80ms (quick check)
- **Token cost**: ~50 tokens (5x cheaper than screenshot)

**Use in Testing:**

- Add quality checks to test suites
- Monitor accessibility regression
- Identify screens needing accessibility improvements

---

### Operation: targets

Query and manage IDB target connections.

**When to use:**

- Listing available devices/simulators
- Connecting to specific target
- Verifying IDB connection status
- Managing multiple targets

**Sub-operations:**

1. **list**: List all available IDB targets
2. **describe**: Get detailed target information
3. **focus**: Set active target
4. **connect**: Establish IDB connection
5. **disconnect**: Close IDB connection

#### Targets: list

List all available IDB targets (devices and simulators).

```json
{
  "operation": "targets",
  "parameters": {
    "sub_operation": "list",
    "type": "simulator", // Optional: simulator, device, or omit for all
    "state": "Booted" // Optional: Booted, Shutdown, or omit for all
  }
}
```

**Returns:**

```json
{
  "success": true,
  "data": {
    "targets": [
      {
        "udid": "A1B2C3D4-E5F6-7890-ABCD-EF1234567890",
        "name": "iPhone 15",
        "type": "simulator",
        "state": "Booted",
        "osVersion": "iOS 17.0",
        "architecture": "arm64"
      },
      {
        "udid": "B2C3D4E5-F6G7-8901-BCDE-FG2345678901",
        "name": "iPad Pro 11-inch",
        "type": "simulator",
        "state": "Shutdown",
        "osVersion": "iOS 17.0"
      }
    ]
  }
}
```

**Example: List Booted Simulators**

```json
{
  "operation": "targets",
  "parameters": {
    "sub_operation": "list",
    "type": "simulator",
    "state": "Booted"
  }
}
```

#### Targets: describe

Get detailed information about a specific target.

```json
{
  "operation": "targets",
  "parameters": {
    "sub_operation": "describe",
    "udid": "A1B2C3D4-E5F6-7890-ABCD-EF1234567890"
  }
}
```

**Returns:**

```json
{
  "success": true,
  "data": {
    "udid": "A1B2C3D4-E5F6-7890-ABCD-EF1234567890",
    "name": "iPhone 15",
    "type": "simulator",
    "state": "Booted",
    "osVersion": "iOS 17.0",
    "screenSize": { "width": 375, "height": 812 },
    "screenScale": 3.0,
    "architecture": "arm64",
    "connected": true
  }
}
```

#### Targets: focus

Set the active/default target for subsequent operations.

```json
{
  "operation": "targets",
  "parameters": {
    "sub_operation": "focus",
    "udid": "A1B2C3D4-E5F6-7890-ABCD-EF1234567890"
  }
}
```

**Use case:**

- Set default target once, then omit `target` parameter in other operations

#### Targets: connect

Establish IDB connection to a target.

```json
{
  "operation": "targets",
  "parameters": {
    "sub_operation": "connect",
    "udid": "A1B2C3D4-E5F6-7890-ABCD-EF1234567890"
  }
}
```

#### Targets: disconnect

Close IDB connection to a target.

```json
{
  "operation": "targets",
  "parameters": {
    "sub_operation": "disconnect",
    "udid": "A1B2C3D4-E5F6-7890-ABCD-EF1234567890"
  }
}
```

**Common Pattern:**

```json
// 1. List available targets
{
  "operation": "targets",
  "parameters": {
    "sub_operation": "list",
    "state": "Booted"
  }
}

// 2. Focus on specific target
{
  "operation": "targets",
  "parameters": {
    "sub_operation": "focus",
    "udid": "A1B2C3D4-..."
  }
}

// 3. Run automation (target parameter now optional)
{
  "operation": "describe"
}
```

---

## Accessibility Tree Structure

### Understanding Element Hierarchy

The accessibility tree is a flattened representation of the UI hierarchy. Elements are listed in depth-first order.

**Example Tree:**

```
NavigationBar "Settings"
  ├─ Button "Back"
  └─ StaticText "Settings"
ScrollView
  ├─ Cell "Profile"
  │   ├─ Image "Profile Icon"
  │   └─ StaticText "Profile"
  ├─ Cell "Notifications"
  │   ├─ Image "Bell Icon"
  │   ├─ StaticText "Notifications"
  │   └─ Switch (value: 1)
  └─ Cell "Privacy"
      ├─ Image "Lock Icon"
      └─ StaticText "Privacy"
```

### Element Identification Strategies

#### 1. By Label (Most Common)

```javascript
const element = elements.find((e) => e.label === 'Login');
```

#### 2. By Type and Label

```javascript
const button = elements.find((e) => e.type === 'Button' && e.label === 'Submit');
```

#### 3. By Identifier (Most Reliable)

```javascript
const element = elements.find((e) => e.identifier === 'loginButton');
```

#### 4. By Position

```javascript
// First button in list
const firstButton = elements.find((e) => e.type === 'Button');

// Button in specific region
const headerButton = elements.find((e) => e.type === 'Button' && e.centerY < 100);
```

#### 5. By Value (Inputs, Switches)

```javascript
// Text field with specific value
const field = elements.find((e) => e.type === 'TextField' && e.value === 'user@example.com');

// Enabled switch
const enabledSwitch = elements.find((e) => e.type === 'Switch' && e.value === '1');
```

### Coordinate Systems

**Screen Coordinates:**

- Origin: Top-left (0, 0)
- X: Increases rightward
- Y: Increases downward

**Element Frame:**

```javascript
{
  x: 50,        // Left edge
  y: 300,       // Top edge
  width: 275,   // Width
  height: 44    // Height
}
```

**Tap Coordinates:**

- Use `centerX` and `centerY` for accurate taps
- Calculated as: `x + (width / 2)` and `y + (height / 2)`

**Screen Bounds:**

```javascript
{
  width: 375,   // iPhone 15 width
  height: 812   // iPhone 15 height
}
```

### Traversal Patterns

#### Find All Buttons

```javascript
const buttons = elements.filter((e) => e.type === 'Button');
```

#### Find Interactive Elements

```javascript
const interactive = elements.filter(
  (e) =>
    e.enabled && e.visible && (e.type === 'Button' || e.type === 'TextField' || e.type === 'Cell')
);
```

#### Find Elements in Region

```javascript
// Top navigation area (y < 100)
const navElements = elements.filter((e) => e.centerY < 100);

// Bottom tab bar (y > 700)
const tabElements = elements.filter((e) => e.centerY > 700);

// Content area (100 < y < 700)
const contentElements = elements.filter((e) => e.centerY > 100 && e.centerY < 700);
```

#### Find by Text Content

```javascript
// Exact match
const exact = elements.find((e) => e.label === 'Login');

// Partial match
const partial = elements.filter((e) => e.label && e.label.includes('Login'));

// Case-insensitive
const caseInsensitive = elements.find((e) => e.label && e.label.toLowerCase() === 'login');
```

---

## Common Workflows

### Workflow: Login

```json
// 1. Query accessibility tree
{
  "operation": "describe",
  "target": "booted"
}

// 2. Find email field and tap
{
  "operation": "find-element",
  "target": "booted",
  "parameters": { "query": "Email" }
}

{
  "operation": "tap",
  "target": "booted",
  "parameters": { "x": 187, "y": 322 }
}

// 3. Type email
{
  "operation": "input",
  "target": "booted",
  "parameters": { "text": "user@example.com" }
}

// 4. Tab to password field
{
  "operation": "input",
  "target": "booted",
  "parameters": { "key": "tab" }
}

// 5. Type password
{
  "operation": "input",
  "target": "booted",
  "parameters": { "text": "password123" }
}

// 6. Submit
{
  "operation": "input",
  "target": "booted",
  "parameters": { "key": "return" }
}

// 7. Verify navigation
{
  "operation": "describe",
  "target": "booted"
}
```

### Workflow: Navigate and Select

```json
// 1. Find Settings button
{
  "operation": "find-element",
  "target": "booted",
  "parameters": { "query": "Settings" }
}

// 2. Tap Settings
{
  "operation": "tap",
  "target": "booted",
  "parameters": { "x": 187, "y": 450 }
}

// 3. Wait and verify
{
  "operation": "describe",
  "target": "booted"
}

// 4. Find and tap Notifications
{
  "operation": "find-element",
  "target": "booted",
  "parameters": { "query": "Notifications" }
}

{
  "operation": "tap",
  "target": "booted",
  "parameters": { "x": 187, "y": 300 }
}
```

### Workflow: Scroll and Find

```json
// 1. Check if element visible
{
  "operation": "describe",
  "target": "booted"
}

// 2. If not found, scroll down
{
  "operation": "gesture",
  "target": "booted",
  "parameters": {
    "gesture_type": "swipe",
    "direction": "up"
  }
}

// 3. Check again
{
  "operation": "describe",
  "target": "booted"
}

// 4. Repeat until found or max scrolls reached
// 5. Tap element when found
```

### Workflow: Form Filling

```json
// 1. Get all form fields
{
  "operation": "describe",
  "target": "booted"
}

// 2. Fill each field
// Name field
{
  "operation": "tap",
  "target": "booted",
  "parameters": { "x": 187, "y": 200 }
}
{
  "operation": "input",
  "target": "booted",
  "parameters": { "text": "John Doe" }
}

// Email field
{
  "operation": "input",
  "target": "booted",
  "parameters": { "key": "tab" }
}
{
  "operation": "input",
  "target": "booted",
  "parameters": { "text": "john@example.com" }
}

// Phone field
{
  "operation": "input",
  "target": "booted",
  "parameters": { "key": "tab" }
}
{
  "operation": "input",
  "target": "booted",
  "parameters": { "text": "555-1234" }
}

// Submit
{
  "operation": "find-element",
  "target": "booted",
  "parameters": { "query": "Submit" }
}
{
  "operation": "tap",
  "target": "booted",
  "parameters": { "x": 187, "y": 600 }
}
```

### Workflow: Table Cell Interaction

```json
// 1. Find cell
{
  "operation": "find-element",
  "target": "booted",
  "parameters": { "query": "Item 5" }
}

// 2. Swipe to reveal delete
{
  "operation": "gesture",
  "target": "booted",
  "parameters": {
    "gesture_type": "swipe",
    "direction": "left"
  }
}

// 3. Find and tap delete button
{
  "operation": "find-element",
  "target": "booted",
  "parameters": { "query": "Delete" }
}
{
  "operation": "tap",
  "target": "booted",
  "parameters": { "x": 300, "y": 400 }
}

// 4. Confirm deletion if needed
{
  "operation": "find-element",
  "target": "booted",
  "parameters": { "query": "Confirm" }
}
{
  "operation": "tap",
  "target": "booted",
  "parameters": { "x": 187, "y": 450 }
}
```

---

## Error Handling

### Common Errors and Solutions

#### Error: Element Not Found

**Symptoms:**

- `find-element` returns empty array
- `describe` doesn't show expected element

**Solutions:**

1. **Element off-screen**: Scroll and try again
2. **Wrong screen**: Verify navigation succeeded
3. **Different label**: Check actual label in `describe` output
4. **Hidden element**: Check `visible: false` in tree
5. **Not yet loaded**: Wait and query again

**Example:**

```json
// Try find
{
  "operation": "find-element",
  "target": "booted",
  "parameters": { "query": "Settings" }
}

// If not found, describe all to see available elements
{
  "operation": "describe",
  "target": "booted"
}

// Check actual labels and adjust query
```

#### Error: Tap Not Registering

**Symptoms:**

- Tap executes but nothing happens
- Element doesn't respond to interaction

**Solutions:**

1. **Element disabled**: Check `enabled: false` in tree
2. **Element not visible**: Check `visible: false`
3. **Wrong coordinates**: Use `centerX`, `centerY` from tree
4. **Element not ready**: Wait for animations to complete
5. **Overlapping element**: Check z-order, tap might hit wrong element

**Example:**

```json
// Verify element state before tapping
{
  "operation": "describe",
  "target": "booted",
  "parameters": {
    "operation": "point",
    "x": 187,
    "y": 425
  }
}

// Check response: enabled=true, visible=true
// Then tap
```

#### Error: Input Not Working

**Symptoms:**

- Text doesn't appear in field
- Keyboard input ignored

**Solutions:**

1. **Field not focused**: Tap field first
2. **Keyboard not visible**: Verify field type allows input
3. **Field disabled**: Check `enabled: false`
4. **Wrong field type**: Some fields only accept specific input (numeric, email)

**Example:**

```json
// 1. Tap field to focus
{
  "operation": "tap",
  "target": "booted",
  "parameters": { "x": 187, "y": 322 }
}

// 2. Wait briefly for keyboard

// 3. Input text
{
  "operation": "input",
  "target": "booted",
  "parameters": { "text": "user@example.com" }
}
```

#### Error: Accessibility Tree Empty

**Symptoms:**

- `describe` returns no elements or very few
- `check-accessibility` shows "insufficient" quality

**Solutions:**

1. **App has poor accessibility**: Fallback to screenshots
2. **Screen loading**: Wait and try again
3. **IDB connection issue**: Reconnect target
4. **App crashed**: Check app state, relaunch if needed

**Example:**

```json
// Check accessibility quality
{
  "operation": "check-accessibility",
  "target": "booted"
}

// If poor, use screenshots
// If good, verify app is running
{
  "operation": "list-apps",
  "target": "booted",
  "parameters": { "filter_type": "user" }
}
```

#### Error: Target Not Found

**Symptoms:**

- "No target found" error
- Operations fail with connection error

**Solutions:**

1. **Simulator not booted**: Boot simulator first
2. **Wrong UDID**: Use "booted" or verify UDID
3. **IDB not connected**: Run targets → connect
4. **Simulator crashed**: Restart simulator

**Example:**

```json
// List available targets
{
  "operation": "targets",
  "parameters": {
    "sub_operation": "list",
    "state": "Booted"
  }
}

// Connect to target
{
  "operation": "targets",
  "parameters": {
    "sub_operation": "connect",
    "udid": "A1B2C3D4-..."
  }
}
```

### Error Handling Pattern

```javascript
// Robust automation pattern
try {
  // 1. Verify target
  await targets.list({ state: 'Booted' });

  // 2. Check accessibility quality
  const quality = await checkAccessibility();

  if (quality === 'poor') {
    // Fallback to screenshot approach
  }

  // 3. Find element with retry
  let element;
  for (let i = 0; i < 3; i++) {
    const result = await findElement('Login');
    if (result.elements.length > 0) {
      element = result.elements[0];
      break;
    }
    // Scroll and retry
    await gesture({ gesture_type: 'swipe', direction: 'up' });
  }

  if (!element) {
    throw new Error('Element not found after scrolling');
  }

  // 4. Verify element state
  if (!element.enabled || !element.visible) {
    throw new Error('Element not interactable');
  }

  // 5. Tap with verified coordinates
  await tap({ x: element.centerX, y: element.centerY });

  // 6. Verify result
  const newTree = await describe();
  // Check for expected state change
} catch (error) {
  // Log error with context
  console.error('Automation failed:', error);
  // Take screenshot for debugging
  // Cleanup state
}
```

---

## Performance Tips

### 1. Minimize Round-Trips

**Bad:**

```json
// 3 separate calls
describe → find → tap
```

**Good:**

```json
// 1 call to get tree, parse locally, then tap
describe → [parse locally] → tap
```

### 2. Cache Accessibility Tree

If UI hasn't changed, reuse previous `describe` result:

```javascript
let cachedTree = null;

function getElement(label) {
  if (!cachedTree) {
    cachedTree = await describe();
  }
  return cachedTree.elements.find(e => e.label === label);
}

// Invalidate cache after interactions that change UI
function invalidateCache() {
  cachedTree = null;
}
```

### 3. Use find-element for Quick Searches

When you know the label, use `find-element` instead of `describe → parse`:

**Faster:**

```json
{
  "operation": "find-element",
  "target": "booted",
  "parameters": { "query": "Login" }
}
```

**Slower:**

```json
{
  "operation": "describe",
  "target": "booted"
}
// Then parse all elements locally
```

### 4. Batch Accessibility Checks

Check quality once per screen, not before every operation:

```javascript
// Good: Once per screen
const quality = await checkAccessibility();
if (quality === 'good') {
  // Use accessibility for all operations on this screen
}

// Bad: Before every operation
await checkAccessibility(); // Unnecessary overhead
await findElement('Button1');
await checkAccessibility(); // Don't do this
await findElement('Button2');
```

### 5. Use describe → point Sparingly

Only use `point` operation when debugging or verifying specific coordinates:

**Preferred:**

```json
describe → all  // Get full tree once
```

**Only when needed:**

```json
describe → point  // Verify specific element
```

### 6. Avoid Screenshot Fallback Unless Necessary

Screenshot operations are significantly slower:

- **describe**: ~120ms, ~50 tokens
- **screenshot**: ~2000ms, ~170 tokens

Only use screenshots when:

- Accessibility quality is "poor" or "insufficient"
- Visual verification required (colors, images, layout)
- Custom drawn UI without accessibility support

### 7. Optimize Scroll-and-Find

Limit scroll iterations and use efficient checking:

```javascript
const MAX_SCROLLS = 5;
let element = null;

for (let i = 0; i < MAX_SCROLLS; i++) {
  const tree = await describe();
  element = tree.elements.find((e) => e.label === 'Target');

  if (element) break;

  // Only scroll if not at bottom
  const lastElement = tree.elements[tree.elements.length - 1];
  if (lastElement.centerY > screenHeight - 100) {
    break; // At bottom, stop scrolling
  }

  await gesture({ gesture_type: 'swipe', direction: 'up' });
}
```

### 8. Reuse Target Connection

Focus on a target once, then omit `target` parameter:

```javascript
// Set once
await targets.focus({ udid: 'A1B2C3D4-...' });

// Then omit target in subsequent calls
await describe(); // Uses focused target
await findElement({ query: 'Login' });
await tap({ x: 187, y: 425 });
```

---

## Related Resources

### Skills

- **ui-automation-workflows**: Comprehensive UI automation patterns and workflows
- **accessibility-testing**: WCAG compliance and accessibility quality testing
- **ios-testing-patterns**: Test automation best practices and strategies
- **simulator-workflows**: Device and simulator management

### Resources

- **xc://reference/accessibility**: Detailed accessibility tree structure guide
- **xc://workflows/accessibility-first**: Accessibility-first automation pattern
- **xc://operations/simulator**: Simulator operations for device management
- **xc://operations/xcode**: Xcode build and test operations

---

## Summary

**Key Takeaways:**

1. **Accessibility-First**: Always use `describe` before screenshots (3-4x faster, 80% cheaper)
2. **Standard Workflow**: describe → find-element → tap (or describe → parse → tap)
3. **Quality Matters**: Use `check-accessibility` to assess strategy
4. **Efficient Search**: Use `find-element` for quick label-based searches
5. **Robust Automation**: Verify element state (enabled, visible) before interacting
6. **Error Handling**: Implement retries, scroll-and-find, and fallbacks
7. **Performance**: Cache trees, batch operations, minimize round-trips

**Token Cost Comparison:**

| Approach                   | Token Cost   | Speed |
| -------------------------- | ------------ | ----- |
| describe → find → tap      | ~100 tokens  | Fast  |
| screenshot → analyze → tap | ~500+ tokens | Slow  |

**Use `execute_idb_command` with ui-automation-workflows Skill for complete automation patterns.**
