# Accessibility Tree Reference

## Overview

The accessibility tree is the structured representation of UI elements that iOS provides through the accessibility framework. Rather than analyzing visual pixels, the accessibility tree gives you semantic information about what elements exist, their properties, and their relationships—making it much faster and more reliable than visual analysis.

### What is the Accessibility Tree?

The accessibility tree is a hierarchical representation of all interactive and informative UI elements on screen. Each element has accessibility properties that describe its purpose, state, and interaction model. This is the same system used by VoiceOver and other assistive technologies on iOS.

### Why It's Faster Than Visual Analysis

- **Structured Data**: You get semantic information directly (is it a button? a text field?) rather than needing to infer from appearance
- **Sub-pixel Accuracy**: Coordinate data is precise, no need for image analysis
- **State Information**: Properties like `isEnabled`, `isSelected`, `value` are directly available
- **Instant Results**: No ML models or image processing—just data extraction
- **Reliable**: Not affected by visual styling, themes, or rendering quirks

### When to Use It

**Use the Accessibility Tree when:**

- You need to find, verify, or interact with specific UI elements
- You need element properties (labels, values, state)
- You need tap coordinates for reliable interaction
- Speed is critical for test execution
- You need to navigate hierarchical structures (tables, lists)

**Use Screenshots when:**

- You need to verify visual layout or appearance
- You need to check image content or visual state
- The UI lacks proper accessibility labels
- You need to debug why elements aren't interactive

---

## Accessibility Element Structure

Every element in the accessibility tree has these core properties:

```json
{
  "id": "unique-element-id",
  "label": "Sign In",
  "value": null,
  "type": "Button",
  "frame": {
    "x": 147,
    "y": 452,
    "width": 80,
    "height": 44
  },
  "centerX": 187,
  "centerY": 474,
  "isEnabled": true,
  "isVisible": true,
  "traits": ["button"],
  "identifier": "signInButton",
  "children": []
}
```

### Property Reference

| Property       | Type            | Description                                            |
| -------------- | --------------- | ------------------------------------------------------ |
| `id`           | string          | Unique identifier for this element                     |
| `label`        | string \| null  | Accessibility label (what VoiceOver reads)             |
| `value`        | string \| null  | Current value (for text fields, sliders, etc.)         |
| `type`         | string          | Element type (Button, TextField, etc.)                 |
| `frame.x`      | number          | X position in screen coordinates                       |
| `frame.y`      | number          | Y position in screen coordinates                       |
| `frame.width`  | number          | Element width in points                                |
| `frame.height` | number          | Element height in points                               |
| `centerX`      | number          | X coordinate of tap target (center of frame)           |
| `centerY`      | number          | Y coordinate of tap target (center of frame)           |
| `isEnabled`    | boolean         | Can this element be interacted with?                   |
| `isVisible`    | boolean         | Is this element visible on screen?                     |
| `traits`       | string[]        | Accessibility traits (button, image, staticText, etc.) |
| `identifier`   | string \| null  | Programmatic identifier (testID equivalent)            |
| `children`     | Element[]       | Child elements in the hierarchy                        |
| `parent`       | Element \| null | Parent element (in hierarchical queries)               |

---

## Element Types

### Button

Tappable interactive element that performs an action.

**Properties:**

- `label`: Text displayed on button or accessibility label
- `type`: "Button"
- `traits`: ["button"]
- `isEnabled`: Whether button can be tapped
- `value`: Optional (usually null)

**How to interact:**
Tap at `centerX, centerY` coordinates

**Example:**

```json
{
  "id": "elem-123",
  "label": "Sign In",
  "type": "Button",
  "frame": {
    "x": 147,
    "y": 452,
    "width": 80,
    "height": 44
  },
  "centerX": 187,
  "centerY": 474,
  "isEnabled": true,
  "isVisible": true,
  "traits": ["button"]
}
```

### TextField

Input field for text entry.

**Properties:**

- `label`: Placeholder or label text
- `type`: "TextField"
- `traits`: ["textField"] or ["textField", "searchField"]
- `value`: Current text content
- `isEnabled`: Whether text can be entered

