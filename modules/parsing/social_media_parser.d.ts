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
export declare class SocialMediaParser {
    private config;
    private auditTrail;
    constructor(config: ForensicConfig, auditTrail: AuditTrail);
    /**
     * Parse Instagram data export
     */
    parseInstagram(archivePath: string, outputPath?: string): Promise<SocialMediaParseResult>;
    /**
     * Parse Snapchat data export
     */
    parseSnapchat(archivePath: string, outputPath?: string): Promise<SocialMediaParseResult>;
    /**
     * Parse Instagram message directory
     */
    private parseInstagramMessages;
}
