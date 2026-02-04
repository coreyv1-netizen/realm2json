# Standard Operating Procedures (SOP)

## Purpose

This document defines standard operating procedures for using the Universal Forensic Toolkit to ensure consistency, reliability, and admissibility of forensic analysis.

## General Principles

1. **Chain of Custody**: Maintain complete documentation of evidence handling
2. **Reproducibility**: All analyses must be reproducible
3. **Integrity**: Verify integrity at every step
4. **Documentation**: Document all actions, decisions, and findings
5. **Objectivity**: Maintain impartiality in analysis

## SOP-001: Case Initialization

### Objective
Properly initialize a new forensic case with all required documentation.

### Prerequisites
- Authorization to conduct investigation
- Case number assigned
- Investigator credentials verified

### Procedure

1. **Create Case Directory**
   ```bash
   mkdir -p /forensic-cases/CASE-YYYY-NNN
   cd /forensic-cases/CASE-YYYY-NNN
   ```

2. **Configure Environment**
   ```bash
   cp /path/to/toolkit/.env.example .env
   nano .env
   ```
   
   Set required variables:
   - `FORENSIC_CASE_ID`
   - `FORENSIC_CASE_NAME`
   - `FORENSIC_INVESTIGATOR`
   - `FORENSIC_WORKSPACE_ROOT`

3. **Initialize Workspace**
   ```bash
   node /path/to/toolkit/dist/forensic-cli.js init
   ```

4. **Document Case**
   Create `case-notes.md` with:
   - Case background
   - Investigation objectives
   - Evidence sources
   - Legal authorization

5. **Verification**
   - Verify all directories created
   - Confirm audit logging enabled
   - Test write permissions

### Documentation Requirements
- Case initialization timestamp
- Investigator name and credentials
- Legal authorization reference
- Workspace location

---

## SOP-002: Evidence Acquisition

### Objective
Acquire evidence with forensic integrity and complete documentation.

### Prerequisites
- Case initialized (SOP-001)
- Evidence identified and authorized
- Storage space verified

### Procedure

1. **Pre-Acquisition Documentation**
   - Record evidence description
   - Note evidence location
   - Document acquisition date/time
   - Photograph evidence in situ (if applicable)

2. **Acquire Evidence**
   ```bash
   node dist/forensic-cli.js acquire /source/path/evidence.file \
     --output descriptive-name \
     --notes "Detailed acquisition notes"
   ```

3. **Verify Acquisition**
   ```bash
   node dist/forensic-cli.js verify evidence/descriptive-name
   ```

4. **Document Acquisition**
   Record in case notes:
   - Original file path
   - Acquisition timestamp
   - MD5 and SHA256 hashes
   - File size
   - Any anomalies observed

5. **Secure Original**
   - Preserve original evidence
   - Mark as "DO NOT MODIFY"
   - Store in secure location

### Quality Control
- Verify hash matches original
- Confirm metadata file created
- Check audit log entry
- Peer review acquisition notes

### Documentation Requirements
- Acquisition timestamp
- Source and destination paths
- Cryptographic hashes
- Acquisition notes
- Verification results

---

## SOP-003: Data Parsing

### Objective
Extract data from acquired evidence in a reproducible manner.

### Prerequisites
- Evidence acquired (SOP-002)
- Integrity verified
- Parser identified for evidence type

### Procedure

1. **Pre-Parsing Verification**
   ```bash
   node dist/forensic-cli.js verify evidence/file
   ```

2. **Parse Evidence**
   ```bash
   node dist/forensic-cli.js parse <type> evidence/file \
     --output output/parsed-data-YYYYMMDD-HHMMSS.json
   ```
   
   Supported types:
   - `realm` - Realm databases
   - `chrome` - Chrome history
   - `safari` - Safari history
   - `google-takeout` - Google Takeout exports
   - `instagram` - Instagram exports
   - `snapchat` - Snapchat exports

3. **Review Output**
   - Examine parsed data structure
   - Verify data completeness
   - Check for parsing errors

4. **Document Parsing**
   Record:
   - Parser type and version
   - Input file and hash
   - Output file and hash
   - Records extracted
   - Any errors or warnings

### Quality Control
- Compare output with source
- Verify data integrity
- Check for parsing anomalies
- Peer review if critical evidence

