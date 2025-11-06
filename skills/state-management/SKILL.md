---
name: state-management
description: Cache management, configuration best practices, and progressive disclosure patterns for efficient context window usage. Use when working with large responses, optimizing token costs, or managing plugin state across operations.
version: 0.0.1
token_cost: ~40
---

# State Management Skill

**Optimizing token efficiency and state management in xc-plugin**

## Overview

The xc-plugin implements sophisticated state management through caching, progressive disclosure, and configuration management. This Skill teaches how to leverage these patterns to minimize token usage, improve performance, and maintain clean state across operations.

**Key Benefits:**
- **85-90% token reduction** through progressive disclosure
- **Cache-friendly operations** avoid redundant work
- **Deterministic state** ensures reliable test results
- **Configuration consistency** across development workflows

## When to Use This Skill

Use this Skill when you need to:

1. **Optimize Token Usage**
   - Working with large device lists or build logs
   - Reducing context window consumption
   - Implementing efficient query patterns

2. **Manage Cache State**
   - Understanding when responses are cached
   - Invalidating stale cache entries
   - Querying cached data efficiently

3. **Handle Configuration**
   - Setting up consistent build environments
   - Managing simulator preferences
   - Configuring test execution parameters

4. **Design Efficient Workflows**
   - Implementing progressive disclosure patterns
   - Avoiding expensive repeated operations
   - Building cache-aware automation

## Key Concepts

### Progressive Disclosure Pattern

**Principle:** Show essentials first, provide details on-demand.

Instead of returning massive datasets that consume tokens, xc-plugin returns:
1. **Summary** - Key metrics and booted devices (~100 tokens)
2. **cache_id** - Reference to full dataset
3. **Follow-up query** - Retrieve complete details only if needed

**Token Efficiency:**
```
Traditional approach: 2000 tokens (full device list)
Progressive disclosure: 100 tokens (summary) + optional 2000 tokens (details)
Average savings: 95% (most queries don't need full details)
```

### Cache Architecture

The plugin uses deterministic caching for expensive operations:

**Cache Key Generation:**
- SHA-256 hash of operation + parameters
- First 16 characters used as `cache_id`
- Deterministic: Same input → Same cache_id

**Cache Storage:**
- In-memory for current session
- Optional disk persistence
- Automatic expiration (configurable TTL)

**Cache-Friendly Operations:**
- `list` operations (device lists, app lists)
- `build` operations (build logs, test results)
- `describe` operations (accessibility trees)

### Response Types

**SuccessResult with Progressive Disclosure:**
```typescript
{
  success: true,
  data: {
    summary: "31 devices available, 1 booted",
    booted_devices: [...],
    cache_id: "a1b2c3d4e5f6g7h8"
  },
  summary: "Device list retrieved successfully"
}
```

**Follow-up Query Pattern:**
```typescript
{
  operation: "get-details",
  cache_id: "a1b2c3d4e5f6g7h8",
  detail_type: "full-list"
}
```

## Workflows

### Workflow 1: Cache-Aware Device Listing

**Initial Query (Token-Efficient):**
```json
{
  "operation": "list",
  "parameters": {
    "concise": true
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "summary": {
      "total_devices": 47,
      "available_devices": 31,
      "booted_devices": 1
    },
    "booted": [
      {
        "name": "iPhone 15",
        "udid": "ABC123...",
        "state": "Booted",
        "runtime": "iOS 17.0"
      }
    ],
    "cache_id": "sim-list-xyz789"
  }
}
```

**Follow-Up (Only If Needed):**
```json
{
  "operation": "get-details",
  "cache_id": "sim-list-xyz789",
  "detail_type": "full-list"
}
```

**Token Analysis:**
- Initial query: ~150 tokens
- Follow-up (if needed): ~2000 tokens
- Traditional approach: ~2000 tokens always
- **Savings: 92% when details not needed**

### Workflow 2: Build Cache Management

**Build Operation:**
```json
{
  "operation": "build",
  "scheme": "MyApp",
  "configuration": "Debug",
  "output_format": "summary"
}
```

