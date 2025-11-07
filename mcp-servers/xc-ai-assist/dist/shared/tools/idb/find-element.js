/**
 * IDB Find Element Tool
 *
 * Search UI elements by label/identifier (semantic search)
 */
import { runCommand } from '../../utils/command.js';
import { logger } from '../../utils/logger.js';
export const idbFindElementDefinition = {
    name: 'idb_find_element',
    description: 'Search UI elements by label or identifier (semantic search)',
    inputSchema: {
        type: 'object',
        properties: {
            target: {
                type: 'string',
                description: 'Target device (default: "booted")',
            },
            query: {
                type: 'string',
                description: 'Element label or identifier to search for',
            },
        },
        required: ['query'],
    },
};
export async function idbFindElement(params) {
    try {
        // Validation
        if (!params.query) {
            return {
                success: false,
                error: 'query required',
                operation: 'find-element',
            };
        }
        const target = params.target || 'booted';
        // Execute find command
        logger.info(`Finding element: ${params.query}`);
        const result = await runCommand('idb', [
            'ui',
            'describe-all',
            '--target',
            target,
            '--json',
        ]);
        // Parse and filter results
        const json = JSON.parse(result.stdout);
        const matches = [];
        if (Array.isArray(json)) {
            for (const elem of json) {
                // Match on label or value
                if (elem.label?.toLowerCase().includes(params.query.toLowerCase()) ||
                    elem.value?.toLowerCase().includes(params.query.toLowerCase())) {
                    matches.push({
                        label: elem.label,
                        value: elem.value,
                        type: elem.type,
                        centerX: elem.frame?.x + elem.frame?.width / 2,
                        centerY: elem.frame?.y + elem.frame?.height / 2,
                        frame: elem.frame,
                    });
                }
            }
        }
        const data = {
            message: `Found ${matches.length} matching elements`,
            matches,
            count: matches.length,
        };
        return {
            success: true,
            data,
            summary: `${matches.length} matches`,
        };
    }
    catch (error) {
        logger.error('Find element failed', error);
        return {
            success: false,
            error: String(error),
            operation: 'find-element',
        };
    }
}
//# sourceMappingURL=find-element.js.map