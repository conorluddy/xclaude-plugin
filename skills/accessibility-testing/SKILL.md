---
name: accessibility-testing
description: WCAG compliance testing and accessibility quality assurance workflows for iOS apps. Use when validating accessibility labels, testing VoiceOver compatibility, checking contrast ratios, or ensuring WCAG 2.1 compliance. Covers accessibility tree analysis, semantic validation, and automated accessibility testing patterns.
version: 0.0.1
token_cost: ~40
---

# Accessibility Testing Skill

**WCAG compliance and accessibility quality assurance for iOS applications**

## Overview

This skill teaches accessibility-first testing strategies for iOS apps. Accessibility testing ensures apps are usable by everyone, including people with disabilities. It combines automated validation of accessibility metadata with manual verification of user experience patterns.

**Why accessibility testing matters:**
- **Legal compliance:** WCAG 2.1 is required in many jurisdictions
- **User reach:** 15% of population has some form of disability
- **Better UX:** Accessible apps are better for everyone
- **SEO benefits:** Better structure improves discoverability
- **Cost savings:** Fix issues early vs. retrofitting

## When to Use This Skill

**Use this skill when:**
1. Validating accessibility compliance before release
2. Debugging VoiceOver issues or user reports
3. Implementing new features that need accessibility support
4. Running accessibility audits as part of CI/CD
5. Testing Dynamic Type support and contrast ratios
6. Verifying semantic markup and element roles
7. Checking keyboard navigation and focus management

**This skill covers:**
- Accessibility tree analysis and interpretation
- WCAG 2.1 compliance checking (A, AA, AAA levels)
- VoiceOver testing patterns
- Dynamic Type validation
- Common accessibility violations and fixes

## Quick Reference

| Task | Tool/Operation | Typical Time |
|------|---------------|--------------|
| Check accessibility quality | `accessibility-quality-check` | ~80ms |
| Query full accessibility tree | `idb-ui-describe` | ~120ms |
| Find element by label | `idb-ui-find-element` | ~100ms |
| Screenshot (fallback only) | `screenshot` | ~2000ms |
| VoiceOver simulation | Manual testing | - |

## Core Principle: Accessibility Tree First

**The accessibility tree IS your primary testing interface.**

Unlike visual testing (screenshots), the accessibility tree reveals:
- What screen readers "see"
- Semantic structure and relationships
- Focus order and navigation paths
- Element roles and states
- Text alternatives for non-text content

**3-4x faster and more reliable than visual inspection.**

## Key Concepts

### WCAG 2.1 Levels

**Level A (Minimum):**
- Text alternatives for images
- Keyboard accessibility
- No color-only information
- Headings and labels present

**Level AA (Recommended):**
- Contrast ratio 4.5:1 for normal text
- Contrast ratio 3:1 for large text
- Resize text up to 200%
- Meaningful focus order
- Descriptive labels and instructions

**Level AAA (Enhanced):**
- Contrast ratio 7:1 for normal text
- Contrast ratio 4.5:1 for large text
- No timing requirements
- Comprehensive error handling

**Target Level AA for most apps.**

### iOS Accessibility Properties

**Essential Properties:**

1. **accessibilityLabel:** What element is
   - Example: "Profile photo", "Send message button"
   - Should be concise, descriptive

2. **accessibilityValue:** Current state/value
   - Example: "50%", "Selected", "3 of 10"

3. **accessibilityHint:** What happens when activated
   - Example: "Opens your profile settings"
   - Use sparingly, only when action isn't obvious

4. **accessibilityTraits:** Element behavior
   - Button, Link, Header, Selected, etc.

5. **isAccessibilityElement:** Should be exposed
   - `true` for interactive/informative elements
   - `false` for decorative elements

### Accessibility Tree vs Visual UI

**Accessibility tree is semantic, not visual:**

```
Visual UI:
┌─────────────────┐
│ [img] John Doe  │  ← Visual: Image + Text
│ Online          │
└─────────────────┘

Accessibility Tree:
• Button: "John Doe, Online, Profile"  ← Single focusable element
  - label: "John Doe"
  - value: "Online"
  - hint: "Opens profile"
  - traits: [Button]
```

