/**
 * IDB tool types
 */
/**
 * Tap operation parameters
 */
export interface TapParams {
    target?: string;
    x: number;
    y: number;
    duration?: number;
}
/**
 * Input operation parameters
 */
export interface InputParams {
    target?: string;
    text?: string;
    key?: string;
    key_sequence?: string[];
}
/**
 * Gesture operation parameters
 */
export interface GestureParams {
    target?: string;
    gesture_type: 'swipe' | 'button';
    start_x?: number;
    start_y?: number;
    end_x?: number;
    end_y?: number;
    direction?: 'up' | 'down' | 'left' | 'right';
    button_type?: 'HOME' | 'LOCK' | 'SIDE_BUTTON' | 'SIRI';
    duration?: number;
}
/**
 * Describe operation parameters
 */
export interface DescribeParams {
    target?: string;
    operation?: 'all' | 'point';
    x?: number;
    y?: number;
}
/**
 * Find element parameters
 */
export interface FindElementParams {
    target?: string;
    query: string;
}
/**
 * Check accessibility quality parameters
 */
export interface CheckAccessibilityParams {
    target?: string;
}
/**
 * List apps parameters
 */
export interface ListAppsParams {
    target?: string;
    filter_type?: 'system' | 'user' | 'internal';
}
/**
 * App lifecycle parameters (via IDB)
 */
export interface IDBAppParams {
    target?: string;
    app_identifier: string;
    app_path?: string;
    arguments?: string[];
    environment?: Record<string, string>;
}
/**
 * Targets parameters
 */
export interface TargetsParams {
    target?: string;
}
/**
 * UI element from accessibility tree
 */
export interface UIElement {
    label?: string;
    value?: string;
    type?: string;
    centerX?: number;
    centerY?: number;
    frame?: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
}
/**
 * Tap result data
 */
export interface TapResultData {
    message: string;
    coordinates: {
        x: number;
        y: number;
    };
    note?: string;
}
/**
 * Input result data
 */
export interface InputResultData {
    message: string;
    note?: string;
}
/**
 * Gesture result data
 */
export interface GestureResultData {
    message: string;
    note?: string;
}
/**
 * Describe result data
 */
export interface DescribeResultData {
    message: string;
    elements?: UIElement[];
    element?: UIElement;
    note?: string;
}
/**
 * Find element result data
 */
export interface FindElementResultData {
    message: string;
    matches: UIElement[];
    count: number;
}
/**
 * Accessibility quality result data
 */
export interface AccessibilityQualityResultData {
    score: number;
    labeled_elements: number;
    interactive_elements: number;
    total_elements: number;
    recommendation: string;
    message: string;
}
/**
 * List apps result data
 */
export interface ListAppsResultData {
    apps: Array<{
        bundle_id: string;
        name?: string;
        install_type?: string;
    }>;
    count: number;
    message: string;
}
/**
 * Targets result data
 */
export interface TargetsResultData {
    targets: Array<{
        udid: string;
        name?: string;
        state?: string;
        type?: string;
    }>;
    count: number;
    message: string;
}
//# sourceMappingURL=idb.d.ts.map