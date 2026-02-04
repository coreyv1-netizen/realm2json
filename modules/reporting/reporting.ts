////////////////////////////////////////////////////////////////////////////
//
// Reporting Module
//
// Generates comprehensive forensic reports from analyzed data.
// Reports include executive summaries, technical details, timelines,
// and supporting evidence.
//
////////////////////////////////////////////////////////////////////////////

import fs from 'fs-extra';
import path from 'path';
import { ForensicConfig } from '../../config/forensic_config';
import { AuditTrail } from '../audit_trail';
import { Timeline } from '../timeline/timeline';

export interface ForensicReport {
  metadata: {
    caseId: string;
    caseName: string;
    investigator: string;
    reportDate: string;
    reportVersion: string;
  };
  executiveSummary: string;
  findings: Finding[];
  timeline?: Timeline;
  evidence: EvidenceItem[];
  aiAnalysis?: any;
  conclusions: string[];
  recommendations: string[];
}

export interface Finding {
  id: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'informational';
  title: string;
  description: string;
  evidence: string[];
  timestamp?: string;
}

export interface EvidenceItem {
  id: string;
  type: string;
  source: string;
  description: string;
  hash: string;
  acquisitionDate: string;
  filePath: string;
}

export class ReportingModule {
  private config: ForensicConfig;
  private auditTrail: AuditTrail;
  private findings: Finding[] = [];
  private evidence: EvidenceItem[] = [];

  constructor(config: ForensicConfig, auditTrail: AuditTrail) {
    this.config = config;
    this.auditTrail = auditTrail;
  }

  /**
   * Add a finding to the report
   */
  addFinding(finding: Finding): void {
    this.findings.push(finding);
  }

  /**
   * Add evidence to the report
   */
  addEvidence(evidence: EvidenceItem): void {
    this.evidence.push(evidence);
  }

  /**
   * Generate a comprehensive forensic report
   */
  async generateReport(
    executiveSummary: string,
    timeline?: Timeline,
    aiAnalysis?: any
  ): Promise<ForensicReport> {
    const report: ForensicReport = {
      metadata: {
        caseId: this.config.caseId,
        caseName: this.config.caseName,
        investigator: this.config.investigator,
        reportDate: new Date().toISOString(),
        reportVersion: '1.0',
      },
      executiveSummary,
      findings: this.findings,
      timeline,
      evidence: this.evidence,
      aiAnalysis,
      conclusions: this.generateConclusions(),
      recommendations: this.generateRecommendations(),
    };

    // Log report generation
    await this.auditTrail.log({
      module: 'reporting',
      operation: 'generateReport',
      details: {
        findingsCount: report.findings.length,
        evidenceCount: report.evidence.length,
        hasTimeline: !!timeline,
        hasAIAnalysis: !!aiAnalysis,
      },
      success: true,
    });

    if (this.config.verboseLogging) {
      console.log(`Forensic report generated`);
      console.log(`  Findings: ${report.findings.length}`);
      console.log(`  Evidence: ${report.evidence.length}`);
    }

    return report;
  }

  /**
   * Export report to JSON
   */
  async exportJSON(report: ForensicReport, outputPath: string): Promise<void> {
    await fs.ensureDir(path.dirname(outputPath));
    await fs.writeJson(outputPath, report, { spaces: 2 });

    if (this.config.verboseLogging) {
      console.log(`Report exported to JSON: ${outputPath}`);
    }
  }

  /**
   * Export report to HTML
   */
  async exportHTML(report: ForensicReport, outputPath: string): Promise<void> {
    await fs.ensureDir(path.dirname(outputPath));
    
    const html = this.generateHTML(report);
    await fs.writeFile(outputPath, html, 'utf-8');

    if (this.config.verboseLogging) {
      console.log(`Report exported to HTML: ${outputPath}`);
    }
  }

