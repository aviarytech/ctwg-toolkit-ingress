#!/usr/bin/env node
import commandLineArgs from "command-line-args";
import * as fs from "fs";
import * as yaml from "js-yaml";
import { simpleGit } from "simple-git";
import { Command } from "commander";
import { z } from "zod";
import { CuratedTextParser } from "./CuratedText.js";
import { fileURLToPath } from "url";
import { filenameToTitle, getFileContents, removeNullValues, saveToFile, scanDir, } from "./utils.js";
import path from "path";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const packageJson = JSON.parse(fs.readFileSync(path.resolve(__dirname, "package.json"), "utf8"));
const version = packageJson.version;
const program = new Command();
program
    .name("tev2-ingress")
    .version(version)
    .usage("[ <paramlist> ] [ <globpattern> ]\n" +
    "- <paramlist> (optional) is a list of key-value pairs\n" +
    "- <globpattern> (optional) specifies a set of (input) files that are to be processed")
    .description("The CLI for the Term Reference Resolution Tool")
    .option("-c, --config <path>", "Path (including the filename) of the tool's (YAML) configuration file")
    .option("-w, --wikiPath <path>", "Path of the local filesystem for the wiki folder to be created")
    .option("-r, --githubRepo <path>", "Path of the github repo the wiki lives in")
    .option("-o, --output <dir>", "(Root) directory for output files to be written")
    .option("-s, --scopedir <path>", "Path of the scope directory where the SAF is located")
    .option("-t, --termselcriteria", "List of term selection criteria that are used to generate")
    .option("-m, --method", "The method that is used to create the output (default HTML)")
    .option("-l, --license", "File that contains the licensing conditions")
    .option("-f, --force", "Allow overwriting of existing files")
    .parse(process.argv);
program.parse();
const main = async () => {
    // YAML Schema Validation
    const schema = z.object({
        config: z.string().optional(),
        wikiPath: z
            .string({ invalid_type_error: "wikiPath must be a string" })
            .optional(),
        githubRepo: z.string({ invalid_type_error: "githubRepo must be a string" }),
        term: z
            .string({
            required_error: "term is required",
            invalid_type_error: "Name must be a string",
        })
            .regex(/[a-z0-9_-]+/)
            .min(1, { message: "term must be at least 1 character" }),
        termType: z
            .string()
            .regex(/[a-z0-9_-]+/)
            .optional(),
        isa: z.string().optional(),
        glossaryText: z
            .string({
            required_error: "glossaryText is required",
            invalid_type_error: "glossaryText must be a string",
        })
            .min(1, { message: "glossaryText must be at least 1 character" }),
        synonymOf: z.string().optional(),
        groupTags: z
            .string()
            .regex(/(?:\[\s*([a-z0-9_-]+)\s*(?:,\s*([a-z0-9_-]+))*\s*\])?/)
            .optional(),
        formPhrases: z.string().optional(),
        status: z.string().optional(),
        created: z.date().optional(),
        updated: z.date().optional(),
        // updated: z.string().datetime().optional(),
        contributors: z.string().optional(),
        attribution: z.string().optional(),
        originalLicense: z.string().optional(),
    });
    // Command Line Arguments
    const claOptions = [
        { name: "config", alias: "c", type: String },
        { name: "wikiPath", alias: "w", type: String },
        { name: "githubRepo", alias: "r", type: String },
        { name: "term", alias: "t", type: String },
        { name: "termType", alias: "e", type: String },
        { name: "isa", alias: "i", type: String },
        { name: "glossaryText", alias: "g", type: String },
        { name: "synonymOf", alias: "y", type: String },
        { name: "groupTags", alias: "x", type: String },
        { name: "formPhrases", alias: "f", type: String },
        { name: "status", alias: "s", type: String },
        { name: "created", alias: "d", type: Date },
        { name: "updated", alias: "u", type: Date },
        { name: "contributors", alias: "n", type: String },
        { name: "attribution", alias: "a", type: String },
        { name: "originalLicense", alias: "l", type: String },
    ];
    // Parse the command line arguments
    const cla = commandLineArgs(claOptions);
    // Read in the config.yaml file
    console.log(`Reading config file: ${cla.config ?? "config.yaml"}`);
    const fileContents = fs.existsSync(cla.config ?? "config.yaml")
        ? fs.readFileSync(cla.config ?? "config.yaml", "utf8")
        : "";
    const yml = yaml.load(fileContents);
    // Remove any null values from the yml object
    removeNullValues(yml);
    // merge the YAML config with the command line arguments into a new single settings object. Command line arguments override the config.yaml file.
    const settings = { ...yml, ...cla };
    // Validate the object against the schema
    const result = schema.safeParse(settings);
    // If the settings object is not valid based on the schema, throw an error
    if (!result.success)
        throw new Error(`Config is invalid ${JSON.stringify(result, null, 2)}`);
    // Validate the settings object
    if (!settings.githubRepo)
        throw new Error("Github Repo is required. Please provide a URL to a repo using with the -r or --githubRepo flag or githubRepo in the config.yaml file.");
    console.log(`Processing Repo wiki: ${settings.githubRepo}`);
    console.log(JSON.stringify(settings, null, 2)); // TODO might need to remove this. If there are any secrets it would leak them.
    // Delete the cloned wiki repo directory if it alredy exists
    fs.rmSync(settings.wikiPath ?? "./wiki", { recursive: true });
    // Clone the Github wiki repo
    await simpleGit().clone(settings.githubRepo, settings.wikiPath ?? "./wiki", undefined, (err) => {
        if (err) {
            console.log(`Error cloning repo: ${err.name} ${err.message}`);
            process.exit(1);
        }
    });
    // Scan the cloned wiki repo for markdown files
    const files = scanDir(settings.wikiPath ?? "./wiki");
    if (!fs.existsSync("curated-texts")) {
        fs.mkdirSync("curated-texts", { recursive: true });
    }
    files.forEach((file) => {
        const newFile = file.replace("wiki", "curated-texts");
        console.log("-------------------------------------");
        const curatedText = new CuratedTextParser(getFileContents(file), {
            term: filenameToTitle(file),
            termType: "term",
        });
        curatedText.toYAML();
        console.log(file, "->", newFile);
        saveToFile(newFile, curatedText.toYAML());
    });
    // Delete the cloned wiki repo directory
    fs.rmSync(settings.wikiPath ?? "./wiki", { recursive: true });
};
main();
