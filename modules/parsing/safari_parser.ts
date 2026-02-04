////////////////////////////////////////////////////////////////////////////
//
// Safari History Parser Module
//
// Extracts browsing history, downloads, and related data from Safari
//
////////////////////////////////////////////////////////////////////////////

import fs from 'fs-extra';
import path from 'path';
import { ForensicConfig } from '../../config/forensic_config';
import { AuditTrail } from '../audit_trail';

export interface SafariHistoryEntry {
  id: number;
  url: string;
  title?: string;
  visit_count?: number;
  visit_time?: string;
}

export interface SafariParseResult {
  history: SafariHistoryEntry[];
  metadata: {
    browser: 'Safari';
    profilePath: string;
    parseTimestamp: string;
    historyCount: number;
  };
}

export class SafariParser {
  private config: ForensicConfig;
  private auditTrail: AuditTrail;

  constructor(config: ForensicConfig, auditTrail: AuditTrail) {
    this.config = config;
    this.auditTrail = auditTrail;
  }

  /**
   * Parse Safari history from SQLite database
   * Note: This is a placeholder for the actual SQLite parsing logic
   */
  async parse(historyDbPath: string, outputPath?: string): Promise<SafariParseResult> {
    // Validate input
    if (!await fs.pathExists(historyDbPath)) {
      throw new Error(`Safari history database does not exist: ${historyDbPath}`);
    }

    // TODO: Implement actual SQLite parsing for Safari
    const result: SafariParseResult = {
      history: [],
      metadata: {
        browser: 'Safari',
        profilePath: path.dirname(historyDbPath),
        parseTimestamp: new Date().toISOString(),
        historyCount: 0,
      },
    };

    // Note: Safari stores history in ~/Library/Safari/History.db
    // Main tables: history_items, history_visits

    // Write output if path specified
    if (outputPath) {
      await fs.ensureDir(path.dirname(outputPath));
      await fs.writeJson(outputPath, result, { spaces: 2 });

      if (this.config.verboseLogging) {
        console.log(`Safari history exported to: ${outputPath}`);
      }
    }

    // Log to audit trail
    await this.auditTrail.log({
      module: 'parsing',
      operation: 'parseSafari',
      details: {
        inputPath: historyDbPath,
        outputPath,
        historyCount: result.metadata.historyCount,
      },
      success: true,
    });

    if (this.config.verboseLogging) {
      console.log(`Parsed Safari history: ${historyDbPath}`);
      console.log(`  History entries: ${result.metadata.historyCount}`);
    }

    return result;
  }

  /**
   * Detect Safari history database location
   */
  async detectHistoryDb(): Promise<string | null> {
    const homeDir = process.env.HOME || process.env.USERPROFILE || '';
    
    // macOS Safari location
    const safariDb = path.join(homeDir, 'Library', 'Safari', 'History.db');
    
    if (await fs.pathExists(safariDb)) {
      return safariDb;
    }

    return null;
  }
}
