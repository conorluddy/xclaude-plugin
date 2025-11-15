/**
 * Tests for build-and-launch.ts - Build, install, and launch tool
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { buildAndLaunch } from "../../../shared/tools/xcode/build-and-launch.js";

// Mock command execution
vi.mock("../../../shared/utils/command.js", () => ({
  runCommand: vi.fn(),
  findXcodeProject: vi.fn(),
  extractBuildErrors: vi.fn(),
}));

// Mock fs/promises
vi.mock("fs/promises", () => ({
  readdir: vi.fn(),
  readFile: vi.fn(),
}));

// Mock destination resolver
vi.mock("../../../shared/utils/destination.js", () => ({
  resolveDestination: vi.fn(),
  listAvailableSimulators: vi.fn(),
}));

import * as command from "../../../shared/utils/command.js";
import * as fs from "fs/promises";
import * as destination from "../../../shared/utils/destination.js";

const mockRunCommand = command.runCommand as ReturnType<typeof vi.fn>;
const mockFindXcodeProject = command.findXcodeProject as ReturnType<
  typeof vi.fn
>;
const mockExtractBuildErrors = command.extractBuildErrors as ReturnType<
  typeof vi.fn
>;
const mockResolveDestination = destination.resolveDestination as ReturnType<
  typeof vi.fn
>;
const mockListAvailableSimulators =
  destination.listAvailableSimulators as ReturnType<typeof vi.fn>;
const mockReaddir = fs.readdir as ReturnType<typeof vi.fn>;

describe("Build and Launch Tool", () => {
  const mockProjectPath = "/path/to/MyApp.xcodeproj";
  const mockScheme = "MyApp";
  const mockDestination = "platform=iOS Simulator,name=iPhone 15,OS=18.0";
  const mockUDID = "A1B2C3D4-E5F6-7890-ABCD-EF1234567890";
  const mockBundleId = "com.example.MyApp";
  const mockAppPath = "/path/to/MyApp.app";

  beforeEach(() => {
    vi.clearAllMocks();

    // Default mocks
    mockFindXcodeProject.mockResolvedValue(mockProjectPath);
    mockResolveDestination.mockResolvedValue({
      destination: mockDestination,
      wasResolved: false,
    });
  });

  describe("buildAndLaunch", () => {
    it("should validate scheme is required", async () => {
      const result = await buildAndLaunch({
        destination: mockDestination,
      } as any);

      expect(result.success).toBe(false);
      expect(result.error).toContain("Scheme required");
    });

    it("should validate destination is required", async () => {
      const result = await buildAndLaunch({
        scheme: mockScheme,
      } as any);

      expect(result.success).toBe(false);
      expect(result.error).toContain("Destination");
    });

    it("should find project if not specified", async () => {
      mockRunCommand.mockResolvedValue({
        code: 1,
        stdout: "",
        stderr: "No project",
      });

      await buildAndLaunch({
        scheme: mockScheme,
        destination: mockDestination,
      });

      expect(mockFindXcodeProject).toHaveBeenCalled();
    });

    it("should return error if project not found", async () => {
      mockFindXcodeProject.mockResolvedValue(null);

      const result = await buildAndLaunch({
        scheme: mockScheme,
        destination: mockDestination,
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain("No Xcode project found");
    });

    it("should resolve destination", async () => {
      mockRunCommand.mockResolvedValue({
        code: 1,
        stdout: "",
        stderr: "",
      });

      await buildAndLaunch({
        project_path: mockProjectPath,
        scheme: mockScheme,
        destination: "platform=iOS Simulator,name=iPhone 15",
      });

      expect(mockResolveDestination).toHaveBeenCalledWith(
        "platform=iOS Simulator,name=iPhone 15",
        mockProjectPath,
      );
    });

    it("should build with workspace if .xcworkspace", async () => {
      const workspacePath = "/path/to/MyApp.xcworkspace";
      mockRunCommand.mockResolvedValue({
        code: 1,
        stdout: "",
        stderr: "",
      });

      await buildAndLaunch({
        project_path: workspacePath,
        scheme: mockScheme,
        destination: mockDestination,
      });

      const buildCall = mockRunCommand.mock.calls.find(
        (call) => call[0] === "xcodebuild" && call[1].includes("build"),
      );

      expect(buildCall).toBeDefined();
      expect(buildCall?.[1]).toContain("-workspace");
      expect(buildCall?.[1]).toContain(workspacePath);
    });

    it("should build with project if .xcodeproj", async () => {
      mockRunCommand.mockResolvedValue({
        code: 1,
        stdout: "",
        stderr: "",
      });

      await buildAndLaunch({
        project_path: mockProjectPath,
        scheme: mockScheme,
        destination: mockDestination,
      });

      const buildCall = mockRunCommand.mock.calls.find(
        (call) => call[0] === "xcodebuild" && call[1].includes("build"),
      );

      expect(buildCall).toBeDefined();
      expect(buildCall?.[1]).toContain("-project");
      expect(buildCall?.[1]).toContain(mockProjectPath);
    });

    it("should use specified configuration", async () => {
      mockRunCommand.mockResolvedValue({
        code: 1,
        stdout: "",
        stderr: "",
      });

      await buildAndLaunch({
        project_path: mockProjectPath,
        scheme: mockScheme,
        destination: mockDestination,
        configuration: "Release",
      });

      const buildCall = mockRunCommand.mock.calls.find(
        (call) => call[0] === "xcodebuild",
      );

      expect(buildCall?.[1]).toContain("-configuration");
      expect(buildCall?.[1]).toContain("Release");
    });

    it("should default to Debug configuration", async () => {
      mockRunCommand.mockResolvedValue({
        code: 1,
        stdout: "",
        stderr: "",
      });

      await buildAndLaunch({
        project_path: mockProjectPath,
        scheme: mockScheme,
        destination: mockDestination,
      });

      const buildCall = mockRunCommand.mock.calls.find(
        (call) => call[0] === "xcodebuild",
      );

      expect(buildCall?.[1]).toContain("Debug");
    });

    it("should return error if build fails", async () => {
      const buildStdout = `Build output
error: Cannot find 'foo' in scope
warning: Unused variable 'bar'
Build failed`;

      mockRunCommand.mockResolvedValue({
        code: 1,
        stdout: buildStdout,
        stderr: "",
      });

      mockExtractBuildErrors.mockReturnValue([
        "error: Cannot find 'foo' in scope",
        "warning: Unused variable 'bar'",
      ]);

      const result = await buildAndLaunch({
        project_path: mockProjectPath,
        scheme: mockScheme,
        destination: mockDestination,
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain("Build failed");
      expect(result.details).toContain("error: Cannot find 'foo' in scope");
      expect(result.details).toContain("warning: Unused variable 'bar'");
      expect(mockExtractBuildErrors).toHaveBeenCalledWith(buildStdout + "\n");
    });

    it("should skip build if skip_build is true", async () => {
      mockReaddir.mockResolvedValue([mockScheme] as any);
      mockRunCommand.mockResolvedValue({
        code: 0,
        stdout: bundleIdOutput,
        stderr: "",
      });

      // Mock fs.readdir for finding the app
      const originalReaddir = fs.readdir;
      const readdirMock = vi.fn();
      readdirMock.mockImplementation(async (dirPath) => {
        if (dirPath.includes("DerivedData")) {
          return [mockScheme];
        }
        if (dirPath.includes("Build/Products")) {
          return ["MyApp.app"];
        }
        return [];
      });

      (fs.readdir as any) = readdirMock;

      await buildAndLaunch({
        project_path: mockProjectPath,
        scheme: mockScheme,
        destination: mockDestination,
        skip_build: true,
      });

      const buildCalls = mockRunCommand.mock.calls.filter(
        (call) => call[0] === "xcodebuild",
      );

      expect(buildCalls).toHaveLength(0);

      (fs.readdir as any) = originalReaddir;
    });

    it("should return error if simulator not found during destination resolution", async () => {
      mockResolveDestination.mockResolvedValue({
        destination: mockDestination,
        wasResolved: false,
        warning:
          'No available simulator found for "iPhone 14". Available: iPhone 15, iPhone 16',
      });

      mockListAvailableSimulators.mockResolvedValue([
        {
          name: "iPhone 15",
          udid: "UDID-15",
          runtime: "iOS",
          osVersion: "18.0",
          available: true,
        },
        {
          name: "iPhone 16",
          udid: "UDID-16",
          runtime: "iOS",
          osVersion: "18.0",
          available: true,
        },
      ]);

      const result = await buildAndLaunch({
        project_path: mockProjectPath,
        scheme: mockScheme,
        destination: "platform=iOS Simulator,name=iPhone 14",
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain("No available simulator found");
      expect(result.details).toContain("Available simulators");
      expect(result.details).toContain("iPhone 15");
      expect(result.details).toContain("iPhone 16");
    });

    it("should return error with simulator suggestions if destination resolution fails", async () => {
      mockResolveDestination.mockResolvedValue({
        destination: "platform=iOS Simulator,name=iPhone 14,OS=18.0",
        wasResolved: false,
        warning:
          'No available simulator found for "iPhone 14". Available: iPhone 15',
      });

      mockListAvailableSimulators.mockResolvedValue([
        {
          name: "iPhone 15",
          udid: "UDID-15",
          runtime: "iOS",
          osVersion: "18.0",
          available: true,
        },
      ]);

      const result = await buildAndLaunch({
        project_path: mockProjectPath,
        scheme: mockScheme,
        destination: "platform=iOS Simulator,name=iPhone 14",
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain("No available simulator found");
      expect(result.details).toContain("Available simulators");
      expect(result.details).toContain("iPhone 15");
      expect(result.details).toContain("id=UDID-15");
    });
  });
});

// Sample bundle ID output from defaults read command
const bundleIdOutput = "com.example.MyApp";
