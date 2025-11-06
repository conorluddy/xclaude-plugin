# 01 - Repository Structure

**Purpose**: Define the complete directory layout and file organization for xc-plugin.

## Directory Tree

```
xc-plugin/
├── .claude-plugin/
│   ├── plugin.json              # Plugin manifest (see spec 05)
│   └── icon.png                 # 512x512 PNG for marketplace
│
├── mcp-server/
│   ├── package.json             # MCP server npm package
│   ├── tsconfig.json            # TypeScript configuration
│   ├── .eslintrc.json           # Code style
│   ├── src/
│   │   ├── index.ts             # Main entry point
│   │   │
│   │   ├── dispatchers/
│   │   │   ├── build-tools.ts   # execute_build_command dispatcher
│   │   │   ├── simulator-tools.ts # execute_simulator_command dispatcher
│   │   │   ├── advanced-tools.ts # execute_advanced_operation dispatcher
│   │   │   └── types.ts         # Shared TypeScript types
│   │   │
│   │   ├── resources/
│   │   │   ├── operation-catalog.ts # MCP resource handler
│   │   │   ├── templates/
│   │   │   │   ├── build-tools-reference.md
│   │   │   │   ├── simulator-reference.md
│   │   │   │   ├── advanced-reference.md
│   │   │   │   └── common-workflows.md
│   │   │   └── index.ts
│   │   │
│   │   ├── file-processing/
│   │   │   ├── response-writer.ts # Write large outputs to files
│   │   │   ├── summary-generator.ts # Create token-efficient summaries
│   │   │   └── cache-manager.ts  # File-based caching
│   │   │
│   │   ├── xcode/
│   │   │   ├── xcodebuild.ts    # xcodebuild command wrapper
│   │   │   ├── simctl.ts        # simctl command wrapper
│   │   │   ├── idb.ts           # IDB wrapper
│   │   │   ├── project-detector.ts # Auto-detect .xcodeproj/.xcworkspace
│   │   │   └── accessibility.ts # Accessibility tree parsing
│   │   │
│   │   ├── utils/
│   │   │   ├── logger.ts        # Structured logging
│   │   │   ├── error-handler.ts # Error normalization
│   │   │   ├── validation.ts    # Input validation
│   │   │   └── token-counter.ts # Token usage tracking
│   │   │
│   │   └── config/
│   │       ├── defaults.ts      # Default settings
│   │       └── environment.ts   # Environment variables
│   │
│   ├── dist/                    # Compiled JavaScript output
│   │   └── index.js             # Built entry point
│   │
│   └── tests/
│       ├── dispatchers/
│       │   ├── build-tools.test.ts
│       │   ├── simulator-tools.test.ts
│       │   └── advanced-tools.test.ts
│       ├── file-processing/
│       │   ├── response-writer.test.ts
│       │   └── summary-generator.test.ts
│       ├── integration/
│       │   ├── full-workflow.test.ts
│       │   └── token-efficiency.test.ts
│       └── fixtures/
│           ├── TestApp.xcodeproj/
│           ├── sample-build-log.txt
│           └── sample-test-results.json
│
├── skills/
│   │
│   ├── ios-testing-workflow/
│   │   ├── SKILL.md             # Main documentation (see spec 04)
│   │   ├── skill.yaml           # Metadata and activation
│   │   ├── scripts/
│   │   │   ├── run_tests.py     # Test execution automation
│   │   │   ├── analyze_results.py # Parse xcresult bundles
│   │   │   └── requirements.txt # Python dependencies
│   │   └── examples/
│   │       ├── unit-test-example.md
│   │       └── ui-test-example.md
│   │
│   ├── xcode-project-patterns/
│   │   ├── SKILL.md
│   │   ├── skill.yaml
│   │   ├── examples/
│   │   │   ├── build-configs.md
│   │   │   ├── signing-setup.md
│   │   │   └── dependency-management.md
│   │   └── troubleshooting/
│   │       ├── common-build-errors.md
│   │       └── signing-issues.md
│   │
│   ├── screenshot-analyzer/
│   │   ├── SKILL.md
│   │   ├── skill.yaml
│   │   ├── scripts/
│   │   │   ├── analyze_screenshot.py
│   │   │   ├── compare_visual_diff.py
│   │   │   ├── accessibility_overlay.py
│   │   │   └── requirements.txt
│   │   └── examples/
│   │       ├── visual-regression-test.md
│   │       └── accessibility-audit.md
│   │
│   ├── performance-profiling/
│   │   ├── SKILL.md
│   │   ├── skill.yaml
│   │   ├── scripts/
│   │   │   ├── analyze_instruments.py
│   │   │   ├── memory_profile.py
│   │   │   └── requirements.txt
│   │   └── guides/
│   │       ├── memory-profiling.md
│   │       ├── cpu-profiling.md
│   │       └── network-analysis.md
│   │
│   └── accessibility-testing/
│       ├── SKILL.md
│       ├── skill.yaml
│       ├── scripts/
│       │   ├── wcag_audit.py
│       │   ├── voiceover_test.py
│       │   ├── contrast_checker.py
│       │   └── requirements.txt
│       └── guidelines/
│           ├── wcag-2.1-checklist.md
│           ├── inclusive-design.md
│           └── voiceover-best-practices.md
│
├── commands/
│   ├── xcode-build.ts           # /xcode-build implementation
│   ├── sim-test.ts              # /sim-test implementation
│   ├── debug-crash.ts           # /debug-crash implementation
│   ├── profile-perf.ts          # /profile-perf implementation
│   ├── types.ts                 # Command handler types
│   └── utils.ts                 # Shared command utilities
│
├── hooks/
│   ├── pre-test.ts              # Pre-test lifecycle hook
│   ├── post-test.ts             # Post-test lifecycle hook
│   ├── types.ts                 # Hook context types
│   └── README.md                # Hook documentation
│
├── docs/
│   ├── README.md                # Main documentation
│   ├── INSTALLATION.md          # Setup instructions
│   ├── ARCHITECTURE.md          # Design decisions
│   ├── TOOL-REFERENCE.md        # MCP tool documentation
│   ├── SKILLS-GUIDE.md          # Skills usage guide
│   ├── TROUBLESHOOTING.md       # Common issues and solutions
│   └── assets/
│       ├── architecture-diagram.png
│       ├── token-comparison-chart.png
│       └── workflow-examples/
│
├── examples/
│   ├── basic-workflow.md        # Getting started example
│   ├── testing-pipeline.md      # Complete test workflow
│   ├── ci-integration.md        # CI/CD setup
│   ├── custom-skill.md          # Creating custom Skills
│   └── advanced-debugging.md    # Complex debugging scenarios
│
├── scripts/
│   ├── setup.sh                 # Development environment setup
│   ├── build.sh                 # Build all components
│   ├── test.sh                  # Run all tests
│   ├── validate-token-usage.sh  # Token efficiency validation
│   └── publish.sh               # Release automation
│
├── .github/
│   ├── workflows/
│   │   ├── test.yml             # CI testing
│   │   ├── lint.yml             # Code quality
│   │   ├── publish.yml          # NPM and marketplace publishing
│   │   └── release.yml          # Version management
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug_report.md
│   │   ├── feature_request.md
│   │   └── skill_contribution.md
│   └── PULL_REQUEST_TEMPLATE.md
│
├── .gitignore                   # Git exclusions
├── .npmignore                   # NPM exclusions
├── package.json                 # Root package (workspace)
├── tsconfig.json                # Root TypeScript config
├── LICENSE                      # MIT License
├── README.md                    # Project overview
├── CONTRIBUTING.md              # Contribution guidelines
├── CHANGELOG.md                 # Version history
└── CODE_OF_CONDUCT.md           # Community standards
```

