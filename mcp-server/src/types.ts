/**
 * Type definitions for xc-plugin
 *
 * Zero tolerance for `any` or `unknown` - all types explicitly defined
 */

// ============================================================================
// Base Types
// ============================================================================

export interface SuccessResult<T = Record<string, never>> {
  success: true;
  data: T;
  summary?: string;
  cache_id?: string;
}

export interface ErrorResult {
  success: false;
  error: string;
  operation?: string;
}

export type OperationResult<T = Record<string, never>> = SuccessResult<T> | ErrorResult;

// ============================================================================
// Xcode Operation Types
// ============================================================================

export type XcodeOperation = 'build' | 'clean' | 'test' | 'list' | 'version';

export interface XcodeOperationArgs {
  operation: XcodeOperation;
  project_path?: string;
  scheme?: string;
  configuration?: 'Debug' | 'Release';
  destination?: string;
  options?: XcodeBuildOptions;
}

export interface XcodeBuildOptions {
  clean_before_build?: boolean;
  parallel?: boolean;
  quiet?: boolean;
  verbose?: boolean;
  sdk?: string;
  arch?: string;
}

export interface BuildParams {
  project_path?: string;
  scheme: string;
  configuration: 'Debug' | 'Release';
  destination?: string;
  options?: XcodeBuildOptions;
}

export interface CleanParams {
  project_path?: string;
  scheme?: string;
}

export interface TestParams {
  project_path?: string;
  scheme: string;
  destination?: string;
  options?: TestOptions;
}

export interface TestOptions {
  test_plan?: string;
  only_testing?: string[];
  skip_testing?: string[];
}

export interface ListParams {
  project_path?: string;
}

// Xcode Result Types

export interface BuildResultData {
  message: string;
  note?: string;
  params?: BuildParams;
}

export interface TestResultData {
  message: string;
  params?: TestParams;
}

export interface ListResultData {
  schemes?: string[];
  targets?: string[];
  message?: string;
}

export interface VersionResultData {
  xcode_version?: string;
  build_number?: string;
  sdks?: string[];
  message?: string;
}

export type XcodeResultData =
  | BuildResultData
  | TestResultData
  | ListResultData
  | VersionResultData
  | BuildResultData; // clean returns same as build

// ============================================================================
// Simulator Operation Types
// ============================================================================

export type SimulatorOperation =
  | 'device-lifecycle'
  | 'app-lifecycle'
  | 'io'
  | 'push'
  | 'openurl'
  | 'list'
  | 'health-check'
  | 'get-app-container';

export type DeviceLifecycleSubOperation =
  | 'boot'
  | 'shutdown'
  | 'create'
  | 'delete'
  | 'erase'
  | 'clone';

export type AppLifecycleSubOperation = 'install' | 'uninstall' | 'launch' | 'terminate';

export type IOSubOperation = 'screenshot' | 'video';

export interface SimulatorOperationArgs {
  operation: SimulatorOperation;
  device_id?: string;
  sub_operation?: string;
  app_identifier?: string;
  parameters?: SimulatorParameters;
}

export interface SimulatorParameters {
  device_type?: string;
  runtime?: string;
  wait_for_boot?: boolean;
  erase?: boolean;
  app_path?: string;
  url?: string;
  output_path?: string;
  duration?: number;
  arguments?: string[];
  environment?: Record<string, string>;
  new_name?: string;
  container_type?: 'data' | 'bundle' | 'group';
}

export interface DeviceLifecycleParams {
  device_id?: string;
  sub_operation: DeviceLifecycleSubOperation;
  parameters?: SimulatorParameters;
}

export interface AppLifecycleParams {
  device_id?: string;
  app_identifier: string;
  sub_operation: AppLifecycleSubOperation;
  parameters?: SimulatorParameters;
}

export interface IOParams {
  device_id?: string;
  sub_operation: IOSubOperation;
  parameters?: SimulatorParameters;
}

