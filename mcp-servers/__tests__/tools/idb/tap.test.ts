/**
 * Tests for idb tap tool
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { idbTap } from "../../../shared/tools/idb/tap.js";
import * as commandUtils from "../../../shared/utils/command.js";

vi.mock("../../../shared/utils/command", async () => {
  const actual = await vi.importActual("../../../shared/utils/command");
  return {
    ...actual,
    runCommand: vi.fn(),
  };
});

describe("idbTap", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should tap at provided coordinates", async () => {
    const mockRunCommand = vi.mocked(commandUtils.runCommand);
    mockRunCommand.mockResolvedValue({
      stdout: "",
      stderr: "",
      code: 0,
    });

    const result = await idbTap({ x: 150, y: 250 });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.coordinates).toEqual({ x: 150, y: 250 });
      expect(result.data.message).toContain("successfully");
    }
  });

  it("should validate required coordinates", async () => {
    const result = await idbTap({ x: 100 } as any);

    expect(result.success).toBe(false);
    expect((result as any).error).toContain("required");
  });

  it("should use custom tap duration when provided", async () => {
    const mockRunCommand = vi.mocked(commandUtils.runCommand);
    mockRunCommand.mockResolvedValue({
      stdout: "",
      stderr: "",
      code: 0,
    });

    await idbTap({ x: 100, y: 200, duration: 0.5 });

    expect(mockRunCommand).toHaveBeenCalledWith(
      "idb",
      expect.arrayContaining(["--duration", "0.5"]),
    );
  });

  it("should use default tap duration of 0.1 seconds", async () => {
    const mockRunCommand = vi.mocked(commandUtils.runCommand);
    mockRunCommand.mockResolvedValue({
      stdout: "",
      stderr: "",
      code: 0,
    });

    await idbTap({ x: 100, y: 200 });

    expect(mockRunCommand).toHaveBeenCalledWith(
      "idb",
      expect.arrayContaining(["--duration", "0.1"]),
    );
  });

  it("should use booted target by default", async () => {
    const mockRunCommand = vi.mocked(commandUtils.runCommand);
    mockRunCommand.mockResolvedValue({
      stdout: "",
      stderr: "",
      code: 0,
    });

    await idbTap({ x: 100, y: 200 });

    expect(mockRunCommand).toHaveBeenCalledWith(
      "idb",
      expect.arrayContaining(["--target", "booted"]),
    );
  });

  it("should handle command execution errors", async () => {
    const mockRunCommand = vi.mocked(commandUtils.runCommand);
    mockRunCommand.mockRejectedValue(new Error("Tap failed"));

    const result = await idbTap({ x: 100, y: 200 });

    expect(result.success).toBe(false);
  });

  it("should return error when command exits with non-zero code", async () => {
    const mockRunCommand = vi.mocked(commandUtils.runCommand);
    mockRunCommand.mockResolvedValue({
      stdout: "",
      stderr: "Device not found",
      code: 1,
    });

    const result = await idbTap({ x: 100, y: 200 });

    expect(result.success).toBe(false);
  });
});
