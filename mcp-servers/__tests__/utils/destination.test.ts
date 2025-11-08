/**
 * Tests for destination resolver utilities
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  resolveDestination,
  validateDestination,
  listAvailableSimulators,
} from "../../shared/utils/destination.js";
import * as commandModule from "../../shared/utils/command.js";

// Mock the command module
vi.mock("../../shared/utils/command.js", () => ({
  runCommand: vi.fn(),
}));

describe("destination resolver", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("validateDestination", () => {
    it("should validate empty string as invalid", () => {
      const result = validateDestination("");
      expect(result.isValid).toBe(false);
      expect(result.warning).toContain("cannot be empty");
    });

    it("should validate UDID format as valid", () => {
      const result = validateDestination("id=ABC-123-DEF-456");
      expect(result.isValid).toBe(true);
      expect(result.warning).toBeUndefined();
    });

    it("should validate complete destination as valid", () => {
      const result = validateDestination(
        "platform=iOS Simulator,name=iPhone 15,OS=18.0",
      );
      expect(result.isValid).toBe(true);
      expect(result.warning).toBeUndefined();
    });

    it("should warn for destination missing OS version", () => {
      const result = validateDestination(
        "platform=iOS Simulator,name=iPhone 15",
      );
      expect(result.isValid).toBe(true);
      expect(result.warning).toContain("auto-resolution");
    });

    it("should warn for unexpected format", () => {
      const result = validateDestination("some-random-format");
      expect(result.isValid).toBe(true);
      expect(result.warning).toContain("Unexpected destination format");
    });
  });

  describe("resolveDestination", () => {
    const mockSimulatorOutput = `== Devices ==
-- iOS 17.5 --
    iPhone 14 (ABC-123) (Shutdown)
    iPhone 15 (DEF-456) (Shutdown)
-- iOS 18.0 --
    iPhone 14 (GHI-789) (Booted)
    iPhone 15 (JKL-012) (Shutdown)
    iPhone 15 Pro (MNO-345) (Shutdown)
-- iOS 18.1 --
    iPhone 15 (PQR-678) (Shutdown)
`;

    beforeEach(() => {
      vi.mocked(commandModule.runCommand).mockResolvedValue({
        stdout: mockSimulatorOutput,
        stderr: "",
        code: 0,
      });
    });

    it("should pass through explicit OS version unchanged", async () => {
      const input = "platform=iOS Simulator,name=iPhone 15,OS=17.5";
      const result = await resolveDestination(input);

      expect(result.destination).toBe(input);
      expect(result.wasResolved).toBe(false);
      expect(result.details).toContain("explicit");
    });

    it("should pass through UDID format unchanged", async () => {
      const input = "id=ABC-123-DEF";
      const result = await resolveDestination(input);

      expect(result.destination).toBe(input);
      expect(result.wasResolved).toBe(false);
      expect(result.details).toContain("explicit");
    });

    it("should auto-resolve missing OS version to latest", async () => {
      const input = "platform=iOS Simulator,name=iPhone 15";
      const result = await resolveDestination(input);

      expect(result.destination).toBe(
        "platform=iOS Simulator,name=iPhone 15,OS=18.1",
      );
      expect(result.wasResolved).toBe(true);
      expect(result.details).toContain("18.1");
    });

    it("should resolve to correct device when multiple OS versions exist", async () => {
      const input = "platform=iOS Simulator,name=iPhone 14";
      const result = await resolveDestination(input);

      // Should resolve to iOS 18.0 (latest available for iPhone 14)
      expect(result.destination).toBe(
        "platform=iOS Simulator,name=iPhone 14,OS=18.0",
      );
      expect(result.wasResolved).toBe(true);
    });

    it("should warn when device name not found", async () => {
      const input = "platform=iOS Simulator,name=iPhone 16 Pro Max";
      const result = await resolveDestination(input);

      expect(result.destination).toBe(input);
      expect(result.wasResolved).toBe(false);
      expect(result.warning).toContain("No available simulator found");
      expect(result.warning).toContain("iPhone 16 Pro Max");
    });

    it("should list available devices in warning when no match found", async () => {
      const input = "platform=iOS Simulator,name=NonExistent Device";
      const result = await resolveDestination(input);

      expect(result.warning).toContain("Available:");
      expect(result.warning).toContain("iPhone 14");
      expect(result.warning).toContain("iPhone 15");
    });

    it("should pass through destination without name parameter", async () => {
      const input = "platform=iOS Simulator";
      const result = await resolveDestination(input);

      expect(result.destination).toBe(input);
      expect(result.wasResolved).toBe(false);
      // This will return "Unexpected destination format" from validation since it has platform but no name
      expect(result.warning).toBeDefined();
    });

    it("should handle simctl command failure gracefully", async () => {
      vi.mocked(commandModule.runCommand).mockRejectedValue(
        new Error("simctl not found"),
      );

      const input = "platform=iOS Simulator,name=iPhone 15";
      const result = await resolveDestination(input);

      expect(result.destination).toBe(input);
      expect(result.wasResolved).toBe(false);
      expect(result.warning).toContain("Failed to resolve");
    });

    it("should handle simctl non-zero exit code", async () => {
      vi.mocked(commandModule.runCommand).mockResolvedValue({
        stdout: "",
        stderr: "Command failed",
        code: 1,
      });

      const input = "platform=iOS Simulator,name=iPhone 15";
      const result = await resolveDestination(input);

      expect(result.destination).toBe(input);
      expect(result.wasResolved).toBe(false);
      expect(result.warning).toContain("Failed to resolve");
    });

    it("should prefer Shutdown/Booted devices over Unavailable", async () => {
      const outputWithUnavailable = `== Devices ==
-- iOS 18.0 --
    iPhone 15 (ABC-123) (Unavailable)
-- iOS 18.1 --
    iPhone 15 (DEF-456) (Shutdown)
`;
      vi.mocked(commandModule.runCommand).mockResolvedValue({
        stdout: outputWithUnavailable,
        stderr: "",
        code: 0,
      });

      const input = "platform=iOS Simulator,name=iPhone 15";
      const result = await resolveDestination(input);

      // Should resolve to 18.1 (available) not 18.0 (unavailable)
      expect(result.destination).toBe(
        "platform=iOS Simulator,name=iPhone 15,OS=18.1",
      );
      expect(result.wasResolved).toBe(true);
    });

    it("should handle device names with special characters", async () => {
      const outputWithSpecialChars = `== Devices ==
-- iOS 18.0 --
    iPhone 15 Pro Max (ABC-123) (Shutdown)
`;
      vi.mocked(commandModule.runCommand).mockResolvedValue({
        stdout: outputWithSpecialChars,
        stderr: "",
        code: 0,
      });

      const input = "platform=iOS Simulator,name=iPhone 15 Pro Max";
      const result = await resolveDestination(input);

      expect(result.destination).toBe(
        "platform=iOS Simulator,name=iPhone 15 Pro Max,OS=18.0",
      );
      expect(result.wasResolved).toBe(true);
    });

    it("should sort versions correctly (18.1 > 18.0 > 17.5)", async () => {
      const input = "platform=iOS Simulator,name=iPhone 15";
      const result = await resolveDestination(input);

      // Should pick 18.1 as latest, not 18.0 or 17.5
      expect(result.destination).toContain("OS=18.1");
    });

    it("should handle major version differences correctly (19.0 > 18.9)", async () => {
      const outputWithMajorVersions = `== Devices ==
-- iOS 18.9 --
    iPhone 15 (ABC-123) (Shutdown)
-- iOS 19.0 --
    iPhone 15 (DEF-456) (Shutdown)
`;
      vi.mocked(commandModule.runCommand).mockResolvedValue({
        stdout: outputWithMajorVersions,
        stderr: "",
        code: 0,
      });

      const input = "platform=iOS Simulator,name=iPhone 15";
      const result = await resolveDestination(input);

      expect(result.destination).toBe(
        "platform=iOS Simulator,name=iPhone 15,OS=19.0",
      );
    });
  });

  describe("listAvailableSimulators", () => {
    it("should return parsed simulator list", async () => {
      const mockOutput = `== Devices ==
-- iOS 18.0 --
    iPhone 15 (ABC-123) (Shutdown)
    iPhone 15 Pro (DEF-456) (Booted)
`;
      vi.mocked(commandModule.runCommand).mockResolvedValue({
        stdout: mockOutput,
        stderr: "",
        code: 0,
      });

      const simulators = await listAvailableSimulators();

      expect(simulators).toHaveLength(2);
      expect(simulators[0]).toMatchObject({
        name: "iPhone 15",
        udid: "ABC-123",
        runtime: "iOS",
        osVersion: "18.0",
        available: true,
      });
      expect(simulators[1]).toMatchObject({
        name: "iPhone 15 Pro",
        udid: "DEF-456",
        runtime: "iOS",
        osVersion: "18.0",
        available: true,
      });
    });

    it("should handle empty simulator list", async () => {
      vi.mocked(commandModule.runCommand).mockResolvedValue({
        stdout: "== Devices ==\n",
        stderr: "",
        exitCode: 0,
        code: 0,
      });

      const simulators = await listAvailableSimulators();

      expect(simulators).toHaveLength(0);
    });

    it("should propagate simctl errors", async () => {
      vi.mocked(commandModule.runCommand).mockRejectedValue(
        new Error("simctl failed"),
      );

      await expect(listAvailableSimulators()).rejects.toThrow(
        "Failed to query simulators",
      );
    });
  });
});
