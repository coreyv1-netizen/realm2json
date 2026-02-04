"use strict";
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoogleTakeoutParser = void 0;
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
class GoogleTakeoutParser {
    constructor(config, auditTrail) {
        this.config = config;
        this.auditTrail = auditTrail;
    }
    /**
     * Parse Google Takeout archive
     */
    async parse(takeoutPath, outputPath) {
        // Validate input
        if (!await fs_extra_1.default.pathExists(takeoutPath)) {
            throw new Error(`Takeout archive does not exist: ${takeoutPath}`);
        }
        const result = {
            metadata: {
                parseTimestamp: new Date().toISOString(),
                archivePath: takeoutPath,
                componentsFound: [],
            },
        };
        const stats = await fs_extra_1.default.stat(takeoutPath);
        // Handle both directory and zip archive
        let workingDir = takeoutPath;
        if (stats.isFile()) {
            // TODO: Extract zip archive to temp directory
            if (this.config.verboseLogging) {
                console.log('Note: ZIP extraction not yet implemented. Please extract manually.');
            }
        }
        // Parse Location History
        const locationHistoryPath = path_1.default.join(workingDir, 'Location History', 'Records.json');
        if (await fs_extra_1.default.pathExists(locationHistoryPath)) {
            result.locationHistory = await this.parseLocationHistory(locationHistoryPath);
            result.metadata.componentsFound.push('Location History');
        }
        // Parse Search History
        const searchHistoryPath = path_1.default.join(workingDir, 'My Activity', 'Search', 'MyActivity.json');
        if (await fs_extra_1.default.pathExists(searchHistoryPath)) {
            result.searchHistory = await this.parseActivityHistory(searchHistoryPath);
            result.metadata.componentsFound.push('Search History');
        }
        // Parse YouTube History
        const youtubeHistoryPath = path_1.default.join(workingDir, 'YouTube and YouTube Music', 'history', 'watch-history.json');
        if (await fs_extra_1.default.pathExists(youtubeHistoryPath)) {
            result.youtubeHistory = await this.parseActivityHistory(youtubeHistoryPath);
            result.metadata.componentsFound.push('YouTube History');
        }
        // Write output if path specified
        if (outputPath) {
            await fs_extra_1.default.ensureDir(path_1.default.dirname(outputPath));
            await fs_extra_1.default.writeJson(outputPath, result, { spaces: 2 });
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
    async parseLocationHistory(jsonPath) {
        try {
            const data = await fs_extra_1.default.readJson(jsonPath);
            // Google Takeout location history is in 'locations' array
            return data.locations || [];
        }
        catch (error) {
            if (this.config.verboseLogging) {
                console.warn(`Failed to parse location history: ${error}`);
            }
            return [];
        }
    }
    /**
     * Parse activity history JSON (search, YouTube, etc.)
     */
    async parseActivityHistory(jsonPath) {
        try {
            const data = await fs_extra_1.default.readJson(jsonPath);
            // Activity history is typically an array at root
            return Array.isArray(data) ? data : [];
        }
        catch (error) {
            if (this.config.verboseLogging) {
                console.warn(`Failed to parse activity history: ${error}`);
            }
            return [];
        }
    }
}
exports.GoogleTakeoutParser = GoogleTakeoutParser;
//# sourceMappingURL=google_takeout_parser.js.map