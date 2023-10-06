#!/usr/bin/env npx ts-node
"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.main = void 0;
/* eslint-disable @typescript-eslint/no-unsafe-call */
var command_line_args_1 = require("command-line-args");
var fs = require("fs");
var yaml = require("js-yaml");
var simple_git_1 = require("simple-git");
var zod_1 = require("zod");
var CuratedText_1 = require("./CuratedText");
var utils_1 = require("./utils");
var main = function () { return __awaiter(void 0, void 0, void 0, function () {
    var schema, claOptions, cla, fileContents, yml, settings, result, files;
    var _a, _b, _c, _d, _e, _f, _g, _h;
    return __generator(this, function (_j) {
        switch (_j.label) {
            case 0:
                schema = zod_1.z.object({
                    config: zod_1.z.string().optional(),
                    wikiPath: zod_1.z.string({ invalid_type_error: 'wikiPath must be a string' }).optional(),
                    verbose: zod_1.z.boolean({ invalid_type_error: 'verbose must be a boolean' }).optional(),
                    githubRepo: zod_1.z.string({ invalid_type_error: 'githubRepo must be a string' }),
                    term: zod_1.z.string({ required_error: 'term is required', invalid_type_error: 'Name must be a string' }).regex(/[a-z0-9_-]+/).min(1, { message: 'term must be at least 1 character' }),
                    termType: zod_1.z.string().regex(/[a-z0-9_-]+/).optional(),
                    isa: zod_1.z.string().optional(),
                    glossaryText: zod_1.z.string({ required_error: 'glossaryText is required', invalid_type_error: 'glossaryText must be a string' }).min(1, { message: 'glossaryText must be at least 1 character' }),
                    synonymOf: zod_1.z.string().optional(),
                    groupTags: zod_1.z.string().regex(/(?:\[\s*([a-z0-9_-]+)\s*(?:,\s*([a-z0-9_-]+))*\s*\])?/).optional(),
                    formPhrases: zod_1.z.string().optional(),
                    status: zod_1.z.string().optional(),
                    created: zod_1.z.date().optional(),
                    updated: zod_1.z.date().optional(),
                    // updated: z.string().datetime().optional(),
                    contributors: zod_1.z.string().optional(),
                    attribution: zod_1.z.string().optional(),
                    originalLicense: zod_1.z.string().optional()
                });
                claOptions = [
                    { name: 'config', alias: 'c', type: String },
                    { name: 'wikiPath', alias: 'w', type: String },
                    { name: 'verbose', alias: 'v', type: Boolean },
                    { name: 'githubRepo', alias: 'r', type: String },
                    { name: 'term', alias: 't', type: String },
                    { name: 'termType', alias: 'e', type: String },
                    { name: 'isa', alias: 'i', type: String },
                    { name: 'glossaryText', alias: 'g', type: String },
                    { name: 'synonymOf', alias: 'y', type: String },
                    { name: 'groupTags', alias: 'x', type: String },
                    { name: 'formPhrases', alias: 'f', type: String },
                    { name: 'status', alias: 's', type: String },
                    { name: 'created', alias: 'd', type: Date },
                    { name: 'updated', alias: 'u', type: Date },
                    { name: 'contributors', alias: 'n', type: String },
                    { name: 'attribution', alias: 'a', type: String },
                    { name: 'originalLicense', alias: 'l', type: String },
                ];
                cla = (0, command_line_args_1["default"])(claOptions);
                // Read in the config.yaml file
                console.log("Reading config file: ".concat((_a = cla.config) !== null && _a !== void 0 ? _a : 'config.yaml'));
                fileContents = (fs.existsSync((_b = cla.config) !== null && _b !== void 0 ? _b : 'config.yaml')) ? fs.readFileSync((_c = cla.config) !== null && _c !== void 0 ? _c : 'config.yaml', 'utf8') : '';
                yml = yaml.load(fileContents);
                // Remove any null values from the yml object
                (0, utils_1.removeNullValues)(yml);
                settings = __assign(__assign({}, yml), cla);
                result = schema.safeParse(settings);
                // If the settings object is not valid based on the schema, throw an error
                if (!result.success)
                    throw new Error("Config is invalid ".concat(JSON.stringify(result, null, 2)));
                // Validate the settings object
                if (!settings.githubRepo)
                    throw new Error('Github Repo is required. Please provide a URL to a repo using with the -r or --githubRepo flag or githubRepo in the config.yaml file.');
                console.log("Processing Repo wiki: ".concat(settings.githubRepo));
                console.log(JSON.stringify(settings, null, 2)); // TODO might need to remove this. If there are any secrets it would leak them.
                // Delete the cloned wiki repo directory if it alredy exists
                if (fs.existsSync((_d = settings.wikiPath) !== null && _d !== void 0 ? _d : './wiki')) {
                    console.log("The folder ".concat((_e = settings.wikiPath) !== null && _e !== void 0 ? _e : './wiki', " already exists. Please delete it, move it or pick another folder name."));
                    process.exit(1);
                    // throw new Error(`The folder ${settings.wikiPath ?? './wiki'} already exists. Please delete it, move it or pick another folder name.`); // TODO I did an exit instead of a throw because the throw was heavy handed and not really and error, just a logic gate.
                }
                // Clone the Github wiki repo
                return [4 /*yield*/, (0, simple_git_1.simpleGit)().clone(settings.githubRepo, (_f = settings.wikiPath) !== null && _f !== void 0 ? _f : './wiki', undefined, function (err) {
                        if (err) {
                            console.log("Error cloning repo: ".concat(err.name, " ").concat(err.message));
                            process.exit(1);
                        }
                    })];
            case 1:
                // Clone the Github wiki repo
                _j.sent();
                files = (0, utils_1.scanDir)((_g = settings.wikiPath) !== null && _g !== void 0 ? _g : './wiki');
                if (!fs.existsSync('curated-texts')) {
                    fs.mkdirSync('curated-texts', { recursive: true });
                }
                files.forEach(function (file) {
                    var newFile = file.replace('wiki', 'curated-texts');
                    console.log('-------------------------------------');
                    var curatedText = new CuratedText_1.CuratedTextParser((0, utils_1.getFileContents)(file), {
                        term: (0, utils_1.filenameToTitle)(file),
                        termType: 'term'
                    });
                    curatedText.toYAML();
                    console.log(file, '->', newFile);
                    (0, utils_1.saveToFile)(newFile, curatedText.toYAML());
                });
                // Delete the cloned wiki repo directory
                fs.rmSync((_h = settings.wikiPath) !== null && _h !== void 0 ? _h : './wiki');
                return [2 /*return*/];
        }
    });
}); };
exports.main = main;
exports["default"] = exports.main;
