"use strict";
////////////////////////////////////////////////////////////////////////////
//
// Realm Database Parser Module
//
// Extracts data from Realm database files and converts to JSON format.
// This module maintains the original realm2json functionality while
// adding forensic-grade audit trails and metadata preservation.
//
////////////////////////////////////////////////////////////////////////////
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RealmParser = void 0;
const realm_1 = __importDefault(require("realm"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const flatted_1 = require("flatted");
class RealmParser {
    constructor(config, auditTrail) {
        this.config = config;
        this.auditTrail = auditTrail;
    }
    /**
     * Parse a Realm database file
     */
    async parse(realmPath, outputPath) {
        // Validate input
        if (!await fs_extra_1.default.pathExists(realmPath)) {
            throw new Error(`Realm file does not exist: ${realmPath}`);
        }
        if (!realmPath.toLowerCase().endsWith('.realm')) {
            throw new Error(`File must have .realm extension: ${realmPath}`);
        }
        // Open the Realm file
        const realm = new realm_1.default({ path: realmPath });
        try {
            // Extract all non-embedded, non-asymmetric classes
            const resultMap = realm.schema.reduce((map, objectSchema) => {
                if (!objectSchema.embedded && !objectSchema.asymmetric) {
                    map[objectSchema.name] = realm.objects(objectSchema.name).snapshot();
                }
                return map;
            }, {});
            // Serialize data
            const jsonContent = (0, flatted_1.stringify)(resultMap);
            const data = JSON.parse(jsonContent);
            // Count total objects
            const objectCount = Object.values(resultMap).reduce((sum, results) => sum + results.length, 0);
            // Create metadata
            const metadata = {
                fileName: path_1.default.basename(realmPath),
                parseTimestamp: new Date().toISOString(),
                objectCount,
                classNames: realm.schema
                    .filter(s => !s.embedded && !s.asymmetric)
                    .map(s => s.name),
            };
            // Create result
            const result = {
                data,
                schema: realm.schema,
                metadata,
            };
            // Write output if path specified
            if (outputPath) {
                await fs_extra_1.default.ensureDir(path_1.default.dirname(outputPath));
                await fs_extra_1.default.writeJson(outputPath, result, { spaces: 2 });
                // Also write just the data for backward compatibility
                const dataPath = outputPath.replace('.json', '.data.json');
                await fs_extra_1.default.writeFile(dataPath, jsonContent);
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
        }
        finally {
            realm.close();
        }
    }
    /**
     * Extract schema information from a Realm file
     */
    async extractSchema(realmPath) {
        if (!await fs_extra_1.default.pathExists(realmPath)) {
            throw new Error(`Realm file does not exist: ${realmPath}`);
        }
        const realm = new realm_1.default({ path: realmPath });
        try {
            return realm.schema;
        }
        finally {
            realm.close();
        }
    }
    /**
     * Get statistics about a Realm database
     */
    async getStatistics(realmPath) {
        if (!await fs_extra_1.default.pathExists(realmPath)) {
            throw new Error(`Realm file does not exist: ${realmPath}`);
        }
        const realm = new realm_1.default({ path: realmPath });
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
        }
        finally {
            realm.close();
        }
    }
}
exports.RealmParser = RealmParser;
//# sourceMappingURL=realm_parser.js.map