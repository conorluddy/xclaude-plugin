/**
 * Tests for xcode version tool
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { xcodeVersion } from "../../../shared/tools/xcode/version.js";
import * as commandUtils from "../../../shared/utils/command.js";

vi.mock("../../../shared/utils/command", async () => {
  const actual = await vi.importActual("../../../shared/utils/command");
  return {
    ...actual,
    runCommand: vi.fn(),
  };
});

describe("xcodeVersion", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should parse Xcode version successfully", async () => {
    const mockRunCommand = vi.mocked(commandUtils.runCommand);
    mockRunCommand.mockResolvedValue({
      stdout: "Xcode 15.0\nBuild version 15A240d",
      stderr: "",
      code: 0,
    });

    const result = await xcodeVersion({});

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.message).toContain("15");
    }
  });

  it("should return empty version when Xcode output is empty", async () => {
    const mockRunCommand = vi.mocked(commandUtils.runCommand);
    mockRunCommand.mockResolvedValue({
      stdout: "",
      stderr: "",
      code: 0,
    });

    const result = await xcodeVersion({});

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.xcode_version).toBeUndefined();
    }
  });

  it("should handle command execution errors", async () => {
    const mockRunCommand = vi.mocked(commandUtils.runCommand);
    mockRunCommand.mockRejectedValue(new Error("Command failed"));

    const result = await xcodeVersion({});

    expect(result.success).toBe(false);
  });
});
