# 05 - Plugin Manifest

**Purpose**: Complete plugin.json specification for Claude Code plugin packaging.

## Complete plugin.json

```json
{
  "name": "xc-plugin",
  "displayName": "Xcode Automation",
  "version": "0.0.1",
  "description": "Comprehensive iOS development automation with consolidated MCP tools and procedural Skills. Provides build, simulator, and advanced operations with 85-90% token efficiency improvement.",
  "author": "Conor Luddy",
  "homepage": "https://github.com/conorluddy/xc-plugin",
  "repository": {
    "type": "git",
    "url": "https://github.com/conorluddy/xc-plugin.git"
  },
  "bugs": {
    "url": "https://github.com/conorluddy/xc-plugin/issues"
  },
  "license": "MIT",
  "keywords": [
    "xcode",
    "ios",
    "simulator",
    "testing",
    "accessibility",
    "swiftui",
    "mobile",
    "development",
    "automation",
    "build-tools"
  ],
  
  "engines": {
    "claudeCode": ">=1.0.0",
    "node": ">=18.0.0"
  },
  
  "requirements": {
    "platform": ["darwin"],
    "xcode": ">=15.0",
    "commandLineTools": true
  },
  
  "mcpServers": {
    "xcode": {
      "command": "node",
      "args": ["${CLAUDE_PLUGIN_ROOT}/mcp-server/dist/index.js"],
      "env": {
        "XC_FILE_OUTPUT_DIR": "/tmp/xc-plugin",
        "XC_CACHE_ENABLED": "true",
        "XC_CACHE_DIR": "${HOME}/.xc-plugin/cache",
        "XC_LOG_LEVEL": "info",
        "XC_LOG_FILE": "${HOME}/.xc-plugin/logs/xc-mcp.log"
      },
      "disabled": false
    }
  },
  
  "skills": [
    {
      "id": "ios-testing-workflow",
      "path": "${CLAUDE_PLUGIN_ROOT}/skills/ios-testing-workflow",
      "enabled": true,
      "priority": "high"
    },
    {
      "id": "xcode-project-patterns",
      "path": "${CLAUDE_PLUGIN_ROOT}/skills/xcode-project-patterns",
      "enabled": true,
      "priority": "medium"
    },
    {
      "id": "screenshot-analyzer",
      "path": "${CLAUDE_PLUGIN_ROOT}/skills/screenshot-analyzer",
      "enabled": true,
      "priority": "medium"
    },
    {
      "id": "performance-profiling",
      "path": "${CLAUDE_PLUGIN_ROOT}/skills/performance-profiling",
      "enabled": true,
      "priority": "low"
    },
    {
      "id": "accessibility-testing",
      "path": "${CLAUDE_PLUGIN_ROOT}/skills/accessibility-testing",
      "enabled": true,
      "priority": "high"
    }
  ],
  
  "commands": [
    {
      "id": "xcode-build",
      "title": "Build Xcode Project",
      "description": "Smart build with sensible defaults and auto-detection",
      "handler": "${CLAUDE_PLUGIN_ROOT}/commands/xcode-build.js",
      "category": "Build",
      "icon": "🔨"
    },
    {
      "id": "sim-test",
      "title": "Run Simulator Tests",
      "description": "Complete testing workflow with setup, execution, and analysis",
      "handler": "${CLAUDE_PLUGIN_ROOT}/commands/sim-test.js",
      "category": "Testing",
      "icon": "🧪"
    },
    {
      "id": "debug-crash",
      "title": "Debug Crash",
      "description": "Crash analysis pipeline with log collection and symbolication",
      "handler": "${CLAUDE_PLUGIN_ROOT}/commands/debug-crash.js",
      "category": "Debugging",
      "icon": "🐛"
    },
    {
      "id": "profile-perf",
      "title": "Profile Performance",
      "description": "Performance profiling workflow with Instruments",
      "handler": "${CLAUDE_PLUGIN_ROOT}/commands/profile-perf.js",
      "category": "Profiling",
      "icon": "⚡"
    }
  ],
  
  "hooks": {
    "preTest": "${CLAUDE_PLUGIN_ROOT}/hooks/pre-test.js",
    "postTest": "${CLAUDE_PLUGIN_ROOT}/hooks/post-test.js"
  },
  
  "settings": {
    "defaultScheme": {
      "type": "string",
      "description": "Default scheme for builds (auto-detected if not set)",
      "default": ""
    },
    "defaultDevice": {
      "type": "string",
      "description": "Default simulator device name",
      "default": "iPhone 15"
    },
    "preferAccessibility": {
      "type": "boolean",
      "description": "Prefer accessibility-based navigation over screenshots for UI testing",
      "default": true
    },
    "cacheStrategy": {
      "type": "string",
      "enum": ["aggressive", "normal", "minimal"],
      "default": "normal",
      "description": "Cache behavior for repeated operations"
    },
    "outputFormat": {
      "type": "string",
      "enum": ["summary", "detailed", "file"],
      "default": "summary",
      "description": "Default output format for MCP operations"
    },
    "autoCleanBeforeBuild": {
      "type": "boolean",
      "description": "Automatically clean before building",
      "default": false
    },
    "parallelTesting": {
      "type": "boolean",
      "description": "Enable parallel test execution by default",
      "default": true
    },
    "disableAnimations": {
      "type": "boolean",
      "description": "Disable simulator animations for faster testing",
      "default": true
    },
    "codeCoverage": {
      "type": "boolean",
      "description": "Enable code coverage for test runs",
      "default": true
    }
  },
  
  "capabilities": {
    "build": {
      "operations": ["build", "test", "clean", "analyze", "archive"],
      "platforms": ["iOS", "macOS", "watchOS", "tvOS"]
    },
    "simulator": {
      "operations": ["manage", "install", "launch", "screenshot", "diagnostics"],
      "accessibility": true
    },
    "advanced": {
      "idb": true,
      "caching": true,
      "workflows": true
    }
  },
  
  "documentation": {
    "readme": "${CLAUDE_PLUGIN_ROOT}/README.md",
    "architecture": "${CLAUDE_PLUGIN_ROOT}/docs/ARCHITECTURE.md",
    "toolReference": "${CLAUDE_PLUGIN_ROOT}/docs/TOOL-REFERENCE.md",
    "skillsGuide": "${CLAUDE_PLUGIN_ROOT}/docs/SKILLS-GUIDE.md",
    "examples": "${CLAUDE_PLUGIN_ROOT}/examples"
  },
  
  "telemetry": {
    "enabled": false,
    "endpoint": null
  }
}
```

