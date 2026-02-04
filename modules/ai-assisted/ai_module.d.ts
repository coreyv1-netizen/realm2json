import { ForensicConfig } from '../../config/forensic_config';
import { AuditTrail } from '../audit_trail';
export interface AISummary {
    artifact: string;
    summary: string;
    keyFindings: string[];
    timestamp: string;
    model: string;
    confidence: number;
    limitations: string[];
}
export interface AICorrelation {
    events: string[];
    relationship: string;
    confidence: number;
    reasoning: string;
}
export interface AIPriority {
    artifact: string;
    priority: 'critical' | 'high' | 'medium' | 'low';
    reasoning: string;
    suggestedActions: string[];
}
export declare class AIModule {
    private config;
    private auditTrail;
    constructor(config: ForensicConfig, auditTrail: AuditTrail);
    /**
     * Check if AI is enabled and configured
     */
    private validateAIConfig;
    /**
     * Summarize an artifact using AI
     * NOTE: This is a placeholder. In production, integrate with OpenAI/Anthropic API
     */
    summarize(artifactData: any, artifactType: string): Promise<AISummary>;
    /**
     * Correlate events across multiple data sources using AI
     */
    correlate(events: any[]): Promise<AICorrelation[]>;
    /**
     * Prioritize artifacts for investigation using AI
     */
    prioritize(artifacts: any[]): Promise<AIPriority[]>;
    /**
     * Generate ethical and legal compliance report
     */
    generateComplianceReport(): Promise<any>;
    /**
     * Export AI analysis results
     */
    exportResults(outputPath: string, results: any): Promise<void>;
}
