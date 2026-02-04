import { ForensicConfig } from '../../config/forensic_config';
import { AuditTrail } from '../audit_trail';
export interface SafariHistoryEntry {
    id: number;
    url: string;
    title?: string;
    visit_count?: number;
    visit_time?: string;
}
export interface SafariParseResult {
    history: SafariHistoryEntry[];
    metadata: {
        browser: 'Safari';
        profilePath: string;
        parseTimestamp: string;
        historyCount: number;
    };
}
export declare class SafariParser {
    private config;
    private auditTrail;
    constructor(config: ForensicConfig, auditTrail: AuditTrail);
    /**
     * Parse Safari history from SQLite database
     * Note: This is a placeholder for the actual SQLite parsing logic
     */
    parse(historyDbPath: string, outputPath?: string): Promise<SafariParseResult>;
    /**
     * Detect Safari history database location
     */
    detectHistoryDb(): Promise<string | null>;
}
