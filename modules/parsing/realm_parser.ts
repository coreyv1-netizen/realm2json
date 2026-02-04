////////////////////////////////////////////////////////////////////////////
//
// Realm Database Parser Module
//
// Extracts data from Realm database files and converts to JSON format.
// This module maintains the original realm2json functionality while
// adding forensic-grade audit trails and metadata preservation.
//
////////////////////////////////////////////////////////////////////////////

import Realm from 'realm';
import fs from 'fs-extra';
import path from 'path';
import { stringify } from 'flatted';
import { ForensicConfig } from '../../config/forensic_config';
import { AuditTrail } from '../audit_trail';

type ResultMap = {
  [key: string]: Realm.Results<any>;
};

export interface RealmParseResult {
  data: any;
  schema: any[];
  metadata: {
    fileName: string;
    parseTimestamp: string;
    objectCount: number;
    classNames: string[];
  };
}

export class RealmParser {
  private config: ForensicConfig;
  private auditTrail: AuditTrail;

  constructor(config: ForensicConfig, auditTrail: AuditTrail) {
    this.config = config;
    this.auditTrail = auditTrail;
  }

  /**
   * Parse a Realm database file
   */
  async parse(realmPath: string, outputPath?: string): Promise<RealmParseResult> {
    // Validate input
    if (!await fs.pathExists(realmPath)) {
      throw new Error(`Realm file does not exist: ${realmPath}`);
    }

    if (!realmPath.toLowerCase().endsWith('.realm')) {
      throw new Error(`File must have .realm extension: ${realmPath}`);
    }

    // Open the Realm file
    const realm = new Realm({ path: realmPath });

    try {
      // Extract all non-embedded, non-asymmetric classes
      const resultMap: ResultMap = realm.schema.reduce(
        (map: ResultMap, objectSchema) => {
          if (!objectSchema.embedded && !objectSchema.asymmetric) {
            map[objectSchema.name] = realm.objects(objectSchema.name).snapshot();
          }
          return map;
        },
        {},
      );

      // Serialize data
      const jsonContent = stringify(resultMap);
      const data = JSON.parse(jsonContent);

      // Count total objects
      const objectCount = Object.values(resultMap).reduce(
        (sum, results) => sum + results.length,
        0
      );

      // Create metadata
      const metadata = {
        fileName: path.basename(realmPath),
        parseTimestamp: new Date().toISOString(),
        objectCount,
        classNames: realm.schema
          .filter(s => !s.embedded && !s.asymmetric)
          .map(s => s.name),
      };

      // Create result
      const result: RealmParseResult = {
        data,
        schema: realm.schema,
        metadata,
      };

      // Write output if path specified
      if (outputPath) {
        await fs.ensureDir(path.dirname(outputPath));
        await fs.writeJson(outputPath, result, { spaces: 2 });
        
        // Also write just the data for backward compatibility
        const dataPath = outputPath.replace('.json', '.data.json');
        await fs.writeFile(dataPath, jsonContent);

        if (this.config.verboseLogging) {
          console.log(`Realm data exported to: ${outputPath}`);
          console.log(`Raw data exported to: ${dataPath}`);
        }
      }

      // Log to audit trail
      await this.auditTrail.log({
        module: 'parsing',
        operation: 'parseRealm',
        details: {
          inputPath: realmPath,
          outputPath,
          objectCount,
          classNames: metadata.classNames,
        },
        success: true,
      });

      if (this.config.verboseLogging) {
        console.log(`Parsed Realm database: ${realmPath}`);
        console.log(`  Classes: ${metadata.classNames.length}`);
        console.log(`  Objects: ${objectCount}`);
      }

      return result;
    } finally {
      realm.close();
    }
  }

  /**
   * Extract schema information from a Realm file
   */
  async extractSchema(realmPath: string): Promise<any[]> {
    if (!await fs.pathExists(realmPath)) {
      throw new Error(`Realm file does not exist: ${realmPath}`);
    }

    const realm = new Realm({ path: realmPath });
    try {
      return realm.schema;
    } finally {
      realm.close();
    }
  }

  /**
   * Get statistics about a Realm database
   */
  async getStatistics(realmPath: string): Promise<any> {
    if (!await fs.pathExists(realmPath)) {
      throw new Error(`Realm file does not exist: ${realmPath}`);
    }

    const realm = new Realm({ path: realmPath });
    try {
      const stats = {
        schemaVersion: realm.schemaVersion,
        isEmpty: realm.isEmpty,
        classes: realm.schema.map(objectSchema => ({
          name: objectSchema.name,
          embedded: objectSchema.embedded,
          asymmetric: objectSchema.asymmetric,
          count: objectSchema.embedded || objectSchema.asymmetric
            ? 0
            : realm.objects(objectSchema.name).length,
        })),
      };

      return stats;
    } finally {
      realm.close();
    }
  }
}
