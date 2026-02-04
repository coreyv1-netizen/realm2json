////////////////////////////////////////////////////////////////////////////
//
// Chrome/Chromium History Parser Module
//
// Extracts browsing history, downloads, and related data from Chrome/
// Chromium-based browsers (Chrome, Edge, Brave, Opera, etc.)
//
////////////////////////////////////////////////////////////////////////////

import fs from 'fs-extra';
import path from 'path';
import { ForensicConfig } from '../../config/forensic_config';
import { AuditTrail } from '../audit_trail';

export interface ChromeHistoryEntry {
  id: number;
  url: string;
  title?: string;
  visit_count?: number;
  typed_count?: number;
  last_visit_time?: string;
  hidden?: boolean;
}

export interface ChromeDownload {
  id: number;
  target_path: string;
  start_time?: string;
  end_time?: string;
  danger_type?: number;
  opened?: boolean;
}

export interface ChromeParseResult {
  history: ChromeHistoryEntry[];
  downloads: ChromeDownload[];
  metadata: {
    browser: string;
    profilePath: string;
    parseTimestamp: string;
    historyCount: number;
    downloadCount: number;
  };
}

export class ChromeParser {
  private config: ForensicConfig;
  private auditTrail: AuditTrail;

  constructor(config: ForensicConfig, auditTrail: AuditTrail) {
    this.config = config;
    this.auditTrail = auditTrail;
  }

  /**
   * Parse Chrome/Chromium history from SQLite database
   * Note: This is a placeholder for the actual SQLite parsing logic
   * In production, you would use a library like 'better-sqlite3'
   */
  async parse(historyDbPath: string, outputPath?: string): Promise<ChromeParseResult> {
    // Validate input
    if (!await fs.pathExists(historyDbPath)) {
      throw new Error(`Chrome history database does not exist: ${historyDbPath}`);
    }

    // TODO: Implement actual SQLite parsing
    // For now, we'll create a structure that can be filled in
    const result: ChromeParseResult = {
      history: [],
      downloads: [],
      metadata: {
        browser: 'Chrome/Chromium',
        profilePath: path.dirname(historyDbPath),
        parseTimestamp: new Date().toISOString(),
        historyCount: 0,
        downloadCount: 0,
      },
    };

    // Note: In production implementation, you would:
    // 1. Copy the database to temp location (Chrome may have it locked)
    // 2. Open the SQLite database
    // 3. Query the 'urls' table for history
    // 4. Query the 'downloads' table for downloads
    // 5. Query the 'visits' table for visit details
    // 6. Convert Chrome epoch time (microseconds since 1601-01-01) to ISO timestamps

    // Write output if path specified
    if (outputPath) {
      await fs.ensureDir(path.dirname(outputPath));
      await fs.writeJson(outputPath, result, { spaces: 2 });

      if (this.config.verboseLogging) {
        console.log(`Chrome history exported to: ${outputPath}`);
      }
    }

    // Log to audit trail
    await this.auditTrail.log({
      module: 'parsing',
      operation: 'parseChrome',
      details: {
        inputPath: historyDbPath,
        outputPath,
        historyCount: result.metadata.historyCount,
        downloadCount: result.metadata.downloadCount,
      },
      success: true,
    });

    if (this.config.verboseLogging) {
      console.log(`Parsed Chrome history: ${historyDbPath}`);
      console.log(`  History entries: ${result.metadata.historyCount}`);
      console.log(`  Downloads: ${result.metadata.downloadCount}`);
    }

    return result;
  }

  /**
   * Detect Chrome profile directories on the system
   */
  async detectProfiles(): Promise<string[]> {
    const profiles: string[] = [];
    const homeDir = process.env.HOME || process.env.USERPROFILE || '';

    // Common Chrome profile locations
    const locations = [
      // Windows
      path.join(homeDir, 'AppData', 'Local', 'Google', 'Chrome', 'User Data'),
      // macOS
      path.join(homeDir, 'Library', 'Application Support', 'Google', 'Chrome'),
      // Linux
      path.join(homeDir, '.config', 'google-chrome'),
    ];

    for (const location of locations) {
      if (await fs.pathExists(location)) {
        // Check for Default profile and numbered profiles
        const defaultHistory = path.join(location, 'Default', 'History');
        if (await fs.pathExists(defaultHistory)) {
          profiles.push(defaultHistory);
        }

        // Check for Profile 1, Profile 2, etc.
        for (let i = 1; i <= 10; i++) {
          const profileHistory = path.join(location, `Profile ${i}`, 'History');
          if (await fs.pathExists(profileHistory)) {
            profiles.push(profileHistory);
          }
        }
      }
    }

    return profiles;
  }
}
