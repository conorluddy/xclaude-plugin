# Device Specifications Reference

## Overview

Comprehensive technical specifications for iOS devices and simulators. This reference covers physical device characteristics, simulator capabilities, and screen specifications essential for testing and development.

### Physical Devices vs Simulators

**Physical Devices** provide the most accurate testing environment:

- Real hardware performance characteristics
- Actual sensor capabilities (accelerometer, gyroscope, compass)
- True cellular and network behavior
- Genuine camera and microphone input
- Face ID / Touch ID authentication
- Real power consumption patterns

**Simulators** offer convenience for rapid development:

- Fast build and deploy cycles
- Headless and remote execution support
- Multiple concurrent instances
- Screen recording and screenshot capabilities
- Push notification simulation
- Easy access to system logs

### Why Specifications Matter

Device specifications are critical for:

- **UI Testing**: Ensuring layouts adapt to screen sizes, orientations, and safe areas
- **Performance Baseline**: Understanding typical device capabilities and limitations
- **Feature Detection**: Knowing which devices support specific capabilities
- **Version Coverage**: Testing across supported iOS versions
- **Regression Prevention**: Identifying device-specific rendering or behavior issues

---

## iPhone Specifications

### iPhone 16 Pro Max

| Property               | Value                                          |
| ---------------------- | ---------------------------------------------- |
| Screen Size            | 6.9 inches (diagonal)                          |
| Native Resolution      | 2796 × 1290 pixels (landscape)                 |
| Points (Logical)       | 932 × 430 points (@3x)                         |
| Scale Factor           | @3x                                            |
| Safe Area (Landscape)  | Top: 0pt, Bottom: 0pt, Left: 59pt, Right: 59pt |
| Status Bar Height      | 0pt (integrated in notch)                      |
| Notch Height           | 30pt                                           |
| Device Identifier      | `iPhone17,1`                                   |
| Starting iOS           | 18.0                                           |
| Supported iOS Versions | 18.0+                                          |

### iPhone 16 Pro

| Property               | Value                                          |
| ---------------------- | ---------------------------------------------- |
| Screen Size            | 6.3 inches (diagonal)                          |
| Native Resolution      | 2556 × 1179 pixels (landscape)                 |
| Points (Logical)       | 852 × 393 points (@3x)                         |
| Scale Factor           | @3x                                            |
| Safe Area (Landscape)  | Top: 0pt, Bottom: 0pt, Left: 47pt, Right: 47pt |
| Status Bar Height      | 0pt (integrated in notch)                      |
| Notch Height           | 30pt                                           |
| Device Identifier      | `iPhone17,0`                                   |
| Starting iOS           | 18.0                                           |
| Supported iOS Versions | 18.0+                                          |

### iPhone 16 Plus

| Property               | Value                                          |
| ---------------------- | ---------------------------------------------- |
| Screen Size            | 6.7 inches (diagonal)                          |
| Native Resolution      | 2796 × 1290 pixels (landscape)                 |
| Points (Logical)       | 932 × 430 points (@3x)                         |
| Scale Factor           | @3x                                            |
| Safe Area (Landscape)  | Top: 0pt, Bottom: 0pt, Left: 59pt, Right: 59pt |
| Status Bar Height      | 0pt (integrated in notch)                      |
| Dynamic Island Height  | 32pt                                           |
| Device Identifier      | `iPhone17,3`                                   |
| Starting iOS           | 18.0                                           |
| Supported iOS Versions | 18.0+                                          |

### iPhone 16

| Property               | Value                                          |
| ---------------------- | ---------------------------------------------- |
| Screen Size            | 6.1 inches (diagonal)                          |
| Native Resolution      | 2556 × 1179 pixels (landscape)                 |
| Points (Logical)       | 852 × 393 points (@3x)                         |
| Scale Factor           | @3x                                            |
| Safe Area (Landscape)  | Top: 0pt, Bottom: 0pt, Left: 47pt, Right: 47pt |
| Status Bar Height      | 0pt (integrated in notch)                      |
| Dynamic Island Height  | 32pt                                           |
| Device Identifier      | `iPhone17,2`                                   |
| Starting iOS           | 18.0                                           |
| Supported iOS Versions | 18.0+                                          |

