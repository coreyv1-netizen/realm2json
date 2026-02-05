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
  succeeded: string[];
  failed: { file: string; error: string }[];
}

const batchExportRealmToJSON = (inputDir: string, outputDir: string): BatchResult => {
  const result: BatchResult = {
    succeeded: [],
    failed: [],
  };

  // Ensure input directory exists
  if (!fs.existsSync(inputDir)) {
    throw new Error(`Input directory does not exist: ${inputDir}`);
  }

  // Ensure input is a directory
  if (!fs.statSync(inputDir).isDirectory()) {
    throw new Error(`Input path is not a directory: ${inputDir}`);
  }

  // Create output directory if it doesn't exist
  fs.ensureDirSync(outputDir);

  // Find all .realm files (case-insensitive)
  const files = fs.readdirSync(inputDir);
  const realmFiles = files.filter((file) =>
    file.toLowerCase().endsWith('.realm')
  );

  if (realmFiles.length === 0) {
    console.log('No .realm files found in the input directory.');
    return result;
  }

  // Process each realm file
  for (const realmFile of realmFiles) {
    const inputPath = path.join(inputDir, realmFile);
    const baseName = path.basename(realmFile, path.extname(realmFile));
    const outputPath = path.join(outputDir, `${baseName}.json`);

    try {
      exportRealmToJSON(inputPath, outputPath);
      result.succeeded.push(realmFile);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      result.failed.push({ file: realmFile, error: errorMessage });
      console.error(`Failed to export ${realmFile}: ${errorMessage}`);
    }
  }

  return result;
};

const program = new Command();

program
  .name('realm2json')
  .description('Convert a Realm database file to JSON format')
  .version('1.0.0');

// Single file conversion command (default)
program
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
  .description('Convert multiple Realm database files in a directory to JSON format')
  .argument('<input-dir>', 'Path to the input directory containing .realm files')
  .argument('<output-dir>', 'Path to the output directory for .json files')
  .action((inputDir: string, outputDir: string) => {
    try {
      const inputPath = path.resolve(inputDir);
      const outputPath = path.resolve(outputDir);

      console.log(`Processing Realm files from: ${inputPath}`);
      console.log(`Output directory: ${outputPath}`);
      console.log('');

      const result = batchExportRealmToJSON(inputPath, outputPath);

      // Print summary
      console.log('');
      console.log('=== Batch Export Summary ===');
      
      if (result.succeeded.length > 0) {
        const fileWord = result.succeeded.length === 1 ? 'file' : 'files';
        console.log(`✓ Successfully exported ${result.succeeded.length} ${fileWord}:`);
        result.succeeded.forEach((file) => {
          console.log(`  - ${file}`);
        });
      }

      if (result.failed.length > 0) {
        console.log('');
        const fileWord = result.failed.length === 1 ? 'file' : 'files';
        console.log(`✗ Failed to export ${result.failed.length} ${fileWord}:`);
        result.failed.forEach(({ file, error }) => {
          console.log(`  - ${file}: ${error}`);
        });
      }

      const totalFiles = result.succeeded.length + result.failed.length;
      const fileWord = totalFiles === 1 ? 'file' : 'files';
      console.log('');
      console.log(`Total: ${totalFiles} ${fileWord} processed`);

      // Exit with error code if any files failed
      if (result.failed.length > 0) {
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

program.parse();


