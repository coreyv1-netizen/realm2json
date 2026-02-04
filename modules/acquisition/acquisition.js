"use strict";
////////////////////////////////////////////////////////////////////////////
//
// Acquisition Module
//
// Handles forensic-grade data acquisition with integrity verification,
// metadata preservation, and chain of custody documentation.
//
////////////////////////////////////////////////////////////////////////////
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AcquisitionModule = void 0;
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const crypto_1 = __importDefault(require("crypto"));
class AcquisitionModule {
    constructor(config, auditTrail) {
        this.config = config;
        this.auditTrail = auditTrail;
    }
    /**
     * Acquire a file with forensic integrity preservation
     */
    async acquireFile(sourcePath, destinationName, notes) {
        // Validate source file exists
        if (!await fs_extra_1.default.pathExists(sourcePath)) {
            throw new Error(`Source file does not exist: ${sourcePath}`);
        }
        // Get file stats
        const stats = await fs_extra_1.default.stat(sourcePath);
        if (!stats.isFile()) {
            throw new Error(`Source is not a file: ${sourcePath}`);
        }
        // Generate destination path
        const fileName = destinationName || path_1.default.basename(sourcePath);
        const destPath = path_1.default.join(this.config.evidencePath, fileName);
        // Copy file preserving attributes
        await fs_extra_1.default.copy(sourcePath, destPath, { preserveTimestamps: true });
        // Compute hashes
        const md5Hash = await this.computeHash(destPath, 'md5');
        const sha256Hash = await this.computeHash(destPath, 'sha256');
        // Create metadata
        const metadata = {
            originalPath: sourcePath,
            acquisitionTimestamp: new Date().toISOString(),
            fileSize: stats.size,
            md5Hash,
            sha256Hash,
            investigator: this.config.investigator,
            caseId: this.config.caseId,
            notes,
        };
        // Save metadata
        const metadataPath = `${destPath}.metadata.json`;
        await fs_extra_1.default.writeJson(metadataPath, metadata, { spaces: 2 });
        // Log to audit trail
        await this.auditTrail.log({
            module: 'acquisition',
            operation: 'acquireFile',
            details: {
                sourcePath,
                destPath,
                fileSize: stats.size,
                md5Hash,
                sha256Hash,
            },
            inputHash: sha256Hash,
            success: true,
        });
        if (this.config.verboseLogging) {
            console.log(`Acquired: ${sourcePath} -> ${destPath}`);
            console.log(`  Size: ${stats.size} bytes`);
            console.log(`  SHA256: ${sha256Hash}`);
        }
        return { destPath, metadata };
    }
    /**
     * Acquire a directory recursively
     */
    async acquireDirectory(sourcePath, destinationName, notes) {
        if (!await fs_extra_1.default.pathExists(sourcePath)) {
            throw new Error(`Source directory does not exist: ${sourcePath}`);
        }
        const stats = await fs_extra_1.default.stat(sourcePath);
        if (!stats.isDirectory()) {
            throw new Error(`Source is not a directory: ${sourcePath}`);
        }
        const dirName = destinationName || path_1.default.basename(sourcePath);
        const destPath = path_1.default.join(this.config.evidencePath, dirName);
        // Copy directory
        await fs_extra_1.default.copy(sourcePath, destPath, { preserveTimestamps: true });
        // Collect all files
        const files = [];
        const collectFiles = async (dir) => {
            const entries = await fs_extra_1.default.readdir(dir, { withFileTypes: true });
            for (const entry of entries) {
                const fullPath = path_1.default.join(dir, entry.name);
                if (entry.isFile()) {
                    files.push(path_1.default.relative(destPath, fullPath));
                }
                else if (entry.isDirectory()) {
                    await collectFiles(fullPath);
                }
            }
        };
        await collectFiles(destPath);
        // Create directory metadata
        const metadata = {
            originalPath: sourcePath,
            acquisitionTimestamp: new Date().toISOString(),
            fileCount: files.length,
            investigator: this.config.investigator,
            caseId: this.config.caseId,
            notes,
            files: files.slice(0, 100), // First 100 files
        };
        const metadataPath = path_1.default.join(destPath, '.directory.metadata.json');
        await fs_extra_1.default.writeJson(metadataPath, metadata, { spaces: 2 });
        await this.auditTrail.log({
            module: 'acquisition',
            operation: 'acquireDirectory',
            details: {
                sourcePath,
                destPath,
                fileCount: files.length,
            },
            success: true,
        });
        if (this.config.verboseLogging) {
            console.log(`Acquired directory: ${sourcePath} -> ${destPath}`);
            console.log(`  Files: ${files.length}`);
        }
        return { destPath, files, metadata };
    }
    /**
     * Verify file integrity against metadata
     */
    async verifyIntegrity(filePath) {
        const metadataPath = `${filePath}.metadata.json`;
        if (!await fs_extra_1.default.pathExists(metadataPath)) {
            throw new Error(`Metadata file not found: ${metadataPath}`);
        }
        const metadata = await fs_extra_1.default.readJson(metadataPath);
        const currentSha256 = await this.computeHash(filePath, 'sha256');
        const isValid = currentSha256 === metadata.sha256Hash;
        await this.auditTrail.log({
            module: 'acquisition',
            operation: 'verifyIntegrity',
            details: {
                filePath,
                originalHash: metadata.sha256Hash,
                currentHash: currentSha256,
                isValid,
            },
            success: isValid,
            errorMessage: isValid ? undefined : 'Hash mismatch detected',
        });
        return isValid;
    }
    /**
     * Compute hash of a file
     */
    async computeHash(filePath, algorithm) {
        const hash = crypto_1.default.createHash(algorithm);
        const stream = fs_extra_1.default.createReadStream(filePath);
        return new Promise((resolve, reject) => {
            stream.on('data', (data) => hash.update(data));
            stream.on('end', () => resolve(hash.digest('hex')));
            stream.on('error', reject);
        });
    }
}
exports.AcquisitionModule = AcquisitionModule;
//# sourceMappingURL=acquisition.js.map