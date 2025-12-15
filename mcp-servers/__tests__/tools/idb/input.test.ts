/**
 * Tests for idb input tool
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { idbInput } from "../../../shared/tools/idb/input.js";
import * as commandUtils from "../../../shared/utils/command.js";

vi.mock("../../../shared/utils/command", async () => {
  const actual = await vi.importActual("../../../shared/utils/command");
  return {
    ...actual,
    runCommand: vi.fn(),
  };
});

describe("idbInput", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should type text input", async () => {
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
        stdout: "",
        stderr: "",
        code: 0,
      });

    const result = await idbInput({ text: "Hello World" });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.note).toContain("Hello World");
    }
    expect(mockRunCommand).toHaveBeenCalledWith(
      "idb",
      expect.arrayContaining(["ui", "text", "Hello World"]),
    );
  });

  it("should press a single key", async () => {
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
        stdout: "",
        stderr: "",
        code: 0,
      });

    const result = await idbInput({ key: "return" });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.note).toContain("return");
    }
    expect(mockRunCommand).toHaveBeenCalledWith(
      "idb",
      expect.arrayContaining(["ui", "key", "return"]),
    );
  });

  it("should press key sequences", async () => {
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
        stdout: "",
        stderr: "",
        code: 0,
      });

    const result = await idbInput({ key_sequence: ["delete", "delete", "a"] });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.note).toContain("delete");
    }
    expect(mockRunCommand).toHaveBeenCalledWith(
      "idb",
      expect.arrayContaining(["ui", "key-sequence", "delete", "delete", "a"]),
    );
  });

  it("should validate at least one input method is provided", async () => {
    const result = await idbInput({});

    expect(result.success).toBe(false);
    expect((result as any).error).toContain("Must provide");
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
        stdout: "",
        stderr: "",
        code: 0,
      });

    await idbInput({ text: "test" });

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
      .mockRejectedValueOnce(new Error("Input failed"));

    const result = await idbInput({ text: "test" });

    expect(result.success).toBe(false);
  });

  it("should return error when command exits with non-zero code", async () => {
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
        stdout: "",
        stderr: "Input not supported",
        code: 1,
      });

    const result = await idbInput({ text: "test" });

    expect(result.success).toBe(false);
  });
});
