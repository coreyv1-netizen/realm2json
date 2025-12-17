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

const program = new Command();

program
  .name('realm2json')
  .description('Convert a Realm database file to JSON format')
  .version('1.0.0')
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

program.parse();


