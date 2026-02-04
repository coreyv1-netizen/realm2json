#!/usr/bin/env node

////////////////////////////////////////////////////////////////////////////
//
// Universal Forensic Toolkit CLI
//
// Main entry point for the forensic toolkit, providing a unified
// interface to all modules with forensic-grade standards.
//
////////////////////////////////////////////////////////////////////////////

import { Command } from 'commander';
import { loadConfig, initializeWorkspace, validateConfig } from '../config/forensic_config';
import { AuditTrail } from '../modules/audit_trail';
import { AcquisitionModule } from '../modules/acquisition/acquisition';
import { RealmParser } from '../modules/parsing/realm_parser';
import { ChromeParser } from '../modules/parsing/chrome_parser';
import { SafariParser } from '../modules/parsing/safari_parser';
import { GoogleTakeoutParser } from '../modules/parsing/google_takeout_parser';
import { SocialMediaParser } from '../modules/parsing/social_media_parser';
import { ReportingModule } from '../modules/reporting/reporting';
import fs from 'fs-extra';
import path from 'path';

const program = new Command();

program
  .name('forensic-toolkit')
  .description('Universal Forensic Toolkit - Modular, AI-Assisted, Multi-Domain')
  .version('1.0.0');

// Initialize command
program
  .command('init')
  .description('Initialize a new forensic workspace')
  .action(async () => {
    try {
      const config = loadConfig();
      const errors = validateConfig(config);
      
      if (errors.length > 0) {
        console.warn('Configuration warnings:');
        errors.forEach(err => console.warn(`  - ${err}`));
        console.warn('\nYou can continue, but some features may not work properly.');
      }

      await initializeWorkspace(config);
      
      console.log('\n✓ Forensic workspace initialized successfully');
      console.log(`  Case ID: ${config.caseId}`);
      console.log(`  Case Name: ${config.caseName}`);
      console.log(`  Investigator: ${config.investigator}`);
      console.log(`  Workspace: ${config.workspaceRoot}`);
      console.log('\nNext steps:');
      console.log('  1. Configure case details in .env file');
      console.log('  2. Use "forensic-toolkit acquire" to acquire evidence');
      console.log('  3. Use "forensic-toolkit parse" to parse data');
    } catch (error) {
      console.error('Error:', error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });

// Acquire command
program
  .command('acquire <source>')
  .description('Acquire evidence with forensic integrity')
  .option('-o, --output <name>', 'Output name for acquired evidence')
  .option('-n, --notes <notes>', 'Notes about this acquisition')
  .action(async (source, options) => {
    try {
      const config = loadConfig();
      await initializeWorkspace(config);
      
      const auditTrail = new AuditTrail(config);
      const acquisition = new AcquisitionModule(config, auditTrail);

      const stats = await fs.stat(source);
      
      if (stats.isFile()) {
        const result = await acquisition.acquireFile(source, options.output, options.notes);
        console.log(`✓ File acquired successfully`);
        console.log(`  Source: ${source}`);
        console.log(`  Destination: ${result.destPath}`);
        console.log(`  SHA256: ${result.metadata.sha256Hash}`);
      } else if (stats.isDirectory()) {
        const result = await acquisition.acquireDirectory(source, options.output, options.notes);
        console.log(`✓ Directory acquired successfully`);
        console.log(`  Source: ${source}`);
        console.log(`  Destination: ${result.destPath}`);
        console.log(`  Files: ${result.files.length}`);
      }
      
      console.log(`\nAudit log: ${auditTrail.getLogFile()}`);
    } catch (error) {
      console.error('Error:', error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });

// Parse command
program
  .command('parse <type> <input>')
  .description('Parse evidence data (types: realm, chrome, safari, google-takeout, instagram, snapchat)')
  .option('-o, --output <path>', 'Output path for parsed data')
  .action(async (type, input, options) => {
    try {
      const config = loadConfig();
      await initializeWorkspace(config);
      
      const auditTrail = new AuditTrail(config);
      const outputPath = options.output || path.join(
        config.outputPath,
        `${type}-${Date.now()}.json`
      );

      let result: any;

      switch (type.toLowerCase()) {
        case 'realm':
          const realmParser = new RealmParser(config, auditTrail);
          result = await realmParser.parse(input, outputPath);
          console.log(`✓ Realm database parsed successfully`);
          console.log(`  Classes: ${result.metadata.classNames.length}`);
          console.log(`  Objects: ${result.metadata.objectCount}`);
          break;

        case 'chrome':
          const chromeParser = new ChromeParser(config, auditTrail);
          result = await chromeParser.parse(input, outputPath);
          console.log(`✓ Chrome history parsed successfully`);
          console.log(`  History entries: ${result.metadata.historyCount}`);
          break;

        case 'safari':
          const safariParser = new SafariParser(config, auditTrail);
          result = await safariParser.parse(input, outputPath);
          console.log(`✓ Safari history parsed successfully`);
          console.log(`  History entries: ${result.metadata.historyCount}`);
          break;

        case 'google-takeout':
          const googleParser = new GoogleTakeoutParser(config, auditTrail);
          result = await googleParser.parse(input, outputPath);
          console.log(`✓ Google Takeout parsed successfully`);
          console.log(`  Components: ${result.metadata.componentsFound.join(', ')}`);
          break;

        case 'instagram':
          const instagramParser = new SocialMediaParser(config, auditTrail);
          result = await instagramParser.parseInstagram(input, outputPath);
          console.log(`✓ Instagram data parsed successfully`);
          console.log(`  Components: ${result.metadata.componentsFound.join(', ')}`);
          break;

        case 'snapchat':
          const snapchatParser = new SocialMediaParser(config, auditTrail);
          result = await snapchatParser.parseSnapchat(input, outputPath);
          console.log(`✓ Snapchat data parsed successfully`);
          console.log(`  Components: ${result.metadata.componentsFound.join(', ')}`);
          break;

        default:
          console.error(`Unsupported parser type: ${type}`);
          console.error('Supported types: realm, chrome, safari, google-takeout, instagram, snapchat');
          process.exit(1);
      }

      console.log(`  Output: ${outputPath}`);
      console.log(`\nAudit log: ${auditTrail.getLogFile()}`);
    } catch (error) {
      console.error('Error:', error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });

// Verify command
program
  .command('verify <file>')
  .description('Verify integrity of acquired evidence')
  .action(async (file) => {
    try {
      const config = loadConfig();
      await initializeWorkspace(config);
      
      const auditTrail = new AuditTrail(config);
      const acquisition = new AcquisitionModule(config, auditTrail);

      const isValid = await acquisition.verifyIntegrity(file);
      
      if (isValid) {
        console.log(`✓ Integrity verified: ${file}`);
      } else {
        console.error(`✗ Integrity check failed: ${file}`);
        process.exit(1);
      }
    } catch (error) {
      console.error('Error:', error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });

// Report command
program
  .command('report')
  .description('Generate forensic report')
  .option('-f, --format <format>', 'Output format (json, html)', 'html')
  .option('-o, --output <path>', 'Output path for report')
  .action(async (options) => {
    try {
      const config = loadConfig();
      await initializeWorkspace(config);
      
      const auditTrail = new AuditTrail(config);
      const reporting = new ReportingModule(config, auditTrail);

      // Example report generation
      reporting.addFinding({
        id: 'example-1',
        severity: 'informational',
        title: 'Example Finding',
        description: 'This is an example finding. Add real findings using the API.',
        evidence: [],
      });

      const report = await reporting.generateReport(
        'This is an example report. Use the forensic toolkit modules to build real reports.'
      );

      const outputPath = options.output || path.join(
        config.reportsPath,
        `report-${Date.now()}.${options.format}`
      );

      if (options.format === 'json') {
        await reporting.exportJSON(report, outputPath);
      } else {
        await reporting.exportHTML(report, outputPath);
      }

      console.log(`✓ Report generated successfully`);
      console.log(`  Format: ${options.format}`);
      console.log(`  Output: ${outputPath}`);
    } catch (error) {
      console.error('Error:', error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });

program.parse();