  /**
   * Generate HTML report
   */
  private generateHTML(report: ForensicReport): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Forensic Report - ${report.metadata.caseId}</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f5f5f5;
    }
    .header {
      background: #2c3e50;
      color: white;
      padding: 20px;
      border-radius: 5px;
      margin-bottom: 20px;
    }
    .section {
      background: white;
      padding: 20px;
      margin-bottom: 20px;
      border-radius: 5px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .finding {
      border-left: 4px solid #3498db;
      padding-left: 15px;
      margin: 15px 0;
    }
    .finding.critical { border-left-color: #e74c3c; }
    .finding.high { border-left-color: #e67e22; }
    .finding.medium { border-left-color: #f39c12; }
    .finding.low { border-left-color: #3498db; }
    .evidence-item {
      background: #ecf0f1;
      padding: 10px;
      margin: 10px 0;
      border-radius: 3px;
    }
    .timestamp {
      color: #7f8c8d;
      font-size: 0.9em;
    }
    h1 { margin: 0; }
    h2 { color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px; }
    h3 { color: #34495e; }
  </style>
</head>
<body>
  <div class="header">
    <h1>Forensic Analysis Report</h1>
    <p><strong>Case ID:</strong> ${report.metadata.caseId}</p>
    <p><strong>Case Name:</strong> ${report.metadata.caseName}</p>
    <p><strong>Investigator:</strong> ${report.metadata.investigator}</p>
    <p><strong>Report Date:</strong> ${report.metadata.reportDate}</p>
  </div>

  <div class="section">
    <h2>Executive Summary</h2>
    <p>${report.executiveSummary}</p>
  </div>

  <div class="section">
    <h2>Findings (${report.findings.length})</h2>
    ${report.findings.map(f => `
      <div class="finding ${f.severity}">
        <h3>${f.title}</h3>
        <p><strong>Severity:</strong> ${f.severity.toUpperCase()}</p>
        <p>${f.description}</p>
        ${f.timestamp ? `<p class="timestamp">Timestamp: ${f.timestamp}</p>` : ''}
      </div>
    `).join('')}
  </div>

  <div class="section">
    <h2>Evidence (${report.evidence.length})</h2>
    ${report.evidence.map(e => `
      <div class="evidence-item">
        <h3>${e.description}</h3>
        <p><strong>Type:</strong> ${e.type}</p>
        <p><strong>Source:</strong> ${e.source}</p>
        <p><strong>Hash:</strong> <code>${e.hash}</code></p>
        <p class="timestamp">Acquired: ${e.acquisitionDate}</p>
      </div>
    `).join('')}
  </div>

  ${report.timeline ? `
    <div class="section">
      <h2>Timeline</h2>
      <p><strong>Events:</strong> ${report.timeline.metadata.eventCount}</p>
      <p><strong>Date Range:</strong> ${report.timeline.metadata.startDate} to ${report.timeline.metadata.endDate}</p>
      <p><strong>Sources:</strong> ${report.timeline.metadata.sources.join(', ')}</p>
    </div>
  ` : ''}

  <div class="section">
    <h2>Conclusions</h2>
    <ul>
      ${report.conclusions.map(c => `<li>${c}</li>`).join('')}
    </ul>
  </div>

  <div class="section">
    <h2>Recommendations</h2>
    <ul>
      ${report.recommendations.map(r => `<li>${r}</li>`).join('')}
    </ul>
  </div>

  <div class="section">
    <p><small>Generated by Universal Forensic Toolkit v1.0</small></p>
  </div>
</body>
</html>`;
  }

  /**
   * Generate conclusions based on findings
   */
  private generateConclusions(): string[] {
    const conclusions: string[] = [];
    
    const criticalCount = this.findings.filter(f => f.severity === 'critical').length;
    const highCount = this.findings.filter(f => f.severity === 'high').length;

    if (criticalCount > 0) {
      conclusions.push(`${criticalCount} critical finding(s) identified requiring immediate attention.`);
    }
    if (highCount > 0) {
      conclusions.push(`${highCount} high-priority finding(s) identified.`);
    }
    
    conclusions.push(`Analysis based on ${this.evidence.length} evidence item(s).`);
    conclusions.push('All findings require independent verification by qualified personnel.');

    return conclusions;
  }

  /**
   * Generate recommendations based on findings
   */
  private generateRecommendations(): string[] {
    const recommendations: string[] = [
      'Maintain chain of custody for all evidence.',
      'Preserve original evidence in secure storage.',
      'Document all analysis procedures thoroughly.',
      'Conduct peer review of findings.',
    ];

    const criticalFindings = this.findings.filter(f => f.severity === 'critical');
    if (criticalFindings.length > 0) {
      recommendations.push('Prioritize investigation of critical findings.');
      recommendations.push('Consider immediate protective actions if necessary.');
    }

    return recommendations;
  }
}
