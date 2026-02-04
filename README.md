# Universal Forensic Toolkit

A comprehensive, workspace-agnostic forensic analysis toolkit designed for forensic students and professionals. This toolkit provides modular, AI-assisted, multi-domain forensic capabilities with forensic-grade standards.

## 🎯 Overview

The Universal Forensic Toolkit transforms the original `realm2json` tool into a complete forensic analysis platform that:

- **Is Portable**: No hard-coded paths; environment variables drive all locations
- **Has Modular Design**: Separate modules for acquisition, parsing, timeline reconstruction, and reporting
- **Meets Forensic-Grade Standards**: Full audit trails, reproducible runs, and documented assumptions
- **Provides AI-Assisted Analysis**: Optional AI-powered summarization, correlation, and prioritization
- **Supports Multiple Domains**: File systems, mobile, cloud, logs, and social media artifacts

## 🚀 Quick Start

### Installation

```bash
# Clone and install
git clone https://github.com/coreyv1-netizen/realm2json.git
cd realm2json
npm install
npm run build
```

### Initialize a Case

```bash
# Create environment configuration
cp .env.example .env
# Edit .env with your case details

# Initialize workspace
node dist/src/forensic-cli.js init
```

### Basic Usage

```bash
# Acquire evidence with forensic integrity
node dist/src/forensic-cli.js acquire /path/to/evidence.realm \
  --notes "Evidence acquired from suspect device"

# Parse data
node dist/src/forensic-cli.js parse realm evidence/evidence.realm

# Verify integrity
node dist/src/forensic-cli.js verify evidence/evidence.realm

# Generate report
node dist/src/forensic-cli.js report --format html --output reports/case-report.html
```

## 📦 Modules

### Acquisition Module
Forensic-grade evidence acquisition with:
- **Integrity Verification**: MD5 and SHA256 hash computation
- **Metadata Preservation**: Timestamps, file size, source location
- **Chain of Custody**: Complete documentation of evidence handling
- **Audit Trail**: All operations logged with timestamps and hashes

### Parsing Modules
Support for multiple data types:
- **Realm Databases**: Mobile app data (original realm2json functionality preserved)
- **Browser History**: Chrome, Safari, Edge, Brave
- **Google Takeout**: Location, search, YouTube, Gmail
- **Social Media**: Instagram, Snapchat exports
- **Future Support**: Firefox, WhatsApp, Signal, TikTok

### Timeline Reconstruction
Chronological event reconstruction from:
- Browser history
- Location data
- Social media activity
- File system timestamps
- Custom data sources

### AI-Assisted Analysis (Optional)
Optional AI-powered capabilities:
- **Artifact Summarization**: AI-generated summaries of complex data
- **Cross-Source Correlation**: Identify relationships between events
- **Evidence Prioritization**: Suggest investigative priorities
- **Pattern Detection**: Identify anomalies and patterns

**Note**: AI features require API keys. All AI operations are logged in the audit trail.

### Reporting Module
Generate comprehensive forensic reports:
- **Executive Summaries**: High-level findings
- **Detailed Findings**: Technical analysis with severity levels
- **Timeline Visualization**: Chronological event sequences
- **Evidence Catalog**: Complete inventory of evidence
- **Export Formats**: HTML, JSON, CSV

## 🔧 Configuration

All configuration uses environment variables for portability. Create a `.env` file:

```bash
# Case Information (REQUIRED)
FORENSIC_CASE_ID=CASE-2026-001
FORENSIC_CASE_NAME="Investigation Case"
FORENSIC_INVESTIGATOR="Your Name"

# Workspace Paths
FORENSIC_WORKSPACE_ROOT=/path/to/case/workspace
FORENSIC_EVIDENCE_PATH=${FORENSIC_WORKSPACE_ROOT}/evidence
FORENSIC_OUTPUT_PATH=${FORENSIC_WORKSPACE_ROOT}/output
FORENSIC_LOGS_PATH=${FORENSIC_WORKSPACE_ROOT}/logs
FORENSIC_REPORTS_PATH=${FORENSIC_WORKSPACE_ROOT}/reports

# Forensic Standards
FORENSIC_AUDIT_TRAIL=true
FORENSIC_HASH_VERIFICATION=true
FORENSIC_HASH_ALGORITHM=sha256

# AI Configuration (Optional)
FORENSIC_AI_ENABLED=false
FORENSIC_AI_PROVIDER=openai
FORENSIC_AI_API_KEY=your-api-key
FORENSIC_AI_MODEL=gpt-4
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Build the project
npm run build
```

## 📚 Documentation

- [Quick Start Guide](docs/QUICK_START.md) - Detailed getting started guide
- [Standard Operating Procedures](docs/SOP.md) - Best practices and procedures
- [Original realm2json Documentation](README.old.md) - Legacy tool documentation

## ⚖️ Legal & Ethical Considerations

### Chain of Custody
- All evidence acquisitions logged with timestamps and hashes
- Metadata preserved for all files
- Complete audit trail for all operations
- Integrity verification available at any time

### AI Ethics
- AI used for assistance only, not decision-making
- All AI operations logged and auditable
- Human review required for all AI-generated insights
- Sensitive data handling follows privacy regulations
- AI outputs clearly marked as assistive tools

### Admissibility
- Tool designed to meet forensic standards
- Reproducible analysis processes
- Complete documentation of methods
- **Note**: Admissibility varies by jurisdiction. Consult legal experts.

## 🎓 Educational Use

This toolkit is designed for forensic students and professionals to:
- Learn forensic analysis techniques
- Practice evidence handling procedures
- Understand digital artifacts
- Develop investigation skills
- Deploy world-class forensic capabilities

**⚠️ Warning**: Always follow proper legal procedures when handling real evidence. This tool assists in forensic analysis but does not replace proper training, legal authorization, or professional judgment.

## 🔄 Roadmap

Future enhancements planned:
- [ ] Additional parsers (Firefox, WhatsApp, Signal, TikTok)
- [ ] Advanced timeline visualization with graphs
- [ ] Machine learning for pattern detection
- [ ] Cloud evidence acquisition (AWS, Azure, GCP)
- [ ] Mobile device parsers (iOS, Android)
- [ ] Encrypted data handling
- [ ] Financial transaction analysis
- [ ] Network forensics integration

## 🤝 Contributing

Contributions are welcome! This toolkit is designed for forensic education and research.

1. Fork the repository
2. Create a feature branch
3. Add tests for new features
4. Submit a pull request

## 📄 License

Apache 2.0 - See LICENSE file for details

## 🆘 Support

- **Issues**: [GitHub Issues](https://github.com/coreyv1-netizen/realm2json/issues)
- **Documentation**: See `docs/` directory
- **Questions**: Open a discussion on GitHub

## 🙏 Acknowledgments

Built on top of excellent open-source projects:
- **Realm Database** (realm-js) - Database engine
- **Commander.js** - CLI framework
- **TypeScript** - Type safety
- **Jest** - Testing framework

## Original realm2json Tool

The original realm2json functionality is fully preserved and available:

```bash
# Original usage still works
realm2json <input.realm> <output.json>

# Or use the new forensic CLI
node dist/src/forensic-cli.js parse realm <input.realm>
```

See [README.old.md](README.old.md) for original documentation.

---

**This toolkit enables forensic students and professionals to deploy world-class forensic capabilities, accelerate investigations, and push the boundaries of forensic science with AI-assisted analysis—all while maintaining forensic-grade standards and legal compliance.**
