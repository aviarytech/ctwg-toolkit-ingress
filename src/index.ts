#!/usr/bin/env npx ts-node
import commandLineArgs from 'command-line-args';
import fs from 'fs-extra';
import * as yaml from 'js-yaml';
import { simpleGit } from 'simple-git';
import { z } from 'zod';
// import { deleteAsync } from 'del';
// import { deleteAsync } from 'del';
// import { Octokit } from "octokit";
// const gitPullOrClone = require('git-pull-or-clone')
// import { download } from 'clone-git-repo';
// import * as download from 'clone-git-repo';

const del = import('del');

import { markdownToJSON, removeNullValues, scanDir } from './utils';
// import { type ICLA } from './types';
// import { getWikiPageRawText, getWikiPages, removeNullValues } from './utils';


// import inquirer from 'inquirer';
// import shell from 'shelljs';
// import _ from 'lodash';
// import ora from 'ora';
// import * as fs from 'fs';

export const main = async (): Promise<void> => {

  // YAML Schema Validation
  const schema = z.object({
    config: z.null().optional(),
    wikiPath: z.string({ invalid_type_error: 'wikiPath must be a string' }).optional(),
    token: z.string({ invalid_type_error: 'Token must be a string' }).regex(/[a-z0-9_]+/, { message: 'token must confirm to the regex [a-z0-9_]' }).min(40, { message: 'token must be exactly 40 characters long' }).max(40, { message: 'token must be exactly 40 characters long' }).optional(),
    verbose: z.boolean({ invalid_type_error: 'verbose must be a boolean' }).optional(),
    githubOwner: z.string({ invalid_type_error: 'githubOwner must be a string' }),
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

  // Interface for the command line arguments
  // interface ICLA {
  //   config: string;
  //   token: string;
  //   verbose: boolean;
  //   term: string;
  //   termType?: string;
  //   isa?: string;
  //   glossaryText: string;
  //   synonymOf: string;
  //   groupTags: string;
  //   formPhrases: string;
  //   status: string;
  //   created: string;
  //   updated: string;
  //   contributors: string;
  //   attribution: string;
  //   originalLicense: string;
  // }

  // Options to pass to the GitHub API to get the wiki pages
  // interface IWikiPage {
  //   name: string;
  //   path: string;
  //   sha: string;
  //   url: string;
  // }

  // Command Line Arguments
  const claOptions = [
    { name: 'config', alias: 'c',  type: String },
    { name: 'wikiPath', alias: 'w',  type: String },
    { name: 'token', alias: 'k',  type: String },
    { name: 'verbose', alias: 'v',  type: Boolean },
    { name: 'githubOwner', alias: 'o',  type: String },
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
    // { name: 'verbose', alias: 'v', type: Boolean },
    // { name: 'stack', alias: 's', type: String, multiple: true, defaultOption: false },
  ];

  // Parse the command line arguments
  const cla: ISchema = commandLineArgs(claOptions) as ISchema;

  // Read in the config.yaml file
  const fileContents = (fs.existsSync(cla.config ?? 'config.yaml')) ? fs.readFileSync(cla.config ?? 'config.yaml', 'utf8') : '';
  const yml = yaml.load(fileContents) as ISchema;
  // const yml = yaml.loadAll(fileContents) as ICLA[]; // TODO determin if we need multi page yaml

  // Remove any null values from the yml object
  removeNullValues(yml);

  // // create a new variable with all values except for config from cla using a spread operator
  // const {config, verbose, token, ...claWithoutConfig} = cla;

  // // merge the YAML config with the command line arguments into a new object
  // const settings = { ...yml, ...claWithoutConfig };

  // merge the YAML config with the command line arguments into a new object
  const merged = { ...yml, ...cla };

  // create a new variable with all values except for config from cla using a spread operator
  const {config, verbose, token, ...settings} = merged;

  // Validate the object against the schema
  const result = schema.safeParse(settings);

  // If the object is not valid, throw an error
  if (!result.success) throw new Error(`Config is invalid ${JSON.stringify(result.error, null, 2)}`);
  if (verbose) console.log('Config is valid:', result.data);

  // Get the GitHub token from the command line arguments, config.yaml file or environment variable
  const githubToken = token ? token : process.env.TOKEN;
  console.log('process.env.TOKEN', process.env.TOKEN);
  console.log('token', token);
  console.log('config', config);
  console.log('verbose', verbose);
  console.log('githubToken', githubToken);
  // if (!githubToken) throw new Error("Token is required. Please provide a token with the -k or --token flag or in the config.yaml file.");

  console.log(JSON.stringify({ ...settings, githubToken }, null, 2));
  // Create an Octokit client for the GitHub API
  // const octokit = new Octokit({ 
  //   auth: githubToken,
  // });

  // simpleGit().clone(repoPath, [localPath, [options]], (err: Error) => {
  // const git = await simpleGit().clone('https://github.com/ryan-thorburn/wikitest.wiki.git', 'test');
  // git.

  // Delete the cloned wiki repo directory if it alredy exists
  if (fs.existsSync(settings.wikiPath ?? './wiki')) {
    console.log(`The folder ${settings.wikiPath ?? './wiki'} already exists. Please delete it, move it or pick another folder name.`);
    process.exit(1);
    // throw new Error(`The folder ${settings.wikiPath ?? './wiki'} already exists. Please delete it, move it or pick another folder name.`);
  }

  // Clone the wiki repo
  await simpleGit().clone('https://github.com/ryan-thorburn/wikitest.wiki.git', settings.wikiPath ?? './wiki', undefined, (err) => {
    if (err) {
      console.log(`Error cloaning repo: ${err.name} ${err.message}`);
      process.exit(1);
    }
    // if (err) throw new Error(`Error cloaning repo: ${err.name} ${err.message}`);
  });

  // Scan the cloned wiki repo for markdown files
  const files = scanDir(settings.wikiPath ?? './wiki');
  console.log('files', files);
  files.forEach((file) => {
    console.log('-------------------------------------');
    console.log(file);
    markdownToJSON(file);
  });

  // Delete the cloned wiki repo directory
  await (await del).deleteAsync([settings.wikiPath ?? './wiki']);

  // , (err: Error) => {
  //   console.log(err ? 'Error' : 'Success');
  // });
  // const pagesList = await octokit.request('GET /repos/{owner}/{repo}/pages', {
  //   owner: settings.githubOwner,
  //   repo: settings.githubRepo,
  //   headers: {
  //     'X-GitHub-Api-Version': '2022-11-28'
  //   }
  // });

  // console.log(pagesList);

  // await download('direct:https://github.com/ryan-thorburn/wikitest.wiki.git', 'test/tmp', { clone: true }, (err: Error) => {
  //   console.log(err ? 'Error' : 'Success');
  // });

  // Get the owner and repo from the config.yaml file
  // const wikiPages = await getWikiPages(settings.githubOwner, settings.githubRepo, githubToken);

  // console.log(wikiPages);


  // const rawUrl = 'https://raw.githubusercontent.com/<owner>/<repo>/<branch>/wiki/<page>.md';
  // const rawText = await getWikiPageRawText(rawUrl);

  // console.log(rawText);


  //   try {
  //     // Remove the cdk.out directory to clean up cache files
  //     if (!cla.stack) {
  //       spinner.start('Removing cdk.out directory');
  //       await del(['cdk.out']);
  //       spinner.succeed();
  //     }

  //     // Synthesize all or specific stacks
  //     spinner.start(`Generating Lambda Stack: cdk synth ${cla.stack ? cla.stack.join(' ') : ''} --no-staging -e --profile fanciti-dev`);
  //     await shellExec(`cdk synth ${cla.stack ? cla.stack.join(' ') : ''} --no-staging -e --profile fanciti-dev`, { env: { ...process.env, ...env }, silent: true }) ?
  //       spinner.succeed() :
  //       spinner.fail();

  //     // Get list of stacks in cdk.out project
  //     const fileList: string[] = [];
  //     spinner.start('Getting List of Stacks');
  //     fs.readdirSync('cdk.out').forEach(file => {
  //       if (file.endsWith('template.json')) {
  //         fileList.push(file.replace(/\.template\.json$/,''));
  //       }
  //     });
  //     spinner.succeed();


  //     // Write the generated file object to the template.yaml file
  //     spinner.start('Write generated file');
  //     await fs.writeFile('output.file', JSON.stringify(stacksJson, null, 2)); // TODO what is the file name going to be?
  //     spinner.succeed();

  //     if (!cla.stack) {
  //       // Generate list of Lambdas
  //       spinner.start('Generate list of Lambdas');
  //       const resourceNames = Object.keys(stacksJson.Resources);
  //       let lambdaFunctions: { name: string; displayName: string }[] | [] = [];
  //       for (const resourceName of resourceNames) {
  //         if (stacksJson.Resources[resourceName].Type === 'AWS::Lambda::Function') {
  //           lambdaFunctions = [
  //             ...lambdaFunctions,
  //             { name: resourceName, displayName: stacksJson.Resources[resourceName].Properties.FunctionName as string },
  //           ];
  //         }
  //       }
  //       lambdaFunctions = _.orderBy(lambdaFunctions, 'displayName', 'asc');
  //       spinner.succeed(`Found ${lambdaFunctions.length} lambda functions`);

  //       // Get list of files in events directory
  //       spinner.start('Get list of events');
  //       const events = shell.ls('./events');
  //       spinner.succeed(`Found ${events.length} event files`);

  //       let selectedLambda = '';
  //       await inquirer
  //         .prompt([
  //           {
  //             name: 'lambda',
  //             type: 'list',
  //             choices: [
  //               { name: 'Watch', displayName: 'Watch'},
  //               { name: 'Start API', displayName: 'Start API'},
  //               { name: 'Start API Beta', displayName: 'Start API Beta'},
  //               ...lambdaFunctions.map((item) => {
  //                 return { name: item.displayName, value: item.name };
  //               })
  //             ],
  //             message: 'Select lambda to run',
  //           },
  //         ])
  //         .then(({lambda}: IAnswerLambda): string => selectedLambda = lambda)
  //         .catch((error) => {
  //           const { message } = error as Error;
  //           spinner.fail(message ?? error);
  //           console.log('Run for further details: cdk synth --no-staging -e --profile fanciti-dev');
  //         });

  //       let selectedEvent = '';
  //       if (selectedLambda !== 'Watch' && selectedLambda !== 'Start API' && selectedLambda !== 'Start API Beta') {
  //         await inquirer
  //           .prompt([
  //             {
  //               name: 'event',
  //               type: 'list',
  //               choices: ['No Event', ..._.orderBy(events)].map((item: string) => {
  //                 return { name: item, value: item };
  //               }),
  //               message: 'Select Event / No Event',
  //             },
  //           ])
  //           .then(({event}: IAnswerEvent): string => selectedEvent = event)
  //           .catch((error) => {
  //             const { message } = error as Error;
  //             spinner.fail(message ?? error);
  //             console.log('Run for further details: cdk synth --no-staging -e --profile fanciti-dev');
  //           });
  //       }

  //       if (selectedLambda === 'Watch') {
  //         spinner.info('npm run watch');
  //         await shellExec('npm run watch') ?
  //           spinner.succeed() :
  //           spinner.fail();
  //       }
  //     }
  //   } catch (error) {
  //     const { message } = error as Error;
  //     spinner.fail(message ?? error);
  //     console.log('Run for further details: cdk synth --no-staging -e --profile fanciti-dev');
  //   }
};

export default main;
