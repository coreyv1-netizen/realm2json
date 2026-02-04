# Quick Start Guide

## Prerequisites

- Node.js 18 or higher
- npm or yarn

## Installation

```bash
# Clone the repository
git clone https://github.com/coreyv1-netizen/realm2json.git
cd realm2json

# Install dependencies
npm install

# Build the toolkit
npm run build
```

## Setting Up Your First Case

### 1. Configure Environment

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env with your case details
nano .env
```

Required settings:
```bash
FORENSIC_CASE_ID=CASE-2026-001
FORENSIC_CASE_NAME="Your Case Name"
FORENSIC_INVESTIGATOR="Your Name"
FORENSIC_WORKSPACE_ROOT=/path/to/your/case/workspace
```

### 2. Initialize Workspace

```bash
node dist/forensic-cli.js init
```

This creates the following directory structure:
```
workspace/
├── evidence/      # Acquired evidence with metadata
├── output/        # Parsed data outputs
├── temp/          # Temporary processing files
├── logs/          # Audit trail logs
└── reports/       # Generated reports
```

## Basic Workflow

### Step 1: Acquire Evidence

```bash
# Acquire a file
node dist/forensic-cli.js acquire /path/to/source/file.realm \
  --notes "Device seized from suspect on 2026-01-15"

# Acquire a directory
node dist/forensic-cli.js acquire /path/to/evidence-folder \
  --output case-001-phone-data
```

**What happens:**
- File copied to evidence directory
- MD5 and SHA256 hashes computed
- Metadata file created (.metadata.json)
- Operation logged in audit trail

### Step 2: Parse Evidence

```bash
# Parse Realm database
node dist/forensic-cli.js parse realm evidence/file.realm

# Parse browser history
node dist/forensic-cli.js parse chrome evidence/History

# Parse social media export
node dist/forensic-cli.js parse instagram evidence/instagram-export/
```

**What happens:**
- Data extracted and converted to JSON
- Structured output saved to output directory
- Operation logged in audit trail

### Step 3: Verify Integrity

```bash
# Verify acquired evidence hasn't been tampered with
node dist/forensic-cli.js verify evidence/file.realm
```

### Step 4: Generate Report

```bash
# Generate HTML report
node dist/forensic-cli.js report --format html --output reports/case-report.html

# Generate JSON report
node dist/forensic-cli.js report --format json --output reports/case-report.json
```

## Example Complete Workflow

```bash
# 1. Set up case
export FORENSIC_CASE_ID="CASE-2026-042"
export FORENSIC_CASE_NAME="Mobile Device Analysis"
export FORENSIC_INVESTIGATOR="Jane Smith"
export FORENSIC_WORKSPACE_ROOT="/cases/case-042"

# 2. Initialize
node dist/forensic-cli.js init

# 3. Acquire evidence
node dist/forensic-cli.js acquire /media/phone/default.realm \
  --output phone-database.realm \
  --notes "iPhone 12, acquired via iTunes backup"

# 4. Parse database
node dist/forensic-cli.js parse realm evidence/phone-database.realm

# 5. Verify integrity before analysis
node dist/forensic-cli.js verify evidence/phone-database.realm

# 6. Generate report
node dist/forensic-cli.js report --format html --output reports/analysis.html
```

## Audit Trail

All operations are logged automatically. Check your audit logs:

```bash
ls -lh logs/
cat logs/audit-*.jsonl | tail -10
```

Each log entry includes:
- Timestamp
- Case ID
- Investigator
- Module and operation
- Input/output hashes
- Success/failure status

## Next Steps

- Read [Standard Operating Procedures](SOP.md)
- Explore [Module Documentation](modules/)
- Review [Case Studies](case-studies/)

## Troubleshooting

### Common Issues

**Issue**: "Case ID not set" warning
- **Solution**: Set `FORENSIC_CASE_ID` in .env file

**Issue**: "Permission denied" errors
- **Solution**: Ensure you have read/write permissions to workspace directory

**Issue**: Build fails
- **Solution**: Ensure Node.js 18+ is installed: `node --version`

**Issue**: Module not found errors
- **Solution**: Run `npm install` to install dependencies

## Getting Help

- Check the [Documentation](../README.md)
- Review [Issue Tracker](https://github.com/coreyv1-netizen/realm2json/issues)
- Read the [SOP](SOP.md) for detailed procedures
