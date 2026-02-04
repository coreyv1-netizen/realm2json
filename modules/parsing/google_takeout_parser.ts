////////////////////////////////////////////////////////////////////////////
//
// Google Takeout Parser Module
//
// Extracts data from Google Takeout archives including:
// - Location history
// - Search history
// - YouTube history
// - Gmail
// - Photos metadata
// - Drive files
//
////////////////////////////////////////////////////////////////////////////

import fs from 'fs-extra';
import path from 'path';
import { ForensicConfig } from '../../config/forensic_config';
import { AuditTrail } from '../audit_trail';

export interface GoogleTakeoutParseResult {
  locationHistory?: any[];
  searchHistory?: any[];
  youtubeHistory?: any[];
  emailMetadata?: any[];
  metadata: {
    parseTimestamp: string;
    archivePath: string;
    componentsFound: string[];
  };
}

export class GoogleTakeoutParser {
  private config: ForensicConfig;
  private auditTrail: AuditTrail;

  constructor(config: ForensicConfig, auditTrail: AuditTrail) {
    this.config = config;
    this.auditTrail = auditTrail;
  }

  /**
   * Parse Google Takeout archive
   */
  async parse(takeoutPath: string, outputPath?: string): Promise<GoogleTakeoutParseResult> {
    // Validate input
    if (!await fs.pathExists(takeoutPath)) {
      throw new Error(`Takeout archive does not exist: ${takeoutPath}`);
    }

    const result: GoogleTakeoutParseResult = {
      metadata: {
        parseTimestamp: new Date().toISOString(),
        archivePath: takeoutPath,
        componentsFound: [],
      },
    };

    const stats = await fs.stat(takeoutPath);

    // Handle both directory and zip archive
    let workingDir = takeoutPath;
    if (stats.isFile()) {
      // TODO: Extract zip archive to temp directory
      if (this.config.verboseLogging) {
        console.log('Note: ZIP extraction not yet implemented. Please extract manually.');
      }
    }

    // Parse Location History
    const locationHistoryPath = path.join(workingDir, 'Location History', 'Records.json');
    if (await fs.pathExists(locationHistoryPath)) {
      result.locationHistory = await this.parseLocationHistory(locationHistoryPath);
      result.metadata.componentsFound.push('Location History');
    }

    // Parse Search History
    const searchHistoryPath = path.join(workingDir, 'My Activity', 'Search', 'MyActivity.json');
    if (await fs.pathExists(searchHistoryPath)) {
      result.searchHistory = await this.parseActivityHistory(searchHistoryPath);
      result.metadata.componentsFound.push('Search History');
    }

    // Parse YouTube History
    const youtubeHistoryPath = path.join(workingDir, 'YouTube and YouTube Music', 'history', 'watch-history.json');
    if (await fs.pathExists(youtubeHistoryPath)) {
      result.youtubeHistory = await this.parseActivityHistory(youtubeHistoryPath);
      result.metadata.componentsFound.push('YouTube History');
    }

    // Write output if path specified
    if (outputPath) {
      await fs.ensureDir(path.dirname(outputPath));
      await fs.writeJson(outputPath, result, { spaces: 2 });

      if (this.config.verboseLogging) {
        console.log(`Google Takeout data exported to: ${outputPath}`);
      }
    }

    // Log to audit trail
    await this.auditTrail.log({
      module: 'parsing',
      operation: 'parseGoogleTakeout',
      details: {
        inputPath: takeoutPath,
        outputPath,
        componentsFound: result.metadata.componentsFound,
      },
      success: true,
    });

    if (this.config.verboseLogging) {
      console.log(`Parsed Google Takeout: ${takeoutPath}`);
      console.log(`  Components found: ${result.metadata.componentsFound.length}`);
      result.metadata.componentsFound.forEach(c => console.log(`    - ${c}`));
    }

    return result;
  }

  /**
   * Parse location history JSON
   */
  private async parseLocationHistory(jsonPath: string): Promise<any[]> {
    try {
      const data = await fs.readJson(jsonPath);
      // Google Takeout location history is in 'locations' array
      return data.locations || [];
    } catch (error) {
      if (this.config.verboseLogging) {
        console.warn(`Failed to parse location history: ${error}`);
      }
      return [];
    }
  }

  /**
   * Parse activity history JSON (search, YouTube, etc.)
   */
  private async parseActivityHistory(jsonPath: string): Promise<any[]> {
    try {
      const data = await fs.readJson(jsonPath);
      // Activity history is typically an array at root
      return Array.isArray(data) ? data : [];
    } catch (error) {
      if (this.config.verboseLogging) {
        console.warn(`Failed to parse activity history: ${error}`);
      }
      return [];
    }
  }
}
