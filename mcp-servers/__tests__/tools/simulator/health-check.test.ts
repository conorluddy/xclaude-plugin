/**
 * Tests for simulator health check tool
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { simulatorHealthCheck } from "../../../shared/tools/simulator/health-check.js";
import * as commandUtils from "../../../shared/utils/command.js";

vi.mock("../../../shared/utils/command", async () => {
  const actual = await vi.importActual("../../../shared/utils/command");
  return {
    ...actual,
    runCommand: vi.fn(),
  };
});

describe("simulatorHealthCheck", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should report healthy environment when all tools available", async () => {
    const mockRunCommand = vi.mocked(commandUtils.runCommand);
    mockRunCommand.mockResolvedValue({
      stdout: "Xcode 15.0",
      stderr: "",
      code: 0,
    });

    const result = await simulatorHealthCheck({});

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.xcode_installed).toBe(true);
      expect(result.data.simctl_available).toBe(true);
      expect(result.data.issues).toHaveLength(0);
      expect(result.data.message).toContain("healthy");
    }
  });

  it("should detect missing Xcode", async () => {
    const mockRunCommand = vi.mocked(commandUtils.runCommand);

    // First call (xcodebuild check) fails
    mockRunCommand.mockRejectedValueOnce(new Error("xcodebuild not found"));
    // Second call (simctl check) succeeds
    mockRunCommand.mockResolvedValueOnce({
      stdout: "simctl help",
      stderr: "",
      code: 0,
    });

    const result = await simulatorHealthCheck({});

    expect(result.success).toBe(false);
  });

  it("should detect missing simctl", async () => {
    const mockRunCommand = vi.mocked(commandUtils.runCommand);

    // First call (xcodebuild check) succeeds
    mockRunCommand.mockResolvedValueOnce({
      stdout: "Xcode 15.0",
      stderr: "",
      code: 0,
    });
    // Second call (simctl check) fails
    mockRunCommand.mockRejectedValueOnce(new Error("simctl not found"));

    const result = await simulatorHealthCheck({});

    expect(result.success).toBe(false);
  });

  it("should detect both tools missing", async () => {
    const mockRunCommand = vi.mocked(commandUtils.runCommand);
    mockRunCommand.mockRejectedValue(new Error("tools not found"));

    const result = await simulatorHealthCheck({});

    expect(result.success).toBe(false);
  });

  it("should check xcodebuild version first", async () => {
    const mockRunCommand = vi.mocked(commandUtils.runCommand);
    mockRunCommand.mockResolvedValue({
      stdout: "Xcode 15.0",
      stderr: "",
      code: 0,
    });

    await simulatorHealthCheck({});

    const firstCall = mockRunCommand.mock.calls[0];
    expect(firstCall[0]).toBe("xcodebuild");
    expect(firstCall[1]).toContain("-version");
  });

  it("should check simctl availability second", async () => {
    const mockRunCommand = vi.mocked(commandUtils.runCommand);
    mockRunCommand.mockResolvedValue({
      stdout: "help output",
      stderr: "",
      code: 0,
    });

    await simulatorHealthCheck({});

    const secondCall = mockRunCommand.mock.calls[1];
    expect(secondCall[0]).toBe("xcrun");
    expect(secondCall[1]).toContain("simctl");
    expect(secondCall[1]).toContain("help");
  });
});
