/**
 * Tests for simulator install app tool
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { simulatorInstallApp } from "../../../shared/tools/simulator/install-app.js";
import * as commandUtils from "../../../shared/utils/command.js";

vi.mock("../../../shared/utils/command", async () => {
  const actual = await vi.importActual("../../../shared/utils/command");
  return {
    ...actual,
    runCommand: vi.fn(),
  };
});

describe("simulatorInstallApp", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should install app with app_path", async () => {
    const mockRunCommand = vi.mocked(commandUtils.runCommand);
    mockRunCommand.mockResolvedValue({
      stdout: "",
      stderr: "",
      code: 0,
    });

    const result = await simulatorInstallApp({
      app_path: "/path/to/MyApp.app",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.message).toContain("installed");
      expect(result.data.app_path).toBe("/path/to/MyApp.app");
      expect(result.data.device_id).toBe("booted");
    }
    expect(mockRunCommand).toHaveBeenCalledWith("xcrun", [
      "simctl",
      "install",
      "booted",
      "/path/to/MyApp.app",
    ]);
  });

  it("should install app on specific device", async () => {
    const mockRunCommand = vi.mocked(commandUtils.runCommand);
    mockRunCommand.mockResolvedValue({
      stdout: "",
      stderr: "",
      code: 0,
    });

    const result = await simulatorInstallApp({
      app_path: "/path/to/MyApp.app",
      device_id: "ABC-123-DEF",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.device_id).toBe("ABC-123-DEF");
    }
    expect(mockRunCommand).toHaveBeenCalledWith("xcrun", [
      "simctl",
      "install",
      "ABC-123-DEF",
      "/path/to/MyApp.app",
    ]);
  });

  it("should default to booted device when device_id not specified", async () => {
    const mockRunCommand = vi.mocked(commandUtils.runCommand);
    mockRunCommand.mockResolvedValue({
      stdout: "",
      stderr: "",
      code: 0,
    });

    const result = await simulatorInstallApp({
      app_path: "/path/to/MyApp.app",
    });

    expect(result.success).toBe(true);
    expect(mockRunCommand).toHaveBeenCalledWith("xcrun", [
      "simctl",
      "install",
      "booted",
      "/path/to/MyApp.app",
    ]);
  });

  it("should validate app_path is required", async () => {
    const result = await simulatorInstallApp({} as any);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain("app_path is required");
    }
  });

  it("should handle installation failures with descriptive error", async () => {
    const mockRunCommand = vi.mocked(commandUtils.runCommand);
    mockRunCommand.mockResolvedValue({
      stdout: "",
      stderr: "No such file or directory",
      code: 1,
    });

    const result = await simulatorInstallApp({
      app_path: "/invalid/path/MyApp.app",
      device_id: "DEVICE-123",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain("Install failed");
      expect(result.error).toContain("/invalid/path/MyApp.app");
      expect(result.error).toContain("DEVICE-123");
      expect(result.details).toBe("No such file or directory");
    }
  });

  it("should handle command execution errors", async () => {
    const mockRunCommand = vi.mocked(commandUtils.runCommand);
    mockRunCommand.mockRejectedValue(new Error("Command not found"));

    const result = await simulatorInstallApp({
      app_path: "/path/to/MyApp.app",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain("Install failed");
      expect(result.error).toContain("Command not found");
    }
  });

  it("should include note in successful response", async () => {
    const mockRunCommand = vi.mocked(commandUtils.runCommand);
    mockRunCommand.mockResolvedValue({
      stdout: "",
      stderr: "",
      code: 0,
    });

    const result = await simulatorInstallApp({
      app_path: "/path/to/MyApp.app",
      device_id: "TEST-DEVICE",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.note).toContain("TEST-DEVICE");
    }
  });

  it("should return summary for successful installation", async () => {
    const mockRunCommand = vi.mocked(commandUtils.runCommand);
    mockRunCommand.mockResolvedValue({
      stdout: "",
      stderr: "",
      code: 0,
    });

    const result = await simulatorInstallApp({
      app_path: "/path/to/MyApp.app",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.summary).toBe("App installed");
    }
  });

  it("should handle app paths with spaces", async () => {
    const mockRunCommand = vi.mocked(commandUtils.runCommand);
    mockRunCommand.mockResolvedValue({
      stdout: "",
      stderr: "",
      code: 0,
    });

    const appPath = "/path/with spaces/My App.app";
    const result = await simulatorInstallApp({
      app_path: appPath,
    });

    expect(result.success).toBe(true);
    expect(mockRunCommand).toHaveBeenCalledWith("xcrun", [
      "simctl",
      "install",
      "booted",
      appPath,
    ]);
  });
});
