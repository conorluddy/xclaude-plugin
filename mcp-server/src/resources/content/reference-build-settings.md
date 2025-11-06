# Build Settings Reference

## Overview

Build settings are configuration variables that control how Xcode builds your application. They define everything from the app's name and bundle identifier to optimization levels, code signing parameters, and search paths for frameworks and libraries.

### Where Build Settings Are Defined

Build settings can be specified at multiple levels, with a clear hierarchy:

1. **Project Level** - Applies to all targets in the project
2. **Target Level** - Overrides project settings for a specific target
3. **xcconfig Files** - External configuration files that can override both project and target settings
4. **Command Line** - `xcodebuild` flags that override all other levels

### How Build Settings Are Resolved

Xcode resolves build settings using a precedence system:

1. Command line arguments (highest priority)
2. xcconfig files (if referenced)
3. Target settings
4. Project settings
5. Xcode defaults (lowest priority)

Build settings support variable substitution using `$(VARIABLE_NAME)` syntax, enabling composition and reference to other settings. For example, `$(SRCROOT)/Resources` references the source root path.

### Viewing Build Settings

To see all build settings for a target:

```bash
xcodebuild -showBuildSettings -scheme YourScheme
```

To see settings for a specific configuration:

```bash
xcodebuild -showBuildSettings -scheme YourScheme -configuration Release
```

---

## Common Build Settings Dictionary

### General Settings

#### PRODUCT_NAME

- **Description:** The name of the final product (app, framework, or library)
- **Type:** String
- **Default:** Target name
- **Common Values:** `MyApp`, `MyFramework`
- **Example:** `PRODUCT_NAME = MyApp`
- **When to Modify:** When the app's display name differs from its target name, or when building multiple variants

#### PRODUCT_BUNDLE_IDENTIFIER

- **Description:** Unique identifier for the application (reverse domain notation)
- **Type:** String (must be unique on App Store)
- **Default:** `com.yourcompany.$(PRODUCT_NAME:rfc1034identifier)`
- **Common Values:** `com.example.myapp`, `com.company.myapp.enterprise`
- **Example:** `PRODUCT_BUNDLE_IDENTIFIER = com.example.myapp`
- **When to Modify:** For each variant, environment, or App Store submission
- **Important:** Must match provisioning profile bundle identifier for code signing

#### TARGETED_DEVICE_FAMILY

- **Description:** The device families the app targets
- **Type:** Comma-separated list
- **Common Values:**
  - `1` - iPhone
  - `2` - iPad
  - `1,2` - Universal (iPhone and iPad)
  - `6` - Apple TV
- **Example:** `TARGETED_DEVICE_FAMILY = 1,2`
- **When to Modify:** When changing app target devices

#### IPHONEOS_DEPLOYMENT_TARGET

- **Description:** Minimum iOS version the app supports
- **Type:** Version string
- **Common Values:** `12.0`, `13.0`, `14.0`, `15.0`, `16.0`
- **Debug vs Release:** Usually the same, but can differ if testing backward compatibility
- **Example:** `IPHONEOS_DEPLOYMENT_TARGET = 14.0`
- **When to Modify:** When updating minimum supported iOS version
- **Impact:** Affects available APIs and frameworks; older values support more devices

#### SWIFT_VERSION

- **Description:** Swift language version used to compile
- **Type:** Version string
- **Common Values:** `5.0`, `5.1`, `5.5`, `5.8`, `5.9`
- **Default:** Latest version bundled with Xcode
- **Example:** `SWIFT_VERSION = 5.9`
- **When to Modify:** To maintain compatibility with specific Swift language features or suppress warnings

---

### Build Configuration

#### CONFIGURATION

- **Description:** The build configuration being used
- **Type:** String (read-only during build)
- **Common Values:** `Debug`, `Release`
- **Debug vs Release:**
  - Debug: Contains symbols, no optimization, faster builds
  - Release: Optimized, symbols stripped, slower builds
- **Example:** Current configuration accessible via `$(CONFIGURATION)`
- **When to Modify:** Define custom configurations beyond Debug/Release

#### GCC_OPTIMIZATION_LEVEL

- **Description:** Optimization level for C/Objective-C code compilation
- **Type:** String
- **Common Values:**
  - `0` - No optimization (Debug)
  - `1` - Basic optimization
  - `2` - Moderate optimization (Release)
  - `3` - Aggressive optimization
  - `s` - Optimize for size
  - `z` - Optimize for size (aggressive)
