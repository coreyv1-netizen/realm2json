import { ForensicConfig } from '../../config/forensic_config';
import { AuditTrail } from '../audit_trail';
export interface TimelineEvent {
    timestamp: string;
    source: string;
    type: string;
    description: string;
    details?: any;
    confidence: 'high' | 'medium' | 'low';
}
export interface Timeline {
    events: TimelineEvent[];
    metadata: {
        startDate: string;
        endDate: string;
        eventCount: number;
        sources: string[];
        generatedAt: string;
    };
}
export declare class TimelineModule {
    private config;
    private auditTrail;
    private events;
    constructor(config: ForensicConfig, auditTrail: AuditTrail);
    /**
     * Add events from a parsed data source
     */
    addEvents(events: TimelineEvent[]): void;
    /**
     * Add a single event
     */
    addEvent(event: TimelineEvent): void;
    /**
     * Extract events from browser history
     */
    extractFromBrowserHistory(history: any[], source: string): TimelineEvent[];
    /**
     * Extract events from location history
     */
    extractFromLocationHistory(locations: any[]): TimelineEvent[];
    /**
     * Extract events from social media activity
     */
    extractFromSocialMedia(posts: any[], platform: string): TimelineEvent[];
    /**
     * Reconstruct and sort timeline
     */
    reconstruct(): Promise<Timeline>;
    /**
     * Export timeline to file
     */
    export(outputPath: string, format?: 'json' | 'csv'): Promise<void>;
    /**
     * Convert timeline to CSV format
     */
    private timelineToCSV;
    /**
     * Filter timeline by date range
     */
    filterByDateRange(startDate: Date, endDate: Date): TimelineEvent[];
    /**
     * Filter timeline by source
     */
    filterBySource(source: string): TimelineEvent[];
    /**
     * Get timeline statistics
     */
    getStatistics(): any;
    /**
     * Clear all events
     */
    clear(): void;
}