**How to interact:**

1. Tap at center coordinates to focus
2. Use input operation to type text
3. Clear with key deletion or selectAll + type

**Example:**

```json
{
  "id": "elem-456",
  "label": "Email Address",
  "type": "TextField",
  "frame": {
    "x": 16,
    "y": 120,
    "width": 343,
    "height": 44
  },
  "centerX": 187.5,
  "centerY": 142,
  "isEnabled": true,
  "isVisible": true,
  "traits": ["textField"],
  "value": "user@example.com"
}
```

### StaticText

Non-interactive text element (labels, headings, descriptions).

**Properties:**

- `label`: The text content
- `type`: "StaticText"
- `traits`: ["staticText"] or ["staticText", "header"]
- `value`: Usually null
- `isEnabled`: Usually true (not applicable)

**How to interact:**
Cannot be interacted with—used for reading/verification only

**Example:**

```json
{
  "id": "elem-789",
  "label": "Enter your email address below",
  "type": "StaticText",
  "frame": {
    "x": 16,
    "y": 80,
    "width": 300,
    "height": 20
  },
  "centerX": 166,
  "centerY": 90,
  "isEnabled": true,
  "isVisible": true,
  "traits": ["staticText"]
}
```

### Image

Visual element (icon, photo, illustration).

**Properties:**

- `label`: Accessibility description of image
- `type`: "Image"
- `traits`: ["image"]
- `value`: Usually null
- `isEnabled`: Depends on whether image is tappable

**How to interact:**
Tap at center if enabled; otherwise image is for visual verification only

**Example:**

```json
{
  "id": "elem-img-001",
  "label": "App logo",
  "type": "Image",
  "frame": {
    "x": 100,
    "y": 50,
    "width": 174,
    "height": 174
  },
  "centerX": 187,
  "centerY": 137,
  "isEnabled": false,
  "isVisible": true,
  "traits": ["image"]
}
```

### Cell (Table/Collection View Cell)

Container element in a scrollable list or table.

**Properties:**

- `label`: Primary cell content or title
- `type`: "Cell"
- `traits`: ["button"] (cells are usually tappable)
- `value`: Optional secondary content
- `children`: Content elements within cell

**How to interact:**
Tap at center to select/navigate; swipe for additional actions

**Example:**

```json
{
  "id": "elem-cell-001",
  "label": "John Doe",
  "type": "Cell",
  "frame": {
    "x": 0,
    "y": 180,
    "width": 375,
    "height": 60
  },
  "centerX": 187.5,
  "centerY": 210,
  "isEnabled": true,
  "isVisible": true,
  "traits": ["button"],
  "children": [
    {
      "id": "elem-cell-001-label",
      "label": "john@example.com",
      "type": "StaticText",
      "traits": ["staticText"]
    }
  ]
}
```

### Table

Container for rows of data.

**Properties:**

- `label`: Table name/identifier
- `type`: "Table"
- `traits`: ["table"]
- `children`: Array of cells

**How to interact:**
Access cells through children array; scroll using swipe operations

**Example:**

```json
{
  "id": "elem-table-001",
  "label": "Contacts",
  "type": "Table",
  "frame": {
    "x": 0,
    "y": 100,
    "width": 375,
    "height": 600
  },
  "centerX": 187.5,
  "centerY": 400,
  "isEnabled": true,
  "isVisible": true,
  "traits": ["table"],
  "children": [
    { "id": "elem-cell-001", "label": "John Doe", ... },
    { "id": "elem-cell-002", "label": "Jane Smith", ... }
  ]
}
```

### NavigationBar

Top bar containing navigation controls and title.

**Properties:**

- `label`: Current screen title
- `type`: "NavigationBar"
- `traits`: ["navigationBar"]
- `children`: Back button, title, additional controls

**How to interact:**
Tap back button or specific controls within the bar

**Example:**

