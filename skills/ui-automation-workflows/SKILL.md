---
name: ui-automation-workflows
description: Accessibility-first UI automation using IDB. Query accessibility tree (fast, 50 tokens) before screenshots (slow, 170 tokens). Use when automating simulator interactions, tapping UI elements, finding buttons, or testing user flows. Covers idb-ui-describe, idb-ui-tap, idb-ui-find-element patterns.
---

# UI Automation Workflows

**Accessibility-first UI automation for iOS simulators**

## Core Principle: Accessibility Before Screenshots

**Always query the accessibility tree first.** Only use screenshots as a fallback.

### Why Accessibility-First?

| Approach | Time | Tokens | Reliability |
|----------|------|--------|-------------|
| Accessibility tree | ~120ms | ~50 | Survives theme changes |
| Screenshot | ~2000ms | ~170 | Breaks on visual changes |

**Result: 3-4x faster, 80% cheaper, more reliable**

## Standard Workflow

### 1. Check Accessibility Quality (Optional)

Before starting automation, check if the app has good accessibility support:

```json
{
  "operation": "check-accessibility",
  "target": "booted"
}
```

**Interprets:**
- **"excellent"** or **"good"**: Proceed with accessibility-first workflow
- **"poor"** or **"insufficient"**: May need to rely more on screenshots

**Note:** Most modern iOS apps have good accessibility support. Skip this check if you're confident.

### 2. Query Accessibility Tree

**This is your starting point for all UI automation:**

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
  "elements": [
    {
      "label": "Login",
      "type": "Button",
      "frame": { "x": 100, "y": 400, "width": 175, "height": 50 },
      "centerX": 187,
      "centerY": 425,
      "enabled": true,
      "visible": true
    },
    {
      "label": "Email",
      "type": "TextField",
      "value": "",
      "frame": { "x": 50, "y": 300, "width": 275, "height": 44 },
      "centerX": 187,
      "centerY": 322
    }
  ]
}
```

**Use `centerX` and `centerY` for tap coordinates.**

### 3. Find Your Element

**Option A: Search by Label/Text (Preferred)**

```json
{
  "operation": "find-element",
  "target": "booted",
  "parameters": {
    "query": "Login"
  }
}
```

**Option B: Manual Search**

From the accessibility tree response, find the element you want by:
- `label`: Button text, field labels
- `type`: Button, TextField, Cell, etc.
- `value`: Current input value
- `visible`: Only interact with visible elements

### 4. Interact with Element

**Tap:**

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

**Input Text:**

```json
{
  "operation": "input",
  "target": "booted",
  "parameters": {
    "text": "user@example.com"
  }
}
```

**Keyboard Actions:**

```json
{
  "operation": "input",
  "target": "booted",
  "parameters": {
    "key": "return"
  }
}
```

Available keys: `return`, `home`, `delete`, `space`, `escape`, `tab`, `up`, `down`, `left`, `right`

### 5. Verify State

After interaction, query accessibility tree again to verify:

```json
{
  "operation": "describe",
  "target": "booted"
}
```

## Common Patterns

### Pattern: Login Flow

```
1. describe → Find "Email" text field
2. tap → Focus email field
3. input → Type email
4. describe → Find "Password" text field
5. tap → Focus password field
6. input → Type password
7. describe → Find "Login" button
8. tap → Submit form
9. describe → Verify next screen
```

### Pattern: Navigate and Tap

```
1. describe → Get all buttons
2. find-element → Search for specific button
3. tap → Execute tap
4. describe → Verify navigation
```

### Pattern: Fill Form

```
1. describe → Get all text fields
2. For each field:
   - tap → Focus field
   - input → Enter text
   - input key:return → Next field
3. describe → Find submit button
4. tap → Submit
```

### Pattern: Scroll and Find

```
1. describe → Check if element visible
2. If not visible:
   - gesture (swipe up) → Scroll
   - describe → Check again
3. find-element → Locate target
4. tap → Interact
```

## Gestures

### Swipe

```json
{
  "operation": "gesture",
  "target": "booted",
  "parameters": {
    "gesture_type": "swipe",
    "direction": "up",
    "duration": 200
  }
}
```

Directions: `up`, `down`, `left`, `right`

### Button Presses

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

Buttons: `HOME`, `LOCK`, `SIRI`, `SIDE_BUTTON`, `APPLE_PAY`, `SCREENSHOT`, `APP_SWITCH`

## When to Use Screenshots (Fallback Only)

**Only use screenshots if:**

1. **Accessibility quality is "poor"**
   ```json
   { "operation": "check-accessibility", "target": "booted" }
   ```

2. **Visual verification needed**
   - Checking UI layout
   - Verifying colors/images
   - Debug visual issues

3. **Element not in accessibility tree**
   - Custom drawn UI
   - Canvas/game elements
   - Some third-party components

**For everything else, use accessibility tree.**

## Troubleshooting

### Element Not Found

**Problem:** find-element returns no results

**Solutions:**
1. Query full tree with `describe` to see all elements
2. Check if element is in a scroll view (may be off-screen)
3. Verify app state (correct screen?)
4. Check if element has accessibility label

### Tap Not Working

**Problem:** Tap executes but nothing happens

**Solutions:**
1. Verify element is `enabled: true`
2. Check element is `visible: true`
3. Confirm coordinates are correct (use `centerX`, `centerY`)
4. Element might need double-tap or long-press

### Input Not Working

**Problem:** Text input not appearing

**Solutions:**
1. Tap text field first to focus
2. Wait for keyboard to appear
3. Check field is not disabled
4. Use keyboard-specific keys (`return`, `delete`)

## Advanced: Coordinate Transformation

If using screenshots with `idb-ui-tap`, coordinates may need scaling:

```json
{
  "operation": "tap",
  "target": "booted",
  "parameters": {
    "x": 187,
    "y": 425,
    "applyScreenshotScale": true,
    "screenshotScaleX": 0.5,
    "screenshotScaleY": 0.5
  }
}
```

**But with accessibility-first, this is rarely needed.**

## Performance Tips

1. **Batch Operations**: Group describe queries to minimize round-trips
2. **Cache Tree**: Reuse accessibility tree if UI hasn't changed
3. **Target Specific Areas**: Use `describe` with point coordinates for specific regions
4. **Avoid Unnecessary Waits**: Accessibility tree reflects real-time state

## Integration with MCP Tools

This Skill works with `execute_idb_command` tool:

- All operations use the `execute_idb_command` tool
- Tool handles IDB connection and execution
- Tool returns structured accessibility data
- This Skill teaches WHEN and HOW to use operations

## Related Skills

- **accessibility-testing**: WCAG compliance and quality assessment
- **ios-testing-patterns**: Test automation strategies
- **simulator-workflows**: Device and app management

## Related Resources

- `xc://operations/idb`: Complete IDB operations reference
- `xc://reference/accessibility`: Accessibility tree structure guide
- `xc://workflows/accessibility-first`: This workflow pattern

---

**Remember: Accessibility tree first, screenshots last. 3-4x faster, 80% cheaper.**
