# Copilot Instructions for realm2json

This document provides comprehensive guidance for AI coding agents working on the `realm2json` project. It covers architecture, key files, development workflows, and best practices.

---

## Architecture Overview

### Purpose and Functionality

`realm2json` is a command-line tool designed to convert Realm database files (`.realm`) into JSON format. The tool provides a simple, efficient way to export Realm data for backup, migration, or analysis purposes.

### Workflow

The conversion process follows these steps:

1. **Input Validation**: Verify the input file exists and has the `.realm` extension
2. **Realm Database Opening**: Open the Realm file using the Realm JavaScript SDK
3. **Data Extraction**: Extract all data from non-embedded and non-asymmetric classes/schemas
4. **Serialization**: Use the `flatted` library to serialize data (same approach as Realm Studio)
5. **Output Writing**: Write the serialized JSON to the specified output file
6. **Cleanup**: Ensure Realm connection is properly closed

### Modularity and Structure

The codebase is intentionally simple and focused:

- **Single-file Architecture**: All core logic resides in `src/index.ts`
- **Functional Approach**: Key operations are separated into discrete functions:
  - `serialize()`: Converts result map to JSON string using flatted
  - `exportRealmToJSON()`: Main conversion logic
  - Command-line interface setup using Commander.js

This monolithic approach was chosen for simplicity, as the tool has a single, well-defined purpose.

### Key Dependencies

- **realm** (`^12.9.0`): Realm JavaScript SDK for opening and reading `.realm` files
- **flatted** (`^3.3.1`): Circular reference-safe JSON stringification (consistent with Realm Studio)
- **commander** (`^12.0.0`): Command-line interface framework
- **fs-extra** (`^11.2.0`): Enhanced file system operations

---

## Important Files and Directories

### `/src/index.ts`

**Primary entry point and core logic file.**

Key components:

1. **Type Definitions** (lines 27-29):
   ```typescript
   type ResultMap = {
     [key: string]: Realm.Results<any>;
   };
   ```
   Maps class names to Realm query results.

2. **serialize() function** (lines 31-33):
   - Converts ResultMap to JSON string
   - Uses `flatted.stringify()` for circular reference handling

3. **exportRealmToJSON() function** (lines 35-62):
   - Core conversion logic
   - Opens Realm database at specified path
   - Filters schemas: only includes non-embedded and non-asymmetric classes
   - Creates snapshot of each valid object collection
   - Serializes and writes to output file
   - Ensures Realm is closed in finally block (important for resource management)

4. **Command-line Interface** (lines 64-106):
   - Uses Commander.js for argument parsing
   - Two required positional arguments: `<input>` and `<output>`
   - Input validation:
     - File existence check
     - `.realm` extension verification
   - Output directory creation (if needed)
   - Comprehensive error handling with exit code 1 on failure

### `/package.json`

Defines project metadata, dependencies, and build scripts:

- **bin**: Points to `dist/index.js` for CLI executable
- **scripts**:
  - `build`: Compiles TypeScript to JavaScript
  - `prepublishOnly`: Ensures build runs before publishing
- **engines**: Requires Node.js 18

### `/tsconfig.json`

TypeScript configuration:

- Target: ES2019
- Module: CommonJS
- Strict mode enabled
- Output directory: `./dist`
- Source maps and declarations enabled

### `/README.md`

User-facing documentation covering installation, usage, requirements, and error handling.

---

## Command-line/Script-driven Code Nature

### CLI Design Philosophy

`realm2json` is designed as a straightforward, single-purpose command-line tool:

```bash
realm2json <input.realm> <output.json>
```

### Flexible Usage Patterns

1. **Global Installation**:
   ```bash
   npm install -g realm2json
   realm2json ~/data/app.realm ~/exports/app.json
   ```

2. **Local Project Installation**:
   ```bash
   npm install realm2json
   npx realm2json ./local.realm ./output.json
   ```

3. **Script Integration**:
   ```bash
   # Batch conversion in shell scripts
   for file in *.realm; do
     realm2json "$file" "${file%.realm}.json"
   done
   ```

### Error Handling and Exit Codes

- **Success**: Exit code 0, success message printed to stdout
- **Failure**: Exit code 1, error message printed to stderr
- All errors are caught and reported clearly for scripting reliability

---

## Implementation Details and Best Practices

### When Modifying the Code

1. **Maintain TypeScript Strict Mode**:
   - The project uses strict TypeScript compilation
   - Always maintain type safety and explicit types
   - Avoid using `any` type where possible

2. **Error Handling Pattern**:
   - Always catch errors at the CLI action level
   - Provide clear, actionable error messages
   - Exit with code 1 for any failure
   - Example:
     ```typescript
     try {
       // operation
     } catch (error) {
       if (error instanceof Error) {
         console.error(`Error: ${error.message}`);
       }
       process.exit(1);
     }
     ```