```json
{
  "id": "elem-nav-001",
  "label": "Settings",
  "type": "NavigationBar",
  "frame": {
    "x": 0,
    "y": 0,
    "width": 375,
    "height": 44
  },
  "centerX": 187.5,
  "centerY": 22,
  "isEnabled": true,
  "isVisible": true,
  "traits": ["navigationBar"],
  "children": [
    {
      "id": "elem-back-btn",
      "label": "Back",
      "type": "Button",
      "traits": ["button"]
    }
  ]
}
```

### TabBar

Bottom navigation with multiple tabs.

**Properties:**

- `label`: "Tab Bar" or similar
- `type": "TabBar"
- `traits`: ["tabBar"]
- `children`: Individual tab buttons

**How to interact:**
Tap on specific tab button to switch tabs

**Example:**

```json
{
  "id": "elem-tabbar-001",
  "label": "Tab Bar",
  "type": "TabBar",
  "frame": {
    "x": 0,
    "y": 812,
    "width": 375,
    "height": 49
  },
  "centerX": 187.5,
  "centerY": 836.5,
  "isEnabled": true,
  "isVisible": true,
  "traits": ["tabBar"],
  "children": [
    {
      "id": "elem-tab-home",
      "label": "Home",
      "type": "Button",
      "traits": ["button", "selected"]
    },
    {
      "id": "elem-tab-search",
      "label": "Search",
      "type": "Button",
      "traits": ["button"]
    }
  ]
}
```

### Alert

Modal dialog for user interaction (confirmation, input, selection).

**Properties:**

- `label`: Alert title
- `type`: "Alert"
- `traits`: ["alert"]
- `children`: Alert buttons and fields
- `value`: Optional message text

**How to interact:**
Interact with buttons or input fields within the alert

**Example:**

```json
{
  "id": "elem-alert-001",
  "label": "Confirm Action",
  "type": "Alert",
  "frame": {
    "x": 52,
    "y": 290,
    "width": 271,
    "height": 191
  },
  "centerX": 187.5,
  "centerY": 385.5,
  "isEnabled": true,
  "isVisible": true,
  "traits": ["alert"],
  "value": "Are you sure you want to delete?",
  "children": [
    {
      "id": "elem-alert-cancel",
      "label": "Cancel",
      "type": "Button",
      "traits": ["button"]
    },
    {
      "id": "elem-alert-delete",
      "label": "Delete",
      "type": "Button",
      "traits": ["button"]
    }
  ]
}
```

### ScrollView

Container that scrolls when content exceeds bounds.

**Properties:**

- `label`: Optional identifier
- `type": "ScrollView"
- `traits`: ["scrollView"]
- `children`: Content elements
- `value`: Optional scroll position info

**How to interact:**
Swipe to scroll; interact with contained elements normally

**Example:**

```json
{
  "id": "elem-scroll-001",
  "label": "Main Content",
  "type": "ScrollView",
  "frame": {
    "x": 0,
    "y": 44,
    "width": 375,
    "height": 768
  },
  "centerX": 187.5,
  "centerY": 428,
  "isEnabled": true,
  "isVisible": true,
  "traits": ["scrollView"],
  "children": [
    /* content elements */
  ]
}
```

### Switch

Toggle control for on/off state.

**Properties:**

