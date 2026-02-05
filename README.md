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
# Using default command (backward compatible)
realm2json <input.realm> <output.json>

# Or using explicit convert command
realm2json convert <input.realm> <output.json>
```

### Batch Conversion

Convert multiple Realm files at once:

```bash
realm2json batch <input-directory> <output-directory>
```

### Examples

```bash
# Convert a single Realm file to JSON
realm2json ~/path/to/file.realm ~/path/to/output.json

# Convert with relative paths
realm2json ./data.realm ./export.json

# Batch convert all .realm files in a directory
realm2json batch ./realm-files ./json-output

# Batch convert with absolute paths
realm2json batch ~/data/realms ~/exports/json
```

## Requirements

- Node.js 18 or higher
- A valid Realm database file (.realm extension)

## How it works

The tool:
1. Opens the specified Realm database file(s)
2. Extracts all data from non-embedded, non-asymmetric classes
3. Serializes the data using the `flatted` library (same as Realm Studio)
4. Writes the JSON output to the specified file(s)

### Batch Processing Features

When using batch mode:
- Automatically discovers all `.realm` files in the input directory
- Processes each file sequentially with progress logging
- Creates corresponding `.json` files in the output directory with matching names
- Continues processing even if individual files fail
- Provides a detailed summary report at the end
- Logs success and failure information for each file

## Error Handling

The tool will exit with code 1 if:
- The input file/directory doesn't exist
- The input file is not a .realm file
- The input path for batch mode is not a directory
- There's an error opening or reading the Realm file
- There's an error writing the output file

### Batch Mode Error Handling

In batch mode:
- Each file is processed independently
- Errors in one file don't stop processing of other files
- Failed conversions are logged with error details
- A summary report shows successful and failed conversions
- Exit code 1 is returned if any files failed to convert

## Logging

The tool provides detailed logging:
- Progress indicators for batch operations (e.g., `[2/5] Processing: data.realm`)
- Success messages for each exported file
- Warning messages when no .realm files are found
- Error messages with specific details for failures
- Summary statistics for batch operations

## License

Apache 2.0


