"use strict";
////////////////////////////////////////////////////////////////////////////
//
// Safari History Parser Module
//
// Extracts browsing history, downloads, and related data from Safari
//
////////////////////////////////////////////////////////////////////////////
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SafariParser = void 0;
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
class SafariParser {
    constructor(config, auditTrail) {
        this.config = config;
        this.auditTrail = auditTrail;
    }
    /**
     * Parse Safari history from SQLite database
     * Note: This is a placeholder for the actual SQLite parsing logic
     */
    async parse(historyDbPath, outputPath) {
        // Validate input
        if (!await fs_extra_1.default.pathExists(historyDbPath)) {
            throw new Error(`Safari history database does not exist: ${historyDbPath}`);
        }
        // TODO: Implement actual SQLite parsing for Safari
        const result = {
            history: [],
            metadata: {
                browser: 'Safari',
                profilePath: path_1.default.dirname(historyDbPath),
                parseTimestamp: new Date().toISOString(),
                historyCount: 0,
            },
        };
        // Note: Safari stores history in ~/Library/Safari/History.db
        // Main tables: history_items, history_visits
        // Write output if path specified
        if (outputPath) {
            await fs_extra_1.default.ensureDir(path_1.default.dirname(outputPath));
            await fs_extra_1.default.writeJson(outputPath, result, { spaces: 2 });
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
    async detectHistoryDb() {
        const homeDir = process.env.HOME || process.env.USERPROFILE || '';
        // macOS Safari location
        const safariDb = path_1.default.join(homeDir, 'Library', 'Safari', 'History.db');
        if (await fs_extra_1.default.pathExists(safariDb)) {
            return safariDb;
        }
        return null;
    }
}
exports.SafariParser = SafariParser;
//# sourceMappingURL=safari_parser.js.map