### iPhone 15 Pro Max

| Property               | Value                                          |
| ---------------------- | ---------------------------------------------- |
| Screen Size            | 6.7 inches (diagonal)                          |
| Native Resolution      | 2796 × 1290 pixels (landscape)                 |
| Points (Logical)       | 932 × 430 points (@3x)                         |
| Scale Factor           | @3x                                            |
| Safe Area (Landscape)  | Top: 0pt, Bottom: 0pt, Left: 59pt, Right: 59pt |
| Status Bar Height      | 0pt (integrated in notch)                      |
| Notch Height           | 30pt                                           |
| Device Identifier      | `iPhone16,2`                                   |
| Starting iOS           | 17.0                                           |
| Supported iOS Versions | 17.0+                                          |

### iPhone 15 Pro

| Property               | Value                                          |
| ---------------------- | ---------------------------------------------- |
| Screen Size            | 6.1 inches (diagonal)                          |
| Native Resolution      | 2556 × 1179 pixels (landscape)                 |
| Points (Logical)       | 852 × 393 points (@3x)                         |
| Scale Factor           | @3x                                            |
| Safe Area (Landscape)  | Top: 0pt, Bottom: 0pt, Left: 47pt, Right: 47pt |
| Status Bar Height      | 0pt (integrated in notch)                      |
| Notch Height           | 30pt                                           |
| Device Identifier      | `iPhone16,1`                                   |
| Starting iOS           | 17.0                                           |
| Supported iOS Versions | 17.0+                                          |

### iPhone 15 Plus

| Property               | Value                                          |
| ---------------------- | ---------------------------------------------- |
| Screen Size            | 6.7 inches (diagonal)                          |
| Native Resolution      | 2796 × 1290 pixels (landscape)                 |
| Points (Logical)       | 932 × 430 points (@3x)                         |
| Scale Factor           | @3x                                            |
| Safe Area (Landscape)  | Top: 0pt, Bottom: 0pt, Left: 59pt, Right: 59pt |
| Status Bar Height      | 0pt (integrated in notch)                      |
| Dynamic Island Height  | 32pt                                           |
| Device Identifier      | `iPhone16,0`                                   |
| Starting iOS           | 17.0                                           |
| Supported iOS Versions | 17.0+                                          |

### iPhone 15

| Property               | Value                                          |
| ---------------------- | ---------------------------------------------- |
| Screen Size            | 6.1 inches (diagonal)                          |
| Native Resolution      | 2556 × 1179 pixels (landscape)                 |
| Points (Logical)       | 852 × 393 points (@3x)                         |
| Scale Factor           | @3x                                            |
| Safe Area (Landscape)  | Top: 0pt, Bottom: 0pt, Left: 47pt, Right: 47pt |
| Status Bar Height      | 0pt (integrated in notch)                      |
| Dynamic Island Height  | 32pt                                           |
| Device Identifier      | `iPhone15,2`                                   |
| Starting iOS           | 17.0                                           |
| Supported iOS Versions | 17.0+                                          |

### iPhone 14 Pro Max

| Property               | Value                                          |
| ---------------------- | ---------------------------------------------- |
| Screen Size            | 6.7 inches (diagonal)                          |
| Native Resolution      | 2796 × 1290 pixels (landscape)                 |
| Points (Logical)       | 932 × 430 points (@3x)                         |
| Scale Factor           | @3x                                            |
| Safe Area (Landscape)  | Top: 0pt, Bottom: 0pt, Left: 59pt, Right: 59pt |
| Status Bar Height      | 0pt (integrated in notch)                      |
| Notch Height           | 30pt                                           |
| Device Identifier      | `iPhone15,1`                                   |
| Starting iOS           | 16.0                                           |
| Supported iOS Versions | 16.0 - 17.x                                    |

### iPhone 14 Pro

