/**
 * Tests for config.ts - Configuration and usage tracking utilities
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import * as path from "path";

// Mock fs/promises and os BEFORE importing config.ts
vi.mock("fs/promises", () => ({
  readFile: vi.fn(),
  writeFile: vi.fn(),
  mkdir: vi.fn(),
}));

vi.mock("os", () => ({
  homedir: vi.fn(() => "/Users/testuser"),
}));

// Now import after mocking
import * as fs from "fs/promises";
import * as os from "os";
import {
  loadConfig,
  saveUsage,
  getDefaultSimulator,
  getRecentSimulators,
} from "../../shared/utils/config.js";

const mockFs = fs as unknown as {
  readFile: ReturnType<typeof vi.fn>;
  writeFile: ReturnType<typeof vi.fn>;
  mkdir: ReturnType<typeof vi.fn>;
};

const mockOs = os as unknown as {
  homedir: ReturnType<typeof vi.fn>;
};

describe("Config System", () => {
  const mockHomeDir = "/Users/testuser";
  const mockProjectDir = "/Users/testuser/MyProject";
  const userConfigPath = path.join(mockHomeDir, ".xcplugin", "config.json");
  const projectConfigPath = path.join(mockProjectDir, ".xcplugin");

  beforeEach(() => {
    // Use mockReset to clear implementation AND reset to default
    mockFs.readFile.mockReset();
    mockFs.writeFile.mockReset();
    mockFs.mkdir.mockReset();

    mockOs.homedir.mockReturnValue(mockHomeDir);
    // Default to file not found
    mockFs.readFile.mockRejectedValue({ code: "ENOENT" });
    mockFs.mkdir.mockResolvedValue(undefined);
    mockFs.writeFile.mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("loadConfig", () => {
    it("should return default config when no config files exist", async () => {
      const config = await loadConfig();

      expect(config).toEqual({
        maxRecentHistory: 10,
        recentSimulators: [],
        source: "merged",
      });
    });

    it("should load user config when it exists", async () => {
      const userConfig = {
        defaultSimulator: "platform=iOS Simulator,name=iPhone 15",
        maxRecentHistory: 5,
      };

      mockFs.readFile.mockImplementation((filePath: string) => {
        if (filePath === userConfigPath) {
          return Promise.resolve(JSON.stringify(userConfig));
        }
        return Promise.reject({ code: "ENOENT" });
      });

      const config = await loadConfig();

      expect(config.defaultSimulator).toBe(userConfig.defaultSimulator);
      expect(config.maxRecentHistory).toBe(5);
      expect(config.source).toBe("user");
    });

    it("should load project config when it exists", async () => {
      const projectConfig = {
        defaultSimulator: "platform=iOS Simulator,name=iPhone 14",
      };

      mockFs.readFile.mockImplementation((filePath: string) => {
        if (filePath === projectConfigPath) {
          return Promise.resolve(JSON.stringify(projectConfig));
        }
        return Promise.reject({ code: "ENOENT" });
      });

      const config = await loadConfig(mockProjectDir);

      expect(config.defaultSimulator).toBe(projectConfig.defaultSimulator);
      expect(config.source).toBe("project");
    });

    it("should merge configs with project overriding user", async () => {
      const userConfig = {
        defaultSimulator: "platform=iOS Simulator,name=iPhone 15",
        maxRecentHistory: 20,
      };

      const projectConfig = {
        defaultSimulator: "platform=iOS Simulator,name=iPhone 14",
      };

      mockFs.readFile.mockImplementation((filePath: string) => {
        if (filePath === userConfigPath) {
          return Promise.resolve(JSON.stringify(userConfig));
        }
        if (filePath === projectConfigPath) {
          return Promise.resolve(JSON.stringify(projectConfig));
        }
        return Promise.reject({ code: "ENOENT" });
      });

      const config = await loadConfig(mockProjectDir);

      expect(config.defaultSimulator).toBe(projectConfig.defaultSimulator);
      expect(config.maxRecentHistory).toBe(userConfig.maxRecentHistory);
      expect(config.source).toBe("project");
    });

    it("should handle invalid JSON gracefully", async () => {
      mockFs.readFile.mockResolvedValue("invalid json{");

      const config = await loadConfig();

      expect(config).toEqual({
        maxRecentHistory: 10,
        recentSimulators: [],
        source: "merged",
      });
    });

    it("should use cwd when no projectPath provided", async () => {
      const currentDir = process.cwd();
      const expectedPath = path.join(currentDir, ".xcplugin");

      await loadConfig();

      expect(mockFs.readFile).toHaveBeenCalledWith(
        expect.stringContaining(".xcplugin"),
        "utf-8",
      );
    });
  });

  describe("saveUsage", () => {
    const destination = "platform=iOS Simulator,name=iPhone 15,OS=18.0";

    it("should create new usage entry", async () => {
      mockFs.readFile.mockRejectedValue({ code: "ENOENT" });

      await saveUsage(destination);

      expect(mockFs.mkdir).toHaveBeenCalledWith(
        path.join(mockHomeDir, ".xcplugin"),
        { recursive: true },
      );

      expect(mockFs.writeFile).toHaveBeenCalledWith(
        userConfigPath,
        expect.stringContaining(destination),
        "utf-8",
      );

      const writtenConfig = JSON.parse(
        mockFs.writeFile.mock.calls[0][1] as string,
      );
      expect(writtenConfig.recentSimulators).toHaveLength(1);
      expect(writtenConfig.recentSimulators[0].destination).toBe(destination);
      expect(writtenConfig.recentSimulators[0].count).toBe(1);
    });

    it("should update existing usage entry", async () => {
      const existingConfig = {
        recentSimulators: [
          {
            destination,
            lastUsed: "2025-01-01T00:00:00.000Z",
            count: 3,
          },
        ],
      };

      mockFs.readFile.mockResolvedValue(JSON.stringify(existingConfig));

      await saveUsage(destination);

      const writtenConfig = JSON.parse(
        mockFs.writeFile.mock.calls[0][1] as string,
      );
      expect(writtenConfig.recentSimulators).toHaveLength(1);
      expect(writtenConfig.recentSimulators[0].count).toBe(4);
      expect(
        new Date(writtenConfig.recentSimulators[0].lastUsed).getTime(),
      ).toBeGreaterThan(new Date("2025-01-01T00:00:00.000Z").getTime());
    });

    it("should sort by most recent first", async () => {
      const existingConfig = {
        recentSimulators: [
          {
            destination: "platform=iOS Simulator,name=iPhone 14,OS=17.5",
            lastUsed: "2025-01-02T00:00:00.000Z",
            count: 2,
          },
        ],
      };

      mockFs.readFile.mockResolvedValue(JSON.stringify(existingConfig));

      await saveUsage(destination);

      const writtenConfig = JSON.parse(
        mockFs.writeFile.mock.calls[0][1] as string,
      );
      expect(writtenConfig.recentSimulators[0].destination).toBe(destination);
      expect(writtenConfig.recentSimulators[1].destination).toBe(
        "platform=iOS Simulator,name=iPhone 14,OS=17.5",
      );
    });

    it("should limit history to maxRecentHistory", async () => {
      const existingConfig = {
        maxRecentHistory: 3,
        recentSimulators: [
          {
            destination: "platform=iOS Simulator,name=iPhone 14,OS=17.5",
            lastUsed: "2025-01-03T00:00:00.000Z",
            count: 1,
          },
          {
            destination: "platform=iOS Simulator,name=iPhone 13,OS=17.0",
            lastUsed: "2025-01-02T00:00:00.000Z",
            count: 1,
          },
          {
            destination: "platform=iOS Simulator,name=iPhone 12,OS=16.0",
            lastUsed: "2025-01-01T00:00:00.000Z",
            count: 1,
          },
        ],
      };

      mockFs.readFile.mockResolvedValue(JSON.stringify(existingConfig));

      await saveUsage(destination);

      const writtenConfig = JSON.parse(
        mockFs.writeFile.mock.calls[0][1] as string,
      );
      expect(writtenConfig.recentSimulators).toHaveLength(3);
      expect(writtenConfig.recentSimulators[0].destination).toBe(destination);
      // Oldest entry should be removed
      expect(
        writtenConfig.recentSimulators.find((s: { destination: string }) =>
          s.destination.includes("iPhone 12"),
        ),
      ).toBeUndefined();
    });

    it("should handle write failures gracefully", async () => {
      mockFs.writeFile.mockRejectedValue(new Error("Permission denied"));

      // Should not throw
      await expect(saveUsage(destination)).resolves.toBeUndefined();
    });

    it("should preserve other config properties", async () => {
      const existingConfig = {
        defaultSimulator: "platform=iOS Simulator,name=iPhone 15",
        maxRecentHistory: 15,
        recentSimulators: [],
      };

      mockFs.readFile.mockResolvedValue(JSON.stringify(existingConfig));

      await saveUsage(destination);

      const writtenConfig = JSON.parse(
        mockFs.writeFile.mock.calls[0][1] as string,
      );
      expect(writtenConfig.defaultSimulator).toBe(
        existingConfig.defaultSimulator,
      );
      expect(writtenConfig.maxRecentHistory).toBe(
        existingConfig.maxRecentHistory,
      );
    });
  });

  describe("getDefaultSimulator", () => {
    it("should return explicit default from config", async () => {
      const userConfig = {
        defaultSimulator: "platform=iOS Simulator,name=iPhone 15",
      };

      mockFs.readFile.mockImplementation((filePath: string) => {
        if (filePath === userConfigPath) {
          return Promise.resolve(JSON.stringify(userConfig));
        }
        return Promise.reject({ code: "ENOENT" });
      });

      const defaultSim = await getDefaultSimulator();

      expect(defaultSim).toBe(userConfig.defaultSimulator);
    });

    it("should return most recent simulator when no explicit default", async () => {
      const userConfig = {
        recentSimulators: [
          {
            destination: "platform=iOS Simulator,name=iPhone 15,OS=18.0",
            lastUsed: "2025-01-03T00:00:00.000Z",
            count: 5,
          },
          {
            destination: "platform=iOS Simulator,name=iPhone 14,OS=17.5",
            lastUsed: "2025-01-02T00:00:00.000Z",
            count: 2,
          },
        ],
      };

      mockFs.readFile.mockImplementation((filePath: string) => {
        if (filePath === userConfigPath) {
          return Promise.resolve(JSON.stringify(userConfig));
        }
        return Promise.reject({ code: "ENOENT" });
      });

      const defaultSim = await getDefaultSimulator();

      expect(defaultSim).toBe("platform=iOS Simulator,name=iPhone 15,OS=18.0");
    });

    it("should return undefined when no config exists", async () => {
      // Explicitly ensure mock is set to reject
      mockFs.readFile.mockReset();
      mockFs.readFile.mockRejectedValue({ code: "ENOENT" });

      const defaultSim = await getDefaultSimulator();

      expect(defaultSim).toBeUndefined();
    });

    it("should prefer explicit default over recent usage", async () => {
      const userConfig = {
        defaultSimulator: "platform=iOS Simulator,name=iPhone 14",
        recentSimulators: [
          {
            destination: "platform=iOS Simulator,name=iPhone 15,OS=18.0",
            lastUsed: "2025-01-03T00:00:00.000Z",
            count: 5,
          },
        ],
      };

      mockFs.readFile.mockImplementation((filePath: string) => {
        if (filePath === userConfigPath) {
          return Promise.resolve(JSON.stringify(userConfig));
        }
        return Promise.reject({ code: "ENOENT" });
      });

      const defaultSim = await getDefaultSimulator();

      expect(defaultSim).toBe("platform=iOS Simulator,name=iPhone 14");
    });

    it("should use project config when provided", async () => {
      const projectConfig = {
        defaultSimulator: "platform=iOS Simulator,name=iPhone 13",
      };

      mockFs.readFile.mockImplementation((filePath: string) => {
        if (filePath === projectConfigPath) {
          return Promise.resolve(JSON.stringify(projectConfig));
        }
        return Promise.reject({ code: "ENOENT" });
      });

      const defaultSim = await getDefaultSimulator(mockProjectDir);

      expect(defaultSim).toBe(projectConfig.defaultSimulator);
    });
  });

  describe("getRecentSimulators", () => {
    it("should return empty array when no recent simulators", async () => {
      // Explicitly ensure mock is set to reject
      mockFs.readFile.mockReset();
      mockFs.readFile.mockRejectedValue({ code: "ENOENT" });

      const recent = await getRecentSimulators();

      expect(recent).toEqual([]);
    });

    it("should return recent simulators up to limit", async () => {
      const userConfig = {
        recentSimulators: [
          {
            destination: "platform=iOS Simulator,name=iPhone 15,OS=18.0",
            lastUsed: "2025-01-05T00:00:00.000Z",
            count: 10,
          },
          {
            destination: "platform=iOS Simulator,name=iPhone 14,OS=17.5",
            lastUsed: "2025-01-04T00:00:00.000Z",
            count: 5,
          },
          {
            destination: "platform=iOS Simulator,name=iPhone 13,OS=17.0",
            lastUsed: "2025-01-03T00:00:00.000Z",
            count: 3,
          },
        ],
      };

      mockFs.readFile.mockResolvedValue(JSON.stringify(userConfig));

      const recent = await getRecentSimulators(2);

      expect(recent).toHaveLength(2);
      expect(recent[0].destination).toBe(
        "platform=iOS Simulator,name=iPhone 15,OS=18.0",
      );
      expect(recent[1].destination).toBe(
        "platform=iOS Simulator,name=iPhone 14,OS=17.5",
      );
    });

    it("should default to limit of 5", async () => {
      const userConfig = {
        recentSimulators: Array.from({ length: 10 }, (_, i) => ({
          destination: `platform=iOS Simulator,name=iPhone ${i}`,
          lastUsed: new Date(Date.now() - i * 1000).toISOString(),
          count: 1,
        })),
      };

      mockFs.readFile.mockResolvedValue(JSON.stringify(userConfig));

      const recent = await getRecentSimulators();

      expect(recent).toHaveLength(5);
    });
  });
});
