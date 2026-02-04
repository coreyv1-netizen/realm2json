import { loadConfig, validateConfig } from '../config/forensic_config';

describe('Forensic Configuration', () => {
  beforeEach(() => {
    // Clear environment variables
    delete process.env.FORENSIC_CASE_ID;
    delete process.env.FORENSIC_CASE_NAME;
    delete process.env.FORENSIC_INVESTIGATOR;
  });

  test('should load default configuration', () => {
    const config = loadConfig();
    
    expect(config).toBeDefined();
    expect(config.caseId).toBe('CASE-UNKNOWN');
    expect(config.caseName).toBe('Unnamed Case');
    expect(config.investigator).toBe('Unknown');
    expect(config.enableAuditTrail).toBe(true);
    expect(config.enableHashVerification).toBe(true);
    expect(config.hashAlgorithm).toBe('sha256');
  });

  test('should load configuration from environment variables', () => {
    process.env.FORENSIC_CASE_ID = 'TEST-CASE-001';
    process.env.FORENSIC_CASE_NAME = 'Test Case';
    process.env.FORENSIC_INVESTIGATOR = 'Test Investigator';
    process.env.FORENSIC_AI_ENABLED = 'true';

    const config = loadConfig();
    
    expect(config.caseId).toBe('TEST-CASE-001');
    expect(config.caseName).toBe('Test Case');
    expect(config.investigator).toBe('Test Investigator');
    expect(config.aiEnabled).toBe(true);
  });

  test('should validate configuration and return errors', () => {
    const config = loadConfig();
    const errors = validateConfig(config);
    
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some(e => e.includes('Case ID'))).toBe(true);
    expect(errors.some(e => e.includes('Investigator'))).toBe(true);
  });

  test('should validate AI configuration when enabled', () => {
    process.env.FORENSIC_AI_ENABLED = 'true';
    process.env.FORENSIC_CASE_ID = 'TEST-001';
    process.env.FORENSIC_INVESTIGATOR = 'Tester';
    
    const config = loadConfig();
    const errors = validateConfig(config);
    
    expect(errors.some(e => e.includes('AI'))).toBe(true);
  });
});
