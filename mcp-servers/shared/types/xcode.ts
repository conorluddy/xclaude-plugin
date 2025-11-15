/**
 * Xcode tool types
 */

/**
 * Build operation parameters
 */
export interface BuildParams {
  project_path?: string;
  scheme: string;
  configuration?: "Debug" | "Release";
  destination?: string;
  sdk?: string;
  arch?: string;
  clean_before_build?: boolean;
  parallel?: boolean;
  quiet?: boolean;
}

/**
 * Clean operation parameters
 */
export interface CleanParams {
  project_path?: string;
  scheme?: string;
}

/**
 * Test operation parameters
 */
export interface TestParams {
  project_path?: string;
  scheme: string;
  destination?: string;
  configuration?: "Debug" | "Release";
  test_plan?: string;
  only_testing?: string[];
  skip_testing?: string[];
}

/**
 * List operation parameters
 */
export interface ListParams {
  project_path?: string;
}

/**
 * Version operation parameters
 */
export interface VersionParams {
  sdk?: string;
}

/**
 * Build result data
 */
export interface BuildResultData {
  message: string;
  note?: string;
  duration?: string;
  errors?: string[];
  warnings?: number;
  cache_id?: string;
}

/**
 * Test result data
 */
export interface TestResultData {
  message: string;
  passed?: number;
  failed?: number;
  duration?: string;
  cache_id?: string;
}

/**
 * List result data
 */
export interface ListResultData {
  schemes: string[];
  targets: string[];
  message: string;
}

/**
 * Version result data
 */
export interface VersionResultData {
  xcode_version?: string;
  build_number?: string;
  message: string;
  sdks?: string[];
}

/**
 * Build and launch operation parameters
 */
export interface BuildAndLaunchParams {
  project_path?: string;
  scheme: string;
  configuration?: "Debug" | "Release";
  destination?: string;
  skip_build?: boolean;
}

/**
 * Build and launch result data
 */
export interface BuildAndLaunchResultData {
  message: string;
  build_duration?: string;
  install_duration?: string;
  launch_duration?: string;
  bundle_id?: string;
  app_path?: string;
  simulator_udid?: string;
}

// Backward compatibility aliases
export type BuildAndRunParams = BuildAndLaunchParams;
export type BuildAndRunResultData = BuildAndLaunchResultData;
