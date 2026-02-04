"use strict";
////////////////////////////////////////////////////////////////////////////
//
// Chrome/Chromium History Parser Module
//
// Extracts browsing history, downloads, and related data from Chrome/
// Chromium-based browsers (Chrome, Edge, Brave, Opera, etc.)
//
////////////////////////////////////////////////////////////////////////////
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChromeParser = void 0;
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
class ChromeParser {
    constructor(config, auditTrail) {
        this.config = config;
        this.auditTrail = auditTrail;
    }
    /**
     * Parse Chrome/Chromium history from SQLite database
     * Note: This is a placeholder for the actual SQLite parsing logic
     * In production, you would use a library like 'better-sqlite3'
     */
    async parse(historyDbPath, outputPath) {
        // Validate input
        if (!await fs_extra_1.default.pathExists(historyDbPath)) {
            throw new Error(`Chrome history database does not exist: ${historyDbPath}`);
        }
        // TODO: Implement actual SQLite parsing
        // For now, we'll create a structure that can be filled in
        const result = {
            history: [],
            downloads: [],
            metadata: {
                browser: 'Chrome/Chromium',
                profilePath: path_1.default.dirname(historyDbPath),
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
            await fs_extra_1.default.ensureDir(path_1.default.dirname(outputPath));
            await fs_extra_1.default.writeJson(outputPath, result, { spaces: 2 });
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
    async detectProfiles() {
        const profiles = [];
        const homeDir = process.env.HOME || process.env.USERPROFILE || '';
        // Common Chrome profile locations
        const locations = [
            // Windows
            path_1.default.join(homeDir, 'AppData', 'Local', 'Google', 'Chrome', 'User Data'),
            // macOS
            path_1.default.join(homeDir, 'Library', 'Application Support', 'Google', 'Chrome'),
            // Linux
            path_1.default.join(homeDir, '.config', 'google-chrome'),
        ];
        for (const location of locations) {
            if (await fs_extra_1.default.pathExists(location)) {
                // Check for Default profile and numbered profiles
                const defaultHistory = path_1.default.join(location, 'Default', 'History');
                if (await fs_extra_1.default.pathExists(defaultHistory)) {
                    profiles.push(defaultHistory);
                }
                // Check for Profile 1, Profile 2, etc.
                for (let i = 1; i <= 10; i++) {
                    const profileHistory = path_1.default.join(location, `Profile ${i}`, 'History');
                    if (await fs_extra_1.default.pathExists(profileHistory)) {
                        profiles.push(profileHistory);
                    }
                }
            }
        }
        return profiles;
    }
}
exports.ChromeParser = ChromeParser;
//# sourceMappingURL=chrome_parser.js.map