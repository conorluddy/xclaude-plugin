/**
 * Tests for xcode test tool
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { xcodeTest } from "../../../shared/tools/xcode/test.js";
import * as commandUtils from "../../../shared/utils/command.js";

vi.mock("../../../shared/utils/command", async () => {
  const actual = await vi.importActual("../../../shared/utils/command");
  return {
    ...actual,
    runCommand: vi.fn(),
    findXcodeProject: vi.fn(),
  };
});

// Mock the destination resolver
vi.mock("../../../shared/utils/destination", () => ({
  resolveDestination: vi.fn((dest: string) =>
    Promise.resolve({
      destination: dest,
      wasResolved: false,
      details: "Using explicit destination format",
    }),
  ),
}));

describe("xcodeTest", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should validate scheme is required", async () => {
    const result = await xcodeTest({} as any);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain("Scheme required");
    }
  });

  it("should run tests with scheme", async () => {
    const mockFindXcodeProject = vi.mocked(commandUtils.findXcodeProject);
    const mockRunCommand = vi.mocked(commandUtils.runCommand);

    mockFindXcodeProject.mockResolvedValue("/path/to/project.xcodeproj");
    mockRunCommand.mockResolvedValue({
      stdout: "Test Suite 'All Tests' passed at 10:00 AM.",
      stderr: "",
      code: 0,
    });

    const result = await xcodeTest({ scheme: "MyScheme" });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.message).toContain("passed");
    }
    expect(mockRunCommand).toHaveBeenCalledWith(
      "xcodebuild",
      expect.arrayContaining(["-scheme", "MyScheme", "test"]),
    );
  });

  it("should use workspace when specified", async () => {
    const mockRunCommand = vi.mocked(commandUtils.runCommand);
    mockRunCommand.mockResolvedValue({
      stdout: "Test Suite passed",
      stderr: "",
      code: 0,
    });

    await xcodeTest({
      scheme: "MyScheme",
      project_path: "/path/to/project.xcworkspace",
    });

    expect(mockRunCommand).toHaveBeenCalledWith(
      "xcodebuild",
      expect.arrayContaining(["-workspace", "/path/to/project.xcworkspace"]),
    );
  });

  it("should use project when specified", async () => {
    const mockRunCommand = vi.mocked(commandUtils.runCommand);
    mockRunCommand.mockResolvedValue({
      stdout: "Test Suite passed",
      stderr: "",
      code: 0,
    });

    await xcodeTest({
      scheme: "MyScheme",
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
      stdout: "Test Suite passed",
      stderr: "",
      code: 0,
    });

    await xcodeTest({ scheme: "MyScheme" });

    expect(mockFindXcodeProject).toHaveBeenCalled();
  });

  it("should return error when no project found", async () => {
    const mockFindXcodeProject = vi.mocked(commandUtils.findXcodeProject);
    mockFindXcodeProject.mockResolvedValue(null);

    const result = await xcodeTest({ scheme: "MyScheme" });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain("No Xcode project found");
    }
  });

  it("should use test destination when specified", async () => {
    const mockRunCommand = vi.mocked(commandUtils.runCommand);
    mockRunCommand.mockResolvedValue({
      stdout: "Test Suite passed",
      stderr: "",
      code: 0,
    });

    await xcodeTest({
      scheme: "MyScheme",
      project_path: "/path/to/project.xcodeproj",
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

  it("should use test plan when specified", async () => {
    const mockRunCommand = vi.mocked(commandUtils.runCommand);
    mockRunCommand.mockResolvedValue({
      stdout: "Test Suite passed",
      stderr: "",
      code: 0,
    });

    await xcodeTest({
      scheme: "MyScheme",
      project_path: "/path/to/project.xcodeproj",
      test_plan: "AllTests",
    });

    expect(mockRunCommand).toHaveBeenCalledWith(
      "xcodebuild",
      expect.arrayContaining(["-testPlan", "AllTests"]),
    );
  });

  it("should run only specific tests when specified", async () => {
    const mockRunCommand = vi.mocked(commandUtils.runCommand);
    mockRunCommand.mockResolvedValue({
      stdout: "Test Suite passed",
      stderr: "",
      code: 0,
    });

    await xcodeTest({
      scheme: "MyScheme",
      project_path: "/path/to/project.xcodeproj",
      only_testing: ["MyTests/testFoo", "MyTests/testBar"],
    });

    expect(mockRunCommand).toHaveBeenCalledWith(
      "xcodebuild",
      expect.arrayContaining([
        "-only-testing",
        "MyTests/testFoo",
        "-only-testing",
        "MyTests/testBar",
      ]),
    );
  });

  it("should parse test results with failures", async () => {
    const mockRunCommand = vi.mocked(commandUtils.runCommand);
    mockRunCommand.mockResolvedValue({
      stdout: "5 tests, 2 failures",
      stderr: "error: test failed",
      code: 1,
    });

    const result = await xcodeTest({
      scheme: "MyScheme",
      project_path: "/path/to/project.xcodeproj",
    });

    expect(result.success).toBe(false);
  });

  it("should handle command execution errors", async () => {
    const mockRunCommand = vi.mocked(commandUtils.runCommand);
    mockRunCommand.mockRejectedValue(new Error("Process crashed"));

    const result = await xcodeTest({ scheme: "MyScheme" });

    expect(result.success).toBe(false);
  });
});
