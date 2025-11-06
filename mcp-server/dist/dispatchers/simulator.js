/**
 * Simulator Dispatcher
 *
 * Consolidates all simctl operations into a single tool.
 * Token cost: ~400 tokens (vs ~5k for 9 separate tools)
 *
 * Operations: device-lifecycle, app-lifecycle, io, push, openurl, list, health-check
 */
import { BaseDispatcher } from './base.js';
import { logger } from '../utils/logger.js';
export class SimulatorDispatcher extends BaseDispatcher {
    getToolDefinition() {
        return {
            name: 'execute_simulator_command',
            description: 'Control iOS Simulator devices and apps. Use simulator-workflows Skill for device management guidance.',
            inputSchema: {
                type: 'object',
                properties: {
                    operation: {
                        type: 'string',
                        enum: [
                            'device-lifecycle',
                            'app-lifecycle',
                            'io',
                            'push',
                            'openurl',
                            'list',
                            'health-check',
                            'get-app-container',
                        ],
                        description: 'Operation category: device-lifecycle (boot/shutdown/create/delete), app-lifecycle (install/launch/terminate), io (screenshot/video), push (notifications), openurl, list (devices), health-check (validate environment), get-app-container (app paths)',
                    },
                    device_id: {
                        type: 'string',
                        description: 'Device UDID or name (e.g. "iPhone 15" or full UDID)',
                    },
                    sub_operation: {
                        type: 'string',
                        description: 'Specific action within operation: boot, shutdown, create, delete, erase, clone, install, uninstall, launch, terminate, screenshot, video',
                    },
                    app_identifier: {
                        type: 'string',
                        description: 'App bundle identifier (e.g. "com.example.MyApp")',
                    },
                    parameters: {
                        type: 'object',
                        description: 'Operation-specific parameters (device_type, runtime, app_path, url, etc.)',
                    },
                },
                required: ['operation'],
            },
        };
    }
    async execute(args) {
        const { operation, device_id, sub_operation, app_identifier, parameters } = args;
        logger.info(`Executing simulator operation: ${operation} / ${sub_operation || 'default'}`);
        try {
            switch (operation) {
                case 'device-lifecycle':
                    if (!sub_operation) {
                        return this.formatError('sub_operation required for device-lifecycle', operation);
                    }
                    return await this.executeDeviceLifecycle({
                        device_id,
                        sub_operation: sub_operation,
                        parameters,
                    });
                case 'app-lifecycle':
                    if (!sub_operation || !app_identifier) {
                        return this.formatError('sub_operation and app_identifier required for app-lifecycle', operation);
                    }
                    return await this.executeAppLifecycle({
                        device_id,
                        app_identifier,
                        sub_operation: sub_operation,
                        parameters,
                    });
                case 'io':
                    if (!sub_operation) {
                        return this.formatError('sub_operation required for io', operation);
                    }
                    return await this.executeIO({
                        device_id,
                        sub_operation: sub_operation,
                        parameters,
                    });
                case 'push':
                    if (!app_identifier) {
                        return this.formatError('app_identifier required for push', operation);
                    }
                    return await this.executePush({
                        device_id,
                        app_identifier,
                        parameters,
                    });
                case 'openurl':
                    if (!parameters?.url) {
                        return this.formatError('url required in parameters for openurl', operation);
                    }
                    return await this.executeOpenURL({
                        device_id,
                        parameters: { url: parameters.url },
                    });
                case 'list':
                    return await this.executeList(parameters);
                case 'health-check':
                    return await this.executeHealthCheck();
                case 'get-app-container':
                    if (!device_id || !app_identifier) {
                        return this.formatError('device_id and app_identifier required for get-app-container', operation);
                    }
                    return await this.executeGetAppContainer({
                        device_id,
                        app_identifier,
                        parameters,
                    });
                default:
                    return this.formatError(`Unknown operation: ${operation}`, operation);
            }
        }
        catch (error) {
            logger.error(`Simulator operation failed: ${operation}`, error);
            return this.formatError(error, operation);
        }
    }
    async executeDeviceLifecycle(params) {
        try {
            const { runCommand } = await import('../utils/command.js');
            const subOp = params.sub_operation;
            switch (subOp) {
                case 'boot': {
                    if (!params.device_id) {
                        return this.formatError('device_id required for boot', 'device-lifecycle');
                    }
                    await runCommand('xcrun', ['simctl', 'boot', params.device_id]);
                    const data = {
                        message: `Device ${params.device_id} booted successfully`,
                        sub_operation: 'boot',
                        device_id: params.device_id,
                        status: 'Booted',
                    };
                    return this.formatSuccess(data);
                }
                case 'shutdown': {
                    const deviceId = params.device_id || 'booted';
                    await runCommand('xcrun', ['simctl', 'shutdown', deviceId]);
                    const data = {
                        message: `Device ${deviceId} shut down successfully`,
                        sub_operation: 'shutdown',
                        device_id: deviceId,
                        status: 'Shutdown',
                    };
                    return this.formatSuccess(data);
                }
                case 'create': {
                    const name = params.parameters?.new_name || 'New Device';
                    const deviceType = params.parameters?.device_type || 'iPhone 15';
                    const runtime = params.parameters?.runtime || 'iOS 17.0';
                    const result = await runCommand('xcrun', ['simctl', 'create', name, deviceType, runtime]);
                    const udid = result.stdout.trim();
                    const data = {
                        message: `Created device: ${name}`,
                        sub_operation: 'create',
                        device_id: udid,
                        note: `Device UDID: ${udid}`,
                    };
                    return this.formatSuccess(data);
                }
                case 'delete': {
                    if (!params.device_id) {
                        return this.formatError('device_id required for delete', 'device-lifecycle');
                    }
                    await runCommand('xcrun', ['simctl', 'delete', params.device_id]);
                    const data = {
                        message: `Device ${params.device_id} deleted successfully`,
                        sub_operation: 'delete',
                        device_id: params.device_id,
                    };
                    return this.formatSuccess(data);
                }
                case 'erase': {
                    if (!params.device_id) {
                        return this.formatError('device_id required for erase', 'device-lifecycle');
                    }
                    await runCommand('xcrun', ['simctl', 'erase', params.device_id]);
                    const data = {
                        message: `Device ${params.device_id} erased successfully`,
                        sub_operation: 'erase',
                        device_id: params.device_id,
                    };
                    return this.formatSuccess(data);
                }
                default:
                    return this.formatError(`Unknown sub_operation: ${subOp}`, 'device-lifecycle');
            }
        }
        catch (error) {
            logger.error('Device lifecycle operation failed', error);
            return this.formatError(error, 'device-lifecycle');
        }
    }
    async executeAppLifecycle(params) {
        try {
            const { runCommand } = await import('../utils/command.js');
            const subOp = params.sub_operation;
            const deviceId = params.device_id || 'booted';
            switch (subOp) {
                case 'install': {
                    if (!params.parameters?.app_path) {
                        return this.formatError('app_path required for install', 'app-lifecycle');
                    }
                    await runCommand('xcrun', ['simctl', 'install', deviceId, params.parameters.app_path]);
                    const data = {
                        message: `App installed on device ${deviceId}`,
                        sub_operation: 'install',
                        app_identifier: params.app_identifier,
                        status: 'installed',
                    };
                    return this.formatSuccess(data);
                }
                case 'uninstall': {
                    if (!params.app_identifier) {
                        return this.formatError('app_identifier required for uninstall', 'app-lifecycle');
                    }
                    await runCommand('xcrun', ['simctl', 'uninstall', deviceId, params.app_identifier]);
                    const data = {
                        message: `App ${params.app_identifier} uninstalled from device ${deviceId}`,
                        sub_operation: 'uninstall',
                        app_identifier: params.app_identifier,
                        status: 'uninstalled',
                    };
                    return this.formatSuccess(data);
                }
                case 'launch': {
                    if (!params.app_identifier) {
                        return this.formatError('app_identifier required for launch', 'app-lifecycle');
                    }
                    const args = ['simctl', 'launch', deviceId, params.app_identifier];
                    // Add launch arguments if provided
                    if (params.parameters?.arguments) {
                        args.push(...params.parameters.arguments);
                    }
                    const result = await runCommand('xcrun', args);
                    const pidMatch = result.stdout.match(/(\d+)/);
                    const data = {
                        message: `App ${params.app_identifier} launched on device ${deviceId}`,
                        sub_operation: 'launch',
                        app_identifier: params.app_identifier,
                        status: 'running',
                        pid: pidMatch ? pidMatch[1] : undefined,
                    };
                    return this.formatSuccess(data);
                }
                case 'terminate': {
                    if (!params.app_identifier) {
                        return this.formatError('app_identifier required for terminate', 'app-lifecycle');
                    }
                    await runCommand('xcrun', ['simctl', 'terminate', deviceId, params.app_identifier]);
                    const data = {
                        message: `App ${params.app_identifier} terminated on device ${deviceId}`,
                        sub_operation: 'terminate',
                        app_identifier: params.app_identifier,
                        status: 'terminated',
                    };
                    return this.formatSuccess(data);
                }
                default:
                    return this.formatError(`Unknown sub_operation: ${subOp}`, 'app-lifecycle');
            }
        }
        catch (error) {
            logger.error('App lifecycle operation failed', error);
            return this.formatError(error, 'app-lifecycle');
        }
    }
    /**
     * Captures screenshots or records video from the simulator
     * Note: Video recording requires manual stop or process termination
     */
    async executeIO(params) {
        try {
            const { runCommand } = await import('../utils/command.js');
            if (!params.sub_operation) {
                return this.formatError('sub_operation required for io', 'io');
            }
            const deviceId = params.device_id || 'booted';
            const subOp = params.sub_operation;
            const outputPath = params.parameters?.output_path;
            if (!outputPath) {
                return this.formatError('output_path required in parameters for io operation', 'io');
            }
            switch (subOp) {
                case 'screenshot': {
                    await runCommand('xcrun', ['simctl', 'io', deviceId, 'screenshot', outputPath]);
                    const data = {
                        message: `Screenshot saved to: ${outputPath}`,
                        sub_operation: 'screenshot',
                        device_id: deviceId,
                        note: `Screenshot captured from device ${deviceId}`,
                    };
                    return this.formatSuccess(data);
                }
                case 'video': {
                    // Video recording is a long-running operation
                    // For now, we'll note that this requires background execution or manual stop
                    const data = {
                        message: 'Video recording requires background execution',
                        sub_operation: 'video',
                        device_id: deviceId,
                        note: `To record video, use: xcrun simctl io ${deviceId} recordVideo ${outputPath} (requires manual stop with Ctrl+C or process termination)`,
                    };
                    return this.formatSuccess(data);
                }
                default:
                    return this.formatError(`Unknown io sub_operation: ${subOp}`, 'io');
            }
        }
        catch (error) {
            logger.error('IO operation failed', error);
            return this.formatError(error, 'io');
        }
    }
    /**
     * Simulates push notifications to apps in the simulator
     * Accepts JSON payload as string or file path
     */
    async executePush(params) {
        try {
            const { runCommand } = await import('../utils/command.js');
            const { writeFile, unlink } = await import('fs/promises');
            const { join } = await import('path');
            const { tmpdir } = await import('os');
            if (!params.app_identifier) {
                return this.formatError('app_identifier required for push', 'push');
            }
            const payload = params.parameters?.payload;
            if (!payload) {
                return this.formatError('payload required in parameters for push', 'push');
            }
            const deviceId = params.device_id || 'booted';
            const bundleId = params.app_identifier;
            // Determine if payload is a file path or JSON content
            let payloadPath;
            let isTemporaryFile = false;
            if (payload.endsWith('.json') || payload.startsWith('/')) {
                // Assume it's a file path
                payloadPath = payload;
            }
            else {
                // Treat as JSON content - create temporary file
                payloadPath = join(tmpdir(), `push-notification-${Date.now()}.json`);
                await writeFile(payloadPath, payload, 'utf8');
                isTemporaryFile = true;
            }
            try {
                await runCommand('xcrun', ['simctl', 'push', deviceId, bundleId, payloadPath]);
                const data = {
                    message: `Push notification sent to ${bundleId}`,
                    sub_operation: 'push',
                    app_identifier: bundleId,
                    note: `Notification delivered to device ${deviceId}`,
                };
                return this.formatSuccess(data);
            }
            finally {
                // Clean up temporary file if created
                if (isTemporaryFile) {
                    try {
                        await unlink(payloadPath);
                    }
                    catch {
                        // Ignore cleanup errors
                    }
                }
            }
        }
        catch (error) {
            logger.error('Push notification operation failed', error);
            return this.formatError(error, 'push');
        }
    }
    /**
     * Opens a URL in the simulator (deep links, universal links, Safari)
     */
    async executeOpenURL(params) {
        try {
            const { runCommand } = await import('../utils/command.js');
            if (!params.parameters?.url) {
                return this.formatError('url required in parameters for openurl', 'openurl');
            }
            const deviceId = params.device_id || 'booted';
            const url = params.parameters.url;
            await runCommand('xcrun', ['simctl', 'openurl', deviceId, url]);
            const data = {
                message: `Opened URL in simulator: ${url}`,
                sub_operation: 'openurl',
                note: `URL opened on device ${deviceId}`,
            };
            return this.formatSuccess(data);
        }
        catch (error) {
            logger.error('OpenURL operation failed', error);
            return this.formatError(error, 'openurl');
        }
    }
    async executeList(_params) {
        try {
            const { runCommand } = await import('../utils/command.js');
            const { ResponseCache } = await import('../state/response-cache.js');
            // Execute simctl list devices --json
            const result = await runCommand('xcrun', ['simctl', 'list', 'devices', '--json']);
            const fullData = JSON.parse(result.stdout);
            // Extract devices into flat array
            const devices = [];
            for (const [runtime, deviceList] of Object.entries(fullData.devices || {})) {
                if (Array.isArray(deviceList)) {
                    deviceList.forEach((device) => {
                        devices.push({
                            name: device.name,
                            udid: device.udid,
                            state: device.state,
                            runtime: runtime.replace('com.apple.CoreSimulator.SimRuntime.', ''),
                        });
                    });
                }
            }
            // Cache full device list for progressive disclosure
            const cache = new ResponseCache();
            const cacheId = cache.store({
                tool: 'simulator-list',
                fullOutput: JSON.stringify(devices, null, 2),
                stderr: '',
                exitCode: 0,
                command: 'xcrun simctl list devices --json',
                metadata: {
                    deviceCount: devices.length,
                    bootedCount: devices.filter((d) => d.state === 'Booted').length,
                },
            });
            // Return summary with cache_id
            const bootedCount = devices.filter((d) => d.state === 'Booted').length;
            const data = {
                message: `Found ${devices.length} devices (${bootedCount} booted)`,
                note: `Use get-details with cache_id to see full device list`,
                devices: devices.slice(0, 5), // Show first 5 devices
            };
            return this.formatSuccess(data, `Device list cached. cache_id: ${cacheId}`);
        }
        catch (error) {
            logger.error('List operation failed', error);
            return this.formatError(error, 'list');
        }
    }
    async executeHealthCheck() {
        try {
            const { runCommand } = await import('../utils/command.js');
            const issues = [];
            // Check Xcode installation
            let xcodeVersion;
            try {
                const versionResult = await runCommand('xcodebuild', ['-version']);
                const versionMatch = versionResult.stdout.match(/Xcode\s+([\d.]+)/);
                xcodeVersion = versionMatch ? versionMatch[1] : undefined;
                // Verify xcode-select path is configured
                await runCommand('xcode-select', ['-p']);
            }
            catch {
                issues.push('Xcode not found or not properly configured');
            }
            // Check simctl availability
            let simctlAvailable = false;
            try {
                await runCommand('xcrun', ['simctl', 'help']);
                simctlAvailable = true;
            }
            catch {
                issues.push('simctl not available (Xcode Command Line Tools may not be installed)');
            }
            // Check for booted devices
            let bootedDevices = 0;
            try {
                const listResult = await runCommand('xcrun', ['simctl', 'list', 'devices', '--json']);
                const data = JSON.parse(listResult.stdout);
                for (const deviceList of Object.values(data.devices || {})) {
                    if (Array.isArray(deviceList)) {
                        bootedDevices += deviceList.filter((d) => d.state === 'Booted').length;
                    }
                }
            }
            catch {
                // Not critical, just informational
            }
            const data = {
                message: issues.length === 0
                    ? 'iOS development environment is healthy'
                    : `Found ${issues.length} issue(s)`,
                xcode_installed: !!xcodeVersion,
                xcode_version: xcodeVersion,
                simctl_available: simctlAvailable,
                issues: issues.length > 0 ? issues : undefined,
                note: bootedDevices > 0 ? `${bootedDevices} simulator(s) currently booted` : undefined,
            };
            return this.formatSuccess(data);
        }
        catch (error) {
            logger.error('Health check failed', error);
            return this.formatError(error, 'health-check');
        }
    }
    /**
     * Gets the filesystem path to an app's container
     * Container types: 'data' (app data), 'bundle' (app bundle), 'group' (shared container)
     */
    async executeGetAppContainer(params) {
        try {
            const { runCommand } = await import('../utils/command.js');
            if (!params.device_id || !params.app_identifier) {
                return this.formatError('device_id and app_identifier required for get-app-container', 'get-app-container');
            }
            const deviceId = params.device_id;
            const bundleId = params.app_identifier;
            const containerType = params.parameters?.container_type || 'data';
            const result = await runCommand('xcrun', [
                'simctl',
                'get_app_container',
                deviceId,
                bundleId,
                containerType,
            ]);
            const containerPath = result.stdout.trim();
            const data = {
                message: `App container path: ${containerPath}`,
                sub_operation: 'get-container',
                app_identifier: bundleId,
                note: `Container type: ${containerType}`,
            };
            return this.formatSuccess(data);
        }
        catch (error) {
            logger.error('Get app container operation failed', error);
            return this.formatError(error, 'get-app-container');
        }
    }
}
//# sourceMappingURL=simulator.js.map