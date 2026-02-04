import { ForensicConfig } from '../config/forensic_config';
export interface AuditEntry {
    timestamp: string;
    caseId: string;
    investigator: string;
    module: string;
    operation: string;
    details: any;
    inputHash?: string;
    outputHash?: string;
    success: boolean;
    errorMessage?: string;
}
export declare class AuditTrail {
    private config;
    private logFile;
    private sessionId;
    constructor(config: ForensicConfig);
    /**
     * Log an operation to the audit trail
     */
    log(entry: Omit<AuditEntry, 'timestamp' | 'caseId' | 'investigator'>): Promise<void>;
    /**
     * Compute hash of a file for integrity verification
     */
    computeFileHash(filePath: string): Promise<string>;
    /**
     * Log a file operation with hash verification
     */
    logFileOperation(module: string, operation: string, inputPath: string, outputPath?: string, details?: any): Promise<void>;
    /**
     * Get the path to the current audit log file
     */
    getLogFile(): string;
    /**
     * Get the session ID
     */
    getSessionId(): string;
}
