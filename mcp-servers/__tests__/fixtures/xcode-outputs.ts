/**
 * Xcode command output fixtures for testing
 */

export const SUCCESSFUL_BUILD = {
  stdout: `Build settings from command line:
    PLATFORM_NAME = iphonesimulator
    SDK_NAME = iphonesimulator17.0

Building for 'generic/platform=iOS Simulator'...
Compiling Swift source files
Linking
Build complete! (42.234 seconds)
BUILD SUCCEEDED`,
  stderr: "",
  code: 0,
};

export const FAILED_BUILD_LINKER_ERROR = {
  stdout: `Building for 'generic/platform=iOS Simulator'...
Compiling Swift source files
error: Linker command failed with exit code 1 (use -v to see invocation)
error: symbol(s) not found for architecture arm64
clang: error: linker command failed with exit code 1`,
  stderr: "",
  code: 65,
};

export const FAILED_BUILD_COMPILE_ERROR = {
  stdout: `Building for 'generic/platform=iOS Simulator'...
Compiling Swift source files
/path/to/ViewController.swift:42:5: error: Cannot find 'nonexistentFunction' in scope
/path/to/AppDelegate.swift:15:10: error: Variable 'foo' was never initialized
Build failed`,
  stderr: "",
  code: 1,
};

export const BUILD_WITH_WARNINGS = {
  stdout: `Building for 'generic/platform=iOS Simulator'...
Compiling Swift source files
/path/to/File.swift:10:5: warning: Variable 'unused' was never used
/path/to/Other.swift:20:3: warning: Deprecated API 'oldMethod()' was used
Linking
Build complete! (12.5 seconds)
BUILD SUCCEEDED`,
  stderr: "",
  code: 0,
};

export const NO_SCHEME_FOUND = {
  stdout: `xcodebuild: error: Scheme 'NonexistentScheme' does not exist in workspace.
The "-scheme" option must name a scheme that exists in this workspace.`,
  stderr: "Scheme not found",
  code: 1,
};

export const PROJECT_NOT_FOUND = {
  stdout: `xcode-select: error: tool 'xcodebuild' requires Xcode, but active developer directory '/Library/Developer/CommandLineTools' is a command line tools instance`,
  stderr: "Command line tools error",
  code: 1,
};