- `label`: Description of what switch controls
- `type": "Switch"
- `traits": ["switch", "adjustable"]
- `value": "1" (on) or "0" (off)
- `isEnabled`: Whether switch can be toggled

**How to interact:**
Tap to toggle; or use scroll gesture (drag right to turn on, left to turn off)

**Example:**

```json
{
  "id": "elem-switch-001",
  "label": "Dark Mode",
  "type": "Switch",
  "frame": {
    "x": 315,
    "y": 112,
    "width": 51,
    "height": 31
  },
  "centerX": 340.5,
  "centerY": 127.5,
  "isEnabled": true,
  "isVisible": true,
  "traits": ["switch", "adjustable"],
  "value": "1"
}
```

### Slider

Adjustable control for selecting a value within a range.

**Properties:**

- `label`: Description of slider purpose
- `type`: "Slider"
- `traits`: ["adjustable", "slider"]
- `value`: Current value
- `frame`: Hit area (usually larger than visual slider)

**How to interact:**
Swipe right to increase value, left to decrease; or tap at desired position

**Example:**

```json
{
  "id": "elem-slider-001",
  "label": "Volume",
  "type": "Slider",
  "frame": {
    "x": 16,
    "y": 200,
    "width": 343,
    "height": 44
  },
  "centerX": 187.5,
  "centerY": 222,
  "isEnabled": true,
  "isVisible": true,
  "traits": ["adjustable", "slider"],
  "value": "65"
}
```

---

## Accessibility Traits

Traits are semantic markers that describe what an element is and how it behaves. An element can have multiple traits.

### Common Traits

| Trait           | Meaning                  | Example                   |
| --------------- | ------------------------ | ------------------------- |
| `button`        | Tappable action element  | Sign In button            |
| `link`          | Navigational element     | "Learn more" in text      |
| `header`        | Section heading          | "Settings" title          |
| `searchField`   | Text input for search    | Search bar                |
| `image`         | Visual element           | Icon, photo, illustration |
| `selected`      | Currently selected state | Active tab                |
| `keyboardKey`   | On-screen keyboard key   | Key in keyboard view      |
| `staticText`    | Non-interactive text     | Label, description        |
| `adjustable`    | Value can be adjusted    | Slider, switch            |
| `textField`     | Text input element       | Email input               |
| `table`         | Data table               | List of items             |
| `tabBar`        | Tab navigation           | Bottom tabs               |
| `navigationBar` | Navigation controls      | Top bar with back button  |
| `alert`         | Dialog/modal             | Confirmation dialog       |
| `scrollView`    | Scrollable container     | Long content list         |
| `menu`          | Menu of options          | Context menu, dropdown    |
| `none`          | No specific trait        | Generic container         |

---

## Querying the Tree

The accessibility tree can be queried using three main operations:

### 1. Describe Entire Tree (operation: "all")

Returns the complete accessibility tree from the root element downward.

**Use when:**

- You need to explore the full UI structure
- You're debugging accessibility issues
- You need to find elements without knowing their exact path

**Command:**

```bash
idb-ui-describe --operation all
```

**Response:**

```json
{
  "operation": "all",
  "elements": [
    {
      "id": "root",
      "type": "Window",
      "children": [
        {
          "id": "elem-nav",
          "label": "Home",
          "type": "NavigationBar"
        },
        {
          "id": "elem-scroll",
          "label": "Main Content",
          "type": "ScrollView",
          "children": [
            /* nested elements */
          ]
        }
      ]
    }
  ]
}
```

### 2. Query at Point (operation: "point", x, y)

Returns elements at specific screen coordinates.

**Use when:**

- You need to identify what element is at a specific location
- You want to verify element positioning
- You're debugging tap target locations

**Command:**

```bash
idb-ui-describe --operation point --x 187 --y 474
```

**Response:**

```json
{
  "operation": "point",
  "x": 187,
  "y": 474,
  "elements": [
    {
      "id": "elem-sign-in",
      "label": "Sign In",
      "type": "Button",
      "centerX": 187,
      "centerY": 474
    }
  ]
}
```

### 3. Semantic Search (find-element, query)

Searches accessibility labels and properties for matching elements.

**Use when:**

- You know what element you're looking for by name
- You want to find elements without scanning the entire tree
- You need to locate elements by accessibility label or identifier

**Command:**

```bash
idb-ui-find-element --query "Sign In"
```

**Response:**

```json
{
  "matches": [
    {
      "id": "elem-sign-in",
      "label": "Sign In",
      "type": "Button",
      "centerX": 187,
      "centerY": 474
    }
  ],
  "count": 1
}
```

---

## Best Practices for Tree Queries

### 1. Start with Describe All

When you first load a screen, always get the full tree:

```bash
idb-ui-describe --operation all
```

This gives you:

- Complete structure and hierarchy
- All element properties for reference
- Coordinate data for any element
- Understanding of parent-child relationships

### 2. Use Find-Element for Specific Lookups

Once you know the element you want:

```bash
idb-ui-find-element --query "Settings"
```

Faster than parsing the full tree, especially on complex screens.

### 3. Query at Point for Coordinate Verification

To verify what element is at specific coordinates:

```bash
idb-ui-describe --operation point --x 100 --y 200
```

Useful for:

- Validating tap targets
- Debugging layout issues
- Confirming element positioning

### 4. Cache Tree for Multiple Operations

If you need to find multiple elements on the same screen, cache the initial tree:

```bash
# First query
full_tree = idb-ui-describe --operation all