**Response with Cache:**
```json
{
  "success": true,
  "data": {
    "message": "Build succeeded",
    "build_time": "45.2s",
    "warnings": 3,
    "cache_id": "build-abc123"
  },
  "summary": "Build completed successfully with 3 warnings"
}
```

**Retrieve Full Logs:**
```json
{
  "operation": "get-details",
  "cache_id": "build-abc123",
  "detail_type": "full-log"
}
```

**Cache Invalidation Scenarios:**
- Source code changes
- Scheme configuration changes
- Clean operation executed
- Manual cache clear

### Workflow 3: Configuration State Management

**Query Current Configuration:**
```json
{
  "operation": "cache",
  "sub_operation": "get-config"
}
```

**Response:**
```json
{
  "cache_enabled": true,
  "cache_ttl": 3600,
  "max_cache_size": 100,
  "persistence_enabled": false
}
```

**Update Configuration:**
```json
{
  "operation": "cache",
  "sub_operation": "set-config",
  "parameters": {
    "cache_ttl": 7200,
    "persistence_enabled": true
  }
}
```

### Workflow 4: State Cleanup Between Tests

**Pattern for Clean Test State:**

```
1. cache (clear: "all") → Remove all cached data
2. device-lifecycle (erase) → Reset simulator state
3. app-lifecycle (uninstall) → Remove app
4. app-lifecycle (install) → Fresh install
5. app-lifecycle (launch) → Start with clean state
6. (run tests) → Execute test suite
7. cache (clear: "response") → Clean response cache
```

**Why This Matters:**
- Eliminates test interdependencies
- Prevents cache poisoning
- Ensures reproducible results
- Catches state-dependent bugs

## Progressive Disclosure Pattern

### Pattern Structure

**Level 1: Summary (Always Returned)**
```json
{
  "summary": {
    "key_metric_1": "value",
    "key_metric_2": "value",
    "action_taken": "description"
  },
  "cache_id": "unique-identifier",
  "next_steps": [
    "Suggested action 1",
    "Suggested action 2"
  ]
}
```

**Level 2: Detailed Query (On-Demand)**
```json
{
  "operation": "get-details",
  "cache_id": "unique-identifier",
  "detail_type": "full-data|errors-only|warnings-only|metadata"
}
```

### When to Use Progressive Disclosure

**Always Use For:**
- Device lists (>5 devices)
- Build logs (>100 lines)
- Test results (>10 tests)
- Accessibility trees (>20 elements)
- App lists (>10 apps)

**Skip For:**
- Single device operations
- Error messages
- Quick status checks
- Configuration queries

### Example: Test Results

**Summary Response:**
```json
{
  "success": false,
  "data": {
    "tests_run": 45,
    "tests_passed": 43,
    "tests_failed": 2,
    "failed_tests": [
      "MyAppTests.LoginTests.testInvalidPassword",
      "MyAppTests.LoginTests.testEmptyCredentials"
    ],
    "cache_id": "test-run-def456"
  }
}
```

**Full Details Query:**
```json
{
  "operation": "get-details",
  "cache_id": "test-run-def456",
  "detail_type": "full-log"
}
```

**Token Efficiency:**
- Summary: ~200 tokens
- Full log: ~3000 tokens
- **Savings: 93% for typical success cases**

## Caching Strategies

### Cache-Friendly Operations

**High Cache Value (Long TTL):**
- `list` operations (device list changes infrequently)
- `version` operations (Xcode version is stable)
- `show-build-settings` (project config changes rarely)

**Moderate Cache Value (Medium TTL):**
- `build` operations (results valid until code changes)
- `test` operations (results valid until code/tests change)
- `describe` operations (UI state changes moderately)

**Low Cache Value (Short TTL):**
- `device-lifecycle` (device state changes frequently)
- `app-lifecycle` (app state is dynamic)
- `input/tap` operations (UI interactions modify state)

### Cache TTL Guidelines

```typescript
// Recommended TTL values
{
  simulator_list: 1800,      // 30 minutes
  device_state: 60,          // 1 minute
  build_results: 3600,       // 1 hour
  test_results: 3600,        // 1 hour
  xcode_version: 86400,      // 24 hours
  project_schemes: 3600,     // 1 hour
  accessibility_tree: 10     // 10 seconds
}
```

### Cache Invalidation Triggers