- **Debug vs Release:**
  - Debug: `0` (no optimization)
  - Release: `2` or `3` (moderate to aggressive)
- **Example:** `GCC_OPTIMIZATION_LEVEL = 2`
- **Impact:** Affects build time and runtime performance

#### SWIFT_OPTIMIZATION_LEVEL

- **Description:** Optimization level for Swift code compilation
- **Type:** String
- **Common Values:**
  - `-Onone` - No optimization (Debug)
  - `-O` - Optimize for speed (Release)
  - `-Osize` - Optimize for size
- **Debug vs Release:**
  - Debug: `-Onone`
  - Release: `-O`
- **Example:** `SWIFT_OPTIMIZATION_LEVEL = -O`
- **Impact:** Significantly affects build time and app performance

#### DEBUG_INFORMATION_FORMAT

- **Description:** Format for debug symbol information
- **Type:** String
- **Common Values:**
  - `dwarf` - Debug info in object files (smaller builds)
  - `dwarf-with-dsym` - Separate dSYM file (better for distribution)
- **Debug vs Release:**
  - Debug: Usually `dwarf`
  - Release: `dwarf-with-dsym` (for crash symbolication)
- **Example:** `DEBUG_INFORMATION_FORMAT = dwarf-with-dsym`
- **When to Modify:** For App Store builds, always use `dwarf-with-dsym` for crash logs

#### ENABLE_BITCODE

- **Description:** Whether to enable bitcode compilation
- **Type:** Boolean (`YES` / `NO`)
- **Common Values:** `YES` or `NO`
- **Default:** `NO` (deprecated by Apple)
- **Example:** `ENABLE_BITCODE = NO`
- **Important:** Apple no longer accepts bitcode for most app submissions
- **When to Modify:** Generally leave as `NO` unless building frameworks for distribution

---

### Code Signing

#### CODE_SIGN_IDENTITY

- **Description:** Identity used to sign the app
- **Type:** String
- **Common Values:**
  - `Apple Development` - Development signing identity
  - `iPhone Developer` - Legacy development
  - `iPhone Distribution` - App Store distribution
  - `-` - No signing (framework development)
- **Example:** `CODE_SIGN_IDENTITY = Apple Development`
- **When to Modify:** When switching between development and distribution signing

#### CODE_SIGN_STYLE

- **Description:** Whether to use automatic or manual code signing
- **Type:** String
- **Common Values:**
  - `Automatic` - Xcode manages signing (recommended)
  - `Manual` - Developer manages certificates and provisioning profiles
- **Example:** `CODE_SIGN_STYLE = Automatic`
- **When to Modify:** In CI/CD pipelines, often set to `Manual` for explicit control
- **Debug vs Release:** May differ based on signing requirements

#### DEVELOPMENT_TEAM

- **Description:** Apple Developer Team ID for automatic signing
- **Type:** String (10-character ID)
- **Example:** `DEVELOPMENT_TEAM = ABC1234567`
- **Required for:** Automatic code signing
- **When to Modify:** When switching between team accounts
- **Finding Your ID:** Available in Xcode preferences or Apple Developer portal

#### PROVISIONING_PROFILE_SPECIFIER

- **Description:** Name of the provisioning profile to use (manual signing)
- **Type:** String
- **Example:** `PROVISIONING_PROFILE_SPECIFIER = MyApp Development`
- **When to Modify:** When using manual code signing
- **Debug vs Release:** Different profiles for development and distribution
- **Pattern:** Format is usually `$(PRODUCT_NAME) Development` or `$(PRODUCT_NAME) Distribution`

#### PROVISIONING_PROFILE

- **Description:** UUID of provisioning profile (manual signing)
- **Type:** String (UUID format)
- **Example:** `PROVISIONING_PROFILE = a1b2c3d4-e5f6-7890-abcd-ef1234567890`
- **When to Modify:** Alternative to `PROVISIONING_PROFILE_SPECIFIER` for manual signing
- **Relationship:** Usually paired with `PROVISIONING_PROFILE_SPECIFIER`

---

### Search Paths

#### FRAMEWORK_SEARCH_PATHS

- **Description:** Paths where the linker searches for frameworks
- **Type:** Space-separated list of paths
- **Example:** `FRAMEWORK_SEARCH_PATHS = $(inherited) /path/to/frameworks`
- **Best Practice:** Always include `$(inherited)` to preserve parent settings
- **Syntax:** Use `$(SRCROOT)`, `$(CONFIGURATION_BUILD_DIR)`, etc.
- **When to Modify:** When using custom or third-party frameworks outside standard locations
- **Common Pattern:** `$(inherited) "$(SRCROOT)/Frameworks"`

