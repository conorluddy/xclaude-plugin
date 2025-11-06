# XC Plugin - Architecture Specification Suite

**Version**: 1.0.0  
**Status**: Planning Phase  
**Target**: Claude Code Plugin Marketplace

## Overview

XC Plugin is a ground-up redesign for iOS development automation in Claude Code. This specification suite provides complete technical documentation for implementation.

**Core Principles:**
- Token efficiency first (3-5k overhead vs 30-50k)
- Semantic dispatchers over CRUD operations
- Progressive disclosure for all content
- File-based processing for large outputs
- Plugin-native distribution

## Specification Documents

This architecture is broken into focused documents for implementation:

### 1. [Repository Structure](./01-repository-structure.md)
Complete directory layout, file organization, and component relationships.

### 2. [MCP Server Architecture](./02-mcp-server-architecture.md)
Three consolidated dispatchers, file-based processing, resource catalog.

### 3. [Tool Specifications](./03-tool-specifications.md)
Detailed schemas, operations, and examples for each dispatcher.

### 4. [Skills Architecture](./04-skills-architecture.md)
Five procedural Skills with activation conditions and script implementations.

### 5. [Plugin Manifest](./05-plugin-manifest.md)
Complete plugin.json with MCP servers, Skills, commands, hooks, and settings.

### 6. [Slash Commands](./06-slash-commands.md)
Four slash command implementations with workflow orchestration.

### 7. [File Processing System](./07-file-processing-system.md)
Large output handling, summary generation, and cache integration.

### 8. [Testing Strategy](./08-testing-strategy.md)
Unit tests, integration tests, and token efficiency validation.

### 9. [Documentation Plan](./09-documentation-plan.md)
User documentation, API references, and example workflows.

### 10. [Implementation Roadmap](./10-implementation-roadmap.md)
Six-week phased rollout with success metrics and milestones.

## Quick Start for Agents

Each specification document is designed to be independently actionable:

1. **Read the relevant spec** - Each doc is self-contained with context
2. **Check dependencies** - Prerequisites listed at document start
3. **Follow the structure** - Code examples and file layouts provided
4. **Validate requirements** - Success criteria defined
5. **Reference examples** - Real-world patterns included

## Key Architectural Decisions

### Why 3 Dispatchers Instead of 52 Tools?

**Token efficiency**: 52 tool schemas = 30-50k tokens. 3 dispatchers = 3-5k tokens. This recovers 25-45k tokens (12-22% of context window).

**Semantic organization**: Operations grouped by domain (build, simulator, advanced) instead of granular CRUD operations.

**Choice reduction**: Agents face 3 high-level operations instead of 52 similar-sounding tools, reducing confusion.

### Why Skills for Procedural Knowledge?

**Progressive loading**: Skills load 30-50 tokens at startup, full content on-demand. Unbounded documentation without context penalty.

**Executable scripts**: Include automation directly in Skills without loading code into context until execution.

**Separation of concerns**: MCP handles runtime operations, Skills teach workflows and patterns.

### Why Plugin Packaging?

**Single installation**: One command installs MCP server, Skills, commands, and hooks.

**Marketplace distribution**: Discoverable through Claude Code ecosystem.

**Team standardization**: Consistent setup across developers.

## Token Efficiency Analysis

### Startup Overhead Comparison

**xc-mcp v1 (52 tools)**:
- Tool schemas: 30-50k tokens
- Startup total: 30-50k tokens
- Percentage of 200k context: 15-25%

**xc-plugin v2 (3 dispatchers + 5 Skills)**:
- Tool schemas: 2.5-3k tokens
- Skill metadata: 150-250 tokens
- Resource catalog: 500 tokens
- Startup total: 3-5k tokens
- Percentage of 200k context: 1.5-2.5%

**Recovery**: 25-45k tokens = 12-22% of context window

### Runtime Efficiency

**File-based processing**:
- Before: 10k token response in context
- After: 300 token summary + file path
- Savings: 97% per large operation

**Progressive disclosure**:
- Skills: Full content (5-10k tokens) loaded only when triggered
- Resources: Documentation loaded only when queried
- Cache: Results retrieved by ID, not full content

## Technology Stack

### MCP Server
- **Language**: TypeScript
- **Framework**: @modelcontextprotocol/sdk
- **Runtime**: Node.js 18+
- **Build**: tsc with ES2022 target

### Skills
- **Format**: Markdown + YAML frontmatter
- **Scripts**: Python 3.10+ and Bash
- **Activation**: Keyword/pattern matching

### Plugin
- **Manifest**: JSON with Claude-specific schema
- **Distribution**: Git repository + npm package
- **Requirements**: macOS 13+, Xcode 15+

## Dependencies

### Required
- Xcode 15.0+ (command line tools)
- Node.js 18+
- Python 3.10+
- macOS 13.0+

### Optional
- IDB (Facebook iOS Dev Bridge) for advanced debugging
- ios-deploy for device operations
- xcpretty for build log formatting

## Success Criteria

### Technical
- [ ] <5k token startup overhead
- [ ] <100ms response time for local operations
- [ ] 97%+ token reduction for large outputs
- [ ] >80% test coverage

### User Experience
- [ ] Single-command installation
- [ ] Zero-config for common workflows
- [ ] Clear error messages
- [ ] Comprehensive documentation

### Adoption
- [ ] 100+ GitHub stars in month 1
- [ ] Featured in Claude Code marketplace
- [ ] 10+ community contributions
- [ ] Production use by 5+ teams

## Implementation Phases

### Phase 1: Foundation (Weeks 1-2)
MCP server with 3 dispatchers, file processing, resource catalog, basic tests.

### Phase 2: Skills (Weeks 3-4)
Five procedural Skills with YAML frontmatter, SKILL.md content, and Python scripts.

### Phase 3: Plugin (Week 5)
Plugin manifest, slash commands, lifecycle hooks, integration tests.

### Phase 4: Release (Week 6)
Documentation, examples, marketplace submission, community announcement.

## Getting Started

1. **Read specs in order** - Follow the numbering for logical progression
2. **Set up development environment** - See requirements above
3. **Implement by phase** - Don't jump ahead; validate each phase
4. **Test continuously** - Token efficiency tests from day one
5. **Document as you go** - Update specs with implementation learnings

## Questions or Issues?

Each specification document includes:
- **Context**: Why this component exists
- **Requirements**: What it must accomplish
- **Examples**: Reference implementations
- **Validation**: How to verify correctness

If ambiguity exists, refer to:
- Original xc-mcp v1 for operational behavior
- ios-simulator-skill for accessibility patterns
- Anthropic's MCP documentation for protocol details
- Claude Code plugin reference for integration

## License

MIT License - See [LICENSE] for details

## Acknowledgments

Built on learnings from:
- xc-mcp v1 (52-tool architecture and progressive disclosure)
- ios-simulator-skill (accessibility-first navigation)
- Claude Code ecosystem (Plugin architecture and Skills framework)
- Community feedback (token efficiency priorities)

---

**Next Steps**: Start with [01-repository-structure.md](./01-repository-structure.md) to establish the project foundation.