| Property               | Value                                          |
| ---------------------- | ---------------------------------------------- |
| Screen Size            | 6.1 inches (diagonal)                          |
| Native Resolution      | 2556 × 1179 pixels (landscape)                 |
| Points (Logical)       | 852 × 393 points (@3x)                         |
| Scale Factor           | @3x                                            |
| Safe Area (Landscape)  | Top: 0pt, Bottom: 0pt, Left: 47pt, Right: 47pt |
| Status Bar Height      | 0pt (integrated in notch)                      |
| Notch Height           | 30pt                                           |
| Device Identifier      | `iPhone15,0`                                   |
| Starting iOS           | 16.0                                           |
| Supported iOS Versions | 16.0 - 17.x                                    |

### iPhone 14 Plus

| Property               | Value                                          |
| ---------------------- | ---------------------------------------------- |
| Screen Size            | 6.7 inches (diagonal)                          |
| Native Resolution      | 2796 × 1290 pixels (landscape)                 |
| Points (Logical)       | 932 × 430 points (@3x)                         |
| Scale Factor           | @3x                                            |
| Safe Area (Landscape)  | Top: 0pt, Bottom: 0pt, Left: 59pt, Right: 59pt |
| Status Bar Height      | 47pt                                           |
| Home Indicator Height  | 34pt                                           |
| Device Identifier      | `iPhone14,8`                                   |
| Starting iOS           | 16.0                                           |
| Supported iOS Versions | 16.0 - 17.x                                    |

### iPhone 14

| Property               | Value                                          |
| ---------------------- | ---------------------------------------------- |
| Screen Size            | 6.1 inches (diagonal)                          |
| Native Resolution      | 2532 × 1170 pixels (landscape)                 |
| Points (Logical)       | 844 × 390 points (@3x)                         |
| Scale Factor           | @3x                                            |
| Safe Area (Landscape)  | Top: 0pt, Bottom: 0pt, Left: 47pt, Right: 47pt |
| Status Bar Height      | 47pt                                           |
| Home Indicator Height  | 34pt                                           |
| Device Identifier      | `iPhone14,7`                                   |
| Starting iOS           | 16.0                                           |
| Supported iOS Versions | 16.0 - 17.x                                    |

### iPhone 13 Pro Max

| Property               | Value                                          |
| ---------------------- | ---------------------------------------------- |
| Screen Size            | 6.7 inches (diagonal)                          |
| Native Resolution      | 2778 × 1284 pixels (landscape)                 |
| Points (Logical)       | 926 × 428 points (@3x)                         |
| Scale Factor           | @3x                                            |
| Safe Area (Landscape)  | Top: 0pt, Bottom: 0pt, Left: 47pt, Right: 47pt |
| Status Bar Height      | 47pt                                           |
| Notch Height           | 30pt                                           |
| Device Identifier      | `iPhone13,4`                                   |
| Starting iOS           | 15.0                                           |
| Supported iOS Versions | 15.0 - 17.x                                    |

### iPhone 13 Pro

| Property               | Value                                          |
| ---------------------- | ---------------------------------------------- |
| Screen Size            | 6.1 inches (diagonal)                          |
| Native Resolution      | 2532 × 1170 pixels (landscape)                 |
| Points (Logical)       | 844 × 390 points (@3x)                         |
| Scale Factor           | @3x                                            |
| Safe Area (Landscape)  | Top: 0pt, Bottom: 0pt, Left: 47pt, Right: 47pt |
| Status Bar Height      | 47pt                                           |
| Notch Height           | 30pt                                           |
| Device Identifier      | `iPhone13,3`                                   |
| Starting iOS           | 15.0                                           |
| Supported iOS Versions | 15.0 - 17.x                                    |

### iPhone 13 Mini

| Property               | Value                                          |
| ---------------------- | ---------------------------------------------- |
| Screen Size            | 5.4 inches (diagonal)                          |
| Native Resolution      | 2340 × 1080 pixels (landscape)                 |
| Points (Logical)       | 780 × 360 points (@3x)                         |
| Scale Factor           | @3x                                            |
| Safe Area (Landscape)  | Top: 0pt, Bottom: 0pt, Left: 47pt, Right: 47pt |
| Status Bar Height      | 47pt                                           |
| Notch Height           | 30pt                                           |
| Device Identifier      | `iPhone13,1`                                   |
| Starting iOS           | 15.0                                           |
| Supported iOS Versions | 15.0 - 17.x                                    |

