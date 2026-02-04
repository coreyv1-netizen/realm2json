import { ForensicConfig } from '../../config/forensic_config';
import { AuditTrail } from '../audit_trail';
export interface AcquisitionMetadata {
    originalPath: string;
    acquisitionTimestamp: string;
    fileSize: number;
    mimeType?: string;
    md5Hash: string;
    sha256Hash: string;
    investigator: string;
    caseId: string;
    notes?: string;
}
export declare class AcquisitionModule {
    private config;
    private auditTrail;
    constructor(config: ForensicConfig, auditTrail: AuditTrail);
    /**
     * Acquire a file with forensic integrity preservation
     */
    acquireFile(sourcePath: string, destinationName?: string, notes?: string): Promise<{
        destPath: string;
        metadata: AcquisitionMetadata;
    }>;
    /**
     * Acquire a directory recursively
     */
    acquireDirectory(sourcePath: string, destinationName?: string, notes?: string): Promise<{
        destPath: string;
        files: string[];
        metadata: any;
    }>;
    /**
     * Verify file integrity against metadata
     */
    verifyIntegrity(filePath: string): Promise<boolean>;
    /**
     * Compute hash of a file
     */
    private computeHash;
}