**Good accessibility = logical semantic structure.**

## Standard Workflow

### 1. Initial Accessibility Quality Check

**Start here to assess app's accessibility implementation:**

```json
{
  "operation": "check-accessibility",
  "target": "booted"
}
```

**Interprets accessibility tree quality:**
- **"excellent":** 90%+ elements have labels, good semantic structure
- **"good":** 70-90% coverage, minor issues
- **"fair":** 50-70% coverage, needs improvement
- **"poor":** <50% coverage, serious accessibility problems
- **"insufficient":** Cannot perform accessibility-based testing

**Decision tree:**
```
excellent/good → Proceed with accessibility-first testing
fair           → Test but expect to find issues
poor           → Major remediation needed
insufficient   → App may not support assistive tech
```

**Note:** Most modern iOS apps score "good" or "excellent".

### 2. Query Accessibility Tree

**Core operation for all accessibility testing:**

```json
{
  "operation": "describe",
  "target": "booted",
  "parameters": {
    "operation": "all"
  }
}
```

**Returns complete accessibility tree:**
```json
{
  "elements": [
    {
      "label": "Login",
      "type": "Button",
      "frame": { "x": 100, "y": 400, "width": 175, "height": 50 },
      "enabled": true,
      "visible": true,
      "traits": ["Button"],
      "value": null,
      "hint": "Sign in to your account"
    },
    {
      "label": "Email address",
      "type": "TextField",
      "value": "",
      "frame": { "x": 50, "y": 300, "width": 275, "height": 44 },
      "enabled": true,
      "visible": true,
      "traits": ["TextField"]
    }
  ]
}
```

**Analyze for:**
- All interactive elements have labels
- Labels are descriptive and concise
- Proper element types/traits
- Logical reading order (top-to-bottom, left-to-right)
- No duplicate or confusing labels

### 3. Validate Specific Elements

**Find and verify accessibility of specific UI elements:**

```json
{
  "operation": "find-element",
  "target": "booted",
  "parameters": {
    "query": "Submit button"
  }
}
```

**Validates:**
- Element exists in accessibility tree
- Has appropriate label
- Correct type and traits
- Enabled/visible state correct

### 4. Test Navigation and Focus

**Verify logical focus order:**

1. Query accessibility tree
2. Check elements appear in logical order
3. No gaps in navigation
4. Focus lands on meaningful elements first

**Focus order issues:**
```
Bad:  [Button: Cancel] → [Image: Decorative] → [Button: Submit] → [TextField]
Good: [TextField] → [Button: Submit] → [Button: Cancel]
```

## WCAG Compliance Workflows

### Testing Checklist

#### 1. Text Alternatives (WCAG 1.1)

**All non-text content needs text alternative:**

```
Query accessibility tree for all images
For each image:
  ✓ Has accessibilityLabel
  ✓ Label describes image content
  ✓ Or marked as decorative (isAccessibilityElement: false)
```

**Common violations:**
- Images with no label
- Generic labels: "image", "icon", "photo"
- Labels don't describe content: "png_12345"

**Fix:**
```swift
// Bad
imageView.isAccessibilityElement = true // No label

// Good
imageView.isAccessibilityElement = true
imageView.accessibilityLabel = "Profile photo of John Doe"

// Decorative (best if truly decorative)
imageView.isAccessibilityElement = false
```

#### 2. Keyboard/Focus Navigation (WCAG 2.1)

**All functionality available via sequential navigation:**

```
Query accessibility tree
Verify elements appear in logical order:
  ✓ Top to bottom
  ✓ Left to right
  ✓ Grouped logically
  ✓ Interactive elements are focusable
  ✓ Decorative elements are not focusable
```

**Test pattern:**
```
1. describe → Get all elements
2. Map order: element[0], element[1], element[2]...
3. Verify order matches visual/logical flow
4. Check no important elements missing
```

#### 3. Contrast Ratios (WCAG 1.4.3)

