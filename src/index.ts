#!/usr/bin/env npx ts-node
import commandLineArgs from 'command-line-args';
import fs from 'fs-extra';
import * as yaml from 'js-yaml';
import { simpleGit } from 'simple-git';
import { z } from 'zod';

import { extractTokens, getFileContents, removeNullValues, scanDir } from './utils';


export const main = async (): Promise<void> => {

  // YAML Schema Validation
  const schema = z.object({
    config: z.string().optional(),
    wikiPath: z.string({ invalid_type_error: 'wikiPath must be a string' }).optional(),
    verbose: z.boolean({ invalid_type_error: 'verbose must be a boolean' }).optional(),
    githubRepo: z.string({ invalid_type_error: 'githubRepo must be a string' }),
    term: z.string({ required_error: 'term is required', invalid_type_error: 'Name must be a string' }).regex(/[a-z0-9_-]+/).min(1, { message: 'term must be at least 1 character' }),
    termType: z.string().regex(/[a-z0-9_-]+/).optional(),
    isa: z.string().optional(), // TODO concept of which this is a specialization.
    glossaryText: z.string({ required_error: 'glossaryText is required', invalid_type_error: 'glossaryText must be a string' }).min(1, { message: 'glossaryText must be at least 1 character' }),
    synonymOf: z.string().optional(), // TODO check the actual type string is a placeholder
    groupTags: z.string().regex(/(?:\[\s*([a-z0-9_-]+)\s*(?:,\s*([a-z0-9_-]+))*\s*\])?/).optional(),
    formPhrases: z.string().optional(), // TODO check the actual type string is a placeholder
    status: z.string().optional(),
    created: z.date().optional(),
    updated: z.date().optional(),
    // updated: z.string().datetime().optional(),
    contributors: z.string().optional(),
    attribution: z.string().optional(),
    originalLicense: z.string().optional(),
  });

  type ISchema = z.infer<typeof schema>;


  // Command Line Arguments
  const claOptions = [
    { name: 'config', alias: 'c',  type: String },
    { name: 'wikiPath', alias: 'w',  type: String },
    { name: 'verbose', alias: 'v',  type: Boolean },
    { name: 'githubRepo', alias: 'r',  type: String },
    { name: 'term', alias: 't',  type: String },
    { name: 'termType', alias: 'e',  type: String },
    { name: 'isa', alias: 'i',  type: String },
    { name: 'glossaryText', alias: 'g',  type: String },
    { name: 'synonymOf', alias: 'y',  type: String },
    { name: 'groupTags', alias: 'x',  type: String },
    { name: 'formPhrases', alias: 'f',  type: String },
    { name: 'status', alias: 's',  type: String },
    { name: 'created', alias: 'd', type: Date },
    { name: 'updated', alias: 'u', type: Date },
    { name: 'contributors', alias: 'n',  type: String },
    { name: 'attribution', alias: 'a',  type: String },
    { name: 'originalLicense', alias: 'l',  type: String },
  ];

  // Parse the command line arguments
  const cla: ISchema = commandLineArgs(claOptions) as ISchema;

  // Read in the config.yaml file
  console.log(`Reading config file: ${cla.config ?? 'config.yaml'}`);
  const fileContents = (fs.existsSync(cla.config ?? 'config.yaml')) ? fs.readFileSync(cla.config ?? 'config.yaml', 'utf8') : '';
  const yml = yaml.load(fileContents) as ISchema;

  // Remove any null values from the yml object
  removeNullValues(yml);

  // merge the YAML config with the command line arguments into a new single settings object. Command line arguments override the config.yaml file.
  const settings = { ...yml, ...cla };

  // Validate the object against the schema
  const result = schema.safeParse(settings);

  // If the settings object is not valid based on the schema, throw an error
  if (!result.success) throw new Error(`Config is invalid ${JSON.stringify(result.error, null, 2)}`);

  // Validate the settings object
  if (!settings.githubRepo) throw new Error('Github Repo is required. Please provide a URL to a repo using with the -r or --githubRepo flag or githubRepo in the config.yaml file.');
  console.log(`Processing Repo wiki: ${settings.githubRepo}`);

  console.log(JSON.stringify(settings, null, 2)); // TODO might need to remove this. If there are any secrets it would leak them.

  // Delete the cloned wiki repo directory if it alredy exists
  if (fs.existsSync(settings.wikiPath ?? './wiki')) {
    console.log(`The folder ${settings.wikiPath ?? './wiki'} already exists. Please delete it, move it or pick another folder name.`);
    process.exit(1);
    // throw new Error(`The folder ${settings.wikiPath ?? './wiki'} already exists. Please delete it, move it or pick another folder name.`); // TODO I did an exit instead of a throw because the throw was heavy handed and not really and error, just a logic gate.
  }

  // Clone the Github wiki repo
  await simpleGit().clone(settings.githubRepo, settings.wikiPath ?? './wiki', undefined, (err) => {
    if (err) {
      console.log(`Error cloaning repo: ${err.name} ${err.message}`);
      process.exit(1);
    }
  });

  // Scan the cloned wiki repo for markdown files
  const files = scanDir(settings.wikiPath ?? './wiki');
  console.log('files', files);
  files.forEach((file) => {
    console.log('-------------------------------------');
    console.log(file);
    const tokens = extractTokens(getFileContents(file));
    console.log(tokens);
  });

  // Delete the cloned wiki repo directory
  await fs.rm(settings.wikiPath ?? './wiki', { recursive: true, force: true });

};

export default main;