# Then extract multiple elements from full_tree without additional queries
element_1 = find_in_tree(full_tree, "Button1")
element_2 = find_in_tree(full_tree, "Button2")
element_3 = find_in_tree(full_tree, "TextField1")
```

### 5. Verify Visibility Before Interaction

Always check `isVisible` and `isEnabled` before attempting to interact:

```json
if (element.isVisible && element.isEnabled) {
  // Safe to interact
  tap(element.centerX, element.centerY)
} else {
  // Element may be hidden or disabled
  // Try scrolling into view or enable element first
}
```

---

## Coordinate Systems

### Screen Coordinates

All coordinates in the accessibility tree are in **screen coordinates** (absolute position on the device screen).

```
(0, 0) ─────────────────────────► x
│
│
│        Element
│        ┌─────────┐
│        │ (100,50)│ ← frame.x, frame.y
│        │         │
│        └─────────┘
│
▼
y
```

### Frame Property

The `frame` object describes the element's rectangular bounds:

```json
{
  "frame": {
    "x": 100, // Distance from left edge
    "y": 50, // Distance from top edge
    "width": 200, // Horizontal extent
    "height": 44 // Vertical extent
  }
}
```

### Calculating Tap Coordinates

The accessibility tree provides pre-calculated center coordinates:

```
Tap X = frame.x + (frame.width / 2)
Tap Y = frame.y + (frame.height / 2)

// Or use centerX and centerY directly:
centerX = 100 + (200 / 2) = 200
centerY = 50 + (44 / 2) = 72
```

**Always use the provided `centerX` and `centerY` values—they're optimized tap targets.**

### Frame Overlap and Hierarchy

Child elements' coordinates are still in screen space, not relative to parent:

```json
{
  "id": "parent",
  "frame": { "x": 0, "y": 100, "width": 375, "height": 300 },
  "children": [
    {
      "id": "child",
      "frame": { "x": 50, "y": 120, "width": 100, "height": 50 }
      // Note: y: 120 is still screen coordinate, not relative to parent (y: 100)
    }
  ]
}
```

---

## Common Patterns

### Finding Buttons by Label

**Scenario:** You need to find and tap a button with specific text.

**Approach:**

```
1. Use find-element with button label:
   find-element --query "Sign In"

2. Verify result:
   - Check type is "Button"
   - Check traits include "button"
   - Check isEnabled is true
   - Check isVisible is true

3. Tap at centerX, centerY coordinates
```

**Example:**

```json
// Query result
{
  "id": "elem-123",
  "label": "Sign In",
  "type": "Button",
  "centerX": 187,
  "centerY": 474,
  "isEnabled": true,
  "isVisible": true,
  "traits": ["button"]
}

// Tap action
idb-ui-tap --x 187 --y 474
```

### Finding and Populating Text Fields

**Scenario:** You need to enter text in an input field.

**Approach:**

```
1. Find the text field:
   find-element --query "Email"

2. Verify it's a text field:
   - Check type is "TextField"
   - Check traits include "textField"
   - Check isEnabled is true

3. Tap to focus:
   idb-ui-tap --x <centerX> --y <centerY>

4. Clear existing text (if any):
   idb-ui-input --operation key --key delete

5. Type new text:
   idb-ui-input --operation text --text "user@example.com"
```

**Example:**

```json
// Found element
{
  "id": "elem-email",
  "label": "Email Address",
  "type": "TextField",
  "traits": ["textField"],
  "value": "old@example.com",
  "centerX": 187,
  "centerY": 142
}

