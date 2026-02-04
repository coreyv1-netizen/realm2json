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
export declare class ReportingModule {
    private config;
    private auditTrail;
    private findings;
    private evidence;
    constructor(config: ForensicConfig, auditTrail: AuditTrail);
    /**
     * Add a finding to the report
     */
    addFinding(finding: Finding): void;
    /**
     * Add evidence to the report
     */
    addEvidence(evidence: EvidenceItem): void;
    /**
     * Generate a comprehensive forensic report
     */
    generateReport(executiveSummary: string, timeline?: Timeline, aiAnalysis?: any): Promise<ForensicReport>;
    /**
     * Export report to JSON
     */
    exportJSON(report: ForensicReport, outputPath: string): Promise<void>;
    /**
     * Export report to HTML
     */
    exportHTML(report: ForensicReport, outputPath: string): Promise<void>;
    /**
     * Generate HTML report
     */
    private generateHTML;
    /**
     * Generate conclusions based on findings
     */
    private generateConclusions;
    /**
     * Generate recommendations based on findings
     */
    private generateRecommendations;
}
