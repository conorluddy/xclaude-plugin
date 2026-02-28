/**
 * Shared utility for finding xcresult bundles in DerivedData
 */

import { readdir, stat } from "fs/promises";
import { join } from "path";
import { homedir } from "os";
import { LOGS_CONFIG } from "../../utils/constants.js";
import { logger } from "../../utils/logger.js";

/**
 * Find the most recent .xcresult bundle in DerivedData.
 *
 * @param projectPath - Optional project path to narrow search to matching subdirectory
 * @returns Absolute path to the most recent xcresult, or null if none found
 */
export async function findLatestXcresult(
  projectPath?: string,
): Promise<string | null> {
  const derivedDataDir = join(homedir(), LOGS_CONFIG.DERIVED_DATA_DIR);

  try {
    const entries = await readdir(derivedDataDir, { withFileTypes: true });
    const projectDirs = entries.filter((e) => e.isDirectory());

    // If projectPath given, narrow to matching project subdirectory
    let searchDirs: string[];
    if (projectPath) {
      const projectName =
        projectPath
          .split("/")
          .pop()
          ?.replace(/\.(xcodeproj|xcworkspace)$/, "") || "";
      const matching = projectDirs.filter((d) =>
        d.name.startsWith(projectName + "-"),
      );
      searchDirs = matching.map((d) => join(derivedDataDir, d.name));
    } else {
      searchDirs = projectDirs.map((d) => join(derivedDataDir, d.name));
    }

    if (searchDirs.length === 0) {
      logger.debug("No DerivedData directories found");
      return null;
    }

    // Scan all Logs/Test and Logs/Build subdirectories for .xcresult bundles
    const xcresults: Array<{ path: string; mtime: number }> = [];

    for (const dir of searchDirs) {
      for (const logsSubdir of ["Logs/Test", "Logs/Build", "Logs/Launch"]) {
        const logsDir = join(dir, logsSubdir);
        try {
          const files = await readdir(logsDir, { withFileTypes: true });
          for (const file of files) {
            if (file.name.endsWith(".xcresult")) {
              const fullPath = join(logsDir, file.name);
              try {
                const stats = await stat(fullPath);
                xcresults.push({ path: fullPath, mtime: stats.mtimeMs });
              } catch {
                // Skip inaccessible files
              }
            }
          }
        } catch {
          // Directory doesn't exist, skip
        }
      }
    }

    if (xcresults.length === 0) {
      logger.debug("No .xcresult bundles found in DerivedData");
      return null;
    }

    // Return most recent by modification time
    xcresults.sort((a, b) => b.mtime - a.mtime);
    logger.debug(
      `Found ${xcresults.length} xcresult bundles, using most recent: ${xcresults[0].path}`,
    );
    return xcresults[0].path;
  } catch (error) {
    logger.debug("Failed to scan DerivedData", error);
    return null;
  }
}