// Interaction sequence
1. tap(187, 142)
2. input(operation: "key", key: "delete")  // or selectAll
3. input(operation: "text", text: "new@example.com")
```

### Navigating Table Views

**Scenario:** You need to find a specific cell in a scrollable table and tap it.

**Approach:**

```
1. Get full tree to see table structure:
   describe-tree --operation all

2. Find the table:
   Look for element with type "Table" and trait "table"

3. Examine children (cells):
   Each cell is an element with label and coordinates

4. Find target cell:
   - Scan cell labels for match
   - If not visible, calculate scroll position
   - Scroll to bring cell into view

5. Tap the cell:
   Use cell's centerX and centerY
```

**Example:**

```json
// Table structure
{
  "id": "table-1",
  "type": "Table",
  "label": "Contacts",
  "children": [
    {
      "id": "cell-1",
      "label": "Alice",
      "type": "Cell",
      "centerX": 187,
      "centerY": 100,
      "isVisible": true
    },
    {
      "id": "cell-2",
      "label": "Bob",
      "type": "Cell",
      "centerX": 187,
      "centerY": 160,
      "isVisible": true
    },
    {
      "id": "cell-3",
      "label": "Charlie",
      "type": "Cell",
      "centerX": 187,
      "centerY": 220,
      "isVisible": false  // Off-screen, need to scroll
    }
  ]
}

// Interaction
1. Scroll down: gesture(operation: "swipe", startX: 187, startY: 200, endX: 187, endY: 100)
2. Query again to verify cell-3 is now visible
3. Tap: idb-ui-tap --x 187 --y 220
```

### Handling Alerts and Modals

**Scenario:** An alert dialog has appeared, and you need to tap a button.

**Approach:**

```
1. Query tree to find the alert:
   describe-tree --operation all
   OR find-element --query "alert text"

2. Verify it's an alert:
   - Check type is "Alert"
   - Check trait includes "alert"

3. Find the button you want:
   - Scan alert's children for button with target label
   - Verify button is enabled and visible

4. Tap the button:
   Use button's centerX and centerY
```

**Example:**

```json
// Alert structure
{
  "id": "alert-1",
  "label": "Confirm Delete",
  "type": "Alert",
  "value": "This action cannot be undone.",
  "children": [
    {
      "id": "btn-cancel",
      "label": "Cancel",
      "type": "Button",
      "centerX": 100,
      "centerY": 300
    },
    {
      "id": "btn-delete",
      "label": "Delete",
      "type": "Button",
      "centerX": 274,
      "centerY": 300
    }
  ]
}

// Interaction
idb-ui-tap --x 274 --y 300  // Tap Delete button
```

---

## Element Finding Decision Tree

Use this decision tree to determine the best approach for finding an element:

```
Do you know the element's label or text?
├─ YES → Use find-element
│        └─ Faster, semantic search
│           find-element --query "Sign In"
│
└─ NO → Do you know its approximate location on screen?
         ├─ YES → Query at point
         │        └─ Identify what's at coordinates
         │           describe-tree --operation point --x 187 --y 474
         │
         └─ NO → Get full tree
                  └─ Explore structure and find element
                     describe-tree --operation all
                     └─ Parse JSON for element by type, label, or hierarchy
```

---

## Troubleshooting

### Problem: Element Not Found

**Symptoms:**

- `find-element` returns empty results
- Element appears on screen but can't be found

**Diagnosis:**

1. **Verify element exists:**

   ```bash
   describe-tree --operation all
   ```

   Search the JSON for the element. If not present, accessibility issue with app.

2. **Check spelling:**
   Accessibility labels are case-sensitive. "Sign In" ≠ "sign in"

3. **Verify visibility:**
   Check `isVisible: true` in the element. Hidden elements exist in tree but can't be interacted with.

4. **Check element state:**
   Element might be disabled (`isEnabled: false`) or off-screen.

**Solution:**

```bash
# Try broader search
find-element --query "Sign"  # Partial match

