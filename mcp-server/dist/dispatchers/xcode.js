/**
 * Xcode Dispatcher
 *
 * Consolidates all xcodebuild operations into a single tool.
 * Token cost: ~400 tokens (vs ~4k for 7 separate tools)
 *
 * Operations: build, clean, test, list, version
 */
import { BaseDispatcher } from './base.js';
import { logger } from '../utils/logger.js';
export class XcodeDispatcher extends BaseDispatcher {
    getToolDefinition() {
        return {
            name: 'execute_xcode_command',
            description: 'Execute Xcode build system operations. Use xcode-workflows Skill for guidance on when/how to use operations.',
            inputSchema: {
                type: 'object',
                properties: {
                    operation: {
                        type: 'string',
                        enum: ['build', 'clean', 'test', 'list', 'version'],
                        description: 'Operation: build (compile project), clean (remove artifacts), test (run tests), list (show schemes/targets), version (Xcode info)',
                    },
                    project_path: {
                        type: 'string',
                        description: 'Path to .xcodeproj or .xcworkspace (auto-detected if omitted)',
                    },
                    scheme: {
                        type: 'string',
                        description: 'Scheme name (required for build/test)',
                    },
                    configuration: {
                        type: 'string',
                        enum: ['Debug', 'Release'],
                        description: 'Build configuration (default: Debug)',
                    },
                    destination: {
                        type: 'string',
                        description: 'Build destination, e.g. "platform=iOS Simulator,name=iPhone 15"',
                    },
                    options: {
                        type: 'object',
                        description: 'Additional options (clean_before_build, parallel, quiet, sdk, arch, etc.)',
                    },
                },
                required: ['operation'],
            },
        };
    }
    async execute(args) {
        const { operation, project_path, scheme, configuration, destination, options } = args;
        logger.info(`Executing xcode operation: ${operation}`);
        try {
            switch (operation) {
                case 'build':
                    if (!scheme) {
                        return this.formatError('scheme required for build', operation);
                    }
                    return await this.executeBuild({
                        project_path,
                        scheme,
                        configuration: configuration || 'Debug',
                        destination,
                        options,
                    });
                case 'clean':
                    return await this.executeClean({ project_path, scheme });
                case 'test':
                    if (!scheme) {
                        return this.formatError('scheme required for test', operation);
                    }
                    return await this.executeTest({
                        project_path,
                        scheme,
                        destination,
                        options: options,
                    });
                case 'list':
                    return await this.executeList({ project_path });
                case 'version':
                    return await this.executeVersion();
                default:
                    return this.formatError(`Unknown operation: ${operation}`, operation);
            }
        }
        catch (error) {
            logger.error(`Xcode operation failed: ${operation}`, error);
            return this.formatError(error, operation);
        }
    }
    async executeBuild(params) {
        try {
            const { runCommand, findXcodeProject } = await import('../utils/command.js');
            const { ResponseCache } = await import('../state/response-cache.js');
            const projectPath = params.project_path || (await findXcodeProject());
            if (!projectPath) {
                return this.formatError('No Xcode project found', 'build');
            }
            // Build command args
            const args = [
                '-scheme',
                params.scheme || '',
                '-configuration',
                params.configuration || 'Debug',
            ];
            if (projectPath.endsWith('.xcworkspace')) {
                args.unshift('-workspace', projectPath);
            }
            else {
                args.unshift('-project', projectPath);
            }
            if (params.destination) {
                args.push('-destination', params.destination);
            }
            args.push('build');
            // Execute build
            const startTime = Date.now();
            const result = await runCommand('xcodebuild', args);
            const duration = ((Date.now() - startTime) / 1000).toFixed(1);
            // Cache full output for progressive disclosure
            const cache = new ResponseCache();
            const cacheId = cache.store({
                tool: 'xcode-build',
                fullOutput: result.stdout,
                stderr: result.stderr,
                exitCode: result.code,
                command: `xcodebuild ${args.join(' ')}`,
                metadata: {
                    projectPath,
                    scheme: params.scheme || '',
                    configuration: params.configuration || 'Debug',
                    destination: params.destination || null,
                    duration,
                    success: result.code === 0,
                },
            });
            // Return summary
            const data = {
                message: `Build ${result.code === 0 ? 'succeeded' : 'failed'} in ${duration}s`,
                note: `Use get-details with cache_id to see full output`,
                params: params,
            };
            const summary = `Build completed. cache_id: ${cacheId}`;
            return this.formatSuccess(data, summary);
        }
        catch (error) {
            logger.error('Build failed', error);
            return this.formatError(error, 'build');
        }
    }
    async executeClean(params) {
        try {
            const { runCommand, findXcodeProject } = await import('../utils/command.js');
            const projectPath = params.project_path || (await findXcodeProject());
            if (!projectPath) {
                return this.formatError('No Xcode project found', 'clean');
            }
            const args = [];
            if (projectPath.endsWith('.xcworkspace')) {
                args.push('-workspace', projectPath);
            }
            else {
                args.push('-project', projectPath);
            }
            if (params.scheme) {
                args.push('-scheme', params.scheme);
            }
            args.push('clean');
            const result = await runCommand('xcodebuild', args);
            const data = {
                message: 'Clean completed successfully',
                note: result.stdout.includes('CLEAN SUCCEEDED') ? 'Build artifacts removed' : undefined,
                params: params,
            };
            return this.formatSuccess(data);
        }
        catch (error) {
            logger.error('Clean operation failed', error);
            return this.formatError(error, 'clean');
        }
    }
    async executeTest(params) {
        try {
            const { runCommand, findXcodeProject } = await import('../utils/command.js');
            const { ResponseCache } = await import('../state/response-cache.js');
            const projectPath = params.project_path || (await findXcodeProject());
            if (!projectPath) {
                return this.formatError('No Xcode project found', 'test');
            }
            const args = ['-scheme', params.scheme || ''];
            if (projectPath.endsWith('.xcworkspace')) {
                args.unshift('-workspace', projectPath);
            }
            else {
                args.unshift('-project', projectPath);
            }
            if (params.destination) {
                args.push('-destination', params.destination);
            }
            // Add test options
            const testOpts = params.options;
            if (testOpts?.test_plan) {
                args.push('-testPlan', testOpts.test_plan);
            }
            if (testOpts?.only_testing) {
                testOpts.only_testing.forEach((test) => {
                    args.push('-only-testing', test);
                });
            }
            args.push('test');
            const startTime = Date.now();
            const result = await runCommand('xcodebuild', args);
            const duration = ((Date.now() - startTime) / 1000).toFixed(1);
            // Parse test results
            const output = result.stdout;
            const passedMatch = output.match(/Test Suite .* passed at .*/);
            const failedMatch = output.match(/(\d+) tests?, (\d+) failures?/);
            // Cache full output
            const cache = new ResponseCache();
            const cacheId = cache.store({
                tool: 'xcode-test',
                fullOutput: output,
                stderr: result.stderr,
                exitCode: result.code,
                command: `xcodebuild ${args.join(' ')}`,
                metadata: {
                    projectPath,
                    scheme: params.scheme || '',
                    destination: params.destination || null,
                    duration,
                    success: result.code === 0,
                },
            });
            const data = {
                message: passedMatch
                    ? `Tests passed in ${duration}s`
                    : failedMatch
                        ? `Tests completed: ${failedMatch[1]} tests, ${failedMatch[2]} failures`
                        : `Tests completed in ${duration}s`,
                params: params,
            };
            return this.formatSuccess(data, `Test results cached. cache_id: ${cacheId}`);
        }
        catch (error) {
            logger.error('Test execution failed', error);
            return this.formatError(error, 'test');
        }
    }
    async executeList(_params) {
        try {
            const { runCommand, findXcodeProject } = await import('../utils/command.js');
            // Auto-detect project if not specified
            const projectPath = _params.project_path || (await findXcodeProject());
            if (!projectPath) {
                return this.formatError('No Xcode project found', 'list');
            }
            // Execute xcodebuild -list
            const args = ['-list'];
            if (projectPath.endsWith('.xcworkspace')) {
                args.push('-workspace', projectPath);
            }
            else {
                args.push('-project', projectPath);
            }
            const result = await runCommand('xcodebuild', args);
            // Parse schemes and targets
            const output = result.stdout;
            const schemesMatch = output.match(/Schemes:\s*([\s\S]*?)(?=\n\n|Build Configurations:|$)/);
            const targetsMatch = output.match(/Targets:\s*([\s\S]*?)(?=\n\n|Build Configurations:|Schemes:|$)/);
            const schemes = schemesMatch
                ? schemesMatch[1]
                    .trim()
                    .split('\n')
                    .map((s) => s.trim())
                    .filter(Boolean)
                : [];
            const targets = targetsMatch
                ? targetsMatch[1]
                    .trim()
                    .split('\n')
                    .map((t) => t.trim())
                    .filter(Boolean)
                : [];
            const data = {
                schemes,
                targets,
                message: `Found ${schemes.length} schemes and ${targets.length} targets`,
            };
            return this.formatSuccess(data);
        }
        catch (error) {
            logger.error('List operation failed', error);
            return this.formatError(error, 'list');
        }
    }
    async executeVersion() {
        try {
            // Execute xcodebuild -version
            const { executeCommand } = await import('../utils/command.js');
            const result = await executeCommand('xcodebuild -version');
            // Parse version output
            const lines = result.stdout.trim().split('\n');
            const versionMatch = lines[0]?.match(/Xcode\s+([\d.]+)/);
            const buildMatch = lines[1]?.match(/Build\s+version\s+(.+)/);
            const data = {
                xcode_version: versionMatch ? versionMatch[1] : undefined,
                build_number: buildMatch ? buildMatch[1] : undefined,
                message: result.stdout.trim(),
            };
            return this.formatSuccess(data);
        }
        catch (error) {
            logger.error('Version check failed', error);
            return this.formatError(error, 'version');
        }
    }
}
//# sourceMappingURL=xcode.js.map