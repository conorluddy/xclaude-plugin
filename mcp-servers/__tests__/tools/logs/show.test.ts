/**
 * Tests for logs_show tool
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { logsShow } from "../../../shared/tools/logs/show.js";
import * as commandUtils from "../../../shared/utils/command.js";
import * as fixtures from "../../fixtures/logs-outputs.js";

vi.mock("../../../shared/utils/command", async () => {
  const actual = await vi.importActual("../../../shared/utils/command");
  return {
    ...actual,
    runCommand: vi.fn(),
  };
});

describe("logsShow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("parameter validation", () => {
    it("should reject when neither process nor subsystem is provided", async () => {
      const result = await logsShow({});

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain("process");
        expect(result.error).toContain("subsystem");
      }
    });

    it("should accept process only", async () => {
      const mockRunCommand = vi.mocked(commandUtils.runCommand);
      mockRunCommand.mockResolvedValue(fixtures.LOG_SHOW_EMPTY);

      const result = await logsShow({ process: "MyApp" });

      expect(result.success).toBe(true);
    });

    it("should accept subsystem only", async () => {
      const mockRunCommand = vi.mocked(commandUtils.runCommand);
      mockRunCommand.mockResolvedValue(fixtures.LOG_SHOW_EMPTY);

      const result = await logsShow({ subsystem: "com.example.myapp" });

      expect(result.success).toBe(true);
    });
  });

  describe("predicate building", () => {
    it("should build process predicate", async () => {
      const mockRunCommand = vi.mocked(commandUtils.runCommand);
      mockRunCommand.mockResolvedValue(fixtures.LOG_SHOW_EMPTY);

      await logsShow({ process: "SpringBoard" });

      expect(mockRunCommand).toHaveBeenCalledWith(
        "log",
        expect.arrayContaining(["--predicate", 'process == "SpringBoard"']),
        expect.any(Object),
      );
    });

    it("should build subsystem predicate", async () => {
      const mockRunCommand = vi.mocked(commandUtils.runCommand);
      mockRunCommand.mockResolvedValue(fixtures.LOG_SHOW_EMPTY);

      await logsShow({ subsystem: "com.apple.UIKit" });

      expect(mockRunCommand).toHaveBeenCalledWith(
        "log",
        expect.arrayContaining([
          "--predicate",
          'subsystem == "com.apple.UIKit"',
        ]),
        expect.any(Object),
      );
    });

    it("should combine process AND subsystem predicates", async () => {
      const mockRunCommand = vi.mocked(commandUtils.runCommand);
      mockRunCommand.mockResolvedValue(fixtures.LOG_SHOW_EMPTY);

      await logsShow({ process: "MyApp", subsystem: "com.example.myapp" });

      expect(mockRunCommand).toHaveBeenCalledWith(
        "log",
        expect.arrayContaining([
          "--predicate",
          'process == "MyApp" AND subsystem == "com.example.myapp"',
        ]),
        expect.any(Object),
      );
    });
  });

  describe("NDJSON parsing", () => {
    it("should parse valid NDJSON entries", async () => {
      const mockRunCommand = vi.mocked(commandUtils.runCommand);
      mockRunCommand.mockResolvedValue(fixtures.LOG_SHOW_SUCCESS);

      const result = await logsShow({ process: "MyApp" });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.entries).toHaveLength(3);
        expect(result.data.entries[0].process).toBe("MyApp");
        expect(result.data.entries[0].message).toContain("Request started");
        expect(result.data.entries[0].subsystem).toBe("com.example.myapp");
        expect(result.data.entries[0].category).toBe("networking");
      }
    });

    it("should handle empty output", async () => {
      const mockRunCommand = vi.mocked(commandUtils.runCommand);
      mockRunCommand.mockResolvedValue(fixtures.LOG_SHOW_EMPTY);

      const result = await logsShow({ process: "MyApp" });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.entries).toHaveLength(0);
        expect(result.data.count).toBe(0);
        expect(result.data.truncated).toBe(false);
      }
    });
  });

  describe("truncation", () => {
    it("should truncate at max_entries", async () => {
      const mockRunCommand = vi.mocked(commandUtils.runCommand);
      mockRunCommand.mockResolvedValue(fixtures.LOG_SHOW_MANY_ENTRIES);

      const result = await logsShow({ process: "MyApp", max_entries: 10 });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.entries).toHaveLength(10);
        expect(result.data.count).toBe(10);
        expect(result.data.truncated).toBe(true);
        expect(result.data.message).toContain("truncated");
      }
    });

    it("should use default max_entries of 50", async () => {
      const mockRunCommand = vi.mocked(commandUtils.runCommand);
      mockRunCommand.mockResolvedValue(fixtures.LOG_SHOW_MANY_ENTRIES);

      const result = await logsShow({ process: "MyApp" });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.entries).toHaveLength(50);
        expect(result.data.truncated).toBe(true);
      }
    });

    it("should cap max_entries at ceiling (200)", async () => {
      const mockRunCommand = vi.mocked(commandUtils.runCommand);
      mockRunCommand.mockResolvedValue(fixtures.LOG_SHOW_MANY_ENTRIES);

      const result = await logsShow({ process: "MyApp", max_entries: 999 });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.entries.length).toBeLessThanOrEqual(200);
      }
    });
  });

  describe("defaults", () => {
    it("should use default last_minutes of 5", async () => {
      const mockRunCommand = vi.mocked(commandUtils.runCommand);
      mockRunCommand.mockResolvedValue(fixtures.LOG_SHOW_EMPTY);

      await logsShow({ process: "MyApp" });

      expect(mockRunCommand).toHaveBeenCalledWith(
        "log",
        expect.arrayContaining(["--last", "5m"]),
        expect.any(Object),
      );
    });

    it("should use custom last_minutes", async () => {
      const mockRunCommand = vi.mocked(commandUtils.runCommand);
      mockRunCommand.mockResolvedValue(fixtures.LOG_SHOW_EMPTY);

      await logsShow({ process: "MyApp", last_minutes: 15 });

      expect(mockRunCommand).toHaveBeenCalledWith(
        "log",
        expect.arrayContaining(["--last", "15m"]),
        expect.any(Object),
      );
    });

    it("should include --info flag for default info level", async () => {
      const mockRunCommand = vi.mocked(commandUtils.runCommand);
      mockRunCommand.mockResolvedValue(fixtures.LOG_SHOW_EMPTY);

      await logsShow({ process: "MyApp" });

      expect(mockRunCommand).toHaveBeenCalledWith(
        "log",
        expect.arrayContaining(["--info"]),
        expect.any(Object),
      );
    });

    it("should include --debug flag for debug level", async () => {
      const mockRunCommand = vi.mocked(commandUtils.runCommand);
      mockRunCommand.mockResolvedValue(fixtures.LOG_SHOW_EMPTY);

      await logsShow({ process: "MyApp", level: "debug" });

      expect(mockRunCommand).toHaveBeenCalledWith(
        "log",
        expect.arrayContaining(["--debug"]),
        expect.any(Object),
      );
    });

    it("should not include level flags for error level", async () => {
      const mockRunCommand = vi.mocked(commandUtils.runCommand);
      mockRunCommand.mockResolvedValue(fixtures.LOG_SHOW_EMPTY);

      await logsShow({ process: "MyApp", level: "error" });

      const callArgs = mockRunCommand.mock.calls[0][1];
      expect(callArgs).not.toContain("--info");
      expect(callArgs).not.toContain("--debug");
    });
  });

  describe("error handling", () => {
    it("should handle command execution errors", async () => {
      const mockRunCommand = vi.mocked(commandUtils.runCommand);
      mockRunCommand.mockRejectedValue(new Error("Command timed out"));

      const result = await logsShow({ process: "MyApp" });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain("Command timed out");
      }
    });
  });
});
