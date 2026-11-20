/**
 * Tests for idb check-quality tool
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { idbCheckQuality } from "../../../shared/tools/idb/check-quality.js";
import * as commandUtils from "../../../shared/utils/command.js";

vi.mock("../../../shared/utils/command", async () => {
  const actual = await vi.importActual("../../../shared/utils/command");
  return {
    ...actual,
    runCommand: vi.fn(),
  };
});

describe("idbCheckQuality", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should calculate high accessibility quality score", async () => {
    const mockRunCommand = vi.mocked(commandUtils.runCommand);
    mockRunCommand
      .mockResolvedValueOnce({
        stdout: JSON.stringify({
          devices: {
            "com.apple.CoreSimulator.SimRuntime.iOS-17-0": [
              { state: "Booted", name: "iPhone 15", udid: "TEST-UDID-1234" },
            ],
          },
        }),
        stderr: "",
        code: 0,
      })
      .mockResolvedValueOnce({
        stdout: JSON.stringify([
          {
            AXLabel: "Login Button",
            AXValue: null,
            type: "Button",
            frame: { x: 100, y: 400, width: 100, height: 50 },
          },
          {
            AXLabel: "Email Field",
            AXValue: "user@example.com",
            type: "TextField",
            frame: { x: 20, y: 100, width: 280, height: 40 },
          },
          {
            AXLabel: "Password Field",
            AXValue: "",
            type: "TextField",
            frame: { x: 20, y: 150, width: 280, height: 40 },
          },
        ]),
        stderr: "",
        code: 0,
      });

    const result = await idbCheckQuality({});

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.score).toBe(100);
      expect(result.data.total_elements).toBe(3);
      expect(result.data.labeled_elements).toBe(3);
      expect(result.data.recommendation).toContain("sufficient");
    }
  });

  it("should calculate moderate accessibility quality score", async () => {
    const mockRunCommand = vi.mocked(commandUtils.runCommand);
    mockRunCommand
      .mockResolvedValueOnce({
        stdout: JSON.stringify({
          devices: {
            "com.apple.CoreSimulator.SimRuntime.iOS-17-0": [
              { state: "Booted", name: "iPhone 15", udid: "TEST-UDID-1234" },
            ],
          },
        }),
        stderr: "",
        code: 0,
      })
      .mockResolvedValueOnce({
        stdout: JSON.stringify([
          {
            AXLabel: "Button",
            AXValue: null,
            type: "Button",
            frame: { x: 100, y: 400, width: 100, height: 50 },
          },
          {
            AXLabel: "Field",
            AXValue: null,
            type: "TextField",
            frame: { x: 20, y: 100, width: 280, height: 40 },
          },
          {
            AXLabel: null,
            AXValue: null,
            type: "View",
            frame: { x: 0, y: 0, width: 100, height: 100 },
          },
        ]),
        stderr: "",
        code: 0,
      });

    const result = await idbCheckQuality({});

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.score).toBe(67);
      expect(result.data.labeled_elements).toBe(2);
      expect(result.data.recommendation).toContain("Moderate");
    }
  });

  it("should calculate low accessibility quality score", async () => {
    const mockRunCommand = vi.mocked(commandUtils.runCommand);
    mockRunCommand
      .mockResolvedValueOnce({
        stdout: JSON.stringify({
          devices: {
            "com.apple.CoreSimulator.SimRuntime.iOS-17-0": [
              { state: "Booted", name: "iPhone 15", udid: "TEST-UDID-1234" },
            ],
          },
        }),
        stderr: "",
        code: 0,
      })
      .mockResolvedValueOnce({
        stdout: JSON.stringify([
          {
            AXLabel: null,
            AXValue: null,
            type: "View",
            frame: { x: 0, y: 0, width: 100, height: 100 },
          },
          {
            AXLabel: null,
            AXValue: null,
            type: "View",
            frame: { x: 0, y: 0, width: 100, height: 100 },
          },
          {
            AXLabel: null,
            AXValue: null,
            type: "View",
            frame: { x: 0, y: 0, width: 100, height: 100 },
          },
        ]),
        stderr: "",
        code: 0,
      });

    const result = await idbCheckQuality({});

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.score).toBe(0);
      expect(result.data.labeled_elements).toBe(0);
      expect(result.data.recommendation).toContain("screenshot");
    }
  });

  it("should count interactive elements", async () => {
    const mockRunCommand = vi.mocked(commandUtils.runCommand);
    mockRunCommand
      .mockResolvedValueOnce({
        stdout: JSON.stringify({
          devices: {
            "com.apple.CoreSimulator.SimRuntime.iOS-17-0": [
              { state: "Booted", name: "iPhone 15", udid: "TEST-UDID-1234" },
            ],
          },
        }),
        stderr: "",
        code: 0,
      })
      .mockResolvedValueOnce({
        stdout: JSON.stringify([
          {
            AXLabel: "Login Button",
            AXValue: null,
            type: "Button",
            frame: { x: 100, y: 400, width: 100, height: 50 },
          },
          {
            AXLabel: "Email Field",
            AXValue: "",
            type: "TextField",
            frame: { x: 20, y: 100, width: 280, height: 40 },
          },
          {
            AXLabel: "Label",
            AXValue: null,
            type: "Text",
            frame: { x: 20, y: 50, width: 100, height: 40 },
          },
        ]),
        stderr: "",
        code: 0,
      });

    const result = await idbCheckQuality({});

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.interactive_elements).toBe(2);
    }
  });

  it("should handle empty accessibility tree", async () => {
    const mockRunCommand = vi.mocked(commandUtils.runCommand);
    mockRunCommand
      .mockResolvedValueOnce({
        stdout: JSON.stringify({
          devices: {
            "com.apple.CoreSimulator.SimRuntime.iOS-17-0": [
              { state: "Booted", name: "iPhone 15", udid: "TEST-UDID-1234" },
            ],
          },
        }),
        stderr: "",
        code: 0,
      })
      .mockResolvedValueOnce({
        stdout: JSON.stringify([]),
        stderr: "",
        code: 0,
      });

    const result = await idbCheckQuality({});

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.score).toBe(0);
      expect(result.data.total_elements).toBe(0);
    }
  });

  it("should use booted target by default", async () => {
    const mockRunCommand = vi.mocked(commandUtils.runCommand);
    mockRunCommand
      .mockResolvedValueOnce({
        stdout: JSON.stringify({
          devices: {
            "com.apple.CoreSimulator.SimRuntime.iOS-17-0": [
              { state: "Booted", name: "iPhone 15", udid: "TEST-UDID-1234" },
            ],
          },
        }),
        stderr: "",
        code: 0,
      })
      .mockResolvedValueOnce({
        stdout: JSON.stringify([]),
        stderr: "",
        code: 0,
      });

    await idbCheckQuality({});

    expect(mockRunCommand).toHaveBeenCalledWith(
      "idb",
      expect.arrayContaining(["--udid", "TEST-UDID-1234"]),
    );
  });

  it("should handle command execution errors", async () => {
    const mockRunCommand = vi.mocked(commandUtils.runCommand);
    mockRunCommand
      .mockResolvedValueOnce({
        stdout: JSON.stringify({
          devices: {
            "com.apple.CoreSimulator.SimRuntime.iOS-17-0": [
              { state: "Booted", name: "iPhone 15", udid: "TEST-UDID-1234" },
            ],
          },
        }),
        stderr: "",
        code: 0,
      })
      .mockRejectedValueOnce(new Error("Command failed"));

    const result = await idbCheckQuality({});

    expect(result.success).toBe(false);
  });
});
