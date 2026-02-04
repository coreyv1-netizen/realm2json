////////////////////////////////////////////////////////////////////////////
//
// Audit Trail Module
//
// Provides forensic-grade audit logging for all toolkit operations.
// All actions are logged with timestamps, operator information, and
// operation details to ensure reproducibility and chain of custody.
//
////////////////////////////////////////////////////////////////////////////

import fs from 'fs-extra';
import path from 'path';
import crypto from 'crypto';
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

export class AuditTrail {
  private config: ForensicConfig;
  private logFile: string;
  private sessionId: string;

  constructor(config: ForensicConfig) {
    this.config = config;
    this.sessionId = crypto.randomBytes(8).toString('hex');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    this.logFile = path.join(
      config.logsPath,
      `audit-${timestamp}-${this.sessionId}.jsonl`
    );
  }

  /**
   * Log an operation to the audit trail
   */
  async log(entry: Omit<AuditEntry, 'timestamp' | 'caseId' | 'investigator'>): Promise<void> {
    if (!this.config.enableAuditTrail) {
      return;
    }

    const fullEntry: AuditEntry = {
      timestamp: new Date().toISOString(),
      caseId: this.config.caseId,
      investigator: this.config.investigator,
      ...entry,
    };

    const line = JSON.stringify(fullEntry) + '\n';
    await fs.appendFile(this.logFile, line, 'utf-8');

    if (this.config.verboseLogging) {
      console.log(`[AUDIT] ${entry.module}.${entry.operation}: ${entry.success ? 'SUCCESS' : 'FAILED'}`);
    }
  }

  /**
   * Compute hash of a file for integrity verification
   */
  async computeFileHash(filePath: string): Promise<string> {
    const hash = crypto.createHash(this.config.hashAlgorithm);
    const stream = fs.createReadStream(filePath);

    return new Promise((resolve, reject) => {
      stream.on('data', (data) => hash.update(data));
      stream.on('end', () => resolve(hash.digest('hex')));
      stream.on('error', reject);
    });
  }

  /**
   * Log a file operation with hash verification
   */
  async logFileOperation(
    module: string,
    operation: string,
    inputPath: string,
    outputPath?: string,
    details?: any
  ): Promise<void> {
    try {
      const inputHash = this.config.enableHashVerification
        ? await this.computeFileHash(inputPath)
        : undefined;

      const outputHash = outputPath && this.config.enableHashVerification
        ? await this.computeFileHash(outputPath)
        : undefined;

      await this.log({
        module,
        operation,
        details: {
          ...details,
          inputPath,
          outputPath,
        },
        inputHash,
        outputHash,
        success: true,
      });
    } catch (error) {
      await this.log({
        module,
        operation,
        details: {
          ...details,
          inputPath,
          outputPath,
        },
        success: false,
        errorMessage: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  /**
   * Get the path to the current audit log file
   */
  getLogFile(): string {
    return this.logFile;
  }

  /**
   * Get the session ID
   */
  getSessionId(): string {
    return this.sessionId;
  }
}
