/**
 * Tests for simulator screenshot tool
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { simulatorScreenshot } from "../../../shared/tools/simulator/screenshot.js";
import * as commandUtils from "../../../shared/utils/command.js";

vi.mock("../../../shared/utils/command", async () => {
  const actual = await vi.importActual("../../../shared/utils/command");
  return {
    ...actual,
    runCommand: vi.fn(),
  };
});

describe("simulatorScreenshot", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should capture screenshot with auto-generated path", async () => {
    const mockRunCommand = vi.mocked(commandUtils.runCommand);
    mockRunCommand.mockResolvedValue({
      stdout: "Screenshot saved",
      stderr: "",
      code: 0,
    });

    const result = await simulatorScreenshot({});

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.message).toContain("captured");
      expect(result.data.output_path).toBeDefined();
      expect(result.data.output_path).toMatch(/\/tmp\/screenshot-.+\.png$/);
    }
  });

  it("should use custom output path when specified", async () => {
    const mockRunCommand = vi.mocked(commandUtils.runCommand);
    mockRunCommand.mockResolvedValue({
      stdout: "Screenshot saved",
      stderr: "",
      code: 0,
    });

    const customPath = "/custom/path/screenshot.png";
    const result = await simulatorScreenshot({
      output_path: customPath,
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.output_path).toBe(customPath);
    }
    expect(mockRunCommand).toHaveBeenCalledWith(
      "xcrun",
      expect.arrayContaining([
        "simctl",
        "io",
        "booted",
        "screenshot",
        customPath,
      ]),
    );
  });

  it("should use booted device by default", async () => {
    const mockRunCommand = vi.mocked(commandUtils.runCommand);
    mockRunCommand.mockResolvedValue({
      stdout: "Screenshot saved",
      stderr: "",
      code: 0,
    });

    await simulatorScreenshot({});

    expect(mockRunCommand).toHaveBeenCalledWith(
      "xcrun",
      expect.arrayContaining(["io", "booted"]),
    );
  });

  it("should use custom device ID when specified", async () => {
    const mockRunCommand = vi.mocked(commandUtils.runCommand);
    mockRunCommand.mockResolvedValue({
      stdout: "Screenshot saved",
      stderr: "",
      code: 0,
    });

    const deviceId = "ABC-123-DEF-456";
    await simulatorScreenshot({ device_id: deviceId });

    expect(mockRunCommand).toHaveBeenCalledWith(
      "xcrun",
      expect.arrayContaining(["io", deviceId]),
    );
  });

  it("should handle screenshot capture failures", async () => {
    const mockRunCommand = vi.mocked(commandUtils.runCommand);
    mockRunCommand.mockResolvedValue({
      stdout: "",
      stderr: "Device not found",
      code: 1,
    });

    const result = await simulatorScreenshot({});

    expect(result.success).toBe(false);
  });

  it("should handle command execution errors", async () => {
    const mockRunCommand = vi.mocked(commandUtils.runCommand);
    mockRunCommand.mockRejectedValue(new Error("Command not found"));

    const result = await simulatorScreenshot({});

    expect(result.success).toBe(false);
  });

  it("should log screenshot capture with correct device", async () => {
    const mockRunCommand = vi.mocked(commandUtils.runCommand);
    mockRunCommand.mockResolvedValue({
      stdout: "Screenshot saved",
      stderr: "",
      code: 0,
    });

    await simulatorScreenshot({ device_id: "iPhone15-Device" });

    expect(mockRunCommand).toHaveBeenCalled();
    const args = mockRunCommand.mock.calls[0][1];
    expect(args).toContain("iPhone15-Device");
  });
});
