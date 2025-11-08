/**
 * Tests for simulator boot tool
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { simulatorBoot } from "../../../shared/tools/simulator/boot.js";
import * as commandUtils from "../../../shared/utils/command.js";

vi.mock("../../../shared/utils/command", async () => {
  const actual = await vi.importActual("../../../shared/utils/command");
  return {
    ...actual,
    runCommand: vi.fn(),
  };
});

describe("simulatorBoot", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should boot simulator with device ID", async () => {
    const mockRunCommand = vi.mocked(commandUtils.runCommand);
    mockRunCommand.mockResolvedValue({
      stdout: "",
      stderr: "",
      code: 0,
    });

    const result = await simulatorBoot({ device_id: "ABC-123" });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.device_id).toBe("ABC-123");
      expect(result.data.message).toContain("booted");
    }
  });

  it("should boot simulator with device name", async () => {
    const mockRunCommand = vi.mocked(commandUtils.runCommand);
    mockRunCommand.mockResolvedValue({
      stdout: "",
      stderr: "",
      code: 0,
    });

    const result = await simulatorBoot({ device_id: "iPhone 15" });

    expect(result.success).toBe(true);
    expect(mockRunCommand).toHaveBeenCalledWith(
      "xcrun",
      expect.arrayContaining(["simctl", "boot", "iPhone 15"]),
    );
  });

  it("should validate device_id is required", async () => {
    const result = await simulatorBoot({} as any);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain("device_id required");
    }
  });

  it("should handle boot failures", async () => {
    const mockRunCommand = vi.mocked(commandUtils.runCommand);
    mockRunCommand.mockResolvedValue({
      stdout: "",
      stderr: "Device already booted",
      code: 1,
    });

    const result = await simulatorBoot({ device_id: "ABC-123" });

    expect(result.success).toBe(false);
  });

  it("should handle command execution errors", async () => {
    const mockRunCommand = vi.mocked(commandUtils.runCommand);
    mockRunCommand.mockRejectedValue(new Error("Command not found"));

    const result = await simulatorBoot({ device_id: "ABC-123" });

    expect(result.success).toBe(false);
  });

  it("should include device ID in response data", async () => {
    const mockRunCommand = vi.mocked(commandUtils.runCommand);
    mockRunCommand.mockResolvedValue({
      stdout: "",
      stderr: "",
      code: 0,
    });

    const deviceId = "DEVICE-UUID-12345";
    const result = await simulatorBoot({ device_id: deviceId });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.device_id).toBe(deviceId);
    }
  });

  it("should use xcrun simctl for boot command", async () => {
    const mockRunCommand = vi.mocked(commandUtils.runCommand);
    mockRunCommand.mockResolvedValue({
      stdout: "",
      stderr: "",
      code: 0,
    });

    await simulatorBoot({ device_id: "ABC-123" });

    expect(mockRunCommand).toHaveBeenCalledWith(
      "xcrun",
      expect.arrayContaining(["simctl", "boot"]),
    );
  });
});
