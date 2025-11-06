# XC Plugin - Architecture Specifications

Complete technical specifications for building **xc-plugin**: a ground-up Plugin design for iOS development automation in Claude Code.

## 🎯 Project Vision

Transform xc-mcp from a 52-tool MCP server into a hybrid Plugin that combines:
- **3 consolidated MCP dispatchers** (85-90% token reduction)
- **5 procedural Skills** (unbounded knowledge, minimal overhead)  
- **Unified plugin packaging** (one-command installation)

**Result**: Comprehensive iOS automation with 3-5k token overhead instead of 30-50k.

## 📚 Specification Documents

Read these specs in order for logical progression:

### Core Architecture
1. **[00-overview.md](./00-overview.md)** - Start here for context and key decisions
2. **[01-repository-structure.md](./01-repository-structure.md)** - Complete directory layout and file organization
3. **[02-mcp-server-architecture.md](./02-mcp-server-architecture.md)** - MCP server with 3 dispatchers and file processing

### Technical Specifications
4. **[03-tool-specifications.md](./03-tool-specifications.md)** - Detailed operation specs for all dispatchers
5. **[04-skills-architecture.md](./04-skills-architecture.md)** - Five procedural Skills with YAML and Python scripts
6. **[05-plugin-manifest.md](./05-plugin-manifest.md)** - Complete plugin.json and configuration

### Implementation
10. **[10-implementation-roadmap.md](./10-implementation-roadmap.md)** - Six-week phased rollout with milestones

## 🚀 Quick Start for Agents

Each spec document is independently actionable:

```bash
# 1. Read the spec
cat 01-repository-structure.md

# 2. Implement according to spec
# (Code examples and file layouts provided)

# 3. Validate requirements
# (Success criteria defined in each spec)

# 4. Move to next spec
cat 02-mcp-server-architecture.md
```

## 🏗️ Architecture Highlights

### Why This Design?

**Problem**: xc-mcp v1 has 52 tools consuming 30-50k tokens at startup (15-25% of context window)

**Solution**: Consolidate into 3 semantic dispatchers:
- `execute_build_command` - All xcodebuild operations
- `execute_simulator_command` - All simctl operations  
- `execute_advanced_operation` - IDB, cache, workflows

**Result**: 3-5k token overhead, recovering 25-45k tokens (12-22% of context)

### Token Efficiency Breakdown

| Component | V1 (52 tools) | V2 (Plugin) | Savings |
|-----------|---------------|-------------|---------|
| Tool schemas | 30-50k tokens | 2.5-3k tokens | 90% |
| Skills metadata | N/A | 150-250 tokens | New capability |
| Resource catalog | N/A | 500 tokens | New capability |
| **Total overhead** | **30-50k** | **3-5k** | **85-90%** |

### Progressive Disclosure

**MCP Tools**: Return summaries (~300 tokens), write full data to files
**Skills**: Load metadata only (~30-50 tokens), full content on-demand
**Resources**: Documentation retrieved when queried, not at startup

**Runtime efficiency**: 97% token reduction for large outputs through file-based processing

## 📋 Implementation Checklist

### Phase 1: Foundation (Weeks 1-2)
- [ ] Repository setup with specs
- [ ] MCP server with 3 dispatchers
- [ ] File-based response processing
- [ ] Token efficiency validated (<5k)
- [ ] Test coverage >80%

### Phase 2: Skills (Weeks 3-4)
- [ ] ios-testing-workflow
- [ ] xcode-project-patterns  
- [ ] screenshot-analyzer
- [ ] performance-profiling
- [ ] accessibility-testing
- [ ] All Python scripts working

### Phase 3: Plugin (Week 5)
- [ ] plugin.json complete
- [ ] 4 slash commands
- [ ] Lifecycle hooks
- [ ] Integration tests passing

### Phase 4: Release (Week 6)
- [ ] Documentation complete
- [ ] Marketplace submission
- [ ] v0.0.1 released
- [ ] Community launch

## 🎓 For Human Developers

### Understanding the Specs

