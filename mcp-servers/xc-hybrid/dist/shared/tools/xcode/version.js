/**
 * Xcode Version Tool
 *
 * Get Xcode installation details
 */
import { runCommand } from '../../utils/command.js';
import { logger } from '../../utils/logger.js';
export const xcodeVersionDefinition = {
    name: 'xcode_version',
    description: 'Get Xcode version information',
    inputSchema: {
        type: 'object',
        properties: {
            sdk: {
                type: 'string',
                description: 'Optional SDK to check version for',
            },
        },
    },
};
export async function xcodeVersion(params) {
    try {
        // Execute xcodebuild -version
        logger.info('Checking Xcode version');
        const result = await runCommand('xcodebuild', ['-version']);
        // Parse version output
        const lines = result.stdout.trim().split('\n');
        const versionMatch = lines[0]?.match(/Xcode\s+([\d.]+)/);
        const buildMatch = lines[1]?.match(/Build\s+version\s+(.+)/);
        const data = {
            xcode_version: versionMatch ? versionMatch[1] : undefined,
            build_number: buildMatch ? buildMatch[1] : undefined,
            message: result.stdout.trim(),
        };
        // If SDK requested, get SDK info
        if (params.sdk) {
            const sdkResult = await runCommand('xcodebuild', ['-showsdks']);
            const sdks = sdkResult.stdout
                .split('\n')
                .filter((line) => line.includes('SDK'))
                .map((line) => line.trim());
            data.sdks = sdks;
        }
        return {
            success: true,
            data,
            summary: `Xcode ${data.xcode_version || 'unknown'}`,
        };
    }
    catch (error) {
        logger.error('Version check failed', error);
        return {
            success: false,
            error: String(error),
            operation: 'version',
        };
    }
}
//# sourceMappingURL=version.js.map