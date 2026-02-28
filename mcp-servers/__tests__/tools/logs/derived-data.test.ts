/**
 * Tests for derived-data utility (findLatestXcresult)
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { findLatestXcresult } from "../../../shared/tools/logs/derived-data.js";

const mockReaddir = vi.fn();
const mockStat = vi.fn();

vi.mock("fs/promises", () => ({
  readdir: (...args: any[]) => mockReaddir(...args),
  stat: (...args: any[]) => mockStat(...args),
}));

vi.mock("os", () => ({
  homedir: () => "/Users/testuser",
}));

describe("findLatestXcresult", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should find xcresult bundles in DerivedData", async () => {
    // DerivedData listing
    mockReaddir.mockResolvedValueOnce([
      { name: "MyApp-abcdef", isDirectory: () => true },
    ]);

    // Logs/Test listing
    mockReaddir.mockResolvedValueOnce([
      { name: "Test-2025.xcresult", isDirectory: () => false },
    ]);

    // Logs/Build listing
    mockReaddir.mockResolvedValueOnce([]);

    // Logs/Launch listing
    mockReaddir.mockResolvedValueOnce([]);

    mockStat.mockResolvedValue({ mtimeMs: 1000 });

    const result = await findLatestXcresult();

    expect(result).toContain("Test-2025.xcresult");
  });

  it("should return most recent xcresult by modification time", async () => {
    mockReaddir.mockResolvedValueOnce([
      { name: "MyApp-abcdef", isDirectory: () => true },
    ]);

    // Logs/Test has two xcresults
    mockReaddir.mockResolvedValueOnce([
      { name: "Old.xcresult", isDirectory: () => false },
      { name: "New.xcresult", isDirectory: () => false },
    ]);

    // Logs/Build empty
    mockReaddir.mockResolvedValueOnce([]);

    // Logs/Launch empty
    mockReaddir.mockResolvedValueOnce([]);

    mockStat
      .mockResolvedValueOnce({ mtimeMs: 1000 }) // Old
      .mockResolvedValueOnce({ mtimeMs: 2000 }); // New

    const result = await findLatestXcresult();

    expect(result).toContain("New.xcresult");
  });

  it("should narrow search when projectPath is provided", async () => {
    mockReaddir.mockResolvedValueOnce([
      { name: "MyApp-abcdef", isDirectory: () => true },
      { name: "OtherApp-123456", isDirectory: () => true },
    ]);

    // Only MyApp subdirs should be searched (Logs/Test, Logs/Build, Logs/Launch)
    mockReaddir.mockResolvedValueOnce([
      { name: "Build.xcresult", isDirectory: () => false },
    ]);
    mockReaddir.mockResolvedValueOnce([]);
    mockReaddir.mockResolvedValueOnce([]);

    mockStat.mockResolvedValue({ mtimeMs: 1000 });

    const result = await findLatestXcresult("/path/to/MyApp.xcodeproj");

    expect(result).toContain("Build.xcresult");
    // OtherApp should not have been searched (only 4 readdir calls: 1 DerivedData + 3 Logs subdirs)
    expect(mockReaddir).toHaveBeenCalledTimes(4);
  });

  it("should return null when DerivedData directory is missing", async () => {
    mockReaddir.mockRejectedValue(new Error("ENOENT"));

    const result = await findLatestXcresult();

    expect(result).toBeNull();
  });

  it("should return null when no xcresult bundles found", async () => {
    mockReaddir.mockResolvedValueOnce([
      { name: "MyApp-abcdef", isDirectory: () => true },
    ]);

    // All Logs subdirs empty
    mockReaddir.mockResolvedValueOnce([]);
    mockReaddir.mockResolvedValueOnce([]);
    mockReaddir.mockResolvedValueOnce([]);

    const result = await findLatestXcresult();

    expect(result).toBeNull();
  });

  it("should handle empty DerivedData directory", async () => {
    mockReaddir.mockResolvedValueOnce([]);

    const result = await findLatestXcresult();

    expect(result).toBeNull();
  });
});