## Key Files Description

### Root Level

**package.json** (Root workspace):
```json
{
  "name": "xc-plugin",
  "version": "2.0.0",
  "private": true,
  "workspaces": [
    "mcp-server",
    "commands",
    "hooks"
  ],
  "scripts": {
    "build": "npm run build --workspaces",
    "test": "npm run test --workspaces",
    "lint": "eslint . --ext .ts",
    "prepare": "npm run build"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "typescript": "^5.3.0",
    "eslint": "^8.0.0",
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "@typescript-eslint/parser": "^6.0.0"
  }
}
```

**README.md** (Root):
- Project overview and features
- Quick installation instructions
- Link to detailed documentation
- License and contribution info

### MCP Server Structure

**mcp-server/package.json**:
```json
{
  "name": "xc-mcp-server",
  "version": "2.0.0",
  "type": "module",
  "main": "dist/index.js",
  "bin": {
    "xc-mcp": "dist/index.js"
  },
  "scripts": {
    "build": "tsc",
    "test": "jest",
    "dev": "tsc --watch",
    "prepublishOnly": "npm run build"
  },
  "dependencies": {
    "@modelcontextprotocol/sdk": "^0.5.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "typescript": "^5.3.0",
    "jest": "^29.0.0",
    "@types/jest": "^29.0.0",
    "ts-jest": "^29.0.0"
  }
}
```

**mcp-server/tsconfig.json**:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ES2022",
    "moduleResolution": "node",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "tests"]
}
```

**mcp-server/src/index.ts**:
Entry point that:
1. Initializes MCP server
2. Registers 3 dispatchers as tools
3. Sets up resource handlers
4. Configures logging and error handling
5. Starts server on stdio transport

### Skills Structure

Each skill follows identical structure:

**skill.yaml** format:
```yaml
name: Skill Display Name
description: Brief description for metadata (30-50 tokens)
version: 1.0.0
activation_conditions:
  keywords: [keyword1, keyword2, keyword3]
  file_patterns: ["*.swift", "*Tests.swift"]
  contexts: [context1, context2]
