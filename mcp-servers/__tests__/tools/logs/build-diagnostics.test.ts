/**
 * Tests for logs_build_diagnostics tool
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { logsBuildDiagnostics } from "../../../shared/tools/logs/build-diagnostics.js";
import * as commandUtils from "../../../shared/utils/command.js";
import * as derivedData from "../../../shared/tools/logs/derived-data.js";
import * as fixtures from "../../fixtures/logs-outputs.js";

vi.mock("../../../shared/utils/command", async () => {
  const actual = await vi.importActual("../../../shared/utils/command");
  return {
    ...actual,
    runCommand: vi.fn(),
  };
});

vi.mock("../../../shared/tools/logs/derived-data", () => ({
  findLatestXcresult: vi.fn(),
}));

vi.mock("fs/promises", () => ({
  stat: vi.fn(() => Promise.resolve({ isDirectory: () => true })),
}));

describe("logsBuildDiagnostics", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("xcresult discovery", () => {
    it("should auto-discover xcresult when no path provided", async () => {
      const mockFindXcresult = vi.mocked(derivedData.findLatestXcresult);
      const mockRunCommand = vi.mocked(commandUtils.runCommand);

      mockFindXcresult.mockResolvedValue(
        "/path/to/DerivedData/Build/Logs/Test/result.xcresult",
      );
      mockRunCommand.mockResolvedValue(fixtures.BUILD_RESULTS_CLEAN);

      await logsBuildDiagnostics({});

      expect(mockFindXcresult).toHaveBeenCalledWith(undefined);
    });

    it("should use project_path for narrowed discovery", async () => {
      const mockFindXcresult = vi.mocked(derivedData.findLatestXcresult);
      const mockRunCommand = vi.mocked(commandUtils.runCommand);

      mockFindXcresult.mockResolvedValue("/path/to/result.xcresult");
      mockRunCommand.mockResolvedValue(fixtures.BUILD_RESULTS_CLEAN);

      await logsBuildDiagnostics({ project_path: "/path/to/MyApp.xcodeproj" });

      expect(mockFindXcresult).toHaveBeenCalledWith("/path/to/MyApp.xcodeproj");
    });

    it("should use explicit xcresult_path", async () => {
      const mockRunCommand = vi.mocked(commandUtils.runCommand);
      mockRunCommand.mockResolvedValue(fixtures.BUILD_RESULTS_CLEAN);

      const result = await logsBuildDiagnostics({
        xcresult_path: "/tmp/explicit-build.xcresult",
      });

      expect(result.success).toBe(true);
      expect(mockRunCommand).toHaveBeenCalledWith(
        "xcrun",
        expect.arrayContaining(["--path", "/tmp/explicit-build.xcresult"]),
        expect.any(Object),
      );
    });

    it("should fail when no xcresult found", async () => {
      const mockFindXcresult = vi.mocked(derivedData.findLatestXcresult);
      mockFindXcresult.mockResolvedValue(null);

      const result = await logsBuildDiagnostics({});

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain("No .xcresult bundle found");
      }
    });

    it("should reject xcresult_path outside allowed directories", async () => {
      const result = await logsBuildDiagnostics({
        xcresult_path: "/etc/secret/data.xcresult",
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain("must be within");
      }
    });

    it("should reject paths not ending in .xcresult", async () => {
      const result = await logsBuildDiagnostics({
        xcresult_path: "/path/to/something.else",
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain("does not end in .xcresult");
      }
    });
  });

  describe("error/warning parsing", () => {
    it("should parse errors and warnings", async () => {
      const mockRunCommand = vi.mocked(commandUtils.runCommand);
      mockRunCommand.mockResolvedValue(fixtures.BUILD_RESULTS_WITH_ERRORS);

      const result = await logsBuildDiagnostics({
        xcresult_path: "/tmp/build.xcresult",
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.errors).toHaveLength(2);
        expect(result.data.warnings).toHaveLength(1);
        expect(result.data.counts.errors).toBe(2);
        expect(result.data.counts.warnings).toBe(1);

        expect(result.data.errors[0].message).toContain("nonexistentFunction");
        expect(result.data.errors[0].file).toBe(
          "/path/to/ViewController.swift",
        );
        expect(result.data.errors[0].line).toBe(42);
        expect(result.data.errors[0].column).toBe(5);
      }
    });

    it("should return clean build result", async () => {
      const mockRunCommand = vi.mocked(commandUtils.runCommand);
      mockRunCommand.mockResolvedValue(fixtures.BUILD_RESULTS_CLEAN);

      const result = await logsBuildDiagnostics({
        xcresult_path: "/tmp/build.xcresult",
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.errors).toHaveLength(0);
        expect(result.data.warnings).toHaveLength(0);
        expect(result.data.message).toContain("no errors or warnings");
      }
    });

    it("should handle warnings-only build", async () => {
      const mockRunCommand = vi.mocked(commandUtils.runCommand);
      mockRunCommand.mockResolvedValue(fixtures.BUILD_RESULTS_WARNINGS_ONLY);

      const result = await logsBuildDiagnostics({
        xcresult_path: "/tmp/build.xcresult",
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.errors).toHaveLength(0);
        expect(result.data.warnings).toHaveLength(2);
        expect(result.data.message).toContain("2 warnings");
      }
    });
  });

  describe("error handling", () => {
    it("should handle xcresulttool command failure", async () => {
      const mockRunCommand = vi.mocked(commandUtils.runCommand);
      mockRunCommand.mockResolvedValue(fixtures.BUILD_RESULTS_COMMAND_FAILURE);

      const result = await logsBuildDiagnostics({
        xcresult_path: "/tmp/build.xcresult",
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain("xcresulttool failed");
      }
    });

    it("should handle invalid JSON response", async () => {
      const mockRunCommand = vi.mocked(commandUtils.runCommand);
      mockRunCommand.mockResolvedValue(fixtures.BUILD_RESULTS_INVALID_JSON);

      const result = await logsBuildDiagnostics({
        xcresult_path: "/tmp/build.xcresult",
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain("Failed to parse");
      }
    });
  });
});
