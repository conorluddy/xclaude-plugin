/**
 * Tests for xcode list tool
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { xcodeList } from "../../../shared/tools/xcode/list.js";
import * as commandUtils from "../../../shared/utils/command.js";

vi.mock("../../../shared/utils/command", async () => {
  const actual = await vi.importActual("../../../shared/utils/command");
  return {
    ...actual,
    runCommand: vi.fn(),
    findXcodeProject: vi.fn(),
  };
});

describe("xcodeList", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should parse schemes and targets from xcodebuild output", async () => {
    const mockRunCommand = vi.mocked(commandUtils.runCommand);
    mockRunCommand.mockResolvedValue({
      stdout: `Information about project "MyProject":

Targets:
    MyApp
    MyAppTests
    MyFramework

Build Configurations:
    Debug
    Release

Schemes:
    MyApp
    MyFramework`,
      stderr: "",
      code: 0,
    });

    const result = await xcodeList({
      project_path: "/path/to/project.xcodeproj",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.targets).toContain("MyApp");
      expect(result.data.targets).toContain("MyAppTests");
      expect(result.data.schemes).toContain("MyApp");
      expect(result.data.schemes).toContain("MyFramework");
    }
  });

  it("should handle empty targets and schemes", async () => {
    const mockRunCommand = vi.mocked(commandUtils.runCommand);
    mockRunCommand.mockResolvedValue({
      stdout: `Information about project "MyProject":

Targets:

Build Configurations:
    Debug
    Release

Schemes:`,
      stderr: "",
      code: 0,
    });

    const result = await xcodeList({
      project_path: "/path/to/project.xcodeproj",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.targets).toHaveLength(0);
      expect(result.data.schemes).toHaveLength(0);
    }
  });

  it("should use workspace for xcworkspace projects", async () => {
    const mockRunCommand = vi.mocked(commandUtils.runCommand);
    mockRunCommand.mockResolvedValue({
      stdout: "Schemes:\n    MyScheme",
      stderr: "",
      code: 0,
    });

    await xcodeList({
      project_path: "/path/to/project.xcworkspace",
    });

    expect(mockRunCommand).toHaveBeenCalledWith(
      "xcodebuild",
      expect.arrayContaining(["-workspace", "/path/to/project.xcworkspace"]),
    );
  });

  it("should use project for xcodeproj projects", async () => {
    const mockRunCommand = vi.mocked(commandUtils.runCommand);
    mockRunCommand.mockResolvedValue({
      stdout: "Schemes:\n    MyScheme",
      stderr: "",
      code: 0,
    });

    await xcodeList({
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
      stdout: "Schemes:\n    MyScheme",
      stderr: "",
      code: 0,
    });

    await xcodeList({});

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

    const result = await xcodeList({});

    expect(result.success).toBe(false);
    expect((result as any).error).toContain("No Xcode project found");
  });

  it("should include count in message", async () => {
    const mockRunCommand = vi.mocked(commandUtils.runCommand);
    mockRunCommand.mockResolvedValue({
      stdout: `Targets:
    Target1
    Target2

Schemes:
    Scheme1
    Scheme2
    Scheme3`,
      stderr: "",
      code: 0,
    });

    const result = await xcodeList({
      project_path: "/path/to/project.xcodeproj",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.message).toContain("3 schemes");
      expect(result.data.message).toContain("2 targets");
    }
  });

  it("should handle command execution errors", async () => {
    const mockRunCommand = vi.mocked(commandUtils.runCommand);
    mockRunCommand.mockRejectedValue(new Error("Command failed"));

    const result = await xcodeList({
      project_path: "/path/to/project.xcodeproj",
    });

    expect(result.success).toBe(false);
  });
});