## Environment Variables

The plugin supports these environment variables (set in MCP server config):

### Core Settings
- `XC_FILE_OUTPUT_DIR`: Directory for large output files (default: `/tmp/xc-plugin`)
- `XC_CACHE_ENABLED`: Enable result caching (default: `true`)
- `XC_CACHE_DIR`: Cache directory (default: `~/.xc-plugin/cache`)
- `XC_LOG_LEVEL`: Logging level: `debug`, `info`, `warn`, `error` (default: `info`)
- `XC_LOG_FILE`: Log file path (default: `~/.xc-plugin/logs/xc-mcp.log`)

### Performance Tuning
- `XC_MAX_CACHE_SIZE_MB`: Maximum cache size in MB (default: `1000`)
- `XC_CACHE_TTL_HOURS`: Cache time-to-live in hours (default: `24`)
- `XC_MAX_PARALLEL_OPERATIONS`: Max concurrent operations (default: `4`)

### Feature Flags
- `XC_ENABLE_IDB`: Enable IDB operations (default: `false`, auto-detects IDB)
- `XC_ENABLE_ACCESSIBILITY`: Enable accessibility features (default: `true`)
- `XC_STRICT_MODE`: Fail on warnings (default: `false`)

## Plugin Variables

Variables available in plugin configuration using `${VARIABLE}` syntax:

- `${CLAUDE_PLUGIN_ROOT}`: Absolute path to plugin directory
- `${HOME}`: User home directory
- `${WORKSPACE}`: Current workspace root
- `${PROJECT}`: Auto-detected Xcode project path

## Installation

Users can install via:

### Marketplace (Recommended)
```bash
claude install xc-plugin
```

### Direct Install
```bash
claude install-plugin https://github.com/conorluddy/xc-plugin
```

### Manual Install
```bash
git clone https://github.com/conorluddy/xc-plugin.git
cd xc-plugin/mcp-server
npm install && npm run build
cd ..
ln -s $(pwd) ~/.claude/plugins/xc-plugin
```

## Configuration

Users can override settings in their Claude Code settings:

**.claude/settings.json**:
```json
{
  "plugins": {
    "xc-plugin": {
      "settings": {
        "defaultScheme": "MyApp",
        "defaultDevice": "iPhone 15 Pro",
        "cacheStrategy": "aggressive",
        "parallelTesting": true
      }
    }
  }
}
```

## Verification

After installation, verify with:

```bash
# Check MCP server
claude plugin list

# Test MCP tool
claude plugin test xc-plugin

# Check Skills
claude skills list
```

Expected output:
```
Plugin: xc-plugin v0.0.1
Status: ✓ Active
MCP Tools: 3 (build, simulator, advanced)
Skills: 5 (testing, patterns, screenshots, profiling, accessibility)
Commands: 4 (/xcode-build, /sim-test, /debug-crash, /profile-perf)
```

## Next Steps

Proceed to [10-implementation-roadmap.md](./10-implementation-roadmap.md) for the development timeline.