export interface PushParams {
  device_id?: string;
  app_identifier: string;
  parameters?: SimulatorParameters;
}

export interface OpenURLParams {
  device_id?: string;
  parameters: {
    url: string;
  };
}

export interface GetAppContainerParams {
  device_id: string;
  app_identifier: string;
  parameters?: {
    container_type?: 'data' | 'bundle' | 'group';
  };
}

// Simulator Result Types

export interface DeviceLifecycleResultData {
  message: string;
  sub_operation: string;
  note?: string;
  params?: DeviceLifecycleParams;
  device_id?: string;
  status?: string;
}

export interface AppLifecycleResultData {
  message: string;
  sub_operation: string;
  params?: AppLifecycleParams;
  status?: string;
  app_identifier?: string;
}

export interface ListResultData {
  message?: string;
  note?: string;
  devices?: Array<{
    name: string;
    udid: string;
    state: string;
    runtime: string;
  }>;
}

export interface HealthCheckResultData {
  message: string;
  note?: string;
  xcode_installed?: boolean;
  xcode_version?: string;
  simctl_available?: boolean;
  issues?: string[];
}

export type SimulatorResultData =
  | DeviceLifecycleResultData
  | AppLifecycleResultData
  | ListResultData
  | HealthCheckResultData;

// ============================================================================
// IDB Operation Types
// ============================================================================

export type IDBOperation =
  | 'tap'
  | 'input'
  | 'gesture'
  | 'describe'
  | 'find-element'
  | 'app'
  | 'list-apps'
  | 'check-accessibility'
  | 'targets';

export interface IDBOperationArgs {
  operation: IDBOperation;
  target?: string;
  parameters?: IDBParameters;
}

export interface IDBParameters {
  x?: number;
  y?: number;
  duration?: number;
  text?: string;
  key?: string;
  gesture_type?: 'swipe' | 'button';
  direction?: 'up' | 'down' | 'left' | 'right';
  button?: 'HOME' | 'LOCK' | 'SIRI' | 'SIDE_BUTTON';
  query?: string;
  bundle_id?: string;
  app_path?: string;
  sub_operation?: string;
  operation?: string;
  filter_type?: 'system' | 'user' | 'internal';
}

export interface TapParams {
  target?: string;
  parameters: {
    x: number;
    y: number;
    duration?: number;
  };
}

export interface InputParams {
  target?: string;
  parameters: {
    text?: string;
    key?: string;
  };
}

export interface GestureParams {
  target?: string;
  parameters: {
    gesture_type: 'swipe' | 'button';
    direction?: 'up' | 'down' | 'left' | 'right';
    button?: 'HOME' | 'LOCK' | 'SIRI' | 'SIDE_BUTTON';
  };
}

export interface DescribeParams {
  target?: string;
  parameters?: {
    operation?: string;
  };
}

export interface FindElementParams {
  target?: string;
  parameters: {
    query: string;
  };
}

export interface IDBAppParams {
  target?: string;
  parameters: {
    sub_operation: string;
    bundle_id?: string;
    app_path?: string;
  };
}

export interface ListAppsParams {
  target?: string;
  parameters?: {
    filter_type?: 'system' | 'user' | 'internal';
  };
}

export interface CheckAccessibilityParams {
  target?: string;
}

export interface TargetsParams {
  parameters?: {
    sub_operation?: string;
  };
}

// IDB Result Types

export interface IDBOperationResultData {
  message: string;
  note?: string;
  params?: IDBParameters;
  accessibility_priority?: string;
  guidance?: string;
}

export type IDBResultData = IDBOperationResultData;

// ============================================================================
// Logger Types
// ============================================================================

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export type LogData = string | number | boolean | Record<string, LogValue> | Error;
export type LogValue = string | number | boolean | null | undefined;

// ============================================================================
// MCP Tool Definition (SDK constraint - must use any)
// ============================================================================

export interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    // MCP SDK constraint: schema properties must be any
    properties: Record<string, any>;
    required?: string[];
  };
}
