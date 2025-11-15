/**
 * Tests for build-and-run.ts - Build, install, and launch tool
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { buildAndRun } from "../../../shared/tools/xcode/build-and-run.js";

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
}));

import * as command from "../../../shared/utils/command.js";
import * as fs from "fs/promises";
import * as destination from "../../../shared/utils/destination.js";

const mockRunCommand = command.runCommand as ReturnType<typeof vi.fn>;
const mockFindXcodeProject = command.findXcodeProject as ReturnType<
  typeof vi.fn
>;
const mockResolveDestination = destination.resolveDestination as ReturnType<
  typeof vi.fn
>;
const mockReaddir = fs.readdir as ReturnType<typeof vi.fn>;

describe("Build and Run Tool", () => {
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

  describe("buildAndRun", () => {
    it("should validate scheme is required", async () => {
      const result = await buildAndRun({
        destination: mockDestination,
      } as any);

      expect(result.success).toBe(false);
      expect(result.error).toContain("Scheme required");
    });

    it("should validate destination is required", async () => {
      const result = await buildAndRun({
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

      await buildAndRun({
        scheme: mockScheme,
        destination: mockDestination,
      });

      expect(mockFindXcodeProject).toHaveBeenCalled();
    });

    it("should return error if project not found", async () => {
      mockFindXcodeProject.mockResolvedValue(null);

      const result = await buildAndRun({
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

      await buildAndRun({
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

      await buildAndRun({
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

      await buildAndRun({
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

      await buildAndRun({
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

      await buildAndRun({
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
      mockRunCommand.mockResolvedValue({
        code: 1,
        stdout: "Build output",
        stderr: "Build failed",
      });

      const result = await buildAndRun({
        project_path: mockProjectPath,
        scheme: mockScheme,
        destination: mockDestination,
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain("Build failed");
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

      await buildAndRun({
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
  });
});

// Sample bundle ID output from defaults read command
const bundleIdOutput = "com.example.MyApp";
