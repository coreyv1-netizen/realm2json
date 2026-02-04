import { ForensicConfig } from '../../config/forensic_config';
import { AuditTrail } from '../audit_trail';
export interface RealmParseResult {
    data: any;
    schema: any[];
    metadata: {
        fileName: string;
        parseTimestamp: string;
        objectCount: number;
        classNames: string[];
    };
}
export declare class RealmParser {
    private config;
    private auditTrail;
    constructor(config: ForensicConfig, auditTrail: AuditTrail);
    /**
     * Parse a Realm database file
     */
    parse(realmPath: string, outputPath?: string): Promise<RealmParseResult>;
    /**
     * Extract schema information from a Realm file
     */
    extractSchema(realmPath: string): Promise<any[]>;
    /**
     * Get statistics about a Realm database
     */
    getStatistics(realmPath: string): Promise<any>;
}
