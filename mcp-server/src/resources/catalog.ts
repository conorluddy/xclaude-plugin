/**
 * MCP Resource Catalog
 *
 * Provides on-demand documentation and references.
 * Token cost at rest: ~500 tokens (just catalog metadata)
 * Full content loaded only when requested: 0 tokens until queried
 */

import { logger } from '../utils/logger.js';

interface Resource {
  uri: string;
  name: string;
  description: string;
  mimeType: string;
}

export class ResourceCatalog {
  private resources: Resource[] = [
    {
      uri: 'xc://operations/xcode',
      name: 'Xcode Operations Reference',
      description: 'Complete reference for all xcodebuild operations, parameters, and options',
      mimeType: 'text/markdown',
    },
    {
      uri: 'xc://operations/simulator',
      name: 'Simulator Operations Reference',
      description: 'Complete reference for all simctl operations and device management',
      mimeType: 'text/markdown',
    },
    {
      uri: 'xc://operations/idb',
      name: 'IDB Operations Reference',
      description: 'Complete reference for all IDB UI automation operations',
      mimeType: 'text/markdown',
    },
    {
      uri: 'xc://reference/build-settings',
      name: 'Xcode Build Settings',
      description: 'Dictionary of common Xcode build settings and their meanings',
      mimeType: 'text/markdown',
    },
    {
      uri: 'xc://reference/error-codes',
      name: 'Error Codes Reference',
      description: 'Common error codes from xcodebuild, simctl, and IDB with solutions',
      mimeType: 'text/markdown',
    },
    {
      uri: 'xc://reference/device-specs',
      name: 'iOS Device Specifications',
      description: 'Simulator device types, runtimes, and specifications',
      mimeType: 'text/markdown',
    },
    {
      uri: 'xc://reference/accessibility',
      name: 'Accessibility Tree Documentation',
      description: 'Guide to iOS accessibility tree structure and element types',
      mimeType: 'text/markdown',
    },
    {
      uri: 'xc://workflows/accessibility-first',
      name: 'Accessibility-First Automation Pattern',
      description: 'Best practice workflow: describe → find → tap (avoiding screenshots)',
      mimeType: 'text/markdown',
    },
  ];

  /**
   * List all available resources (returns metadata only)
   */
  listResources(): Resource[] {
    logger.debug(`Listing ${this.resources.length} resources`);
    return this.resources;
  }

  /**
   * Read a specific resource by URI (loads full content)
   */
  async readResource(uri: string): Promise<string> {
    logger.info(`Reading resource: ${uri}`);

    // Find resource
    const resource = this.resources.find((r) => r.uri === uri);
    if (!resource) {
      throw new Error(`Resource not found: ${uri}`);
    }

    // Load content based on URI
    const content = this.getResourceContent(uri);

    if (!content) {
      throw new Error(`Failed to load content for: ${uri}`);
    }

    return content;
  }

  /**
   * Get resource content by URI
   * In production, these would load from markdown files
   */
  private getResourceContent(uri: string): string {
    switch (uri) {
      case 'xc://operations/xcode':
        return this.getXcodeOperationsReference();

      case 'xc://operations/simulator':
        return this.getSimulatorOperationsReference();

      case 'xc://operations/idb':
        return this.getIDBOperationsReference();

      case 'xc://reference/build-settings':
        return this.getBuildSettingsReference();

      case 'xc://reference/error-codes':
        return this.getErrorCodesReference();

      case 'xc://reference/device-specs':
        return this.getDeviceSpecsReference();

      case 'xc://reference/accessibility':
        return this.getAccessibilityReference();

      case 'xc://workflows/accessibility-first':
        return this.getAccessibilityFirstWorkflow();

      default:
        return `# Resource Not Implemented\n\nURI: ${uri}\n\nThis resource content will be added in a future update.`;
    }
  }

  // Resource content methods (placeholders for now)

  private getXcodeOperationsReference(): string {
    return `# Xcode Operations Reference

## execute_xcode_command

### Operations

#### build
Compile the project for specified scheme and configuration.

**Parameters:**
- \`scheme\` (required): Scheme name
- \`configuration\`: Debug or Release (default: Debug)
- \`destination\`: Build destination (e.g., "platform=iOS Simulator,name=iPhone 15")
- \`options.clean_before_build\`: Clean before building
- \`options.parallel\`: Enable parallel builds
- \`options.sdk\`: Target SDK
- \`options.arch\`: Target architecture

**Example:**
\`\`\`json
{
  "operation": "build",
  "scheme": "MyApp",
  "configuration": "Debug",
  "destination": "platform=iOS Simulator,name=iPhone 15"
}
\`\`\`

#### clean
Remove all build artifacts for the project.

**Parameters:**
- \`project_path\` (optional): Auto-detected if omitted
- \`scheme\` (optional): Specific scheme to clean

#### test
Run tests for the specified scheme.

**Parameters:**
- \`scheme\` (required): Scheme name
- \`destination\`: Test destination
- \`options.test_plan\`: Specific test plan to run
- \`options.only_testing\`: Array of test identifiers to run
- \`options.skip_testing\`: Array of test identifiers to skip

#### list
List schemes and targets in the project.

**Parameters:**
- \`project_path\` (optional): Auto-detected if omitted

**Returns:** Array of schemes and targets

#### version
Get Xcode and SDK version information.

**Parameters:** None

**Returns:** Xcode version, build number, and available SDKs

## Tips

- Use **xcode-workflows** Skill for guidance on operation selection
- Operations support auto-detection of project path
- Build logs use progressive disclosure for large outputs
`;
  }