#### LIBRARY_SEARCH_PATHS

- **Description:** Paths where the linker searches for static/dynamic libraries
- **Type:** Space-separated list of paths
- **Example:** `LIBRARY_SEARCH_PATHS = $(inherited) /usr/local/lib`
- **Best Practice:** Include `$(inherited)` to preserve default paths
- **When to Modify:** When using custom libraries not in standard system locations
- **Common Pattern:** `$(inherited) "$(SRCROOT)/Libraries"`

#### HEADER_SEARCH_PATHS

- **Description:** Paths where compiler searches for header files
- **Type:** Space-separated list of paths
- **Example:** `HEADER_SEARCH_PATHS = $(inherited) $(SRCROOT)/Headers`
- **Best Practice:** Always use `$(inherited)` and quote paths with spaces
- **When to Modify:** When importing headers from custom locations
- **Difference from FRAMEWORK_SEARCH_PATHS:** Used for individual headers, not frameworks

#### LD_RUNPATH_SEARCH_PATHS

- **Description:** Runtime library search paths for the dynamic linker
- **Type:** Space-separated list
- **Common Values:**
  - `@executable_path/Frameworks` - Load frameworks from app bundle
  - `@loader_path/Frameworks` - Load frameworks relative to loader
- **Example:** `LD_RUNPATH_SEARCH_PATHS = @executable_path/Frameworks $(inherited)`
- **When to Modify:** When embedding frameworks or using custom dylib locations
- **Important:** Critical for framework embedding in app extensions

---

### Compilation

#### SWIFT_ACTIVE_COMPILATION_CONDITIONS

- **Description:** Conditional compilation flags for Swift code
- **Type:** Space-separated list of identifiers
- **Common Values:** `DEBUG`, `BETA`, `PRODUCTION`, `ENABLE_LOGGING`
- **Example:** `SWIFT_ACTIVE_COMPILATION_CONDITIONS = DEBUG $(inherited)`
- **Usage in Code:**
  ```swift
  #if DEBUG
  print("Debug mode")
  #endif
  ```
- **Debug vs Release:**
  - Debug: Usually includes `DEBUG`
  - Release: Often excludes `DEBUG`
- **When to Modify:** To enable feature flags or debug-only code

#### GCC_PREPROCESSOR_DEFINITIONS

- **Description:** Preprocessor macro definitions for C/Objective-C code
- **Type:** Space-separated list of `NAME=VALUE` pairs
- **Example:** `GCC_PREPROCESSOR_DEFINITIONS = DEBUG=1 API_URL=@"https://api.example.com"`
- **Common Values:** `DEBUG`, `ENABLE_LOGGING`, `API_ENDPOINT`
- **Debug vs Release:**
  - Debug: Often includes `DEBUG=1`
  - Release: May include `NDEBUG` to disable assertions
- **When to Modify:** For compile-time configuration or environment-specific values

#### OTHER_SWIFT_FLAGS

- **Description:** Additional flags passed to Swift compiler
- **Type:** Space-separated list
- **Common Values:**
  - `-suppress-warnings` - Suppress compiler warnings
  - `-debug-time-function-bodies` - Measure compilation time
  - `-enable-testing` - Enable testing support
- **Example:** `OTHER_SWIFT_FLAGS = $(inherited) -suppress-warnings`
- **When to Modify:** For Swift compiler-specific options or experimental features

#### OTHER_LDFLAGS

- **Description:** Additional flags passed to the linker
- **Type:** Space-separated list
- **Common Values:**
  - `-lstdc++` - Link C++ standard library
  - `-framework SystemConfiguration` - Link specific framework
  - `-ObjC` - Load all Objective-C categories
- **Example:** `OTHER_LDFLAGS = $(inherited) -framework SystemConfiguration`
- **When to Modify:** For linking special libraries or enabling Objective-C categories
- **Important:** The `-ObjC` flag is necessary for some third-party SDKs

---

### Architecture

#### ARCHS

- **Description:** Architectures to build for (active platform)
- **Type:** Space-separated list
- **Common Values:**
  - `arm64` - Apple Silicon native
  - `x86_64` - Intel Mac
  - `arm64e` - Apple Silicon with PAC
