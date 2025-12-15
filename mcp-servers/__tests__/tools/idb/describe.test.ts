/**
 * Tests for idb describe tool
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { idbDescribe } from "../../../shared/tools/idb/describe.js";
import * as commandUtils from "../../../shared/utils/command.js";

vi.mock("../../../shared/utils/command", async () => {
  const actual = await vi.importActual("../../../shared/utils/command");
  return {
    ...actual,
    runCommand: vi.fn(),
  };
});

describe("idbDescribe", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should parse accessibility tree from JSON output", async () => {
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
            label: "Sign In",
            value: null,
            type: "Button",
            frame: { x: 100, y: 200, width: 80, height: 40 },
          },
          {
            label: "Email Field",
            value: "user@example.com",
            type: "TextField",
            frame: { x: 20, y: 100, width: 280, height: 40 },
          },
        ]),
        stderr: "",
        code: 0,
      });

    const result = await idbDescribe({ operation: "all" });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.elements).toHaveLength(2);
      expect(result.data.elements![0].label).toBe("Sign In");
      expect(result.data.elements![0].centerX).toBe(140);
      expect(result.data.elements![0].centerY).toBe(220);
    }
  });

  it("should query accessibility tree at specific coordinates", async () => {
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
            label: "Login Button",
            value: null,
            type: "Button",
            frame: { x: 100, y: 400, width: 100, height: 50 },
          },
        ]),
        stderr: "",
        code: 0,
      });

    const result = await idbDescribe({
      operation: "point",
      x: 150,
      y: 425,
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.element).toBeDefined();
      expect(result.data.element!.label).toBe("Login Button");
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

    const result = await idbDescribe({ operation: "all" });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.elements).toHaveLength(0);
    }
  });

  it("should validate point operation requires coordinates", async () => {
    const mockRunCommand = vi.mocked(commandUtils.runCommand);
    mockRunCommand.mockResolvedValueOnce({
      stdout: JSON.stringify({
        devices: {
          "com.apple.CoreSimulator.SimRuntime.iOS-17-0": [
            { state: "Booted", name: "iPhone 15", udid: "TEST-UDID-1234" },
          ],
        },
      }),
      stderr: "",
      code: 0,
    });

    const result = await idbDescribe({
      operation: "point",
      // Missing x and y
    });

    expect(result.success).toBe(false);
    expect((result as any).error).toContain("Invalid operation");
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

    await idbDescribe({ operation: "all" });

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

    const result = await idbDescribe({ operation: "all" });

    expect(result.success).toBe(false);
  });
});
