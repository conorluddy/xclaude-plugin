/**
 * Base dispatcher class
 * Provides common functionality for all 3 dispatchers
 */
/**
 * Base class for all MCP dispatchers
 *
 * Provides common error handling and response formatting.
 * Each dispatcher implements specific operation logic.
 */
export class BaseDispatcher {
    /**
     * Format error response
     *
     * @param error - Error object or message
     * @param operation - Optional operation name for context
     * @returns Formatted error result
     */
    formatError(error, operation) {
        const message = error instanceof Error ? error.message : error;
        return {
            success: false,
            error: message,
            ...(operation && { operation }),
        };
    }
    /**
     * Format success response
     *
     * @param data - Operation result data
     * @param summary - Optional human-readable summary
     * @returns Formatted success result
     */
    formatSuccess(data, summary) {
        return {
            success: true,
            data,
            ...(summary && { summary }),
        };
    }
}
//# sourceMappingURL=base.js.map