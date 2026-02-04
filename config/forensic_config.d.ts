export interface ForensicConfig {
    caseId: string;
    caseName: string;
    investigator: string;
    workspaceRoot: string;
    evidencePath: string;
    outputPath: string;
    tempPath: string;
    logsPath: string;
    reportsPath: string;
    enableAuditTrail: boolean;
    enableHashVerification: boolean;
    hashAlgorithm: 'sha256' | 'sha512' | 'md5';
    aiEnabled: boolean;
    aiProvider?: 'openai' | 'anthropic' | 'local';
    aiApiKey?: string;
    aiModel?: string;
    parallelProcessing: boolean;
    maxWorkers: number;
    verboseLogging: boolean;
}
/**
 * Load configuration from environment variables with sensible defaults
 */
export declare function loadConfig(): ForensicConfig;
/**
 * Initialize workspace directories based on configuration
 */
export declare function initializeWorkspace(config: ForensicConfig): Promise<void>;
/**
 * Validate configuration
 */
export declare function validateConfig(config: ForensicConfig): string[];
