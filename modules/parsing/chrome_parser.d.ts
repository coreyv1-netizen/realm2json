import { ForensicConfig } from '../../config/forensic_config';
import { AuditTrail } from '../audit_trail';
export interface ChromeHistoryEntry {
    id: number;
    url: string;
    title?: string;
    visit_count?: number;
    typed_count?: number;
    last_visit_time?: string;
    hidden?: boolean;
}
export interface ChromeDownload {
    id: number;
    target_path: string;
    start_time?: string;
    end_time?: string;
    danger_type?: number;
    opened?: boolean;
}
export interface ChromeParseResult {
    history: ChromeHistoryEntry[];
    downloads: ChromeDownload[];
    metadata: {
        browser: string;
        profilePath: string;
        parseTimestamp: string;
        historyCount: number;
        downloadCount: number;
    };
}
export declare class ChromeParser {
    private config;
    private auditTrail;
    constructor(config: ForensicConfig, auditTrail: AuditTrail);
    /**
     * Parse Chrome/Chromium history from SQLite database
     * Note: This is a placeholder for the actual SQLite parsing logic
     * In production, you would use a library like 'better-sqlite3'
     */
    parse(historyDbPath: string, outputPath?: string): Promise<ChromeParseResult>;
    /**
     * Detect Chrome profile directories on the system
     */
    detectProfiles(): Promise<string[]>;
}