# Or use tree to understand structure
describe-tree --operation all | grep -i "sign"
```

### Problem: Incorrect Coordinates

**Symptoms:**

- Tap doesn't hit the element you expect
- Tapping empty space or wrong element

**Diagnosis:**

1. **Verify coordinates in tree:**

   ```bash
   describe-tree --operation point --x 187 --y 474
   ```

   Check that the returned element matches what you expect.

2. **Check frame size:**
   Is the element large enough? Very small elements can be hard to tap.

   ```json
   {
     "frame": { "width": 5, "height": 5 } // Too small!
   }
   ```

3. **Verify centerX/centerY calculation:**
   ```
   Manual check:
   centerX = 100 + (200 / 2) = 200 ✓
   centerY = 50 + (44 / 2) = 72 ✓
   ```

**Solution:**

```bash
# Use the provided centerX and centerY from tree—they're pre-calculated
# Don't manually calculate coordinates

# Verify your tap targets before executing
describe-tree --operation point --x <centerX> --y <centerY>
# Should return the element you want to tap
```

### Problem: Element Missing Accessibility Label

**Symptoms:**

- Element exists but has `label: null`
- Can't find element by name
- VoiceOver reads "button" or "image" with no description

**Diagnosis:**

This is an app accessibility issue. The element doesn't have an accessibility label set.

**Workaround Options:**

1. **Find by position/frame:**

   ```bash
   describe-tree --operation all
   # Find element by type, frame position, or parent-child relationship
   ```

2. **Find by identifier:**
   If the app uses testIDs (SwiftUI `accessibilityIdentifier`):

   ```bash
   find-element --query "testID-value"
   ```

3. **Find by other properties:**
   Scan for elements near your target:

   ```bash
   describe-tree --operation point --x 187 --y 474
   # Find elements nearby and tap the right one
   ```

4. **Escalate to developers:**
   Unlabeled elements are a bug. The app should have accessibility labels for all interactive elements.

### Problem: Elements Appearing and Disappearing

**Symptoms:**

- Element is visible one moment, gone the next
- `isVisible` changes between queries
- Animations cause elements to appear off-screen

**Diagnosis:**

1. **Check timing:**
   Elements may not be ready when queried.

2. **Verify animations:**
   Wait for animations to complete before querying.

3. **Check visibility:**
   Elements might be occluded by other views.

**Solution:**

```bash
# Wait for element to be visible
1. Query tree
2. If element not visible, wait
3. Query again
4. Repeat until element appears

# Use polling pattern
for attempt in 1..5:
  tree = describe-tree --operation all
  if element.isVisible:
    tap(element)
    break
  wait(500ms)
```

---

## Quick Reference

### Fastest Way to Find and Tap a Button

```bash
# 1 query + 1 action
find-element --query "Sign In"           # Returns centerX, centerY
idb-ui-tap --x <centerX> --y <centerY>  # Tap it
```

### Fastest Way to Enter Text

```bash
# 1 find + 1 tap + 1 input
find-element --query "Email"
idb-ui-tap --x <centerX> --y <centerY>
idb-ui-input --operation text --text "user@example.com"
```

### Fastest Way to Navigate Complex UI

```bash
# 1 full tree read + multiple extractions
tree = describe-tree --operation all

# Extract all needed info from single tree
button = find_in_tree(tree, "Next")
field = find_in_tree(tree, "Username")
spinner = find_in_tree(tree, "Loading")

# All coordinates ready, execute actions
```

### Fastest Way to Debug Layout

```bash
# Verify what's at coordinates
describe-tree --operation point --x 187 --y 474
# Should return the element you expect to tap
```

---

## Related Resources

- **UI Automation Workflows Skill:** Combines accessibility tree queries with interaction patterns for complex test scenarios
- **Complete Element Interactions Guide:** Detailed documentation on tapping, swiping, typing, and more
- **XCTest Accessibility Integration:** Using XCUIElement properties and matching in automated tests
- **iOS Accessibility Framework:** Official Apple documentation on accessibility properties and traits