  private getSimulatorOperationsReference(): string {
    return `# Simulator Operations Reference

## execute_simulator_command

### Operations

#### device-lifecycle
Manage simulator device lifecycle.

**Sub-operations:**
- \`boot\`: Start a simulator
- \`shutdown\`: Stop a running simulator
- \`create\`: Create a new simulator
- \`delete\`: Delete a simulator
- \`erase\`: Erase a simulator's data
- \`clone\`: Clone an existing simulator

#### app-lifecycle
Manage app installation and lifecycle.

**Sub-operations:**
- \`install\`: Install an app (.app bundle)
- \`uninstall\`: Remove an installed app
- \`launch\`: Launch an app
- \`terminate\`: Stop a running app

#### io
Capture screenshots and videos.

**Sub-operations:**
- \`screenshot\`: Capture a screenshot
- \`video\`: Record a video

#### list
List all available simulators with progressive disclosure.

**Returns:** Summary with cache ID for full device list

#### health-check
Validate iOS development environment.

**Checks:**
- Xcode installation
- Command line tools
- simctl availability
- CoreSimulator framework

## Tips

- Use **simulator-workflows** Skill for device selection guidance
- \`device_id\` can be UDID or device name (e.g., "iPhone 15")
- Large device lists use progressive disclosure
`;
  }

  private getIDBOperationsReference(): string {
    return `# IDB Operations Reference

## execute_idb_command

### Accessibility-First Strategy

**Always start with:**
1. \`describe\` operation (fast, 50 tokens) - Get accessibility tree
2. \`find-element\` operation - Search by label/identifier
3. \`tap\` operation - Tap discovered coordinates

**Fallback to screenshots only if accessibility data insufficient.**

### Operations

#### describe
Query UI accessibility tree (PREFERRED METHOD).

**Parameters:**
- \`target\`: Device UDID or "booted"
- \`parameters.operation\`: "all" (full tree) or "point" (at coordinates)

**Returns:** Accessibility tree with element coordinates

**Token cost:** ~50 tokens vs ~170 for screenshot

#### find-element
Semantic search for UI elements.

**Parameters:**
- \`target\`: Device UDID
- \`parameters.query\`: Element label or identifier to search

**Returns:** Matching elements with tap coordinates

#### tap
Tap at coordinates.

**Parameters:**
- \`target\`: Device UDID
- \`parameters.x\`: X coordinate
- \`parameters.y\`: Y coordinate
- \`parameters.duration\`: Optional tap duration

#### input
Input text or keyboard operations.

**Parameters:**
- \`target\`: Device UDID
- \`parameters.text\`: Text to input
- \`parameters.key\`: Key to press (home, return, etc.)

#### gesture
Perform gestures and button presses.

**Parameters:**
- \`target\`: Device UDID
- \`parameters.gesture_type\`: swipe, button
- \`parameters.direction\`: up, down, left, right (for swipe)
- \`parameters.button\`: HOME, LOCK, SIRI, etc.

#### check-accessibility
Assess accessibility data quality.

**Returns:** Quality score and recommendation (use accessibility vs screenshot)

## Tips

- Use **ui-automation-workflows** Skill for element finding patterns
- **Accessibility-first is 3-4x faster than screenshots**
- Use \`check-accessibility\` to decide strategy
`;
  }

  private getBuildSettingsReference(): string {
    return `# Xcode Build Settings Reference

## Common Build Settings

### Product Settings
- \`PRODUCT_NAME\`: Name of the built product
- \`PRODUCT_BUNDLE_IDENTIFIER\`: App bundle identifier
- \`INFOPLIST_FILE\`: Path to Info.plist

### SDK & Deployment
- \`SDKROOT\`: SDK to build against (iphoneos, iphonesimulator)
- \`IPHONEOS_DEPLOYMENT_TARGET\`: Minimum iOS version

### Code Signing
- \`CODE_SIGN_IDENTITY\`: Code signing identity
- \`DEVELOPMENT_TEAM\`: Development team ID
- \`PROVISIONING_PROFILE_SPECIFIER\`: Provisioning profile name

### Build Locations
- \`BUILD_DIR\`: Build directory
- \`CONFIGURATION_BUILD_DIR\`: Configuration-specific build dir
- \`DERIVED_DATA_PATH\`: DerivedData location

## Querying Build Settings

Use \`execute_xcode_command\` with operation "list" to see all settings.

## Tips

- Use **xcode-workflows** Skill for build configuration guidance
- Build settings can be queried per scheme/configuration
`;
  }