- **Example:** `ARCHS = arm64 x86_64`
- **Modern Xcode:** Usually just `arm64` for iOS
- **When to Modify:** When building universal binaries or supporting legacy architectures

#### VALID_ARCHS

- **Description:** Valid architectures for the platform
- **Type:** Space-separated list
- **Common Values:**
  - iOS: `arm64 arm64e`
  - macOS: `arm64 x86_64`
  - Simulator: `x86_64 arm64`
- **Example:** `VALID_ARCHS = arm64 arm64e x86_64`
- **When to Modify:** To restrict supported architectures or add new ones
- **Relationship:** `ARCHS` must be a subset of `VALID_ARCHS`

#### ONLY_ACTIVE_ARCH

- **Description:** Build only the active architecture during development
- **Type:** Boolean (`YES` / `NO`)
- **Debug vs Release:**
  - Debug: `YES` (faster builds)
  - Release: `NO` (build for all valid architectures)
- **Example:** `ONLY_ACTIVE_ARCH = YES`
- **When to Modify:** To speed up debug builds (safe) or force full builds
- **Impact:** Setting to `YES` significantly improves build time but produces incomplete binary

---

### Code Organization

#### SOURCES_ROOT

- **Description:** Alias for `SRCROOT`
- **Type:** Path (read-only)
- **Example:** `/path/to/project/TargetName`

#### SRCROOT

- **Description:** Root directory of the target source files
- **Type:** Path (read-only)
- **Example:** `/Users/developer/Projects/MyApp`
- **Usage:** Base for relative path calculations
- **Common Usage:** `$(SRCROOT)/Resources`, `$(SRCROOT)/Frameworks`

#### CONFIGURATION_BUILD_DIR

- **Description:** Directory where build products are placed
- **Type:** Path (read-only)
- **Example:** `/path/to/build/Debug-iphoneos`
- **Debug vs Release:** Different directories for different configurations
- **Usage:** Reference output location of built files

#### BUILT_PRODUCTS_DIR

- **Description:** Directory containing built product
- **Type:** Path (read-only)
- **Related to:** `CONFIGURATION_BUILD_DIR`
- **Usage:** Locate final app or framework binary

#### INTERMEDIATE_BUILD_DIR

- **Description:** Directory for intermediate build artifacts
- **Type:** Path (read-only)
- **Example:** `/path/to/build/Objects-normal/arm64`
- **Contains:** Object files, dependency files, etc.

---

### Versioning

#### MARKETING_VERSION

- **Description:** User-facing version number (e.g., "1.2.3")
- **Type:** String
- **Example:** `MARKETING_VERSION = 1.2.3`
- **Info.plist:** Corresponds to `CFBundleShortVersionString`
- **When to Modify:** For each public release

#### CURRENT_PROJECT_VERSION

- **Description:** Internal build number (must be an integer)
- **Type:** String (numeric)
- **Example:** `CURRENT_PROJECT_VERSION = 42`
- **Info.plist:** Corresponds to `CFBundleVersion`
- **When to Modify:** For each build, especially in CI/CD
- **Requirement:** Must increment for App Store submissions

---

### Other Important Settings

#### EXECUTABLE_NAME

- **Description:** Name of the executable binary
- **Type:** String
- **Default:** `$(PRODUCT_NAME)`
- **Example:** `EXECUTABLE_NAME = MyApp`
- **When to Modify:** When executable name differs from product name

#### BUNDLE_LOADER

- **Description:** Path to the executable that loads test bundle
- **Type:** Path
- **Example:** `BUNDLE_LOADER = $(BUILT_PRODUCTS_DIR)/MyApp.app/MyApp`
- **For:** Unit tests that need to load host app

#### TEST_HOST

- **Description:** Path to host app for UI tests
- **Type:** Path
- **Example:** `TEST_HOST = $(BUILT_PRODUCTS_DIR)/MyApp.app`
- **For:** UI tests and integration tests

#### ENABLE_TESTING_SEARCH_PATHS

- **Description:** Add test-specific search paths
- **Type:** Boolean (`YES` / `NO`)
- **For:** Unit tests and UI tests

---

## How to Query Build Settings

### Viewing All Settings for a Target

```bash
xcodebuild -showBuildSettings -scheme MyApp
```

### Viewing Settings for Specific Configuration

```bash
xcodebuild -showBuildSettings -scheme MyApp -configuration Release
```

### Viewing Settings for Specific SDK

```bash
xcodebuild -showBuildSettings -scheme MyApp -sdk iphoneos
```

### Viewing Specific Setting Value