**Automatic Invalidation:**
- TTL expiration
- Memory pressure (LRU eviction)
- Conflicting operation (e.g., `clean` invalidates `build` cache)

**Manual Invalidation:**
```json
{
  "operation": "cache",
  "sub_operation": "clear",
  "parameters": {
    "cache_type": "simulator|project|response|all"
  }
}
```

**Smart Invalidation:**
- File modification detection (build cache)
- State change detection (device cache)
- Operation sequence analysis (test cache)

### Memory vs Disk Caching

**In-Memory Cache (Default):**
- **Pros:** Fast access, no I/O overhead
- **Cons:** Lost on process restart
- **Use For:** Session-scoped data, frequently accessed data

**Disk Cache (Optional):**
- **Pros:** Persists across restarts, larger capacity
- **Cons:** I/O overhead, synchronization complexity
- **Use For:** Build artifacts, test results, expensive queries

**Enable Disk Persistence:**
```json
{
  "operation": "persistence",
  "sub_operation": "enable",
  "parameters": {
    "cache_dir": "/tmp/xc-cache"
  }
}
```

## Configuration Management

### Xcode Preferences

**Query Build Settings:**
```json
{
  "operation": "show-build-settings",
  "scheme": "MyApp",
  "configuration": "Debug"
}
```

**Common Settings to Cache:**
- `PRODUCT_BUNDLE_IDENTIFIER`
- `DEVELOPMENT_TEAM`
- `CODE_SIGN_IDENTITY`
- `SDKROOT`
- `ARCHS`

**Use Case:**
- Validate configuration consistency
- Debug build issues
- Generate documentation
- Audit security settings

### Simulator Settings

**Query Simulator Configuration:**
```json
{
  "operation": "list",
  "parameters": {
    "runtime": "iOS 17.0",
    "device_type": "iPhone"
  }
}
```

**Persist Simulator State:**
- Boot order (preferred device)
- Location simulation settings
- Accessibility preferences
- Network conditions

### Build Configurations

**Debug vs Release Configuration:**

**Debug:**
```json
{
  "configuration": "Debug",
  "options": {
    "parallel": true,
    "quiet": false
  }
}
```
- Optimizations: Off
- Symbols: Included
- Token Impact: Verbose logs (~2000 tokens)
- Cache Strategy: Short TTL (code changes frequently)

**Release:**
```json
{
  "configuration": "Release",
  "options": {
    "parallel": true,
    "quiet": true
  }
}
```
- Optimizations: On
- Symbols: Optional
- Token Impact: Quiet logs (~300 tokens)
- Cache Strategy: Long TTL (less frequent)

### Environment Variables

**Set Test Environment:**
```json
{
  "operation": "app-lifecycle",
  "sub_operation": "launch",
  "device_id": "iPhone 15",
  "app_identifier": "com.example.MyApp",
  "parameters": {
    "environment": {
      "API_URL": "https://staging.example.com",
      "MOCK_DATA": "true",
      "LOG_LEVEL": "debug"
    }
  }
}
```

**Common Environment Variables:**
- `API_URL` - Backend endpoint
- `FEATURE_FLAGS` - Enable/disable features
- `TEST_MODE` - Testing-specific behavior
- `LOG_LEVEL` - Logging verbosity

## Best Practices

### 1. Minimize Context Window Usage

**Use Progressive Disclosure:**
```json
// Good: Request summary first
{
  "operation": "list",
  "parameters": { "concise": true }
}

// Then query details only if needed
{
  "operation": "get-details",
  "cache_id": "sim-list-xyz"
}
```

**Avoid Verbose Operations:**
```json
// Bad: Always verbose
{
  "operation": "build",
  "options": { "verbose": true }
}

// Good: Quiet by default, verbose on errors
{
  "operation": "build",
  "options": { "quiet": true }
}
```

### 2. Cache Expensive Operations

**Identify Expensive Operations:**
- `build` (20-120 seconds)
- `test` (10-300 seconds)
- `list` with large device sets (1-5 seconds)
- `describe` with complex UI (0.5-2 seconds)

**Cache Strategy:**
```json
// First call: Execute and cache
{
  "operation": "list"
}
// Response includes cache_id

// Subsequent calls: Use cached data
{
  "operation": "get-details",
  "cache_id": "previous-cache-id"
}
```

