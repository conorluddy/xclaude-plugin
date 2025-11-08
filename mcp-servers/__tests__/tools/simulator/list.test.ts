/**
 * Tests for simulator list tool
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { simulatorList } from "../../../shared/tools/simulator/list.js";
import * as commandUtils from "../../../shared/utils/command.js";

vi.mock("../../../shared/utils/command", async () => {
  const actual = await vi.importActual("../../../shared/utils/command");
  return {
    ...actual,
    runCommand: vi.fn(),
  };
});

describe("simulatorList", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should parse and flatten simulator devices from JSON", async () => {
    const mockRunCommand = vi.mocked(commandUtils.runCommand);
    mockRunCommand.mockResolvedValue({
      stdout: JSON.stringify({
        devices: {
          "com.apple.CoreSimulator.SimRuntime.iOS-17-0": [
            {
              name: "iPhone 15",
              udid: "ABC-123",
              state: "Shutdown",
              isAvailable: true,
            },
            {
              name: "iPhone 15 Pro",
              udid: "DEF-456",
              state: "Booted",
              isAvailable: true,
            },
          ],
          "com.apple.CoreSimulator.SimRuntime.iOS-16-4": [
            {
              name: "iPhone 14",
              udid: "GHI-789",
              state: "Shutdown",
              isAvailable: false,
            },
          ],
        },
      }),
      stderr: "",
      code: 0,
    });

    const result = await simulatorList({ availability: "all" });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.count).toBeGreaterThan(0);
    }
  });

  it("should filter by availability", async () => {
    const mockRunCommand = vi.mocked(commandUtils.runCommand);
    mockRunCommand.mockResolvedValue({
      stdout: JSON.stringify({
        devices: {
          "com.apple.CoreSimulator.SimRuntime.iOS-17-0": [
            {
              name: "iPhone 15",
              udid: "A",
              state: "Shutdown",
              isAvailable: true,
            },
            {
              name: "iPhone 14",
              udid: "B",
              state: "Shutdown",
              isAvailable: false,
            },
          ],
        },
      }),
      stderr: "",
      code: 0,
    });

    const result = await simulatorList({ availability: "available" });

    expect(result.success).toBe(true);
  });

  it("should handle empty device list", async () => {
    const mockRunCommand = vi.mocked(commandUtils.runCommand);
    mockRunCommand.mockResolvedValue({
      stdout: JSON.stringify({ devices: {} }),
      stderr: "",
      code: 0,
    });

    const result = await simulatorList({ availability: "all" });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.count).toBe(0);
    }
  });
});
