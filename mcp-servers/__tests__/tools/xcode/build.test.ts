/**
 * Tests for xcode build tool
 *
 * Tests the xcodeBuild function with mocked command execution
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { xcodeBuild } from "../../../shared/tools/xcode/build.js";
import * as commandUtils from "../../../shared/utils/command.js";
import * as buildFixtures from "../../fixtures/xcode-outputs.js";

// Mock the command utilities
vi.mock("../../../shared/utils/command", async () => {
  const actual = await vi.importActual("../../../shared/utils/command");
  return {
    ...actual,
    runCommand: vi.fn(),
    findXcodeProject: vi.fn(),
  };
});

describe("xcodeBuild", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("parameter validation", () => {
    it("should reject missing scheme", async () => {
      const result = await xcodeBuild({ scheme: "" } as any);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain("Scheme required");
      }
    });

    it("should reject undefined scheme", async () => {
      const result = await xcodeBuild({} as any);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain("Scheme required");
      }
    });

    it("should use default configuration Debug", async () => {
      const mockRunCommand = vi.mocked(commandUtils.runCommand);
      const mockFindProject = vi.mocked(commandUtils.findXcodeProject);

      mockFindProject.mockResolvedValue("/path/to/MyApp.xcodeproj");
      mockRunCommand.mockResolvedValue(buildFixtures.SUCCESSFUL_BUILD);

      await xcodeBuild({ scheme: "MyScheme" });

      expect(mockRunCommand).toHaveBeenCalledWith(
        "xcodebuild",
        expect.arrayContaining(["-configuration", "Debug"]),
      );
    });

    it("should accept Release configuration", async () => {
      const mockRunCommand = vi.mocked(commandUtils.runCommand);
      const mockFindProject = vi.mocked(commandUtils.findXcodeProject);

      mockFindProject.mockResolvedValue("/path/to/MyApp.xcodeproj");
      mockRunCommand.mockResolvedValue(buildFixtures.SUCCESSFUL_BUILD);

      await xcodeBuild({ scheme: "MyScheme", configuration: "Release" });

      expect(mockRunCommand).toHaveBeenCalledWith(
        "xcodebuild",
        expect.arrayContaining(["-configuration", "Release"]),
      );
    });
  });

  describe("project discovery", () => {
    it("should auto-detect project when not specified", async () => {
      const mockRunCommand = vi.mocked(commandUtils.runCommand);
      const mockFindProject = vi.mocked(commandUtils.findXcodeProject);

      mockFindProject.mockResolvedValue("/auto/MyApp.xcworkspace");
      mockRunCommand.mockResolvedValue(buildFixtures.SUCCESSFUL_BUILD);

      await xcodeBuild({ scheme: "MyScheme" });

      expect(mockFindProject).toHaveBeenCalled();
      expect(mockRunCommand).toHaveBeenCalledWith(
        "xcodebuild",
        expect.arrayContaining(["-workspace", "/auto/MyApp.xcworkspace"]),
      );
    });

    it("should reject when no project found", async () => {
      const mockFindProject = vi.mocked(commandUtils.findXcodeProject);
      mockFindProject.mockResolvedValue(null);

      const result = await xcodeBuild({ scheme: "MyScheme" });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain("No Xcode project found");
      }
    });

    it("should use .xcworkspace when provided", async () => {
      const mockRunCommand = vi.mocked(commandUtils.runCommand);

      mockRunCommand.mockResolvedValue(buildFixtures.SUCCESSFUL_BUILD);

      await xcodeBuild({
        scheme: "MyScheme",
        project_path: "/custom/MyApp.xcworkspace",
      });

      expect(mockRunCommand).toHaveBeenCalledWith(
        "xcodebuild",
        expect.arrayContaining(["-workspace", "/custom/MyApp.xcworkspace"]),
      );
    });

    it("should use .xcodeproj when provided", async () => {
      const mockRunCommand = vi.mocked(commandUtils.runCommand);

      mockRunCommand.mockResolvedValue(buildFixtures.SUCCESSFUL_BUILD);

      await xcodeBuild({
        scheme: "MyScheme",
        project_path: "/custom/MyApp.xcodeproj",
      });

      expect(mockRunCommand).toHaveBeenCalledWith(
        "xcodebuild",
        expect.arrayContaining(["-project", "/custom/MyApp.xcodeproj"]),
      );
    });
  });

  describe("successful builds", () => {
    it("should return success result with duration", async () => {
      const mockRunCommand = vi.mocked(commandUtils.runCommand);
      const mockFindProject = vi.mocked(commandUtils.findXcodeProject);

      mockFindProject.mockResolvedValue("/path/to/MyApp.xcodeproj");
      mockRunCommand.mockResolvedValue(buildFixtures.SUCCESSFUL_BUILD);

      const result = await xcodeBuild({
        scheme: "MyScheme",
        configuration: "Release",
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.message).toContain("succeeded");
        expect(result.data.duration).toBeDefined();
        expect(result.summary).toContain("Build succeeded");
      }
    });

    it("should calculate build duration correctly", async () => {
      const mockRunCommand = vi.mocked(commandUtils.runCommand);
      const mockFindProject = vi.mocked(commandUtils.findXcodeProject);

      mockFindProject.mockResolvedValue("/path/to/MyApp.xcodeproj");

      // Mock with a delay
      mockRunCommand.mockImplementation(async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
        return buildFixtures.SUCCESSFUL_BUILD;
      });

      const result = await xcodeBuild({ scheme: "MyScheme" });

      expect(result.success).toBe(true);
      if (result.success) {
        const duration = parseFloat(result.data.duration);
        expect(duration).toBeGreaterThanOrEqual(0.1);
      }
    });

    it("should not extract errors when build succeeds", async () => {
      const mockRunCommand = vi.mocked(commandUtils.runCommand);
      const mockFindProject = vi.mocked(commandUtils.findXcodeProject);

      mockFindProject.mockResolvedValue("/path/to/MyApp.xcodeproj");
      mockRunCommand.mockResolvedValue(buildFixtures.BUILD_WITH_WARNINGS);

      const result = await xcodeBuild({ scheme: "MyScheme" });

      expect(result.success).toBe(true);
      if (result.success) {
        // Warnings are included in output but build succeeded
        expect(result.data.errors).toBeUndefined();
      }
    });
  });

  describe("failed builds", () => {
    it("should extract and return linker errors", async () => {
      const mockRunCommand = vi.mocked(commandUtils.runCommand);
      const mockFindProject = vi.mocked(commandUtils.findXcodeProject);

      mockFindProject.mockResolvedValue("/path/to/MyApp.xcodeproj");
      mockRunCommand.mockResolvedValue(buildFixtures.FAILED_BUILD_LINKER_ERROR);

      const result = await xcodeBuild({ scheme: "MyScheme" });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain("Build failed");
        expect(result.details).toContain("Linker command failed");
        expect(result.details).toContain("symbol(s) not found");
      }
    });

    it("should extract and return compile errors", async () => {
      const mockRunCommand = vi.mocked(commandUtils.runCommand);
      const mockFindProject = vi.mocked(commandUtils.findXcodeProject);

      mockFindProject.mockResolvedValue("/path/to/MyApp.xcodeproj");
      mockRunCommand.mockResolvedValue(
        buildFixtures.FAILED_BUILD_COMPILE_ERROR,
      );

      const result = await xcodeBuild({ scheme: "MyScheme" });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain("Build failed");
        expect(result.details).toContain("Cannot find 'nonexistentFunction'");
        expect(result.details).toContain(
          "Variable 'foo' was never initialized",
        );
      }
    });

    it("should return duration even when build fails", async () => {
      const mockRunCommand = vi.mocked(commandUtils.runCommand);
      const mockFindProject = vi.mocked(commandUtils.findXcodeProject);

      mockFindProject.mockResolvedValue("/path/to/MyApp.xcodeproj");
      mockRunCommand.mockResolvedValue(buildFixtures.FAILED_BUILD_LINKER_ERROR);

      const result = await xcodeBuild({ scheme: "MyScheme" });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain("in");
        // Duration should be in error message
        expect(result.error).toMatch(/\d+\.\d+s/);
      }
    });
  });

  describe("command arguments", () => {
    it("should include destination when provided", async () => {
      const mockRunCommand = vi.mocked(commandUtils.runCommand);
      const mockFindProject = vi.mocked(commandUtils.findXcodeProject);

      mockFindProject.mockResolvedValue("/path/to/project");
      mockRunCommand.mockResolvedValue(buildFixtures.SUCCESSFUL_BUILD);

      await xcodeBuild({
        scheme: "MyScheme",
        destination: "platform=iOS Simulator,name=iPhone 15",
      });

      expect(mockRunCommand).toHaveBeenCalledWith(
        "xcodebuild",
        expect.arrayContaining([
          "-destination",
          "platform=iOS Simulator,name=iPhone 15",
        ]),
      );
    });

    it("should always include build command", async () => {
      const mockRunCommand = vi.mocked(commandUtils.runCommand);
      const mockFindProject = vi.mocked(commandUtils.findXcodeProject);

      mockFindProject.mockResolvedValue("/path/to/project");
      mockRunCommand.mockResolvedValue(buildFixtures.SUCCESSFUL_BUILD);

      await xcodeBuild({ scheme: "MyScheme" });

      const callArgs = mockRunCommand.mock.calls[0];
      expect(callArgs[1]).toContain("build");
    });

    it("should construct arguments in correct order", async () => {
      const mockRunCommand = vi.mocked(commandUtils.runCommand);
      const mockFindProject = vi.mocked(commandUtils.findXcodeProject);

      mockFindProject.mockResolvedValue("/path/to/MyApp.xcodeproj");
      mockRunCommand.mockResolvedValue(buildFixtures.SUCCESSFUL_BUILD);

      await xcodeBuild({
        scheme: "TestScheme",
        configuration: "Debug",
        destination: "platform=iOS Simulator,name=iPhone 15",
      });

      const [command, args] = mockRunCommand.mock.calls[0];
      expect(command).toBe("xcodebuild");
      expect(args).toEqual(
        expect.arrayContaining([
          "-project",
          "-scheme",
          "TestScheme",
          "-configuration",
          "Debug",
        ]),
      );
    });
  });

  describe("error handling", () => {
    it("should catch and handle command execution errors", async () => {
      const mockRunCommand = vi.mocked(commandUtils.runCommand);
      const mockFindProject = vi.mocked(commandUtils.findXcodeProject);

      mockFindProject.mockResolvedValue("/path/to/MyApp.xcodeproj");
      mockRunCommand.mockRejectedValue(new Error("Process crashed"));

      const result = await xcodeBuild({ scheme: "MyScheme" });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain("Process crashed");
      }
    });

    it("should handle project discovery errors gracefully", async () => {
      const mockFindProject = vi.mocked(commandUtils.findXcodeProject);

      mockFindProject.mockRejectedValue(new Error("Filesystem error"));

      const result = await xcodeBuild({ scheme: "MyScheme" });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeDefined();
      }
    });
  });
});