### 3. Clear State Between Test Runs

**Clean State Pattern:**
```
1. Cache clear (all)
2. Simulator erase
3. App uninstall
4. Fresh app install
5. Launch with test environment
6. Run tests
7. Cache clear (response)
```

**Why Each Step:**
- **Cache clear:** No stale data influencing tests
- **Simulator erase:** Clean device state
- **App uninstall:** Remove app data/preferences
- **Fresh install:** Simulate first-time user
- **Test environment:** Consistent configuration
- **Response cache clear:** Clean logs for next run

### 4. Handle Stale Cache Gracefully

**Detect Stale Cache:**
```typescript
// Check cache timestamp
if (cache_age > ttl) {
  invalidateCache(cache_id);
  refetch();
}
```

**Recovery Strategy:**
```json
// If cache miss or stale:
{
  "operation": "original-operation",
  // Original parameters
}
// Plugin automatically refreshes cache
```

**User Pattern:**
- Try cached query first
- If data seems stale, force refresh
- Update cache with new results

### 5. Token Efficiency Metrics

**Track Token Usage:**
```
Summary responses: ~100-300 tokens
Full responses: ~1000-5000 tokens
Progressive disclosure savings: 80-95%
```

**Optimization Checklist:**
- [ ] Use `concise: true` for list operations
- [ ] Request `summary` output format for builds
- [ ] Query cache_id before full details
- [ ] Use `quiet: true` for non-debug builds
- [ ] Enable response caching for repeated queries

### 6. Configuration File Examples

**Build Configuration:**
```json
{
  "scheme": "MyApp",
  "configurations": {
    "debug": {
      "configuration": "Debug",
      "destination": "platform=iOS Simulator,name=iPhone 15",
      "cache_strategy": "short_ttl",
      "output_format": "summary"
    },
    "release": {
      "configuration": "Release",
      "destination": "generic/platform=iOS",
      "cache_strategy": "long_ttl",
      "output_format": "detailed"
    }
  }
}
```

**Test Configuration:**
```json
{
  "test_scheme": "MyAppTests",
  "test_devices": [
    "iPhone 15",
    "iPad Pro (12.9-inch)"
  ],
  "clean_state": true,
  "cache_results": true,
  "parallel_execution": false,
  "environment": {
    "TEST_MODE": "true",
    "MOCK_NETWORK": "true"
  }
}
```

**Cache Configuration:**
```json
{
  "cache": {
    "enabled": true,
    "ttl": {
      "simulator_list": 1800,
      "build_results": 3600,
      "test_results": 3600,
      "device_state": 60
    },
    "persistence": {
      "enabled": true,
      "path": "/tmp/xc-cache",
      "max_size_mb": 500
    },
    "invalidation": {
      "auto_invalidate_on_build": true,
      "auto_invalidate_on_test": false
    }
  }
}
```

## Integration with MCP Tools

This Skill applies to all xc-plugin MCP tools:

**Cache-Aware Tools:**
- `xcodebuild-list` - Returns cache_id for project data
- `xcodebuild-build` - Returns cache_id for build logs
- `xcodebuild-test` - Returns cache_id for test results
- `simctl-list` - Returns cache_id for device lists
- `idb-ui-describe` - Returns cache_id for UI trees

**Cache Management Tools:**
- `xcodebuild-get-details` - Query cached build data
- `simctl-get-details` - Query cached simulator data
- `cache` - Manage cache configuration
- `persistence` - Configure disk caching

## Related Skills

- **simulator-workflows**: Device management operations
- **xcode-workflows**: Build system operations
- **ui-automation-workflows**: Accessibility tree caching
- **ios-testing-patterns**: Test state management

## Related Resources

- `xc://reference/cache-architecture` - Cache implementation details
- `xc://reference/token-optimization` - Token efficiency guide
- `xc://workflows/progressive-disclosure` - Pattern documentation
- `xc://reference/configuration` - Configuration reference

---

**Remember: Progressive disclosure first, full details only when needed. Cache expensive operations. Clear state between tests. 85-90% token savings are achievable with proper state management.**