### iPhone 13

| Property               | Value                                          |
| ---------------------- | ---------------------------------------------- |
| Screen Size            | 6.1 inches (diagonal)                          |
| Native Resolution      | 2532 × 1170 pixels (landscape)                 |
| Points (Logical)       | 844 × 390 points (@3x)                         |
| Scale Factor           | @3x                                            |
| Safe Area (Landscape)  | Top: 0pt, Bottom: 0pt, Left: 47pt, Right: 47pt |
| Status Bar Height      | 47pt                                           |
| Notch Height           | 30pt                                           |
| Device Identifier      | `iPhone13,2`                                   |
| Starting iOS           | 15.0                                           |
| Supported iOS Versions | 15.0 - 17.x                                    |

### iPhone 12 Pro Max

| Property               | Value                                          |
| ---------------------- | ---------------------------------------------- |
| Screen Size            | 6.7 inches (diagonal)                          |
| Native Resolution      | 2778 × 1284 pixels (landscape)                 |
| Points (Logical)       | 926 × 428 points (@3x)                         |
| Scale Factor           | @3x                                            |
| Safe Area (Landscape)  | Top: 0pt, Bottom: 0pt, Left: 47pt, Right: 47pt |
| Status Bar Height      | 47pt                                           |
| Notch Height           | 30pt                                           |
| Device Identifier      | `iPhone12,3`                                   |
| Starting iOS           | 14.0                                           |
| Supported iOS Versions | 14.0 - 17.x                                    |

### iPhone 12 Pro

| Property               | Value                                          |
| ---------------------- | ---------------------------------------------- |
| Screen Size            | 6.1 inches (diagonal)                          |
| Native Resolution      | 2532 × 1170 pixels (landscape)                 |
| Points (Logical)       | 844 × 390 points (@3x)                         |
| Scale Factor           | @3x                                            |
| Safe Area (Landscape)  | Top: 0pt, Bottom: 0pt, Left: 47pt, Right: 47pt |
| Status Bar Height      | 47pt                                           |
| Notch Height           | 30pt                                           |
| Device Identifier      | `iPhone12,1`                                   |
| Starting iOS           | 14.0                                           |
| Supported iOS Versions | 14.0 - 17.x                                    |

---

## iPad Specifications

### iPad Pro 12.9-inch (7th Generation)

| Property                  | Value                                            |
| ------------------------- | ------------------------------------------------ |
| Screen Size               | 12.9 inches (diagonal)                           |
| Native Resolution         | 2732 × 2048 pixels (landscape)                   |
| Points (Logical)          | 1366 × 1024 points (@2x)                         |
| Scale Factor              | @2x                                              |
| Safe Area (Landscape)     | Top: 24pt, Bottom: 20pt, Left: 20pt, Right: 20pt |
| Status Bar Height         | 24pt                                             |
| Device Identifier         | `iPad13,11`                                      |
| Split View Support        | Yes (2 apps side-by-side)                        |
| Multitasking              | Slide Over, Split View, Picture in Picture       |
| Starting iOS              | 16.0                                             |
| Supported iPadOS Versions | 16.0+                                            |

### iPad Pro 11-inch (6th Generation)

| Property                  | Value                                            |
| ------------------------- | ------------------------------------------------ |
| Screen Size               | 11 inches (diagonal)                             |
| Native Resolution         | 2388 × 1668 pixels (landscape)                   |
| Points (Logical)          | 1194 × 834 points (@2x)                          |
| Scale Factor              | @2x                                              |
| Safe Area (Landscape)     | Top: 24pt, Bottom: 20pt, Left: 20pt, Right: 20pt |
| Status Bar Height         | 24pt                                             |
| Device Identifier         | `iPad13,10`                                      |
| Split View Support        | Yes (2 apps side-by-side)                        |
| Multitasking              | Slide Over, Split View, Picture in Picture       |
| Starting iOS              | 16.0                                             |
| Supported iPadOS Versions | 16.0+                                            |

### iPad Air (6th Generation, 11-inch)

