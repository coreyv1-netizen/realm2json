////////////////////////////////////////////////////////////////////////////
//
// Acquisition Module
//
// Handles forensic-grade data acquisition with integrity verification,
// metadata preservation, and chain of custody documentation.
//
////////////////////////////////////////////////////////////////////////////

import fs from 'fs-extra';
import path from 'path';
import crypto from 'crypto';
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

export class AcquisitionModule {
  private config: ForensicConfig;
  private auditTrail: AuditTrail;

  constructor(config: ForensicConfig, auditTrail: AuditTrail) {
    this.config = config;
    this.auditTrail = auditTrail;
  }

  /**
   * Acquire a file with forensic integrity preservation
   */
  async acquireFile(
    sourcePath: string,
    destinationName?: string,
    notes?: string
  ): Promise<{ destPath: string; metadata: AcquisitionMetadata }> {
    // Validate source file exists
    if (!await fs.pathExists(sourcePath)) {
      throw new Error(`Source file does not exist: ${sourcePath}`);
    }

    // Get file stats
    const stats = await fs.stat(sourcePath);
    if (!stats.isFile()) {
      throw new Error(`Source is not a file: ${sourcePath}`);
    }

    // Generate destination path
    const fileName = destinationName || path.basename(sourcePath);
    const destPath = path.join(this.config.evidencePath, fileName);

    // Copy file preserving attributes
    await fs.copy(sourcePath, destPath, { preserveTimestamps: true });

    // Compute hashes
    const md5Hash = await this.computeHash(destPath, 'md5');
    const sha256Hash = await this.computeHash(destPath, 'sha256');

    // Create metadata
    const metadata: AcquisitionMetadata = {
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
    await fs.writeJson(metadataPath, metadata, { spaces: 2 });

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
  async acquireDirectory(
    sourcePath: string,
    destinationName?: string,
    notes?: string
  ): Promise<{ destPath: string; files: string[]; metadata: any }> {
    if (!await fs.pathExists(sourcePath)) {
      throw new Error(`Source directory does not exist: ${sourcePath}`);
    }

    const stats = await fs.stat(sourcePath);
    if (!stats.isDirectory()) {
      throw new Error(`Source is not a directory: ${sourcePath}`);
    }

    const dirName = destinationName || path.basename(sourcePath);
    const destPath = path.join(this.config.evidencePath, dirName);

    // Copy directory
    await fs.copy(sourcePath, destPath, { preserveTimestamps: true });

    // Collect all files
    const files: string[] = [];
    const collectFiles = async (dir: string) => {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isFile()) {
          files.push(path.relative(destPath, fullPath));
        } else if (entry.isDirectory()) {
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

    const metadataPath = path.join(destPath, '.directory.metadata.json');
    await fs.writeJson(metadataPath, metadata, { spaces: 2 });

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
  async verifyIntegrity(filePath: string): Promise<boolean> {
    const metadataPath = `${filePath}.metadata.json`;
    if (!await fs.pathExists(metadataPath)) {
      throw new Error(`Metadata file not found: ${metadataPath}`);
    }

    const metadata: AcquisitionMetadata = await fs.readJson(metadataPath);
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
  private async computeHash(
    filePath: string,
    algorithm: 'md5' | 'sha256' | 'sha512'
  ): Promise<string> {
    const hash = crypto.createHash(algorithm);
    const stream = fs.createReadStream(filePath);

    return new Promise((resolve, reject) => {
      stream.on('data', (data) => hash.update(data));
      stream.on('end', () => resolve(hash.digest('hex')));
      stream.on('error', reject);
    });
  }
}
