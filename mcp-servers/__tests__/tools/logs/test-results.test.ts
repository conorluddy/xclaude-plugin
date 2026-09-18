/**
 * Tests for logs_test_results tool
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { logsTestResults } from "../../../shared/tools/logs/test-results.js";
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

describe("logsTestResults", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("xcresult discovery", () => {
    it("should auto-discover xcresult when no path provided", async () => {
      const mockFindXcresult = vi.mocked(derivedData.findLatestXcresult);
      const mockRunCommand = vi.mocked(commandUtils.runCommand);

      mockFindXcresult.mockResolvedValue("/path/to/result.xcresult");
      mockRunCommand.mockResolvedValue(fixtures.TEST_SUMMARY_ALL_PASS);

      await logsTestResults({});

      expect(mockFindXcresult).toHaveBeenCalledWith(undefined);
    });

    it("should fail when no xcresult found", async () => {
      const mockFindXcresult = vi.mocked(derivedData.findLatestXcresult);
      mockFindXcresult.mockResolvedValue(null);

      const result = await logsTestResults({});

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain("No .xcresult bundle found");
      }
    });
  });

  describe("summary parsing", () => {
    it("should parse all-pass summary", async () => {
      const mockRunCommand = vi.mocked(commandUtils.runCommand);
      mockRunCommand
        .mockResolvedValueOnce(fixtures.TEST_SUMMARY_ALL_PASS)
        .mockResolvedValueOnce(fixtures.TEST_TESTS_ALL_PASS);

      const result = await logsTestResults({
        xcresult_path: "/tmp/test.xcresult",
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.passed).toBe(15);
        expect(result.data.failed).toBe(0);
        expect(result.data.skipped).toBe(2);
        expect(result.data.total).toBe(17);
        expect(result.data.duration).toContain("4.5");
        expect(result.data.message).toContain("All 17 tests passed");
      }
    });

    it("should parse summary with failures", async () => {
      const mockRunCommand = vi.mocked(commandUtils.runCommand);
      mockRunCommand
        .mockResolvedValueOnce(fixtures.TEST_SUMMARY_WITH_FAILURES)
        .mockResolvedValueOnce(fixtures.TEST_TESTS_WITH_FAILURES);

      const result = await logsTestResults({
        xcresult_path: "/tmp/test.xcresult",
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.passed).toBe(12);
        expect(result.data.failed).toBe(3);
        expect(result.data.total).toBe(16);
        expect(result.data.message).toContain("3 of 16 tests failed");
      }
    });
  });

  describe("failure extraction", () => {
    it("should extract failed tests with details", async () => {
      const mockRunCommand = vi.mocked(commandUtils.runCommand);
      mockRunCommand
        .mockResolvedValueOnce(fixtures.TEST_SUMMARY_WITH_FAILURES)
        .mockResolvedValueOnce(fixtures.TEST_TESTS_WITH_FAILURES);

      const result = await logsTestResults({
        xcresult_path: "/tmp/test.xcresult",
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.failed_tests.length).toBeGreaterThan(0);

        const loginFailure = result.data.failed_tests.find(
          (t) => t.name === "testLoginFailure",
        );
        expect(loginFailure).toBeDefined();
        expect(loginFailure?.failure_message).toContain("Expected status 401");
        expect(loginFailure?.suite).toBe("AuthTests");
      }
    });

    it("should return empty failed_tests when all pass", async () => {
      const mockRunCommand = vi.mocked(commandUtils.runCommand);
      mockRunCommand
        .mockResolvedValueOnce(fixtures.TEST_SUMMARY_ALL_PASS)
        .mockResolvedValueOnce(fixtures.TEST_TESTS_ALL_PASS);

      const result = await logsTestResults({
        xcresult_path: "/tmp/test.xcresult",
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.failed_tests).toHaveLength(0);
      }
    });
  });

  describe("parallel execution", () => {
    it("should call both summary and tests commands", async () => {
      const mockRunCommand = vi.mocked(commandUtils.runCommand);
      mockRunCommand
        .mockResolvedValueOnce(fixtures.TEST_SUMMARY_ALL_PASS)
        .mockResolvedValueOnce(fixtures.TEST_TESTS_ALL_PASS);

      await logsTestResults({
        xcresult_path: "/tmp/test.xcresult",
      });

      expect(mockRunCommand).toHaveBeenCalledTimes(2);
      expect(mockRunCommand).toHaveBeenCalledWith(
        "xcrun",
        expect.arrayContaining(["test-results", "summary"]),
        expect.any(Object),
      );
      expect(mockRunCommand).toHaveBeenCalledWith(
        "xcrun",
        expect.arrayContaining(["test-results", "tests"]),
        expect.any(Object),
      );
    });
  });

  describe("edge cases", () => {
    it("should handle empty test data", async () => {
      const mockRunCommand = vi.mocked(commandUtils.runCommand);
      mockRunCommand
        .mockResolvedValueOnce(fixtures.TEST_SUMMARY_EMPTY)
        .mockResolvedValueOnce(fixtures.TEST_TESTS_EMPTY);

      const result = await logsTestResults({
        xcresult_path: "/tmp/test.xcresult",
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.total).toBe(0);
        expect(result.data.message).toContain("All 0 tests passed");
      }
    });

    it("should handle summary command failure", async () => {
      const mockRunCommand = vi.mocked(commandUtils.runCommand);
      mockRunCommand
        .mockResolvedValueOnce(fixtures.TEST_SUMMARY_COMMAND_FAILURE)
        .mockResolvedValueOnce(fixtures.TEST_TESTS_EMPTY);

      const result = await logsTestResults({
        xcresult_path: "/tmp/test.xcresult",
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain("xcresulttool summary failed");
      }
    });

    it("should handle command execution errors", async () => {
      const mockRunCommand = vi.mocked(commandUtils.runCommand);
      mockRunCommand.mockRejectedValue(new Error("Command timed out"));

      const result = await logsTestResults({
        xcresult_path: "/tmp/test.xcresult",
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain("Command timed out");
      }
    });
  });
});