  private getErrorCodesReference(): string {
    return `# Error Codes Reference

## Common xcodebuild Errors

### Build Errors
- **Exit code 65**: Build failed (compilation errors)
- **Exit code 66**: Build failed (packaging errors)
- **Exit code 70**: Internal xcodebuild error

### Test Errors
- **Exit code 1**: Tests failed
- **Exit code 65**: Test compilation failed

## Common simctl Errors

### Device Errors
- **Device not found**: Invalid UDID or name
- **Device already booted**: Trying to boot an already running device
- **Unable to boot**: CoreSimulator issues

### App Errors
- **App not installed**: Bundle ID not found
- **Launch failed**: App crashed on launch

## Common IDB Errors

### Connection Errors
- **No target found**: IDB not connected or device unavailable
- **Connection refused**: IDB daemon not running

### UI Errors
- **Element not found**: Accessibility tree doesn't contain element
- **Tap failed**: Coordinates out of bounds or element not tappable

## Tips

- Use **crash-debugging** Skill for crash analysis
- Use **simulator-workflows** Skill for device troubleshooting
- Check logs with \`simctl-device diagnose\` for detailed errors
`;
  }

  private getDeviceSpecsReference(): string {
    return `# iOS Device Specifications

## Simulator Device Types

### iPhone
- iPhone SE (3rd generation)
- iPhone 14, 14 Plus, 14 Pro, 14 Pro Max
- iPhone 15, 15 Plus, 15 Pro, 15 Pro Max

### iPad
- iPad (10th generation)
- iPad Air (5th generation)
- iPad Pro (11-inch, 4th generation)
- iPad Pro (12.9-inch, 6th generation)

## iOS Runtimes

Available runtimes depend on Xcode version:
- iOS 15.0+
- iOS 16.0+
- iOS 17.0+
- iOS 18.0+

## Querying Available Devices

Use \`execute_simulator_command\` with operation "list" to see all available devices and runtimes.

## Tips

- Use **simulator-workflows** Skill for device selection guidance
- Device names can be used instead of UDIDs for convenience
- Check runtime availability before creating devices
`;
  }

  private getAccessibilityReference(): string {
    return `# Accessibility Tree Documentation

## Accessibility Tree Structure

The accessibility tree is a hierarchical representation of UI elements exposed to assistive technologies like VoiceOver.

### Element Properties

Each element includes:
- **label**: Text description of the element
- **value**: Current value (for inputs, sliders, etc.)
- **type**: Element type (button, text field, etc.)
- **frame**: Bounding box (x, y, width, height)
- **enabled**: Whether element is interactive
- **visible**: Whether element is on screen

### Element Types

- **Button**: Tappable buttons
- **TextField**: Text input fields
- **StaticText**: Non-interactive text labels
- **Cell**: Table/collection view cells
- **Image**: Image views
- **ScrollView**: Scrollable containers
- **NavigationBar**: Navigation bars
- **TabBar**: Tab bars

## Querying the Tree

Use \`execute_idb_command\` with operation "describe":

\`\`\`json
{
  "operation": "describe",
  "target": "booted",
  "parameters": {
    "operation": "all"
  }
}
\`\`\`

## Tips

- **Accessibility-first is 3-4x faster than screenshots**
- Use **ui-automation-workflows** Skill for element finding patterns
- Check accessibility quality with \`check-accessibility\` operation
`;
  }

  private getAccessibilityFirstWorkflow(): string {
    return `# Accessibility-First Automation Pattern

## The Strategy

**Always prefer accessibility tree over screenshots for UI automation.**

### Why Accessibility-First?

- **3-4x faster**: ~120ms vs ~2000ms for screenshots
- **80% cheaper**: ~50 tokens vs ~170 tokens
- **More reliable**: Survives theme changes, animations
- **Works offline**: No visual processing needed

## Workflow

### 1. Query Accessibility Tree

\`\`\`json
{
  "operation": "describe",
  "target": "booted"
}
\`\`\`

**Returns:** Element tree with labels and coordinates

### 2. Find Element

\`\`\`json
{
  "operation": "find-element",
  "target": "booted",
  "parameters": {
    "query": "Login"
  }
}
\`\`\`

**Returns:** Matching elements with tap coordinates

### 3. Interact

\`\`\`json
{
  "operation": "tap",
  "target": "booted",
  "parameters": {
    "x": 187,
    "y": 450
  }
}
\`\`\`

### 4. Only Fallback to Screenshots if Needed

Check accessibility quality first:

\`\`\`json
{
  "operation": "check-accessibility",
  "target": "booted"
}
\`\`\`

If quality is "insufficient", then use screenshots.

## Tips

- Use **ui-automation-workflows** Skill for detailed guidance
- **Always try describe first**, screenshot last
- Accessibility data survives app theme changes
- Most apps have good accessibility support
`;
  }
}
