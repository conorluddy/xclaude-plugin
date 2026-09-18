/**
 * Logs tool types
 */

/**
 * logs_show parameters
 */
export interface LogsShowParams {
  process?: string;
  subsystem?: string;
  last_minutes?: number;
  level?: "default" | "info" | "debug" | "error" | "fault";
  max_entries?: number;
}

/**
 * Single log entry from unified logging
 */
export interface LogEntry {
  timestamp: string;
  process: string;
  subsystem?: string;
  category?: string;
  level: string;
  message: string;
}

/**
 * logs_show result data
 */
export interface LogsShowResultData {
  entries: LogEntry[];
  count: number;
  truncated: boolean;
  time_range: string;
  message: string;
}

/**
 * logs_build_diagnostics parameters
 */
export interface BuildDiagnosticsParams {
  xcresult_path?: string;
  project_path?: string;
}

/**
 * Single build diagnostic entry
 */
export interface BuildDiagnosticEntry {
  type: "error" | "warning" | "note";
  message: string;
  file?: string;
  line?: number;
  column?: number;
}

/**
 * logs_build_diagnostics result data
 */
export interface BuildDiagnosticsResultData {
  xcresult_path: string;
  errors: BuildDiagnosticEntry[];
  warnings: BuildDiagnosticEntry[];
  counts: { errors: number; warnings: number; notes: number };
  message: string;
}

/**
 * logs_test_results parameters
 */
export interface TestResultsParams {
  xcresult_path?: string;
  project_path?: string;
}

/**
 * Single test case result
 */
export interface TestCaseResult {
  name: string;
  suite: string;
  status: "passed" | "failed" | "skipped" | "expected_failure";
  duration_seconds?: number;
  failure_message?: string;
}

/**
 * logs_test_results result data
 */
export interface TestResultsResultData {
  xcresult_path: string;
  passed: number;
  failed: number;
  skipped: number;
  total: number;
  duration: string;
  failed_tests: TestCaseResult[];
  message: string;
}

/**
 * logs_crash_reports parameters
 */
export interface CrashReportsParams {
  app_name?: string;
  max_reports?: number;
  last_hours?: number;
  include_simulator?: boolean;
}

/**
 * Single crash backtrace frame
 */
export interface CrashFrame {
  frame_number: number;
  binary: string;
  address: string;
  symbol?: string;
}

/**
 * Parsed crash report
 */
export interface CrashReport {
  file_path: string;
  process_name: string;
  timestamp: string;
  exception_type?: string;
  exception_reason?: string;
  crashed_thread: number;
  backtrace: CrashFrame[];
}

/**
 * logs_crash_reports result data
 */
export interface CrashReportsResultData {
  reports: CrashReport[];
  count: number;
  search_dirs: string[];
  message: string;
}
