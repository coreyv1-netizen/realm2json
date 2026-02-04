import fs from 'fs-extra';
import path from 'path';
import os from 'os';
import { AuditTrail } from '../modules/audit_trail';
import { loadConfig } from '../config/forensic_config';

describe('Audit Trail', () => {
  let tempDir: string;
  let auditTrail: AuditTrail;

  beforeEach(async () => {
    // Create temporary directory
    tempDir = path.join(os.tmpdir(), `forensic-test-${Date.now()}`);
    await fs.ensureDir(tempDir);

    // Set up config with temp directory
    process.env.FORENSIC_WORKSPACE_ROOT = tempDir;
    process.env.FORENSIC_LOGS_PATH = path.join(tempDir, 'logs');
    process.env.FORENSIC_CASE_ID = 'TEST-001';
    process.env.FORENSIC_INVESTIGATOR = 'Test User';

    const config = loadConfig();
    await fs.ensureDir(config.logsPath);
    
    auditTrail = new AuditTrail(config);
  });

  afterEach(async () => {
    // Clean up temp directory
    await fs.remove(tempDir);
  });

  test('should create audit trail with session ID', () => {
    expect(auditTrail.getSessionId()).toBeDefined();
    expect(auditTrail.getSessionId().length).toBeGreaterThan(0);
  });

  test('should log operations to audit file', async () => {
    await auditTrail.log({
      module: 'test',
      operation: 'testOperation',
      details: { test: 'data' },
      success: true,
    });

    const logFile = auditTrail.getLogFile();
    expect(await fs.pathExists(logFile)).toBe(true);
    
    const content = await fs.readFile(logFile, 'utf-8');
    expect(content).toContain('test');
    expect(content).toContain('testOperation');
    expect(content).toContain('TEST-001');
  });

  test('should compute file hash correctly', async () => {
    const testFile = path.join(tempDir, 'test.txt');
    await fs.writeFile(testFile, 'test content', 'utf-8');

    const hash = await auditTrail.computeFileHash(testFile);
    expect(hash).toBeDefined();
    expect(hash.length).toBeGreaterThan(0);
    
    // SHA256 hash should be 64 characters (32 bytes in hex)
    expect(hash.length).toBe(64);
  });

  test('should log file operations with hashes', async () => {
    const testFile = path.join(tempDir, 'test.txt');
    await fs.writeFile(testFile, 'test content', 'utf-8');

    await auditTrail.logFileOperation(
      'test',
      'fileTest',
      testFile,
      undefined,
      { note: 'test note' }
    );

    const logFile = auditTrail.getLogFile();
    const content = await fs.readFile(logFile, 'utf-8');
    const logEntry = JSON.parse(content.trim());
    
    expect(logEntry.inputHash).toBeDefined();
    expect(logEntry.details.note).toBe('test note');
  });
});
