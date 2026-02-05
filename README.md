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

Convert multiple Realm files in a directory:

```bash
realm2json batch <input-dir> <output-dir>
```

### Examples

```bash
# Convert a single Realm file to JSON
realm2json ~/path/to/file.realm ~/path/to/output.json

# Convert with relative paths
realm2json ./data.realm ./export.json

# Batch convert all .realm files in a directory
realm2json batch ./realm_files ./json_output

# Batch convert with absolute paths
realm2json batch ~/Documents/realm_data ~/Documents/json_exports
```

## Features

### Single File Mode
- Converts a single Realm database file to JSON format
- Case-insensitive `.realm` extension validation
- Automatic output directory creation

### Batch Mode
- Processes all `.realm` files in a directory
- Case-insensitive file extension matching
- Individual error handling for each file
- Detailed summary report with:
  - List of successfully exported files
  - List of failed files with error messages
  - Proper pluralization in status messages
  - Total files processed count

## Requirements

- Node.js 18 or higher
- A valid Realm database file (.realm extension)

## How it works

The tool:
1. Opens the specified Realm database file(s)
2. Extracts all data from non-embedded, non-asymmetric classes
3. Serializes the data using the `flatted` library (same as Realm Studio)
4. Writes the JSON output to the specified file(s)

## Error Handling

The tool will exit with code 1 if:
- The input file doesn't exist
- The input file is not a .realm file
- There's an error opening or reading the Realm file
- There's an error writing the output file
- (Batch mode) Any files fail to convert

## License

Apache 2.0


