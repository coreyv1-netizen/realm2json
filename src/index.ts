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

interface BatchError {
  file: string;
  error: string;
}

const batchExportRealmToJSON = (inputDir: string, outputDir: string): void => {
  const inputPath = path.resolve(inputDir);
  const outputPath = path.resolve(outputDir);

  // Validate input directory exists
  if (!fs.existsSync(inputPath)) {
    console.error(`Error: Input directory does not exist: ${inputPath}`);
    process.exit(1);
  }

  // Validate input is a directory
  if (!fs.statSync(inputPath).isDirectory()) {
    console.error(`Error: Input path must be a directory: ${inputPath}`);
    process.exit(1);
  }

  // Create output directory if it doesn't exist
  if (!fs.existsSync(outputPath)) {
    fs.mkdirSync(outputPath, { recursive: true });
  }

  // Find all .realm files (case-insensitive)
  const files = fs.readdirSync(inputPath);
  const realmFiles = files.filter(file => file.toLowerCase().endsWith('.realm'));

  if (realmFiles.length === 0) {
    console.log('No .realm files found in the input directory');
    return;
  }

  console.log(`Found ${realmFiles.length} .realm ${realmFiles.length === 1 ? 'file' : 'files'} to process`);

  const errors: BatchError[] = [];
  let successCount = 0;

  // Process each realm file
  for (const file of realmFiles) {
    const realmFilePath = path.join(inputPath, file);
    const jsonFileName = file.replace(/\.realm$/i, '.json');
    const jsonFilePath = path.join(outputPath, jsonFileName);

    try {
      exportRealmToJSON(realmFilePath, jsonFilePath);
      successCount++;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      errors.push({ file, error: errorMessage });
      console.error(`Failed to process ${file}: ${errorMessage}`);
    }
  }

  // Print summary
  console.log('\n--- Batch Processing Summary ---');
  console.log(`Successfully converted: ${successCount} ${successCount === 1 ? 'file' : 'files'}`);
  if (errors.length > 0) {
    console.log(`Failed: ${errors.length} ${errors.length === 1 ? 'file' : 'files'}`);
    console.log('\nErrors:');
    errors.forEach(({ file, error }) => {
      console.log(`  - ${file}: ${error}`);
    });
    process.exit(1);
  }
};

const program = new Command();

program
  .name('realm2json')
  .description('Convert a Realm database file to JSON format')
  .version('1.0.0');

// Single file conversion command
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
  .description('Convert multiple Realm database files from a directory to JSON format')
  .argument('<input-dir>', 'Path to the input directory containing .realm files')
  .argument('<output-dir>', 'Path to the output directory for JSON files')
  .action((inputDir: string, outputDir: string) => {
    batchExportRealmToJSON(inputDir, outputDir);
  });

program.parse();


