/**
 * MCP Resource Catalog
 *
 * Provides on-demand documentation and references.
 * Token cost at rest: ~500 tokens (just catalog metadata)
 * Full content loaded only when requested: 0 tokens until queried
 */
interface Resource {
    uri: string;
    name: string;
    description: string;
    mimeType: string;
}
export declare class ResourceCatalog {
    private resources;
    /**
     * List all available resources (returns metadata only)
     */
    listResources(): Resource[];
    /**
     * Read a specific resource by URI (loads full content)
     */
    readResource(uri: string): Promise<string>;
    /**
     * Get resource content by URI
     * In production, these would load from markdown files
     */
    private getResourceContent;
    private getXcodeOperationsReference;
    private getSimulatorOperationsReference;
    private getIDBOperationsReference;
    private getBuildSettingsReference;
    private getErrorCodesReference;
    private getDeviceSpecsReference;
    private getAccessibilityReference;
    private getAccessibilityFirstWorkflow;
}
export {};
//# sourceMappingURL=catalog.d.ts.map