### Common Issues

**Locked Database Files**
- Copy to temp location first
- Ensure source application closed

**Incomplete Data**
- Check parser compatibility
- Verify file format version
- Review error logs

---

## SOP-004: Timeline Reconstruction

### Objective
Create chronological timeline from multiple evidence sources.

### Prerequisites
- Data parsed from multiple sources
- Timestamp formats understood
- Timeline scope defined

### Procedure

1. **Collect Parsed Data**
   - Identify all relevant parsed outputs
   - Review timestamp fields
   - Note timezone information

2. **Build Timeline**
   - Use timeline module programmatically
   - Add events from each source
   - Normalize timestamps to UTC

3. **Export Timeline**
   ```bash
   # Generate CSV for analysis tools
   timeline.export('timeline.csv', 'csv')
   
   # Generate JSON for programmatic access
   timeline.export('timeline.json', 'json')
   ```

4. **Review Timeline**
   - Check for gaps
   - Identify patterns
   - Note anomalies
   - Correlate events

### Documentation Requirements
- Sources included
- Date range covered
- Total events
- Correlation findings

---

## SOP-005: Report Generation

### Objective
Generate comprehensive forensic report.

### Prerequisites
- Analysis complete
- Findings documented
- Evidence catalog prepared

### Procedure

1. **Prepare Report Content**
   - Executive summary
   - Findings list with severity
   - Evidence catalog
   - Timeline (if applicable)
   - Conclusions and recommendations

2. **Generate Report**
   ```bash
   node dist/forensic-cli.js report \
     --format html \
     --output reports/final-report-YYYYMMDD.html
   ```

3. **Review Report**
   - Verify accuracy
   - Check completeness
   - Validate references
   - Peer review

4. **Finalize Report**
   - Sign and date
   - Version control
   - Secure storage
   - Distribute per policy

### Quality Control
- Technical review
- Legal review (if required)
- Grammar and formatting check
- References verification

---

## SOP-006: Audit Trail Review

### Objective
Review and validate audit trail for case completeness.

### Prerequisites
- Investigation complete
- All operations logged

### Procedure

1. **Collect Audit Logs**
   ```bash
   cat logs/audit-*.jsonl > complete-audit-trail.jsonl
   ```

2. **Review for Completeness**
   - All acquisitions logged
   - All parsing operations logged
   - All verification checks logged
   - No gaps in timeline

3. **Validate Operations**
   - Check success/failure status
   - Verify hashes match
   - Confirm timestamps logical

4. **Document Review**
   - Summary of operations
   - Any anomalies found
   - Corrective actions taken

---

## SOP-007: AI-Assisted Analysis (Optional)

### Objective
Use AI assistance while maintaining forensic standards.

### Prerequisites
- AI enabled in configuration
- API keys configured
- Legal authorization for AI use

### Procedure

1. **Configure AI**
   ```bash
   FORENSIC_AI_ENABLED=true
   FORENSIC_AI_PROVIDER=openai
   FORENSIC_AI_API_KEY=your-key
   ```

2. **Use AI Assistance**
   - Never rely solely on AI output
   - Always verify AI findings
   - Document AI model used

3. **Document AI Usage**
   Record:
   - AI provider and model
   - Input data summary
   - AI output summary
   - Human verification results
   - Final conclusions

4. **Quality Control**
   - Human expert review required
   - Validate AI reasoning
   - Check for bias
   - Document limitations

### Ethical Considerations
- Sensitive data handling
- Privacy protection
- Bias awareness
- Transparency in reporting

---

## Case Closure Checklist

Before closing a case, verify:

- [ ] All evidence acquired and documented
- [ ] Integrity verified for all evidence
- [ ] All parsing complete
- [ ] Timeline reconstructed (if applicable)
- [ ] Report generated and reviewed
- [ ] Audit trail complete and reviewed
- [ ] All files backed up securely
- [ ] Chain of custody complete
- [ ] Legal requirements met
- [ ] Case notes finalized

---

## Revision History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | 2026-02-04 | Initial SOP | System |

---

## References

- NIST Computer Forensics Tool Testing
- ISO/IEC 27037:2012 Guidelines
- Digital Forensics Best Practices
- Local jurisdiction requirements

---

**Note**: These SOPs should be adapted to your organization's policies and local legal requirements.