| Property                  | Value                                            |
| ------------------------- | ------------------------------------------------ |
| Screen Size               | 11 inches (diagonal)                             |
| Native Resolution         | 2388 × 1668 pixels (landscape)                   |
| Points (Logical)          | 1194 × 834 points (@2x)                          |
| Scale Factor              | @2x                                              |
| Safe Area (Landscape)     | Top: 24pt, Bottom: 20pt, Left: 20pt, Right: 20pt |
| Status Bar Height         | 24pt                                             |
| Device Identifier         | `iPad14,8`                                       |
| Split View Support        | Yes (2 apps side-by-side)                        |
| Multitasking              | Slide Over, Split View, Picture in Picture       |
| Starting iOS              | 17.0                                             |
| Supported iPadOS Versions | 17.0+                                            |

### iPad Air (6th Generation, 13-inch)

| Property                  | Value                                            |
| ------------------------- | ------------------------------------------------ |
| Screen Size               | 13 inches (diagonal)                             |
| Native Resolution         | 2732 × 2048 pixels (landscape)                   |
| Points (Logical)          | 1366 × 1024 points (@2x)                         |
| Scale Factor              | @2x                                              |
| Safe Area (Landscape)     | Top: 24pt, Bottom: 20pt, Left: 20pt, Right: 20pt |
| Status Bar Height         | 24pt                                             |
| Device Identifier         | `iPad14,9`                                       |
| Split View Support        | Yes (2-3 apps)                                   |
| Multitasking              | Slide Over, Split View, Picture in Picture       |
| Starting iOS              | 17.0                                             |
| Supported iPadOS Versions | 17.0+                                            |

### iPad (10th Generation)

| Property                  | Value                                         |
| ------------------------- | --------------------------------------------- |
| Screen Size               | 10.9 inches (diagonal)                        |
| Native Resolution         | 2360 × 1640 pixels (landscape)                |
| Points (Logical)          | 1180 × 820 points (@2x)                       |
| Scale Factor              | @2x                                           |
| Safe Area (Landscape)     | Top: 0pt, Bottom: 20pt, Left: 0pt, Right: 0pt |
| Status Bar Height         | 0pt                                           |
| Device Identifier         | `iPad7,12`                                    |
| Split View Support        | Yes (2 apps side-by-side)                     |
| Multitasking              | Slide Over, Split View, Picture in Picture    |
| Starting iOS              | 16.0                                          |
| Supported iPadOS Versions | 16.0+                                         |

### iPad Mini (6th Generation)

| Property                  | Value                                            |
| ------------------------- | ------------------------------------------------ |
| Screen Size               | 8.3 inches (diagonal)                            |
| Native Resolution         | 2048 × 1536 pixels (landscape)                   |
| Points (Logical)          | 1024 × 768 points (@2x)                          |
| Scale Factor              | @2x                                              |
| Safe Area (Landscape)     | Top: 24pt, Bottom: 20pt, Left: 20pt, Right: 20pt |
| Status Bar Height         | 24pt                                             |
| Device Identifier         | `iPad14,1`                                       |
| Split View Support        | Yes (2 apps side-by-side)                        |
| Multitasking              | Slide Over, Split View, Picture in Picture       |
| Starting iOS              | 16.0                                             |
| Supported iPadOS Versions | 16.0+                                            |

---

## Simulator Capabilities

### What Simulators Support

Simulators provide excellent capability coverage for rapid development and testing:

- **Push Notifications**: Full support via `simctl push` command
- **Location Simulation**: Flexible coordinate and address simulation
- **iCloud Integration**: Syncing and account testing
- **Camera Input**: Static image selection and testing
- **In-App Purchases**: Sandbox environment testing
- **Safari**: Full web browsing and debugging
- **Performance Monitoring**: Xcode Instruments integration
- **Background Modes**: Simulated background execution
- **URL Schemes**: Deep linking and custom protocols
- **System Events**: Lock/unlock, app backgrounding, notifications

### What Simulators DON'T Support

Critical limitations to understand:

