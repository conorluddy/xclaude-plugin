/**
 * Tests for idb gesture tool
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { idbGesture } from "../../../shared/tools/idb/gesture.js";
import * as commandUtils from "../../../shared/utils/command.js";

vi.mock("../../../shared/utils/command", async () => {
  const actual = await vi.importActual("../../../shared/utils/command");
  return {
    ...actual,
    runCommand: vi.fn(),
  };
});

describe("idbGesture", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should perform swipe gesture with coordinates", async () => {
    const mockRunCommand = vi.mocked(commandUtils.runCommand);
    mockRunCommand.mockResolvedValue({
      stdout: "",
      stderr: "",
      code: 0,
    });

    const result = await idbGesture({
      gesture_type: "swipe",
      start_x: 100,
      start_y: 200,
      end_x: 100,
      end_y: 600,
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.note).toContain("100, 200");
      expect(result.data.note).toContain("100, 600");
    }
  });

  it("should validate swipe requires all coordinates", async () => {
    const result = await idbGesture({
      gesture_type: "swipe",
      start_x: 100,
      // Missing start_y, end_x, end_y
    } as any);

    expect(result.success).toBe(false);
    expect((result as any).error).toContain("required for swipe");
  });

  it("should press hardware button", async () => {
    const mockRunCommand = vi.mocked(commandUtils.runCommand);
    mockRunCommand.mockResolvedValue({
      stdout: "",
      stderr: "",
      code: 0,
    });

    const result = await idbGesture({
      gesture_type: "button",
      button_type: "HOME",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.note).toContain("HOME");
    }
    expect(mockRunCommand).toHaveBeenCalledWith(
      "idb",
      expect.arrayContaining(["ui", "button", "HOME"]),
    );
  });

  it("should validate button gesture requires button_type", async () => {
    const result = await idbGesture({
      gesture_type: "button",
      // Missing button_type
    } as any);

    expect(result.success).toBe(false);
    expect((result as any).error).toContain("button_type required");
  });

  it("should use custom swipe duration when provided", async () => {
    const mockRunCommand = vi.mocked(commandUtils.runCommand);
    mockRunCommand.mockResolvedValue({
      stdout: "",
      stderr: "",
      code: 0,
    });

    await idbGesture({
      gesture_type: "swipe",
      start_x: 100,
      start_y: 200,
      end_x: 100,
      end_y: 600,
      duration: 500,
    });

    expect(mockRunCommand).toHaveBeenCalledWith(
      "idb",
      expect.arrayContaining(["--duration", "500"]),
    );
  });

  it("should use default swipe duration of 200ms", async () => {
    const mockRunCommand = vi.mocked(commandUtils.runCommand);
    mockRunCommand.mockResolvedValue({
      stdout: "",
      stderr: "",
      code: 0,
    });

    await idbGesture({
      gesture_type: "swipe",
      start_x: 100,
      start_y: 200,
      end_x: 100,
      end_y: 600,
    });

    expect(mockRunCommand).toHaveBeenCalledWith(
      "idb",
      expect.arrayContaining(["--duration", "200"]),
    );
  });

  it("should use booted target by default", async () => {
    const mockRunCommand = vi.mocked(commandUtils.runCommand);
    mockRunCommand.mockResolvedValue({
      stdout: "",
      stderr: "",
      code: 0,
    });

    await idbGesture({
      gesture_type: "button",
      button_type: "LOCK",
    });

    expect(mockRunCommand).toHaveBeenCalledWith(
      "idb",
      expect.arrayContaining(["--target", "booted"]),
    );
  });

  it("should handle command execution errors", async () => {
    const mockRunCommand = vi.mocked(commandUtils.runCommand);
    mockRunCommand.mockRejectedValue(new Error("Gesture failed"));

    const result = await idbGesture({
      gesture_type: "button",
      button_type: "HOME",
    });

    expect(result.success).toBe(false);
  });
});
