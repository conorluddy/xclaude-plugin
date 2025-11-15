/**
 * Xcode List Tool
 *
 * Enumerate schemes and targets
 */
import { runCommand, findXcodeProject } from '../../utils/command.js';
import { logger } from '../../utils/logger.js';
export const xcodeListDefinition = {
    name: 'xcode_list',
    description: 'List Xcode schemes and targets',
    inputSchema: {
        type: 'object',
        properties: {
            project_path: {
                type: 'string',
                description: 'Path to .xcodeproj or .xcworkspace (auto-detected if omitted)',
            },
        },
    },
};
export async function xcodeList(params) {
    try {
        // Find project if not specified
        const projectPath = params.project_path || (await findXcodeProject());
        if (!projectPath) {
            return {
                success: false,
                error: 'No Xcode project found in current directory',
                operation: 'list',
            };
        }
        // Build command args
        const args = ['-list'];
        if (projectPath.endsWith('.xcworkspace')) {
            args.push('-workspace', projectPath);
        }
        else {
            args.push('-project', projectPath);
        }
        // Execute list command
        logger.info(`Listing schemes for project: ${projectPath}`);
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
        return {
            success: true,
            data,
            summary: `${schemes.length} schemes, ${targets.length} targets`,
        };
    }
    catch (error) {
        logger.error('List operation failed', error);
        return {
            success: false,
            error: String(error),
            operation: 'list',
        };
    }
}
