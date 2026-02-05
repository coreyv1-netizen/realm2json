# realm2json

A command-line tool to convert Realm database files to JSON format.

## Installation

```bash
npm install -g realm2json
```

Or install locally in your project:

```bash
npm install realm2json
```

## Usage

### Single File Conversion

```bash
realm2json <input.realm> <output.json>
```

### Batch Conversion

```bash
realm2json batch <input-dir> <output-dir>
```

### Examples

```bash
# Convert a single Realm file to JSON
realm2json ~/path/to/file.realm ~/path/to/output.json

# Convert with relative paths
realm2json ./data.realm ./export.json

# Batch convert all .realm files from a directory
realm2json batch ./realm_files ./json_output

# The batch command will:
# - Scan the input directory for all .realm files (case-insensitive)
# - Convert each file to JSON in the output directory
# - Provide a detailed summary report with any errors
```

## Requirements

- Node.js 18 or higher
- A valid Realm database file (.realm extension)

## How it works

### Single File Conversion

The tool:
1. Opens the specified Realm database file
2. Extracts all data from non-embedded, non-asymmetric classes
3. Serializes the data using the `flatted` library (same as Realm Studio)
4. Writes the JSON output to the specified file

### Batch Conversion

The batch command:
1. Scans the input directory for all `.realm` files (case-insensitive)
2. Converts each file to a corresponding JSON file in the output directory
3. Tracks errors during processing
4. Provides a detailed summary report showing:
   - Number of successfully converted files
   - Number of failed conversions
   - Detailed error messages for each failed file
5. Uses proper pluralization in all status messages

## Error Handling

The tool will exit with code 1 if:
- The input file doesn't exist
- The input file is not a .realm file
- There's an error opening or reading the Realm file
- There's an error writing the output file

## License

Apache 2.0


