/**
 * Tests for simulator launch app tool
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { simulatorLaunchApp } from "../../../shared/tools/simulator/launch-app.js";
import * as commandUtils from "../../../shared/utils/command.js";

vi.mock("../../../shared/utils/command", async () => {
  const actual = await vi.importActual("../../../shared/utils/command");
  return {
    ...actual,
    runCommand: vi.fn(),
  };
});

describe("simulatorLaunchApp", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should launch app with app_identifier", async () => {
    const mockRunCommand = vi.mocked(commandUtils.runCommand);
    mockRunCommand.mockResolvedValue({
      stdout: "12345",
      stderr: "",
      code: 0,
    });

    const result = await simulatorLaunchApp({
      app_identifier: "com.example.MyApp",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.message).toContain("launched");
      expect(result.data.app_identifier).toBe("com.example.MyApp");
      expect(result.data.device_id).toBe("booted");
      expect(result.data.pid).toBe(12345);
    }
    expect(mockRunCommand).toHaveBeenCalledWith("xcrun", [
      "simctl",
      "launch",
      "booted",
      "com.example.MyApp",
    ]);
  });

  it("should launch app on specific device", async () => {
    const mockRunCommand = vi.mocked(commandUtils.runCommand);
    mockRunCommand.mockResolvedValue({
      stdout: "67890",
      stderr: "",
      code: 0,
    });

    const result = await simulatorLaunchApp({
      app_identifier: "com.example.MyApp",
      device_id: "XYZ-789-ABC",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.device_id).toBe("XYZ-789-ABC");
      expect(result.data.pid).toBe(67890);
    }
    expect(mockRunCommand).toHaveBeenCalledWith("xcrun", [
      "simctl",
      "launch",
      "XYZ-789-ABC",
      "com.example.MyApp",
    ]);
  });

  it("should default to booted device when device_id not specified", async () => {
    const mockRunCommand = vi.mocked(commandUtils.runCommand);
    mockRunCommand.mockResolvedValue({
      stdout: "11111",
      stderr: "",
      code: 0,
    });

    const result = await simulatorLaunchApp({
      app_identifier: "com.example.MyApp",
    });

    expect(result.success).toBe(true);
    expect(mockRunCommand).toHaveBeenCalledWith("xcrun", [
      "simctl",
      "launch",
      "booted",
      "com.example.MyApp",
    ]);
  });

  it("should parse PID from stdout", async () => {
    const mockRunCommand = vi.mocked(commandUtils.runCommand);
    mockRunCommand.mockResolvedValue({
      stdout: "com.example.MyApp: 54321",
      stderr: "",
      code: 0,
    });

    const result = await simulatorLaunchApp({
      app_identifier: "com.example.MyApp",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.pid).toBe(54321);
      expect(result.data.note).toContain("54321");
    }
  });

  it("should handle missing PID in stdout", async () => {
    const mockRunCommand = vi.mocked(commandUtils.runCommand);
    mockRunCommand.mockResolvedValue({
      stdout: "",
      stderr: "",
      code: 0,
    });

    const result = await simulatorLaunchApp({
      app_identifier: "com.example.MyApp",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.pid).toBeUndefined();
      expect(result.data.note).toBeUndefined();
    }
  });

  it("should validate app_identifier is required", async () => {
    const result = await simulatorLaunchApp({} as any);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain("app_identifier is required");
    }
  });

  it("should handle launch failures with descriptive error", async () => {
    const mockRunCommand = vi.mocked(commandUtils.runCommand);
    mockRunCommand.mockResolvedValue({
      stdout: "",
      stderr: "App not installed",
      code: 1,
    });

    const result = await simulatorLaunchApp({
      app_identifier: "com.missing.App",
      device_id: "DEVICE-456",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain("Launch failed");
      expect(result.error).toContain("com.missing.App");
      expect(result.error).toContain("DEVICE-456");
      expect(result.details).toBe("App not installed");
    }
  });

  it("should handle command execution errors", async () => {
    const mockRunCommand = vi.mocked(commandUtils.runCommand);
    mockRunCommand.mockRejectedValue(new Error("Simulator not running"));

    const result = await simulatorLaunchApp({
      app_identifier: "com.example.MyApp",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain("Launch failed");
      expect(result.error).toContain("Simulator not running");
    }
  });

  it("should return summary for successful launch", async () => {
    const mockRunCommand = vi.mocked(commandUtils.runCommand);
    mockRunCommand.mockResolvedValue({
      stdout: "12345",
      stderr: "",
      code: 0,
    });

    const result = await simulatorLaunchApp({
      app_identifier: "com.example.MyApp",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.summary).toBe("App launched");
    }
  });

  it("should include operation in error response", async () => {
    const mockRunCommand = vi.mocked(commandUtils.runCommand);
    mockRunCommand.mockRejectedValue(new Error("Test error"));

    const result = await simulatorLaunchApp({
      app_identifier: "com.example.MyApp",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.operation).toBe("launch-app");
    }
  });

  it("should handle bundle identifiers with special characters", async () => {
    const mockRunCommand = vi.mocked(commandUtils.runCommand);
    mockRunCommand.mockResolvedValue({
      stdout: "99999",
      stderr: "",
      code: 0,
    });

    const bundleId = "com.example-company.My-App_123";
    const result = await simulatorLaunchApp({
      app_identifier: bundleId,
    });

    expect(result.success).toBe(true);
    expect(mockRunCommand).toHaveBeenCalledWith("xcrun", [
      "simctl",
      "launch",
      "booted",
      bundleId,
    ]);
  });
});
