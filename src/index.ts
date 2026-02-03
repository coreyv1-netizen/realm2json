#!/usr/bin/env node

////////////////////////////////////////////////////////////////////////////
//
// Copyright 2024 Realm Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
////////////////////////////////////////////////////////////////////////////

import { Command } from 'commander';
import fs from 'fs-extra';
import path from 'path';
import Realm from 'realm';
import { stringify } from 'flatted';

type ResultMap = {
  [key: string]: Realm.Results<any>;
};

const serialize = (map: ResultMap): string => {
  return stringify(map);
};

const exportRealmToJSON = (realmPath: string, outputPath: string): void => {
  // Open the Realm file
  const realm = new Realm({
    path: realmPath,
  });

  try {
    // Create result map from all non-embedded, non-asymmetric classes
    const resultMap: ResultMap = realm.schema.reduce(
      (map: ResultMap, objectSchema) => {
        if (!objectSchema.embedded && !objectSchema.asymmetric) {
          map[objectSchema.name] = realm.objects(objectSchema.name).snapshot();
        }
        return map;
      },
      {},
    );

    // Serialize and write to file
    const jsonContent = serialize(resultMap);
    fs.writeFileSync(outputPath, jsonContent);

    console.log(`Successfully exported Realm to ${outputPath}`);
  } finally {
    // Always close the Realm
    realm.close();
  }
};

interface BatchResult {
  successful: string[];
  failed: { file: string; error: string }[];
}

const exportBatchRealmsToJSON = (inputDir: string, outputDir: string): BatchResult => {
  const result: BatchResult = {
    successful: [],
    failed: [],
  };

  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Read all files in input directory
  const files = fs.readdirSync(inputDir);
  const realmFiles = files.filter((file) => file.toLowerCase().endsWith('.realm'));

  if (realmFiles.length === 0) {
    console.warn(`Warning: No .realm files found in directory: ${inputDir}`);
    return result;
  }

  console.log(`Found ${realmFiles.length} realm file(s) to process`);

  // Process each realm file
  realmFiles.forEach((file, index) => {
    const inputPath = path.join(inputDir, file);
    const outputFileName = `${path.basename(file, '.realm')}.json`;
    const outputPath = path.join(outputDir, outputFileName);

    console.log(`\n[${index + 1}/${realmFiles.length}] Processing: ${file}`);

    try {
      exportRealmToJSON(inputPath, outputPath);
      result.successful.push(file);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`  Error processing ${file}: ${errorMessage}`);
      result.failed.push({ file, error: errorMessage });
    }
  });

  return result;
};

const program = new Command();

program
  .name('realm2json')
  .description('Convert Realm database file(s) to JSON format')
  .version('1.0.0');

// Single file conversion command
program
  .command('convert')
  .description('Convert a single Realm database file to JSON format')
  .argument('<input>', 'Path to the input .realm file')
  .argument('<output>', 'Path to the output .json file')
  .action((input: string, output: string) => {
    try {
      // Validate input file exists
      const inputPath = path.resolve(input);
      if (!fs.existsSync(inputPath)) {
        console.error(`Error: Input file does not exist: ${inputPath}`);
        process.exit(1);
      }

      // Validate input is a .realm file
      if (!inputPath.toLowerCase().endsWith('.realm')) {
        console.error(`Error: Input file must be a .realm file: ${inputPath}`);
        process.exit(1);
      }

      // Create output directory if it doesn't exist
      const outputPath = path.resolve(output);
      const outputDir = path.dirname(outputPath);
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      // Perform the export
      exportRealmToJSON(inputPath, outputPath);
    } catch (error) {
      if (error instanceof Error) {
        console.error(`Error: ${error.message}`);
      } else {
        console.error(`Error: ${String(error)}`);
      }
      process.exit(1);
    }
  });

// Batch conversion command
program
  .command('batch')
  .description('Convert multiple Realm database files to JSON format')
  .argument('<input-dir>', 'Path to directory containing .realm files')
  .argument('<output-dir>', 'Path to output directory for .json files')
  .action((inputDir: string, outputDir: string) => {
    try {
      // Validate input directory exists
      const inputPath = path.resolve(inputDir);
      if (!fs.existsSync(inputPath)) {
        console.error(`Error: Input directory does not exist: ${inputPath}`);
        process.exit(1);
      }

      // Validate input is a directory
      if (!fs.statSync(inputPath).isDirectory()) {
        console.error(`Error: Input path must be a directory: ${inputPath}`);
        process.exit(1);
      }

      const outputPath = path.resolve(outputDir);

      // Perform batch export
      console.log(`Starting batch export from ${inputPath} to ${outputPath}`);
      const result = exportBatchRealmsToJSON(inputPath, outputPath);

      // Print summary
      console.log('\n' + '='.repeat(50));
      console.log('Batch Export Summary:');
      console.log('='.repeat(50));
      console.log(`Total files processed: ${result.successful.length + result.failed.length}`);
      console.log(`Successful: ${result.successful.length}`);
      console.log(`Failed: ${result.failed.length}`);

      if (result.failed.length > 0) {
        console.log('\nFailed files:');
        result.failed.forEach(({ file, error }) => {
          console.log(`  - ${file}: ${error}`);
        });
        process.exit(1);
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error(`Error: ${error.message}`);
      } else {
        console.error(`Error: ${String(error)}`);
      }
      process.exit(1);
    }
  });

// Default action for backward compatibility (when no subcommand is used)
program
  .argument('[input]', 'Path to the input .realm file')
  .argument('[output]', 'Path to the output .json file')
  .action((input?: string, output?: string) => {
    // If input and output are provided, assume single file conversion
    if (input && output) {
      try {
        // Validate input file exists
        const inputPath = path.resolve(input);
        if (!fs.existsSync(inputPath)) {
          console.error(`Error: Input file does not exist: ${inputPath}`);
          process.exit(1);
        }

        // Validate input is a .realm file
        if (!inputPath.toLowerCase().endsWith('.realm')) {
          console.error(`Error: Input file must be a .realm file: ${inputPath}`);
          process.exit(1);
        }

        // Create output directory if it doesn't exist
        const outputPath = path.resolve(output);
        const outputDir = path.dirname(outputPath);
        if (!fs.existsSync(outputDir)) {
          fs.mkdirSync(outputDir, { recursive: true });
        }

        // Perform the export
        exportRealmToJSON(inputPath, outputPath);
      } catch (error) {
        if (error instanceof Error) {
          console.error(`Error: ${error.message}`);
        } else {
          console.error(`Error: ${String(error)}`);
        }
        process.exit(1);
      }
    }
  });

program.parse();