capabilities:
  - capability_1
  - capability_2
dependencies:
  python: ">=3.10"
  packages: [opencv-python, numpy]
```

**SKILL.md** format:
- Quick Reference section (100-200 tokens)
- Detailed procedural sections (5-10k tokens total)
- Code examples and scripts
- Integration with MCP tools
- Troubleshooting guides

**scripts/** directory:
- Python scripts with shebang `#!/usr/bin/env python3`
- Executable permissions set
- requirements.txt for dependencies
- Clear docstrings and type hints

### Commands Structure

**commands/package.json**:
```json
{
  "name": "@xc-plugin/commands",
  "version": "2.0.0",
  "type": "module",
  "scripts": {
    "build": "tsc",
    "test": "jest"
  },
  "dependencies": {
    "@claude/plugin-sdk": "^1.0.0"
  }
}
```

Each command file exports a handler:
```typescript
import { CommandHandler } from '@claude/plugin-sdk';

export const handler: CommandHandler = async (context) => {
  // Command implementation
};
```

### Hooks Structure

Similar to commands, but for lifecycle events:
```typescript
import { HookHandler } from '@claude/plugin-sdk';

export const preTest: HookHandler = async (context) => {
  // Pre-test setup
};
```

### Documentation Structure

**docs/README.md**: Main entry point linking to all docs

**docs/INSTALLATION.md**: Step-by-step setup for:
- Marketplace installation
- Manual installation
- Development setup
- Requirements verification

**docs/ARCHITECTURE.md**: Deep dive into:
- Why 3 dispatchers
- File-based processing
- Skills vs MCP decisions
- Token efficiency analysis

**docs/TOOL-REFERENCE.md**: Complete MCP tool documentation:
- Each dispatcher's operations
- Parameter schemas
- Response formats
- Examples

**docs/SKILLS-GUIDE.md**: Skills usage:
- When to use each Skill
- Script execution
- Integration patterns
- Customization

## File Conventions

### TypeScript Files
- Use ESM imports (`import` not `require`)
- Export types separately
- Prefer named exports over default
- Include JSDoc comments for public APIs

### Python Scripts
- Shebang: `#!/usr/bin/env python3`
- Type hints using `typing` module
- Docstrings in Google style
- Error handling with custom exceptions

### Markdown Files
- Use sentence case for headers
- Include table of contents for long docs
- Code blocks with language specifiers
- Internal links use relative paths

### Configuration Files
- JSON with 2-space indentation
- YAML with 2-space indentation
- Comments where non-obvious

## Git Ignore Rules

**.gitignore**:
```
# Build outputs
dist/
build/
*.js
*.js.map
*.d.ts

# Dependencies
node_modules/
__pycache__/
*.pyc
.venv/
venv/

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Testing
coverage/
.pytest_cache/

# Temporary files
*.log
/tmp/
.cache/

# Environment
.env
.env.local
```

## NPM Ignore Rules

**.npmignore**:
```
# Source files (include only dist)
src/
tests/
scripts/

# Development
*.test.ts
*.spec.ts
tsconfig.json
jest.config.js
.eslintrc.json

# Documentation (except README)
docs/
examples/

# Git
.git/
.github/
.gitignore
```

## Workspace Organization

The repository uses npm workspaces for multi-package management:

**Root**: Coordination and shared tooling
**mcp-server/**: Independent npm package
**commands/**: Plugin commands (bundled)
**hooks/**: Plugin hooks (bundled)

This allows:
- MCP server published to npm independently
- Commands/hooks bundled with plugin
- Shared dependencies hoisted
- Unified build/test commands

## Build Outputs

**Development builds**:
- Source maps enabled
- No minification
- Full type declarations

**Production builds**:
- Source maps for debugging
- Comments preserved for clarity
- Optimized but readable

**Plugin distribution**:
- Compiled JavaScript in dist/
- Type declarations for TypeScript users
- No source files included

## Next Steps

1. **Initialize repository**: `git init`, create on GitHub
2. **Setup package.json**: Root workspace configuration
3. **Create directory structure**: `mkdir -p` all directories
4. **Add placeholder files**: README.md, LICENSE, etc.
5. **Configure TypeScript**: tsconfig.json for project
6. **Setup CI/CD**: GitHub Actions workflows
7. **Create first commit**: Initial structure

Then proceed to [02-mcp-server-architecture.md](./02-mcp-server-architecture.md) for MCP server implementation details.
