/**
 * Simulator List Tool
 *
 * Enumerate available simulators
 */
import { runCommand } from '../../utils/command.js';
import { logger } from '../../utils/logger.js';
export const simulatorListDefinition = {
    name: 'simulator_list',
    description: 'List available iOS simulators',
    inputSchema: {
        type: 'object',
        properties: {
            availability: {
                type: 'string',
                enum: ['available', 'unavailable', 'all'],
                description: 'Filter by availability (default: available)',
            },
            device_type: {
                type: 'string',
                description: 'Filter by device type (e.g. "iPhone")',
            },
            runtime: {
                type: 'string',
                description: 'Filter by runtime (e.g. "iOS 17")',
            },
        },
    },
};
export async function simulatorList(params) {
    try {
        // Execute simctl list
        logger.info('Listing simulators');
        const result = await runCommand('xcrun', ['simctl', 'list', 'devices', '-j']);
        // Parse JSON output
        const json = JSON.parse(result.stdout);
        const devices = [];
        // Flatten devices from all runtimes
        for (const [runtime, runtimeDevices] of Object.entries(json.devices)) {
            for (const device of runtimeDevices) {
                // Apply filters
                if (params.availability === 'available' && !device.isAvailable)
                    continue;
                if (params.availability === 'unavailable' && device.isAvailable)
                    continue;
                if (params.device_type && !device.name.includes(params.device_type))
                    continue;
                if (params.runtime && !runtime.includes(params.runtime))
                    continue;
                devices.push({
                    name: device.name,
                    udid: device.udid,
                    state: device.state,
                    runtime: runtime.replace('com.apple.CoreSimulator.SimRuntime.', '').replace(/-/g, ' '),
                    available: device.isAvailable,
                });
            }
        }
        const data = {
            devices,
            count: devices.length,
            message: `Found ${devices.length} simulators`,
        };
        return {
            success: true,
            data,
            summary: `${devices.length} simulators`,
        };
    }
    catch (error) {
        logger.error('List simulators failed', error);
        return {
            success: false,
            error: String(error),
            operation: 'list',
        };
    }
}
//# sourceMappingURL=list.js.map