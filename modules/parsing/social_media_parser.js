"use strict";
////////////////////////////////////////////////////////////////////////////
//
// Social Media Parser Module
//
// Parsers for Instagram, Snapchat, and other social media data exports
//
////////////////////////////////////////////////////////////////////////////
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocialMediaParser = void 0;
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
class SocialMediaParser {
    constructor(config, auditTrail) {
        this.config = config;
        this.auditTrail = auditTrail;
    }
    /**
     * Parse Instagram data export
     */
    async parseInstagram(archivePath, outputPath) {
        if (!await fs_extra_1.default.pathExists(archivePath)) {
            throw new Error(`Instagram archive does not exist: ${archivePath}`);
        }
        const result = {
            metadata: {
                platform: 'Instagram',
                parseTimestamp: new Date().toISOString(),
                archivePath,
                componentsFound: [],
            },
        };
        // Instagram exports are typically JSON files in specific directories
        const postsPath = path_1.default.join(archivePath, 'content', 'posts_1.json');
        if (await fs_extra_1.default.pathExists(postsPath)) {
            result.posts = await fs_extra_1.default.readJson(postsPath);
            result.metadata.componentsFound.push('Posts');
        }
        const messagesPath = path_1.default.join(archivePath, 'messages', 'inbox');
        if (await fs_extra_1.default.pathExists(messagesPath)) {
            result.messages = await this.parseInstagramMessages(messagesPath);
            result.metadata.componentsFound.push('Messages');
        }
        const followersPath = path_1.default.join(archivePath, 'followers_and_following', 'followers.json');
        if (await fs_extra_1.default.pathExists(followersPath)) {
            result.followers = await fs_extra_1.default.readJson(followersPath);
            result.metadata.componentsFound.push('Followers');
        }
        const followingPath = path_1.default.join(archivePath, 'followers_and_following', 'following.json');
        if (await fs_extra_1.default.pathExists(followingPath)) {
            result.following = await fs_extra_1.default.readJson(followingPath);
            result.metadata.componentsFound.push('Following');
        }
        if (outputPath) {
            await fs_extra_1.default.ensureDir(path_1.default.dirname(outputPath));
            await fs_extra_1.default.writeJson(outputPath, result, { spaces: 2 });
        }
        await this.auditTrail.log({
            module: 'parsing',
            operation: 'parseInstagram',
            details: {
                inputPath: archivePath,
                outputPath,
                componentsFound: result.metadata.componentsFound,
            },
            success: true,
        });
        if (this.config.verboseLogging) {
            console.log(`Parsed Instagram data: ${archivePath}`);
            console.log(`  Components: ${result.metadata.componentsFound.join(', ')}`);
        }
        return result;
    }
    /**
     * Parse Snapchat data export
     */
    async parseSnapchat(archivePath, outputPath) {
        if (!await fs_extra_1.default.pathExists(archivePath)) {
            throw new Error(`Snapchat archive does not exist: ${archivePath}`);
        }
        const result = {
            metadata: {
                platform: 'Snapchat',
                parseTimestamp: new Date().toISOString(),
                archivePath,
                componentsFound: [],
            },
        };
        // Snapchat exports JSON files in 'json' directory
        const jsonDir = path_1.default.join(archivePath, 'json');
        if (await fs_extra_1.default.pathExists(jsonDir)) {
            const files = await fs_extra_1.default.readdir(jsonDir);
            for (const file of files) {
                if (file.endsWith('.json')) {
                    const filePath = path_1.default.join(jsonDir, file);
                    const data = await fs_extra_1.default.readJson(filePath);
                    // Map files to appropriate categories
                    if (file.includes('chat') || file.includes('message')) {
                        result.messages = data;
                        result.metadata.componentsFound.push('Messages');
                    }
                    else if (file.includes('friend')) {
                        result.followers = data;
                        result.metadata.componentsFound.push('Friends');
                    }
                }
            }
        }
        if (outputPath) {
            await fs_extra_1.default.ensureDir(path_1.default.dirname(outputPath));
            await fs_extra_1.default.writeJson(outputPath, result, { spaces: 2 });
        }
        await this.auditTrail.log({
            module: 'parsing',
            operation: 'parseSnapchat',
            details: {
                inputPath: archivePath,
                outputPath,
                componentsFound: result.metadata.componentsFound,
            },
            success: true,
        });
        if (this.config.verboseLogging) {
            console.log(`Parsed Snapchat data: ${archivePath}`);
            console.log(`  Components: ${result.metadata.componentsFound.join(', ')}`);
        }
        return result;
    }
    /**
     * Parse Instagram message directory
     */
    async parseInstagramMessages(messagesDir) {
        const allMessages = [];
        try {
            const conversations = await fs_extra_1.default.readdir(messagesDir);
            for (const conversation of conversations) {
                const convPath = path_1.default.join(messagesDir, conversation, 'message_1.json');
                if (await fs_extra_1.default.pathExists(convPath)) {
                    const messages = await fs_extra_1.default.readJson(convPath);
                    allMessages.push(messages);
                }
            }
        }
        catch (error) {
            if (this.config.verboseLogging) {
                console.warn(`Failed to parse Instagram messages: ${error}`);
            }
        }
        return allMessages;
    }
}
exports.SocialMediaParser = SocialMediaParser;
//# sourceMappingURL=social_media_parser.js.map