**Minimum contrast requirements:**
- **Normal text (<18pt):** 4.5:1 ratio (AA), 7:1 ratio (AAA)
- **Large text (≥18pt or ≥14pt bold):** 3:1 ratio (AA), 4.5:1 (AAA)
- **UI components:** 3:1 ratio (AA)

**Testing approach:**
```
1. screenshot → Capture current screen
2. Use color picker to sample text/background
3. Calculate contrast ratio: (L1 + 0.05) / (L2 + 0.05)
4. Verify meets WCAG AA (4.5:1 or 3:1)
```

**Common violations:**
- Gray text on white: 2.5:1 (fails)
- Light blue on white: 2.8:1 (fails)
- Dark gray on white: 4.6:1 (passes AA)

**Note:** Screenshots are appropriate for contrast testing (color-based).

#### 4. Labels and Instructions (WCAG 3.3.2)

**All inputs have clear labels:**

```
Query accessibility tree
For each TextField/input element:
  ✓ Has accessibilityLabel
  ✓ Label describes purpose
  ✓ Label visible or programmatically associated
  ✓ Required fields indicated
  ✓ Format instructions provided if needed
```

**Good labels:**
```json
{
  "type": "TextField",
  "label": "Email address",
  "hint": "Enter your email to sign in",
  "value": ""
}
```

**Bad labels:**
```json
{
  "type": "TextField",
  "label": "TextField",  // Generic
  "value": ""
}
```

#### 5. Dynamic Type Support (iOS-specific)

**Text scales from 100% to 200%:**

**Test pattern:**
```
1. Set Dynamic Type to smallest size
2. Launch app, screenshot, verify readable
3. Set Dynamic Type to largest size
4. Launch app, screenshot, verify:
   ✓ Text scales appropriately
   ✓ No text truncation
   ✓ Layout adapts
   ✓ Buttons still tappable
```

**Settings locations:**
- Settings → Accessibility → Display & Text Size → Larger Text
- Simulator: Accessibility Inspector → Settings

## VoiceOver Testing Patterns

### Simulating VoiceOver Experience

**VoiceOver announces elements in accessibility tree order:**

```
1. describe → Get accessibility tree
2. For each element (in order):
   - Announces: [label] [value] [traits] [hint]
   - Example: "Submit button, button, Sign in to your account"
3. Verify announcements are:
   ✓ Clear and descriptive
   ✓ Not redundant
   ✓ Appropriate detail level
```

**Announcement structure:**
```
"[label], [type], [value], [hint]"

Examples:
"Profile photo, image, image of John Doe"
"Volume, slider, 50%, adjustable"
"Send, button, button, Sends your message"
```

### Common VoiceOver Issues

**1. Verbose Announcements**

```
Bad:  "Submit button, button, Click here to submit the form"
Good: "Submit, button"
```

**Fix:** Remove redundant "button" from label, concise hint.

**2. Missing Context**

```
Bad:  "Edit, button" (which item?)
Good: "Edit profile photo, button"
```

**Fix:** Include context in label.

**3. Confusing Order**

```
Visual:     [Title]  [Close button]
            [Content]
VoiceOver:  Close button → Content → Title  ❌
```

**Fix:** Adjust accessibility container order or element grouping.

**4. No Label**

```
Element visible, but:
- isAccessibilityElement: false (should be true)
- Or no accessibilityLabel
```

**Fix:** Set both properties appropriately.

## Common Accessibility Violations

### Issue: Image Without Label

**Detection:**
```
Query accessibility tree
Find elements with type: "Image"
Check if label is missing or generic
```

**Symptoms:**
- VoiceOver says "image" or nothing
- Screen reader users can't identify image

**Fix:**
```swift
imageView.isAccessibilityElement = true
imageView.accessibilityLabel = "Descriptive text"
// Or if decorative:
imageView.isAccessibilityElement = false
```

### Issue: Buttons Without Labels

**Detection:**
```
Query accessibility tree
Find elements with traits: ["Button"]
Check if label is missing or just "button"
```

**Symptoms:**
- VoiceOver says "button" with no context
- Users don't know what button does

