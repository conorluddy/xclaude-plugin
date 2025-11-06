# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**xclaude-plugin** is a ground-up redesign of iOS development automation for Claude Code. This repository contains comprehensive technical specifications for building the plugin, not the implementation itself.

**Core Innovation**: Consolidate 52 individual MCP tools into 3 semantic dispatchers + 5 procedural Skills, reducing token overhead from 30-50k to 3-5k tokens (85-90% reduction) while maintaining full functionality.

**Target**: Claude Code Plugin Marketplace distribution with single-command installation.

## Repository Structure

```
xclaude-plugin/
├── SPECS/                    # Complete technical specifications (140KB)
│   ├── 00-overview.md       # Architecture vision and key decisions
│   ├── 01-repository-structure.md  # Directory layout for implementation
│   ├── 02-mcp-server-architecture.md  # MCP server with 3 dispatchers
│   ├── 03-tool-specifications.md  # Detailed operation specs
│   ├── 04-skills-architecture.md  # 5 procedural Skills design
│   ├── 05-plugin-manifest.md  # Plugin configuration
│   ├── 10-implementation-roadmap.md  # 6-week phased rollout
│   ├── README.md            # Project overview
│   ├── SUMMARY.md           # How to use specs
│   ├── INDEX.md             # Navigation guide
│   └── GET-STARTED.md       # Quick start
└── [Implementation structure TBD - see 01-repository-structure.md]
```

## Key Architectural Decisions

### Why 3 Dispatchers Instead of 52 Tools?
- **Token efficiency**: 52 tool schemas = 30-50k tokens vs 3 dispatchers = 3-5k tokens
- **Semantic organization**: Operations grouped by domain (build/simulator/advanced) not CRUD
- **Reduced choice paralysis**: Agents choose from 3 operations vs 52 similar tools

### The 3 Dispatchers
1. **execute_build_command** - All xcodebuild operations (build, test, clean, analyze, list-schemes, etc.)
2. **execute_simulator_command** - All simctl operations (list, boot, install, launch, screenshot, etc.)
3. **execute_advanced_operation** - IDB debugging, cache management, workflows

### Why Skills for Procedural Knowledge?
- **Progressive loading**: Skills load 30-50 tokens at startup, full content (5-10k tokens) on-demand
- **Executable scripts**: Python automation included without loading into context
- **Separation of concerns**: MCP handles runtime operations, Skills teach workflows

### The 5 Skills
1. **ios-testing-workflow** - Test execution and result analysis
2. **xcode-project-patterns** - Project structure, signing, dependencies
3. **screenshot-analyzer** - Visual analysis with OpenCV
4. **performance-profiling** - Instruments data analysis
5. **accessibility-testing** - WCAG audits and VoiceOver testing

### File-Based Processing
Large outputs (>1k tokens) are written to files with summaries (~300 tokens) returned. Skills analyze files, keeping context clean. This achieves 97% token reduction for large operations.

## Implementation Phases (6 weeks)

**Phase 1 (Weeks 1-2)**: MCP server with 3 dispatchers, file processing, <5k token overhead validated
**Phase 2 (Weeks 3-4)**: 5 Skills with YAML + Python scripts
**Phase 3 (Week 5)**: Plugin packaging, 4 slash commands, lifecycle hooks
**Phase 4 (Week 6)**: Documentation and marketplace launch

## Working with This Repository

### Code Style Guidelines

**IMPORTANT**: Always follow [CODESTYLE.md](./CODESTYLE.md) when writing or modifying code.

Key principles:
- **Token efficiency first** - Optimize for AI agent comprehension
- **Self-documenting code** - Clear names, obvious structure
- **Progressive disclosure** - Show essentials first, details on-demand
- **Type safety** - Explicit types on public APIs, minimal `any` usage
- **Function size** - 20-30 lines ideal, 60 lines maximum

Run before committing:
```bash
npm run format      # Prettier formatting
npm run lint:fix    # ESLint auto-fix
npm run typecheck   # TypeScript validation
```

### Reading Specifications
Specs are numbered for logical progression. Start with:
1. `SPECS/README.md` - Project context
2. `SPECS/00-overview.md` - Understand the vision
3. `SPECS/10-implementation-roadmap.md` - Review timeline
4. Then follow numbered specs 01-05 for detailed implementation

### Implementing from Specs
Each spec document includes:
- **Context**: Why the component exists
- **Requirements**: What it must accomplish
- **Examples**: Reference TypeScript/Python implementations
- **Validation**: Success criteria

### Key Success Criteria
- **<5k token startup overhead** (vs 30-50k baseline)
- **<100ms for local operations**
- **97%+ token reduction for large outputs**
- **>80% test coverage**

## Technology Stack

**MCP Server**: TypeScript, Node.js 18+, @modelcontextprotocol/sdk
**Skills**: Markdown + YAML frontmatter + Python 3.10+ scripts
**Plugin**: JSON manifest with Claude Code integration
**Testing**: Jest, integration tests, token efficiency validation

## Common Development Workflows

### Starting Implementation
```bash
# Follow Phase 1 Week 1 checklist from 10-implementation-roadmap.md
# Create repository structure per 01-repository-structure.md
# Implement MCP server per 02-mcp-server-architecture.md
```

### Validating Token Efficiency
Token usage must be measured continuously throughout development. The core value proposition is 85-90% token reduction.

### Testing
Unit tests required for all dispatchers. Integration tests validate end-to-end workflows. Token efficiency tests validate <5k overhead claim.

## Important Constraints

- **macOS 13.0+ required** (Xcode command line tools)
- **Node.js 18+** for MCP server
- **Python 3.10+** for Skill scripts
- **Xcode 15.0+** for build operations

## References

- Original **xc-mcp v1** (52-tool architecture) for operational behavior
- **ios-simulator-skill** for accessibility-first patterns
- Anthropic's **MCP documentation** for protocol details
- **Claude Code plugin reference** for integration patterns