- **True Device Performance**: Simulator performance doesn't reflect real device speed
- **Hardware Sensors**: No accelerometer, gyroscope, barometer, or compass
- **Real Camera/Microphone**: Cannot capture actual media
- **Cellular Connectivity**: Only WiFi simulation available
- **NFC/Payment**: Cannot interact with physical NFC or payment terminals
- **Face ID**: Only Touch ID is simulated (Face ID always fails)
- **Bluetooth**: Limited BLE simulation support
- **Phone Calls/SMS**: Cannot place real calls or send SMS messages
- **Spatial Audio**: True spatial capabilities not available
- **Haptics/Vibration**: No haptic feedback simulation
- **Network Fidelity**: Network throttling available but not identical to real networks
- **Battery Characteristics**: Cannot simulate actual battery drain

### Recommended Device Coverage

For comprehensive simulator testing, maintain these devices:

```
iPhone Testing:
- iPhone 16 Pro Max (largest screen, current generation)
- iPhone 16 (standard size, current generation)
- iPhone 15 (previous generation, large install base)
- iPhone 14 Pro (notch variant reference)

iPad Testing:
- iPad Pro 12.9-inch (largest tablet variant)
- iPad Air 11-inch (mid-range tablet)
- iPad Mini (smallest tablet)

Orientation Testing:
- Test each device in portrait and landscape
- Verify safe area handling (notches, dynamic island, home indicator)
```

---

## Screen Size Classes

iOS and iPadOS use size classes to describe the general layout environment of a device:

### Regular Width / Regular Height

- **Devices**: iPad in any orientation, iPhone in landscape
- **Use Case**: Larger layouts with room for side-by-side UI elements
- **Common Layout**: Master/detail split views, complex dashboards
- **Min Width**: 600 points (estimated)

### Compact Width / Regular Height

- **Devices**: iPhone in portrait orientation
- **Use Case**: Narrow vertical layouts with sequential content flow
- **Common Layout**: Stack-based navigation, full-width content
- **Max Width**: ~430 points (depends on device)

### Compact Width / Compact Height

- **Devices**: iPhone in landscape orientation
- **Use Case**: Very constrained vertical space
- **Common Layout**: Minimal toolbars, horizontal scrolling
- **Height**: ~430 points (varies by device)

### Trait Collection Detection

Size classes are queried at runtime:

```swift
let horizontalSizeClass = traitCollection.horizontalSizeClass
let verticalSizeClass = traitCollection.verticalSizeClass

switch (horizontalSizeClass, verticalSizeClass) {
case (.compact, .regular):
    // iPhone portrait
case (.regular, .regular):
    // iPad or iPhone landscape
default:
    // Compact height (landscape)
}
```

---

## Runtime Information

### Supported iOS Versions by Xcode

| Xcode Version | iOS Support Range | Latest iOS | Min Deployment   |
| ------------- | ----------------- | ---------- | ---------------- |
| Xcode 16.0    | iOS 16 - iOS 18   | iOS 18     | iOS 12 (typical) |
| Xcode 15.0    | iOS 15 - iOS 17   | iOS 17     | iOS 11 (typical) |
| Xcode 14.0    | iOS 14 - iOS 16   | iOS 16     | iOS 11 (typical) |
| Xcode 13.0    | iOS 13 - iOS 15   | iOS 15     | iOS 10 (typical) |

### Simulator Runtime Downloads

Simulators are installed with Xcode but can be downloaded separately:

| Runtime | Download Size | Disk Space Required | Supported Devices      |
| ------- | ------------- | ------------------- | ---------------------- |
| iOS 18  | ~2.5 GB       | ~5 GB               | All iPhone/iPad models |
| iOS 17  | ~2.3 GB       | ~4.5 GB             | All iPhone/iPad models |
| iOS 16  | ~2.2 GB       | ~4.3 GB             | All iPhone/iPad models |
| iOS 15  | ~2.1 GB       | ~4 GB               | All iPhone/iPad models |
| iOS 14  | ~1.9 GB       | ~3.8 GB             | iPhone 6s and later    |

### Device Identifier Lookup

Device identifiers follow the format: `ModelFamily,Generation`

**iPhone Examples:**

- `iPhone17,0` → iPhone 16 Pro
- `iPhone17,1` → iPhone 16 Pro Max
- `iPhone16,1` → iPhone 15 Pro
- `iPhone15,2` → iPhone 15
- `iPhone14,7` → iPhone 14

