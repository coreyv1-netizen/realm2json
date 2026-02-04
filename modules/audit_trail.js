"use strict";
////////////////////////////////////////////////////////////////////////////
//
// Audit Trail Module
//
// Provides forensic-grade audit logging for all toolkit operations.
// All actions are logged with timestamps, operator information, and
// operation details to ensure reproducibility and chain of custody.
//
////////////////////////////////////////////////////////////////////////////
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditTrail = void 0;
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const crypto_1 = __importDefault(require("crypto"));
class AuditTrail {
    constructor(config) {
        this.config = config;
        this.sessionId = crypto_1.default.randomBytes(8).toString('hex');
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        this.logFile = path_1.default.join(config.logsPath, `audit-${timestamp}-${this.sessionId}.jsonl`);
    }
    /**
     * Log an operation to the audit trail
     */
    async log(entry) {
        if (!this.config.enableAuditTrail) {
            return;
        }
        const fullEntry = {
            timestamp: new Date().toISOString(),
            caseId: this.config.caseId,
            investigator: this.config.investigator,
            ...entry,
        };
        const line = JSON.stringify(fullEntry) + '\n';
        await fs_extra_1.default.appendFile(this.logFile, line, 'utf-8');
        if (this.config.verboseLogging) {
            console.log(`[AUDIT] ${entry.module}.${entry.operation}: ${entry.success ? 'SUCCESS' : 'FAILED'}`);
        }
    }
    /**
     * Compute hash of a file for integrity verification
     */
    async computeFileHash(filePath) {
        const hash = crypto_1.default.createHash(this.config.hashAlgorithm);
        const stream = fs_extra_1.default.createReadStream(filePath);
        return new Promise((resolve, reject) => {
            stream.on('data', (data) => hash.update(data));
            stream.on('end', () => resolve(hash.digest('hex')));
            stream.on('error', reject);
        });
    }
    /**
     * Log a file operation with hash verification
     */
    async logFileOperation(module, operation, inputPath, outputPath, details) {
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
        }
        catch (error) {
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
    getLogFile() {
        return this.logFile;
    }
    /**
     * Get the session ID
     */
    getSessionId() {
        return this.sessionId;
    }
}
exports.AuditTrail = AuditTrail;
//# sourceMappingURL=audit_trail.js.map