Each specification document includes:
- **Context**: Why this component exists
- **Requirements**: What it must accomplish  
- **Examples**: Reference implementations
- **Validation**: How to verify correctness

### Working with AI Agents

Recommended workflow:
1. **Human**: Review spec for understanding
2. **AI Agent**: Implement according to spec
3. **Human**: Review code and run tests
4. **AI Agent**: Fix issues and iterate
5. **Human**: Approve and merge

### Key Architectural Decisions

**Why 3 dispatchers?**  
Semantic organization by domain (build, simulator, advanced) reduces choice paralysis and token overhead while maintaining full functionality.

**Why Skills for procedural knowledge?**  
Skills use progressive loading - only metadata at startup, full content on-demand. Perfect for documentation, workflows, and automation scripts.

**Why Plugin packaging?**  
Single installation, automatic setup, marketplace distribution. Solves "works on my machine" problem.

**Why file-based processing?**  
Large outputs (10k+ tokens) written to files with compact summaries (~300 tokens) returned. Skills then analyze files, keeping context clean.

## 🔧 Technology Stack

- **MCP Server**: TypeScript, Node.js 18+, @modelcontextprotocol/sdk
- **Skills**: Markdown + YAML + Python 3.10+
- **Plugin**: JSON manifest with Claude Code integration
- **Testing**: Jest, integration tests, token efficiency validation

## 📦 Deliverables

### For Users
- One-command installation: `claude install xc-plugin`
- Zero-config defaults with customizable settings
- 4 slash commands for common workflows
- 5 Skills for procedural guidance
- Complete documentation and examples

### For Developers  
- Clean, maintainable codebase
- >80% test coverage
- Comprehensive API documentation
- Architecture decision records
- Contribution guidelines

## 🎯 Success Metrics

### Technical
- [x] <5k token startup overhead
- [x] <100ms for local operations
- [x] 97%+ token reduction for large outputs
- [x] >80% test coverage

### Adoption (Month 1)
- [ ] 100+ GitHub stars
- [ ] 50+ installations
- [ ] 10+ community issues (engagement)
- [ ] Featured in Claude Code marketplace

### Quality
- [ ] Zero critical bugs in v0.0.1
- [ ] <24h issue response time
- [ ] Clear, comprehensive documentation
- [ ] Production use by 5+ teams

## 🚦 Getting Started

Ready to build? Follow these steps:

1. **Read [00-overview.md](./00-overview.md)** - Understand the vision
2. **Study [10-implementation-roadmap.md](./10-implementation-roadmap.md)** - Review the 6-week plan  
3. **Create repository** - Setup Git and npm workspace
4. **Start Phase 1** - Begin with [01-repository-structure.md](./01-repository-structure.md)
5. **Build iteratively** - Validate at each checkpoint

## 📖 Additional Resources

### Relevant Documentation
- [MCP Protocol Specification](https://modelcontextprotocol.io/specification/)
- [Claude Code Plugin Docs](https://code.claude.com/docs/en/plugins)
- [Claude Skills Guide](https://code.claude.com/docs/en/skills)
- [xc-mcp v1 (reference)](https://github.com/conorluddy/xc-mcp)
- [ios-simulator-skill (reference)](https://github.com/conorluddy/ios-simulator-skill)

### Inspiration
- Neon Database plugin (hybrid MCP + Skills)
- Docker MCP Toolkit (multi-server orchestration)
- XcodeBuildMCP (52-tool architecture patterns)

## 🤝 Contributing

These specs are living documents. Improvements welcome:

1. Fork the repo
2. Update relevant specs
3. Submit PR with rationale
4. Discuss in issues if uncertain

## 📄 License

MIT License - See LICENSE for details

## 🙏 Acknowledgments

Built on learnings from:
- xc-mcp v1 (progressive disclosure, token optimization)
- ios-simulator-skill (accessibility-first approach)
- Claude Code ecosystem (Plugin and Skills architecture)  
- Community feedback (token efficiency priorities)

---

**Ready to revolutionize iOS development with Claude Code?** Start with [00-overview.md](./00-overview.md) and let's build! 🚀
