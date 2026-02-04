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
export declare class GoogleTakeoutParser {
    private config;
    private auditTrail;
    constructor(config: ForensicConfig, auditTrail: AuditTrail);
    /**
     * Parse Google Takeout archive
     */
    parse(takeoutPath: string, outputPath?: string): Promise<GoogleTakeoutParseResult>;
    /**
     * Parse location history JSON
     */
    private parseLocationHistory;
    /**
     * Parse activity history JSON (search, YouTube, etc.)
     */
    private parseActivityHistory;
}
