# XC Plugin Specs - Navigation Index

Quick reference for all specification documents.

## 📖 Read in This Order

1. [README.md](./README.md) - Start here for project overview
2. [SUMMARY.md](./SUMMARY.md) - How to use these specs effectively
3. [00-overview.md](./00-overview.md) - Architecture vision and key decisions
4. [01-repository-structure.md](./01-repository-structure.md) - Complete file tree
5. [02-mcp-server-architecture.md](./02-mcp-server-architecture.md) - MCP implementation
6. [03-tool-specifications.md](./03-tool-specifications.md) - Operation details
7. [04-skills-architecture.md](./04-skills-architecture.md) - Skills structure
8. [05-plugin-manifest.md](./05-plugin-manifest.md) - Plugin configuration
9. [10-implementation-roadmap.md](./10-implementation-roadmap.md) - 6-week timeline

## 🎯 Quick Links by Topic

### Architecture & Design
- [Why 3 dispatchers?](./00-overview.md#key-architectural-decisions)
- [Token efficiency analysis](./00-overview.md#token-efficiency-analysis)
- [Skills vs MCP decision](./00-overview.md#the-skills-provide-unbounded-procedural-knowledge)

### Implementation
- [Repository structure](./01-repository-structure.md)
- [Dispatcher code](./02-mcp-server-architecture.md)
- [File processing](./02-mcp-server-architecture.md#file-processing-system)

### Tools & Operations
- [Build operations](./03-tool-specifications.md#tool-1-execute_build_command)
- [Simulator operations](./03-tool-specifications.md#tool-2-execute_simulator_command)
- [Advanced operations](./03-tool-specifications.md#tool-3-execute_advanced_operation)

### Skills
- [Skills overview](./04-skills-architecture.md)
- [Testing workflow](./04-skills-architecture.md#skill-1-ios-testing-workflow)
- [Project patterns](./04-skills-architecture.md#skill-2-xcode-project-patterns)

### Configuration
- [plugin.json](./05-plugin-manifest.md#complete-pluginjson)
- [Environment variables](./05-plugin-manifest.md#environment-variables)
- [Settings](./05-plugin-manifest.md#configuration)

### Timeline
- [Phase 1: Foundation](./10-implementation-roadmap.md#phase-1-foundation-weeks-1-2)
- [Phase 2: Skills](./10-implementation-roadmap.md#phase-2-skills-weeks-3-4)
- [Phase 3: Plugin](./10-implementation-roadmap.md#phase-3-plugin-week-5)
- [Phase 4: Release](./10-implementation-roadmap.md#phase-4-release-week-6)

## 📊 Specs by Size

| Spec | Lines | Focus |
|------|-------|-------|
| 02-mcp-server-architecture.md | ~800 | Most detailed - MCP server code |
| 04-skills-architecture.md | ~750 | Complete Skills templates |
| 01-repository-structure.md | ~450 | File organization |
| 03-tool-specifications.md | ~450 | Operation parameters |
| 10-implementation-roadmap.md | ~400 | Timeline and tasks |
| 05-plugin-manifest.md | ~250 | Configuration |
| 00-overview.md | ~200 | High-level vision |
| README.md | ~200 | Entry point |
| SUMMARY.md | ~150 | How to use specs |

## 🔍 Find Specific Content

### Code Examples
- TypeScript dispatcher: [02-mcp-server-architecture.md](./02-mcp-server-architecture.md)
- Python scripts: [04-skills-architecture.md](./04-skills-architecture.md)
- JSON config: [05-plugin-manifest.md](./05-plugin-manifest.md)

### Templates
- skill.yaml: [04-skills-architecture.md](./04-skills-architecture.md#skillyaml-format)
- SKILL.md: [04-skills-architecture.md](./04-skills-architecture.md#skillmd-format)
- package.json: [01-repository-structure.md](./01-repository-structure.md#key-files-description)

### Workflows
- Complete test suite: [03-tool-specifications.md](./03-tool-specifications.md#workflow-category-operations)
- Build and deploy: [03-tool-specifications.md](./03-tool-specifications.md#build-and-deploy)
- Crash debugging: [10-implementation-roadmap.md](./10-implementation-roadmap.md)

## ✅ Implementation Checklist

Track your progress:

- [ ] Read README.md and SUMMARY.md
- [ ] Review 00-overview.md
- [ ] Study 10-implementation-roadmap.md
- [ ] Create repository structure (01)
- [ ] Implement MCP server (02)
- [ ] Add tool operations (03)
- [ ] Create Skills (04)
- [ ] Build plugin package (05)
- [ ] Complete Phase 1 validation
- [ ] Complete Phase 2 validation
- [ ] Complete Phase 3 validation
- [ ] Launch v2.0.0

## 📦 Total Content

- **9 documents** (including this index)
- **~4,800 lines** of specifications
- **~125KB** of detailed technical content
- **Complete architecture** for 6-week implementation

---

**Start here**: [README.md](./README.md) → [SUMMARY.md](./SUMMARY.md) → [00-overview.md](./00-overview.md)