**Fix:**
```swift
button.accessibilityLabel = "Send message"
// Avoid: button.accessibilityLabel = "Send message button" // Redundant
```

### Issue: Low Contrast Text

**Detection:**
```
Screenshot → Sample colors
Calculate contrast ratio
Compare to WCAG standards
```

**Symptoms:**
- Hard to read in bright light
- Fails WCAG AA (4.5:1)

**Fix:**
```swift
// Increase contrast
label.textColor = .label // System adapts to dark mode
// Or explicit colors with sufficient contrast
label.textColor = UIColor(white: 0.2, alpha: 1.0) // Dark gray on white
```

### Issue: Complex Gestures Required

**Detection:**
```
Check if functionality requires:
- Multi-finger gestures
- Precise timing
- Specific swipe patterns
```

**Symptoms:**
- Motor-impaired users can't activate
- VoiceOver users can't navigate

**Fix:**
```swift
// Provide alternative single-tap interaction
// Or use standard UIControl components
// Avoid custom gesture-only interfaces
```

### Issue: Non-Descriptive Link Text

**Detection:**
```
Query accessibility tree
Find elements with traits: ["Link"]
Check if label is generic: "click here", "read more"
```

**Symptoms:**
- Screen reader users don't know destination
- Can't scan links effectively

**Fix:**
```swift
// Bad
link.accessibilityLabel = "Click here"

// Good
link.accessibilityLabel = "Read our privacy policy"
```

## Advanced Testing Patterns

### Pattern: Form Validation

**Test accessibility of error states:**

```
1. describe → Get form elements
2. Submit invalid form
3. describe → Check error state
4. Verify:
   ✓ Error messages have labels
   ✓ Associated with relevant field
   ✓ Clear instructions for fixing
   ✓ Focus moves to first error
```

**Good error accessibility:**
```json
{
  "type": "TextField",
  "label": "Email address",
  "value": "invalid",
  "traits": ["TextField"],
  "hint": "Invalid email format. Example: user@example.com"
}
```

### Pattern: Dynamic Content

**Test when content updates:**

```
1. describe → Get initial state
2. Trigger update (load more, filter, etc.)
3. describe → Get new state
4. Verify:
   ✓ New content has labels
   ✓ Loading states announced
   ✓ Focus managed appropriately
   ✓ No duplicate announcements
```

**Use accessibility notifications:**
```swift
// Announce completion
UIAccessibility.post(notification: .announcement,
                     argument: "10 new messages loaded")

// Or move focus to new content
UIAccessibility.post(notification: .layoutChanged,
                     argument: firstNewElement)
```

### Pattern: Modal/Dialog Testing

**Test focus management:**

```
1. describe → Get main screen elements
2. Open modal
3. describe → Get modal elements
4. Verify:
   ✓ Focus trapped in modal
   ✓ Background content not accessible
   ✓ Close button clearly labeled
   ✓ Modal has accessible title
5. Close modal
6. describe → Verify focus returns appropriately
```

### Pattern: Pagination/Lists

**Test large scrollable content:**

```
For each page/section:
1. describe → Get visible elements
2. Verify logical reading order
3. Check:
   ✓ Item count announced ("Item 1 of 10")
   ✓ Headings mark sections
   ✓ Load more/pagination clear
```

**Good pagination labels:**
```swift
cell.accessibilityLabel = "Message from John, Item 5 of 42"
loadMoreButton.accessibilityLabel = "Load 20 more messages"
```

## Automated Testing Integration

### CI/CD Accessibility Checks

**Basic audit in test pipeline:**

```
1. Launch app to key screen
2. accessibility-quality-check → Get score
3. Assert score >= "good"
4. describe → Capture accessibility tree
5. Validate:
   - All buttons have labels
   - No images without labels (excluding decorative)
   - No duplicate labels in same context
   - Logical element order
```

**Fail build if:**
- Score is "poor" or "insufficient"
- Critical elements missing labels
- New violations introduced (regression)

### Regression Testing

**Track accessibility over time:**

