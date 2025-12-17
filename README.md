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

```bash
realm2json <input.realm> <output.json>
```

### Examples

```bash
# Convert a Realm file to JSON
realm2json ~/path/to/file.realm ~/path/to/output.json

# Convert with relative paths
realm2json ./data.realm ./export.json
```

## Requirements

- Node.js 18 or higher
- A valid Realm database file (.realm extension)

## How it works

The tool:
1. Opens the specified Realm database file
2. Extracts all data from non-embedded, non-asymmetric classes
3. Serializes the data using the `flatted` library (same as Realm Studio)
4. Writes the JSON output to the specified file

## Error Handling

The tool will exit with code 1 if:
- The input file doesn't exist
- The input file is not a .realm file
- There's an error opening or reading the Realm file
- There's an error writing the output file

## License

Apache 2.0


