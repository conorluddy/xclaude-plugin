/**
 * Tests for idb find-element tool
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { idbFindElement } from "../../../shared/tools/idb/find-element.js";
import * as commandUtils from "../../../shared/utils/command.js";

vi.mock("../../../shared/utils/command", async () => {
  const actual = await vi.importActual("../../../shared/utils/command");
  return {
    ...actual,
    runCommand: vi.fn(),
  };
});

describe("idbFindElement", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should find elements matching query", async () => {
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
          {
            label: "Sign Up Button",
            value: null,
            type: "Button",
            frame: { x: 220, y: 400, width: 100, height: 50 },
          },
        ]),
        stderr: "",
        code: 0,
      });

    const result = await idbFindElement({ query: "Button" });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.count).toBe(2);
      expect(result.data.matches).toHaveLength(2);
      expect(result.data.matches[0].label).toContain("Login");
    }
  });

  it("should perform case-insensitive search", async () => {
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
            label: "EMAIL FIELD",
            value: "user@example.com",
            type: "TextField",
            frame: { x: 20, y: 100, width: 280, height: 40 },
          },
        ]),
        stderr: "",
        code: 0,
      });

    const result = await idbFindElement({ query: "email" });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.matches).toHaveLength(1);
    }
  });

  it("should search by value as well as label", async () => {
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
            label: "TextField",
            value: "user@example.com",
            type: "TextField",
            frame: { x: 20, y: 100, width: 280, height: 40 },
          },
        ]),
        stderr: "",
        code: 0,
      });

    const result = await idbFindElement({ query: "example.com" });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.matches).toHaveLength(1);
      expect(result.data.matches[0].value).toContain("example.com");
    }
  });

  it("should handle no matching elements", async () => {
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
            label: "Login",
            value: null,
            type: "Button",
            frame: { x: 100, y: 400, width: 100, height: 50 },
          },
        ]),
        stderr: "",
        code: 0,
      });

    const result = await idbFindElement({ query: "NonExistent" });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.count).toBe(0);
      expect(result.data.matches).toHaveLength(0);
    }
  });

  it("should validate query is required", async () => {
    const result = await idbFindElement({} as any);

    expect(result.success).toBe(false);
    expect((result as any).error).toContain("query required");
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

    await idbFindElement({ query: "Button" });

    expect(mockRunCommand).toHaveBeenCalledWith(
      "idb",
      expect.arrayContaining(["--udid", "TEST-UDID-1234"]),
    );
  });

  it("should handle command execution errors", async () => {
    const mockRunCommand = vi.mocked(commandUtils.runCommand);
    mockRunCommand.mockRejectedValue(new Error("Command failed"));

    const result = await idbFindElement({ query: "Button" });

    expect(result.success).toBe(false);
  });

  it("should calculate center coordinates for tap", async () => {
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
            label: "Button",
            value: null,
            type: "Button",
            frame: { x: 100, y: 200, width: 80, height: 40 },
          },
        ]),
        stderr: "",
        code: 0,
      });

    const result = await idbFindElement({ query: "Button" });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.matches[0].centerX).toBe(140);
      expect(result.data.matches[0].centerY).toBe(220);
    }
  });
});
