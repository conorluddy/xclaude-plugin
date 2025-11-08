/**
 * Tests for xcode clean tool
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { xcodeClean } from "../../../shared/tools/xcode/clean.js";
import * as commandUtils from "../../../shared/utils/command.js";

vi.mock("../../../shared/utils/command", async () => {
  const actual = await vi.importActual("../../../shared/utils/command");
  return {
    ...actual,
    runCommand: vi.fn(),
    findXcodeProject: vi.fn(),
  };
});

describe("xcodeClean", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should clean project with success", async () => {
    const mockRunCommand = vi.mocked(commandUtils.runCommand);
    mockRunCommand.mockResolvedValue({
      stdout: "Build settings from command line:\nCLEAN SUCCEEDED",
      stderr: "",
      code: 0,
    });

    const result = await xcodeClean({
      project_path: "/path/to/project.xcodeproj",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.message).toContain("successfully");
    }
  });

  it("should clean specific scheme", async () => {
    const mockRunCommand = vi.mocked(commandUtils.runCommand);
    mockRunCommand.mockResolvedValue({
      stdout: "CLEAN SUCCEEDED",
      stderr: "",
      code: 0,
    });

    await xcodeClean({
      project_path: "/path/to/project.xcodeproj",
      scheme: "MyScheme",
    });

    expect(mockRunCommand).toHaveBeenCalledWith(
      "xcodebuild",
      expect.arrayContaining(["-scheme", "MyScheme", "clean"]),
    );
  });

  it("should handle xcworkspace projects", async () => {
    const mockRunCommand = vi.mocked(commandUtils.runCommand);
    mockRunCommand.mockResolvedValue({
      stdout: "CLEAN SUCCEEDED",
      stderr: "",
      code: 0,
    });

    await xcodeClean({
      project_path: "/path/to/project.xcworkspace",
    });

    expect(mockRunCommand).toHaveBeenCalledWith(
      "xcodebuild",
      expect.arrayContaining(["-workspace", "/path/to/project.xcworkspace"]),
    );
  });

  it("should use project instead of workspace for .xcodeproj", async () => {
    const mockRunCommand = vi.mocked(commandUtils.runCommand);
    mockRunCommand.mockResolvedValue({
      stdout: "CLEAN SUCCEEDED",
      stderr: "",
      code: 0,
    });

    await xcodeClean({
      project_path: "/path/to/project.xcodeproj",
    });

    expect(mockRunCommand).toHaveBeenCalledWith(
      "xcodebuild",
      expect.arrayContaining(["-project", "/path/to/project.xcodeproj"]),
    );
  });

  it("should auto-discover project if not specified", async () => {
    const mockFindXcodeProject = vi.mocked(commandUtils.findXcodeProject);
    const mockRunCommand = vi.mocked(commandUtils.runCommand);

    mockFindXcodeProject.mockResolvedValue(
      "/auto/discovered/project.xcodeproj",
    );
    mockRunCommand.mockResolvedValue({
      stdout: "CLEAN SUCCEEDED",
      stderr: "",
      code: 0,
    });

    await xcodeClean({});

    expect(mockFindXcodeProject).toHaveBeenCalled();
    expect(mockRunCommand).toHaveBeenCalledWith(
      "xcodebuild",
      expect.arrayContaining([
        "-project",
        "/auto/discovered/project.xcodeproj",
      ]),
    );
  });

  it("should return error when no project found", async () => {
    const mockFindXcodeProject = vi.mocked(commandUtils.findXcodeProject);
    mockFindXcodeProject.mockResolvedValue(null);

    const result = await xcodeClean({});

    expect(result.success).toBe(false);
    expect((result as any).error).toContain("No Xcode project found");
  });

  it("should handle clean command failures", async () => {
    const mockRunCommand = vi.mocked(commandUtils.runCommand);
    mockRunCommand.mockResolvedValue({
      stdout: "",
      stderr: "Error: project not found",
      code: 1,
    });

    const result = await xcodeClean({
      project_path: "/path/to/project.xcodeproj",
    });

    expect(result.success).toBe(false);
  });

  it("should handle command execution errors", async () => {
    const mockRunCommand = vi.mocked(commandUtils.runCommand);
    mockRunCommand.mockRejectedValue(new Error("Process crashed"));

    const result = await xcodeClean({
      project_path: "/path/to/project.xcodeproj",
    });

    expect(result.success).toBe(false);
  });
});
