"use strict";
////////////////////////////////////////////////////////////////////////////
//
// Forensic Configuration Module
// 
// This module provides centralized configuration management for the 
// Universal Forensic Toolkit. All paths and settings are driven by
// environment variables to ensure portability and workspace-agnosticism.
//
////////////////////////////////////////////////////////////////////////////
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadConfig = loadConfig;
exports.initializeWorkspace = initializeWorkspace;
exports.validateConfig = validateConfig;
const path_1 = __importDefault(require("path"));
const fs_extra_1 = __importDefault(require("fs-extra"));
/**
 * Load configuration from environment variables with sensible defaults
 */
function loadConfig() {
    const workspaceRoot = process.env.FORENSIC_WORKSPACE_ROOT || process.cwd();
    const config = {
        // Case Information
        caseId: process.env.FORENSIC_CASE_ID || 'CASE-UNKNOWN',
        caseName: process.env.FORENSIC_CASE_NAME || 'Unnamed Case',
        investigator: process.env.FORENSIC_INVESTIGATOR || 'Unknown',
        // Workspace Paths
        workspaceRoot,
        evidencePath: process.env.FORENSIC_EVIDENCE_PATH || path_1.default.join(workspaceRoot, 'evidence'),
        outputPath: process.env.FORENSIC_OUTPUT_PATH || path_1.default.join(workspaceRoot, 'output'),
        tempPath: process.env.FORENSIC_TEMP_PATH || path_1.default.join(workspaceRoot, 'temp'),
        logsPath: process.env.FORENSIC_LOGS_PATH || path_1.default.join(workspaceRoot, 'logs'),
        reportsPath: process.env.FORENSIC_REPORTS_PATH || path_1.default.join(workspaceRoot, 'reports'),
        // Forensic Standards
        enableAuditTrail: process.env.FORENSIC_AUDIT_TRAIL !== 'false',
        enableHashVerification: process.env.FORENSIC_HASH_VERIFICATION !== 'false',
        hashAlgorithm: process.env.FORENSIC_HASH_ALGORITHM || 'sha256',
        // AI Configuration
        aiEnabled: process.env.FORENSIC_AI_ENABLED === 'true',
        aiProvider: process.env.FORENSIC_AI_PROVIDER,
        aiApiKey: process.env.FORENSIC_AI_API_KEY,
        aiModel: process.env.FORENSIC_AI_MODEL,
        // Processing Options
        parallelProcessing: process.env.FORENSIC_PARALLEL_PROCESSING !== 'false',
        maxWorkers: parseInt(process.env.FORENSIC_MAX_WORKERS || '4', 10),
        verboseLogging: process.env.FORENSIC_VERBOSE_LOGGING === 'true',
    };
    return config;
}
/**
 * Initialize workspace directories based on configuration
 */
async function initializeWorkspace(config) {
    const directories = [
        config.evidencePath,
        config.outputPath,
        config.tempPath,
        config.logsPath,
        config.reportsPath,
    ];
    for (const dir of directories) {
        await fs_extra_1.default.ensureDir(dir);
    }
    if (config.verboseLogging) {
        console.log('Workspace initialized:');
        directories.forEach(dir => console.log(`  - ${dir}`));
    }
}
/**
 * Validate configuration
 */
function validateConfig(config) {
    const errors = [];
    if (!config.caseId || config.caseId === 'CASE-UNKNOWN') {
        errors.push('Case ID not set. Set FORENSIC_CASE_ID environment variable.');
    }
    if (!config.investigator || config.investigator === 'Unknown') {
        errors.push('Investigator not set. Set FORENSIC_INVESTIGATOR environment variable.');
    }
    if (config.aiEnabled && !config.aiApiKey) {
        errors.push('AI is enabled but no API key provided. Set FORENSIC_AI_API_KEY.');
    }
    return errors;
}
//# sourceMappingURL=forensic_config.js.map