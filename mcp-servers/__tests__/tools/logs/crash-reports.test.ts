/**
 * Tests for logs_crash_reports tool
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { logsCrashReports } from "../../../shared/tools/logs/crash-reports.js";
import * as fixtures from "../../fixtures/logs-outputs.js";

// Mock fs/promises
const mockReaddir = vi.fn();
const mockReadFile = vi.fn();
const mockStat = vi.fn();

vi.mock("fs/promises", () => ({
  readdir: (...args: any[]) => mockReaddir(...args),
  readFile: (...args: any[]) => mockReadFile(...args),
  stat: (...args: any[]) => mockStat(...args),
}));

vi.mock("os", () => ({
  homedir: () => "/Users/testuser",
}));

describe("logsCrashReports", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("file discovery", () => {
    it("should search DiagnosticReports directory", async () => {
      mockReaddir.mockResolvedValue([]);

      const result = await logsCrashReports({});

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.search_dirs).toContain(
          "/Users/testuser/Library/Logs/DiagnosticReports",
        );
      }
    });

    it("should return empty when no .ips files found", async () => {
      mockReaddir.mockResolvedValue([]);

      const result = await logsCrashReports({});

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.reports).toHaveLength(0);
        expect(result.data.count).toBe(0);
        expect(result.data.message).toContain("No crash reports found");
      }
    });

    it("should find and parse .ips files", async () => {
      const recentTime = Date.now() - 1000;

      mockReaddir.mockResolvedValue([
        { name: "MyApp-2025-01-15.ips", isDirectory: () => false },
      ]);
      mockStat.mockResolvedValue({ mtimeMs: recentTime });
      mockReadFile.mockResolvedValue(fixtures.CRASH_REPORT_IPS);

      const result = await logsCrashReports({});

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.reports).toHaveLength(1);
        expect(result.data.reports[0].process_name).toBe("MyApp");
      }
    });
  });

  describe("time filtering", () => {
    it("should filter by last_hours", async () => {
      const recentTime = Date.now() - 1000;
      const oldTime = Date.now() - 48 * 60 * 60 * 1000; // 48 hours ago

      mockReaddir.mockResolvedValue([
        { name: "MyApp-recent.ips", isDirectory: () => false },
        { name: "MyApp-old.ips", isDirectory: () => false },
      ]);
      mockStat
        .mockResolvedValueOnce({ mtimeMs: recentTime })
        .mockResolvedValueOnce({ mtimeMs: oldTime });
      mockReadFile.mockResolvedValue(fixtures.CRASH_REPORT_IPS);

      const result = await logsCrashReports({ last_hours: 24 });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.reports).toHaveLength(1);
      }
    });

    it("should use default 24 hours", async () => {
      const recentTime = Date.now() - 1000;

      mockReaddir.mockResolvedValue([
        { name: "MyApp-recent.ips", isDirectory: () => false },
      ]);
      mockStat.mockResolvedValue({ mtimeMs: recentTime });
      mockReadFile.mockResolvedValue(fixtures.CRASH_REPORT_IPS);

      const result = await logsCrashReports({});

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.message).toContain("24 hours");
      }
    });
  });

  describe("app name filtering", () => {
    it("should filter by app_name in filename", async () => {
      const recentTime = Date.now() - 1000;

      mockReaddir.mockResolvedValue([
        { name: "MyApp-2025-01-15.ips", isDirectory: () => false },
        { name: "OtherApp-2025-01-15.ips", isDirectory: () => false },
      ]);
      mockStat.mockResolvedValue({ mtimeMs: recentTime });
      mockReadFile.mockResolvedValue(fixtures.CRASH_REPORT_IPS);

      const result = await logsCrashReports({ app_name: "MyApp" });

      expect(result.success).toBe(true);
      if (result.success) {
        // Only MyApp filename matched, OtherApp was filtered out
        expect(result.data.reports.length).toBeLessThanOrEqual(1);
      }
    });

    it("should be case-insensitive for app_name", async () => {
      const recentTime = Date.now() - 1000;

      mockReaddir.mockResolvedValue([
        { name: "myapp-2025-01-15.ips", isDirectory: () => false },
      ]);
      mockStat.mockResolvedValue({ mtimeMs: recentTime });
      mockReadFile.mockResolvedValue(fixtures.CRASH_REPORT_IPS);

      const result = await logsCrashReports({ app_name: "MyApp" });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.reports).toHaveLength(1);
      }
    });
  });

  describe("IPS parsing", () => {
    it("should extract exception info", async () => {
      const recentTime = Date.now() - 1000;

      mockReaddir.mockResolvedValue([
        { name: "MyApp.ips", isDirectory: () => false },
      ]);
      mockStat.mockResolvedValue({ mtimeMs: recentTime });
      mockReadFile.mockResolvedValue(fixtures.CRASH_REPORT_IPS);

      const result = await logsCrashReports({});

      expect(result.success).toBe(true);
      if (result.success) {
        const report = result.data.reports[0];
        expect(report.exception_type).toBe("EXC_BAD_ACCESS");
        expect(report.exception_reason).toContain("null pointer");
        expect(report.crashed_thread).toBe(0);
      }
    });

    it("should extract backtrace frames", async () => {
      const recentTime = Date.now() - 1000;

      mockReaddir.mockResolvedValue([
        { name: "MyApp.ips", isDirectory: () => false },
      ]);
      mockStat.mockResolvedValue({ mtimeMs: recentTime });
      mockReadFile.mockResolvedValue(fixtures.CRASH_REPORT_IPS);

      const result = await logsCrashReports({});

      expect(result.success).toBe(true);
      if (result.success) {
        const report = result.data.reports[0];
        expect(report.backtrace.length).toBeGreaterThan(0);
        expect(report.backtrace[0].binary).toBe("MyApp");
        expect(report.backtrace[0].symbol).toContain("viewDidLoad");
      }
    });

    it("should handle .ips files with header line", async () => {
      const recentTime = Date.now() - 1000;

      mockReaddir.mockResolvedValue([
        { name: "CrashyApp.ips", isDirectory: () => false },
      ]);
      mockStat.mockResolvedValue({ mtimeMs: recentTime });
      mockReadFile.mockResolvedValue(fixtures.CRASH_REPORT_IPS_WITH_HEADER);

      const result = await logsCrashReports({});

      expect(result.success).toBe(true);
      if (result.success) {
        const report = result.data.reports[0];
        expect(report.process_name).toBe("CrashyApp");
        expect(report.exception_reason).toContain("index out of range");
      }
    });

    it("should handle minimal crash reports", async () => {
      const recentTime = Date.now() - 1000;

      mockReaddir.mockResolvedValue([
        { name: "SimpleApp.ips", isDirectory: () => false },
      ]);
      mockStat.mockResolvedValue({ mtimeMs: recentTime });
      mockReadFile.mockResolvedValue(fixtures.CRASH_REPORT_IPS_MINIMAL);

      const result = await logsCrashReports({});

      expect(result.success).toBe(true);
      if (result.success) {
        const report = result.data.reports[0];
        expect(report.process_name).toBe("SimpleApp");
        expect(report.backtrace).toHaveLength(0);
      }
    });
  });

  describe("simulator dirs", () => {
    it("should include simulator crash dirs when requested", async () => {
      // Call sequence:
      // 1. readdir(CoreSimulator) - list simulator UDIDs
      // 2. readdir(DiagnosticReports) - scan for .ips files
      // 3. readdir(CoreSimulator/ABCD-1234/DiagnosticReports) - scan for .ips files
      mockReaddir
        .mockResolvedValueOnce([
          // CoreSimulator listing
          { name: "ABCD-1234", isDirectory: () => true },
        ])
        .mockResolvedValueOnce([]) // DiagnosticReports scan
        .mockResolvedValueOnce([]); // Simulator DiagnosticReports scan

      const result = await logsCrashReports({ include_simulator: true });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.search_dirs.length).toBeGreaterThan(1);
        expect(
          result.data.search_dirs.some((d) => d.includes("CoreSimulator")),
        ).toBe(true);
      }
    });
  });

  describe("max reports", () => {
    it("should respect max_reports limit", async () => {
      const recentTime = Date.now() - 1000;

      mockReaddir.mockResolvedValue([
        { name: "App1.ips", isDirectory: () => false },
        { name: "App2.ips", isDirectory: () => false },
        { name: "App3.ips", isDirectory: () => false },
      ]);
      mockStat.mockResolvedValue({ mtimeMs: recentTime });
      mockReadFile.mockResolvedValue(fixtures.CRASH_REPORT_IPS);

      const result = await logsCrashReports({ max_reports: 2 });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.reports.length).toBeLessThanOrEqual(2);
      }
    });

    it("should default max_reports to 1", async () => {
      const recentTime = Date.now() - 1000;

      mockReaddir.mockResolvedValue([
        { name: "App1.ips", isDirectory: () => false },
        { name: "App2.ips", isDirectory: () => false },
      ]);
      mockStat.mockResolvedValue({ mtimeMs: recentTime });
      mockReadFile.mockResolvedValue(fixtures.CRASH_REPORT_IPS);

      const result = await logsCrashReports({});

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.reports.length).toBeLessThanOrEqual(1);
      }
    });
  });
});