```bash
xcodebuild -showBuildSettings -scheme MyApp | grep "PRODUCT_BUNDLE_IDENTIFIER"
```

### Exporting Settings to File

```bash
xcodebuild -showBuildSettings -scheme MyApp > build_settings.txt
```

---

## Common Configuration Patterns

### Debug Configuration

```
CONFIGURATION = Debug
GCC_OPTIMIZATION_LEVEL = 0
SWIFT_OPTIMIZATION_LEVEL = -Onone
DEBUG_INFORMATION_FORMAT = dwarf
SWIFT_ACTIVE_COMPILATION_CONDITIONS = DEBUG
ONLY_ACTIVE_ARCH = YES
```

### Release Configuration

```
CONFIGURATION = Release
GCC_OPTIMIZATION_LEVEL = 2
SWIFT_OPTIMIZATION_LEVEL = -O
DEBUG_INFORMATION_FORMAT = dwarf-with-dsym
SWIFT_ACTIVE_COMPILATION_CONDITIONS =
ONLY_ACTIVE_ARCH = NO
```

### App Store Submission

```
CODE_SIGN_STYLE = Automatic
CODE_SIGN_IDENTITY = iPhone Distribution
DEBUG_INFORMATION_FORMAT = dwarf-with-dsym
ENABLE_BITCODE = NO
CURRENT_PROJECT_VERSION = [increment]
MARKETING_VERSION = [semantic version]
```

### Enterprise Distribution

```
CODE_SIGN_STYLE = Manual
PROVISIONING_PROFILE_SPECIFIER = MyApp Enterprise
CODE_SIGN_IDENTITY = iPhone Distribution
DEBUG_INFORMATION_FORMAT = dwarf-with-dsym
```

### Framework Development

```
PRODUCT_TYPE = com.apple.product-type.framework
CODE_SIGN_IDENTITY = -
STRIP_INSTALLED_PRODUCT = NO
SKIP_INSTALL = NO
```

### CI/CD Pipeline

```
CODE_SIGN_STYLE = Manual
DEVELOPMENT_TEAM = ABC1234567
PROVISIONING_PROFILE_SPECIFIER = CI_Profile
ONLY_ACTIVE_ARCH = NO
ENABLE_BITCODE = NO
```

---

## Troubleshooting Build Setting Issues

### "No matching provisioning profile found"

**Cause:** `PROVISIONING_PROFILE_SPECIFIER` or `DEVELOPMENT_TEAM` mismatch

**Solution:**

1. Check profile exists: `security find-certificate -p com.apple.application-id | openssl x509 -noout -text`
2. Verify `DEVELOPMENT_TEAM` matches Apple ID
3. Match `PRODUCT_BUNDLE_IDENTIFIER` to profile

### Build times are slow

**Cause:** `ONLY_ACTIVE_ARCH = NO` in Debug configuration

**Solution:** Set `ONLY_ACTIVE_ARCH = YES` for Debug builds

### Linker errors (undefined symbols)

**Cause:** Missing framework or library in search paths

**Solution:**

1. Add framework to `FRAMEWORK_SEARCH_PATHS`
2. Add library to `LIBRARY_SEARCH_PATHS`
3. Include `-framework FrameworkName` in `OTHER_LDFLAGS`

### Header not found errors

**Cause:** Missing header search path

**Solution:**

1. Add path to `HEADER_SEARCH_PATHS`
2. Use `$(inherited)` to preserve existing paths
3. Quote paths containing spaces

### Code signing issues with frameworks

**Cause:** Incorrect `LD_RUNPATH_SEARCH_PATHS`

**Solution:**

1. Ensure `@executable_path/Frameworks` is in the path
2. For app extensions, use `@executable_path/../../Frameworks`
3. Verify framework embedded in "Frameworks" folder

### Settings not applying

**Cause:** Xcconfig file precedence or caching

**Solution:**

1. Clean build folder: `cmd + shift + k`
2. Check xcconfig file is referenced in project
3. Verify build settings aren't overridden at higher level
4. Restart Xcode if changes not reflected

### Swift compilation errors after updating

**Cause:** `SWIFT_VERSION` mismatch

**Solution:**

1. Match `SWIFT_VERSION` to Xcode version
2. Update deprecated Swift syntax
3. Run `xcodebuild -version` to check compiler version

---

## Related Resources

For more information on working with build settings in Xcode, refer to the xcode-workflows Skill documentation and Apple's official Xcode Build Settings Reference.