3. **Resource Management**:
   - Always close Realm connections using `finally` blocks
   - Ensure file handles are properly released
   - Example pattern:
     ```typescript
     const realm = new Realm({ path: realmPath });
     try {
       // operations
     } finally {
       realm.close();
     }
     ```

4. **Schema Filtering**:
   - Only process non-embedded classes (embedded objects are not queryable directly)
   - Only process non-asymmetric classes (asymmetric objects are write-only)
   - Use `.snapshot()` to create a stable copy of results

5. **Serialization Consistency**:
   - Use `flatted` library for JSON serialization
   - This ensures compatibility with Realm Studio exports
   - Handles circular references that may exist in Realm objects

### Development Workflow

1. **Building the Project**:
   ```bash
   npm run build
   ```
   - Compiles TypeScript to JavaScript in `dist/` directory
   - Generates source maps and type declarations

2. **Testing Manually**:
   ```bash
   # After building
   node dist/index.js path/to/test.realm output.json
   ```

3. **Code Style**:
   - Follow existing indentation and formatting
   - Use meaningful variable names
   - Add comments only for complex logic (code is intentionally simple)

4. **Adding Dependencies**:
   - Justify any new dependencies
   - Prefer well-maintained, popular libraries
   - Keep dependencies minimal for security and reliability

### Common Modification Scenarios

#### Adding New Command-line Options

```typescript
program
  .option('-v, --verbose', 'Enable verbose output')
  .action((input: string, output: string, options) => {
    // Access options.verbose
  });
```

#### Adding Filtering or Transformation Logic

Modify the `exportRealmToJSON` function:

```typescript
const resultMap: ResultMap = realm.schema.reduce(
  (map: ResultMap, objectSchema) => {
    if (!objectSchema.embedded && !objectSchema.asymmetric) {
      // Add custom filtering here
      const results = realm.objects(objectSchema.name);
      const filtered = results.filtered('someCondition');
      map[objectSchema.name] = filtered.snapshot();
    }
    return map;
  },
  {},
);
```

#### Customizing JSON Output Format

Modify the `serialize` function:

```typescript
const serialize = (map: ResultMap): string => {
  // Custom transformation before stringification
  const transformed = transformData(map);
  return stringify(transformed, null, 2); // Pretty print
};
```

### Security Considerations

1. **Path Traversal**: Input paths are resolved using `path.resolve()` to prevent traversal attacks
2. **File Extension Validation**: Ensures only `.realm` files are processed
3. **Error Message Safety**: Avoid leaking sensitive path information in production

### Performance Notes

- The tool uses `.snapshot()` to create in-memory copies of results
- For very large databases, memory usage can be significant
- Consider streaming approaches if handling multi-GB databases becomes necessary

---

## Refactoring Guidelines

### When to Refactor

Consider refactoring when:

1. Adding support for multiple output formats (CSV, XML, etc.)
2. Implementing filtering/query capabilities
3. Adding batch processing features
4. Supporting Realm Sync-specific features

### Potential Refactoring Paths

1. **Modularization**:
   ```
   src/
     ├── cli.ts         # Command-line interface
     ├── converter.ts   # Core conversion logic
     ├── serializer.ts  # Serialization strategies
     └── validators.ts  # Input validation
   ```

2. **Strategy Pattern for Serialization**:
   - Abstract serialization to support multiple formats
   - Implement ISerializer interface

3. **Configuration File Support**:
   - Allow `.realm2jsonrc` for default options
   - Support schema-specific transformations

### Maintaining Backward Compatibility

- The CLI interface (`realm2json <input> <output>`) must remain unchanged
- New features should be opt-in via flags or configuration
- Existing JSON output format must be preserved by default

---

## Testing Approach

Currently, the project has no automated tests. When adding tests:

1. **Use a Testing Framework**: Consider Jest or Mocha
2. **Create Fixture Realm Files**: Generate small `.realm` files for testing
3. **Test Coverage Areas**:
   - Input validation (missing file, wrong extension)
   - Successful conversion with various schema types
   - Error handling for corrupted Realm files
   - Output file creation and content verification

Example test structure:

```typescript
describe('realm2json', () => {
  it('should convert a simple Realm file to JSON', () => {
    // Test logic
  });

  it('should fail gracefully when input file is missing', () => {
    // Test logic
  });

  it('should filter out embedded and asymmetric classes', () => {
    // Test logic
  });
});
```

---

## Contributing

When contributing to this project:

1. Maintain the simple, focused nature of the tool
2. Follow existing TypeScript patterns and conventions
3. Update README.md if adding user-facing features
4. Ensure `npm run build` completes successfully
5. Test manually with real Realm files before submitting changes
6. Keep the Apache 2.0 license header in source files

---

## Additional Resources

- [Realm JavaScript SDK Documentation](https://www.mongodb.com/docs/realm/sdk/node/)
- [Commander.js Documentation](https://github.com/tj/commander.js)
- [flatted Documentation](https://github.com/WebReflection/flatted)
- [Realm Studio](https://github.com/realm/realm-studio) - Reference implementation for JSON export