```
1. Capture baseline accessibility tree (JSON)
2. On each commit:
   - Capture current tree
   - Compare to baseline
   - Flag new missing labels
   - Flag changed reading order
3. Review and approve changes or fix regressions
```

## Troubleshooting

### Problem: Element Not in Accessibility Tree

**Symptoms:**
- Element visible but `describe` doesn't show it
- VoiceOver skips element

**Solutions:**
1. Check `isAccessibilityElement = true`
2. Verify not hidden: `isHidden = false`
3. Check not covered by another element
4. Ensure frame is not CGRect.zero
5. Verify `accessibilityElementsHidden = false` on parents

### Problem: Wrong Reading Order

**Symptoms:**
- Elements announced in illogical order
- Navigation jumps around screen

**Solutions:**
1. Check view hierarchy (Z-order affects reading order)
2. Use `accessibilityElements` array to set explicit order:
   ```swift
   containerView.accessibilityElements = [label, field, button]
   ```
3. Group related elements in accessibility containers

### Problem: Insufficient Context

**Symptoms:**
- Labels too generic: "button", "image", "item"
- Users can't identify purpose

**Solutions:**
1. Add specific context to label
2. Include state information in value
3. Use hint for non-obvious actions
4. Consider combining multiple elements:
   ```swift
   containerView.isAccessibilityElement = true
   containerView.accessibilityLabel = "Email from John Doe, unread"
   ```

## Best Practices

### 1. Accessibility-First Development

**Design with accessibility from the start:**
- Use standard UIKit components (built-in support)
- Plan semantic structure before visual design
- Consider screen reader experience in wireframes
- Test with VoiceOver during development

### 2. Semantic HTML/Structure

**iOS equivalent:**
- Use appropriate UITraits (Button, Header, Link, etc.)
- Group related content in accessibility containers
- Use heading traits to mark sections
- Adjust traits to match element behavior

### 3. Test with Real Users

**Automated testing catches technical issues, but:**
- Real screen reader users find UX problems
- Motor-impaired users reveal interaction issues
- Test with VoiceOver on actual device
- Observe usage patterns, not just compliance

### 4. Document Accessibility Decisions

```swift
// Intentionally not accessible - purely decorative
backgroundImage.isAccessibilityElement = false

// Combined for better experience - announces as single element
cardView.isAccessibilityElement = true
cardView.accessibilityLabel = "\(title), \(date), \(author)"
titleLabel.isAccessibilityElement = false
dateLabel.isAccessibilityElement = false
authorLabel.isAccessibilityElement = false
```

### 5. Maintain Accessibility Tree Quality

**Set standards and enforce:**
- Minimum quality score: "good"
- All interactive elements have labels
- All images have labels or marked decorative
- Contrast ratios meet AA standards
- Forms have clear labels and error handling

**Measure in CI/CD:**
```
Run: accessibility-quality-check
Assert: score >= "good"
Run: describe → Parse accessibility tree
Assert: All buttons have labels
Assert: No generic labels ("button", "image")
```

## Integration with MCP Tools

This Skill works with these MCP tools:

- **accessibility-quality-check:** Quick assessment (~80ms)
- **idb-ui-describe:** Full accessibility tree (~120ms)
- **idb-ui-find-element:** Semantic element search (~100ms)
- **screenshot:** Visual inspection (contrast, layout) (~2000ms)

**Workflow integration:**
```
1. accessibility-quality-check → Assess app quality
2. idb-ui-describe → Get detailed tree
3. Analyze semantic structure
4. screenshot → Verify contrast/visual (if needed)
```

## Related Skills

- **ui-automation-workflows:** Accessibility-first UI automation
- **ios-testing-patterns:** Test strategy and CI integration
- **simulator-workflows:** Device management for testing

## Related Resources

- `xc://reference/accessibility`: Accessibility API reference
- `xc://reference/wcag`: WCAG 2.1 guidelines mapped to iOS
- `xc://workflows/accessibility-first`: This workflow pattern
- `xc://examples/voiceover-testing`: VoiceOver test examples

---

**Remember: Accessibility tree is ground truth. Build accessible from the start. Test with real users.**