**iPad Examples:**

- `iPad13,11` → iPad Pro 12.9-inch (7th gen)
- `iPad14,8` → iPad Air 11-inch (6th gen)
- `iPad14,1` → iPad Mini (6th gen)
- `iPad7,12` → iPad (10th gen)

---

## Device Selection Guidelines

### For Feature Development

1. **Largest iPhone**: Test UI at maximum width
2. **Smallest iPhone**: Verify text readability and touch targets
3. **iPad**: Confirm adaptive layouts function correctly
4. **Landscape Orientation**: Test safe area and orientation handling

### For Performance Testing

Use **physical devices** whenever possible:

- Simulator performance doesn't represent real-world conditions
- Device-specific processors vary significantly
- Memory pressure differs between simulator and device
- Network performance simulation is approximate

### For Accessibility Testing

- **All sizes**: Verify font scaling works
- **Landscape**: Check Dynamic Type rendering in constrained space
- **iPad**: Test VoiceOver with larger screen
- **iPhone SE / Mini**: Ensure UI elements aren't hidden on small screens

### For Camera/Media Features

Use **physical devices only**:

- Simulators cannot access real camera or microphone input
- Static image selection is available in simulator
- Video capture requires physical device
- AR features require ARKit-capable device

### For Testing Network Features

- **Simulators**: Adequate for basic HTTP/HTTPS requests
- **Physical Devices**: Required for true cellular behavior
- **Physical Devices**: Required for testing low-bandwidth scenarios
- **Xcode Network Link Conditioner**: Available for throttling on both

---

## Testing Strategy by Device Type

### Physical Device Testing Strategy

**Phase 1: Rapid Development (Simulator)**

- Basic UI layout and navigation
- Feature logic and state management
- Error handling and edge cases
- Accessibility features (with limitations)

**Phase 2: Device Validation (Physical Device)**

- Camera and media capture
- Sensors (location, motion, etc.)
- Network behavior and performance
- Battery and thermal characteristics
- Face ID / secure enclave interactions
- Gesture recognition edge cases

**Phase 3: Regression Testing (Both)**

- Run full test suite on simulator for speed
- Run critical paths on representative devices
- Test orientation changes on both sizes
- Verify accessibility on actual devices

### Device Pool Recommendations

**Minimum for Feature Completion:**

- 1 current-generation iPhone (your primary device)
- 1 older iPhone (to catch version compatibility issues)
- 1 iPad (if app supports it)

**Recommended for Production Apps:**

- 2-3 iPhones (various sizes and generations)
- 1 iPad (if supported)
- Regular access to latest release

**Enterprise/Large Teams:**

- Device lab with multiple current + previous generation devices
- Automated testing infrastructure
- Remote device access (BrowserStack, TestFlight)

---

## Related Resources

- **Simulator Workflows**: See `xc://skills/simulator-workflows` for hands-on device management
- **Screen Recording**: Capture test evidence with `simctl io`
- **Testing Configuration**: See device list command for runtime management
- **Accessibility**: WWDC sessions on Dynamic Type and VoiceOver testing

---

## Quick Reference: Common Device Dimensions

### iPhone Quick Reference

| Device            | Screen | Points  | Notch/Island |
| ----------------- | ------ | ------- | ------------ |
| iPhone 16 Pro Max | 6.9"   | 932×430 | 30pt         |
| iPhone 16         | 6.1"   | 852×393 | 32pt         |
| iPhone 15 Pro     | 6.1"   | 852×393 | 30pt         |
| iPhone 15         | 6.1"   | 852×393 | 32pt         |
| iPhone 14 Pro Max | 6.7"   | 932×430 | 30pt         |
| iPhone 13 Mini    | 5.4"   | 780×360 | 30pt         |

### iPad Quick Reference

| Device         | Screen | Points    |
| -------------- | ------ | --------- |
| iPad Pro 12.9" | 12.9"  | 1366×1024 |
| iPad Pro 11"   | 11"    | 1194×834  |
| iPad Air 13"   | 13"    | 1366×1024 |
| iPad Mini      | 8.3"   | 1024×768  |

---

Generated for xc://reference/device-specs MCP resource
