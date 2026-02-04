"use strict";
////////////////////////////////////////////////////////////////////////////
//
// Timeline Reconstruction Module
//
// Reconstructs chronological timelines from multiple data sources
// to provide a comprehensive view of events and activities.
//
////////////////////////////////////////////////////////////////////////////
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TimelineModule = void 0;
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
class TimelineModule {
    constructor(config, auditTrail) {
        this.events = [];
        this.config = config;
        this.auditTrail = auditTrail;
    }
    /**
     * Add events from a parsed data source
     */
    addEvents(events) {
        this.events.push(...events);
    }
    /**
     * Add a single event
     */
    addEvent(event) {
        this.events.push(event);
    }
    /**
     * Extract events from browser history
     */
    extractFromBrowserHistory(history, source) {
        return history
            .filter(entry => entry.last_visit_time || entry.visit_time)
            .map(entry => ({
            timestamp: entry.last_visit_time || entry.visit_time,
            source,
            type: 'browser_visit',
            description: `Visited: ${entry.title || entry.url}`,
            details: entry,
            confidence: 'high',
        }));
    }
    /**
     * Extract events from location history
     */
    extractFromLocationHistory(locations) {
        return locations
            .filter(loc => loc.timestamp)
            .map(loc => ({
            timestamp: loc.timestamp,
            source: 'Google Location History',
            type: 'location',
            description: `Location: ${loc.latitudeE7 / 1e7}, ${loc.longitudeE7 / 1e7}`,
            details: loc,
            confidence: 'high',
        }));
    }
    /**
     * Extract events from social media activity
     */
    extractFromSocialMedia(posts, platform) {
        return posts
            .filter(post => post.creation_timestamp || post.taken_at)
            .map(post => ({
            timestamp: new Date((post.creation_timestamp || post.taken_at) * 1000).toISOString(),
            source: platform,
            type: 'social_media_post',
            description: post.title || post.caption || 'Social media activity',
            details: post,
            confidence: 'high',
        }));
    }
    /**
     * Reconstruct and sort timeline
     */
    async reconstruct() {
        // Sort events chronologically
        const sortedEvents = [...this.events].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
        // Get unique sources
        const sources = [...new Set(this.events.map(e => e.source))];
        // Calculate date range
        const timestamps = sortedEvents.map(e => new Date(e.timestamp).getTime());
        const startDate = new Date(Math.min(...timestamps)).toISOString();
        const endDate = new Date(Math.max(...timestamps)).toISOString();
        const timeline = {
            events: sortedEvents,
            metadata: {
                startDate,
                endDate,
                eventCount: sortedEvents.length,
                sources,
                generatedAt: new Date().toISOString(),
            },
        };
        // Log to audit trail
        await this.auditTrail.log({
            module: 'timeline',
            operation: 'reconstruct',
            details: {
                eventCount: timeline.metadata.eventCount,
                sources: timeline.metadata.sources,
                dateRange: `${startDate} to ${endDate}`,
            },
            success: true,
        });
        if (this.config.verboseLogging) {
            console.log(`Timeline reconstructed:`);
            console.log(`  Events: ${timeline.metadata.eventCount}`);
            console.log(`  Date range: ${startDate} to ${endDate}`);
            console.log(`  Sources: ${sources.length}`);
        }
        return timeline;
    }
    /**
     * Export timeline to file
     */
    async export(outputPath, format = 'json') {
        const timeline = await this.reconstruct();
        await fs_extra_1.default.ensureDir(path_1.default.dirname(outputPath));
        if (format === 'json') {
            await fs_extra_1.default.writeJson(outputPath, timeline, { spaces: 2 });
        }
        else if (format === 'csv') {
            const csv = this.timelineToCSV(timeline);
            await fs_extra_1.default.writeFile(outputPath, csv, 'utf-8');
        }
        if (this.config.verboseLogging) {
            console.log(`Timeline exported to: ${outputPath}`);
        }
    }
    /**
     * Convert timeline to CSV format
     */
    timelineToCSV(timeline) {
        const headers = ['Timestamp', 'Source', 'Type', 'Description', 'Confidence'];
        const rows = timeline.events.map(event => [
            event.timestamp,
            event.source,
            event.type,
            event.description.replace(/"/g, '""'),
            event.confidence,
        ]);
        const csvLines = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
        ];
        return csvLines.join('\n');
    }
    /**
     * Filter timeline by date range
     */
    filterByDateRange(startDate, endDate) {
        return this.events.filter(event => {
            const eventTime = new Date(event.timestamp).getTime();
            return eventTime >= startDate.getTime() && eventTime <= endDate.getTime();
        });
    }
    /**
     * Filter timeline by source
     */
    filterBySource(source) {
        return this.events.filter(event => event.source === source);
    }
    /**
     * Get timeline statistics
     */
    getStatistics() {
        const eventsBySource = this.events.reduce((acc, event) => {
            acc[event.source] = (acc[event.source] || 0) + 1;
            return acc;
        }, {});
        const eventsByType = this.events.reduce((acc, event) => {
            acc[event.type] = (acc[event.type] || 0) + 1;
            return acc;
        }, {});
        return {
            totalEvents: this.events.length,
            eventsBySource,
            eventsByType,
        };
    }
    /**
     * Clear all events
     */
    clear() {
        this.events = [];
    }
}
exports.TimelineModule = TimelineModule;
//# sourceMappingURL=timeline.js.map