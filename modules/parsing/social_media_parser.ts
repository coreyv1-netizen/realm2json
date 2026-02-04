////////////////////////////////////////////////////////////////////////////
//
// Social Media Parser Module
//
// Parsers for Instagram, Snapchat, and other social media data exports
//
////////////////////////////////////////////////////////////////////////////

import fs from 'fs-extra';
import path from 'path';
import { ForensicConfig } from '../../config/forensic_config';
import { AuditTrail } from '../audit_trail';

export interface SocialMediaParseResult {
  posts?: any[];
  messages?: any[];
  comments?: any[];
  followers?: any[];
  following?: any[];
  metadata: {
    platform: string;
    parseTimestamp: string;
    archivePath: string;
    componentsFound: string[];
  };
}

export class SocialMediaParser {
  private config: ForensicConfig;
  private auditTrail: AuditTrail;

  constructor(config: ForensicConfig, auditTrail: AuditTrail) {
    this.config = config;
    this.auditTrail = auditTrail;
  }

  /**
   * Parse Instagram data export
   */
  async parseInstagram(archivePath: string, outputPath?: string): Promise<SocialMediaParseResult> {
    if (!await fs.pathExists(archivePath)) {
      throw new Error(`Instagram archive does not exist: ${archivePath}`);
    }

    const result: SocialMediaParseResult = {
      metadata: {
        platform: 'Instagram',
        parseTimestamp: new Date().toISOString(),
        archivePath,
        componentsFound: [],
      },
    };

    // Instagram exports are typically JSON files in specific directories
    const postsPath = path.join(archivePath, 'content', 'posts_1.json');
    if (await fs.pathExists(postsPath)) {
      result.posts = await fs.readJson(postsPath);
      result.metadata.componentsFound.push('Posts');
    }

    const messagesPath = path.join(archivePath, 'messages', 'inbox');
    if (await fs.pathExists(messagesPath)) {
      result.messages = await this.parseInstagramMessages(messagesPath);
      result.metadata.componentsFound.push('Messages');
    }

    const followersPath = path.join(archivePath, 'followers_and_following', 'followers.json');
    if (await fs.pathExists(followersPath)) {
      result.followers = await fs.readJson(followersPath);
      result.metadata.componentsFound.push('Followers');
    }

    const followingPath = path.join(archivePath, 'followers_and_following', 'following.json');
    if (await fs.pathExists(followingPath)) {
      result.following = await fs.readJson(followingPath);
      result.metadata.componentsFound.push('Following');
    }

    if (outputPath) {
      await fs.ensureDir(path.dirname(outputPath));
      await fs.writeJson(outputPath, result, { spaces: 2 });
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
  async parseSnapchat(archivePath: string, outputPath?: string): Promise<SocialMediaParseResult> {
    if (!await fs.pathExists(archivePath)) {
      throw new Error(`Snapchat archive does not exist: ${archivePath}`);
    }

    const result: SocialMediaParseResult = {
      metadata: {
        platform: 'Snapchat',
        parseTimestamp: new Date().toISOString(),
        archivePath,
        componentsFound: [],
      },
    };

    // Snapchat exports JSON files in 'json' directory
    const jsonDir = path.join(archivePath, 'json');
    if (await fs.pathExists(jsonDir)) {
      const files = await fs.readdir(jsonDir);
      
      for (const file of files) {
        if (file.endsWith('.json')) {
          const filePath = path.join(jsonDir, file);
          const data = await fs.readJson(filePath);
          
          // Map files to appropriate categories
          if (file.includes('chat') || file.includes('message')) {
            result.messages = data;
            result.metadata.componentsFound.push('Messages');
          } else if (file.includes('friend')) {
            result.followers = data;
            result.metadata.componentsFound.push('Friends');
          }
        }
      }
    }

    if (outputPath) {
      await fs.ensureDir(path.dirname(outputPath));
      await fs.writeJson(outputPath, result, { spaces: 2 });
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
  private async parseInstagramMessages(messagesDir: string): Promise<any[]> {
    const allMessages: any[] = [];
    
    try {
      const conversations = await fs.readdir(messagesDir);
      
      for (const conversation of conversations) {
        const convPath = path.join(messagesDir, conversation, 'message_1.json');
        if (await fs.pathExists(convPath)) {
          const messages = await fs.readJson(convPath);
          allMessages.push(messages);
        }
      }
    } catch (error) {
      if (this.config.verboseLogging) {
        console.warn(`Failed to parse Instagram messages: ${error}`);
      }
    }

    return allMessages;
  }
}
