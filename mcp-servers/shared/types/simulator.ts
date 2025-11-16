/**
 * Simulator tool types
 */

/**
 * Device lifecycle operations
 */
export type DeviceLifecycleOperation =
  | "boot"
  | "shutdown"
  | "create"
  | "delete"
  | "erase"
  | "clone";

/**
 * Device lifecycle parameters
 */
export interface DeviceLifecycleParams {
  device_id?: string;
  device_name?: string;
  device_type?: string;
  runtime?: string;
  new_name?: string;
}

/**
 * App lifecycle parameters (generic - prefer specific types below)
 */
export interface AppLifecycleParams {
  device_id?: string;
  app_identifier: string;
  app_path?: string;
  arguments?: string[];
  environment?: Record<string, string>;
}

/**
 * Install app parameters
 */
export interface InstallAppParams {
  device_id?: string;
  app_path: string;
}

/**
 * Launch app parameters
 */
export interface LaunchAppParams {
  device_id?: string;
  app_identifier: string;
  arguments?: string[];
  environment?: Record<string, string>;
}

/**
 * List devices parameters
 */
export interface ListDevicesParams {
  availability?: "available" | "unavailable" | "all";
  device_type?: string;
  runtime?: string;
}

/**
 * Screenshot/video parameters
 */
export interface IOParams {
  device_id?: string;
  output_path?: string;
  duration?: number;
}

/**
 * Push notification parameters
 */
export interface PushParams {
  device_id?: string;
  app_identifier: string;
  payload: string; // JSON string or file path
}

/**
 * Open URL parameters
 */
export interface OpenURLParams {
  device_id?: string;
  url: string;
}

/**
 * Get app container parameters
 */
export interface GetAppContainerParams {
  device_id?: string;
  app_identifier: string;
  container_type?: "data" | "bundle" | "group";
}

/**
 * Health check parameters
 */
export interface HealthCheckParams {
  // No parameters needed
}

/**
 * Device information
 */
export interface SimulatorDevice {
  name: string;
  udid: string;
  state: string;
  runtime: string;
  available: boolean;
}

/**
 * Device lifecycle result
 */
export interface DeviceLifecycleResultData {
  message: string;
  device_id?: string;
  device_name?: string;
  note?: string;
}

/**
 * App lifecycle result
 */
export interface AppLifecycleResultData {
  message: string;
  app_identifier: string;
  pid?: number;
  note?: string;
}

/**
 * List devices result
 */
export interface ListDevicesResultData {
  devices: SimulatorDevice[];
  count: number;
  message: string;
}

/**
 * IO result
 */
export interface IOResultData {
  message: string;
  output_path?: string;
  note?: string;
}

/**
 * Health check result
 */
export interface HealthCheckResultData {
  xcode_installed: boolean;
  simctl_available: boolean;
  issues: string[];
  message: string;
}
