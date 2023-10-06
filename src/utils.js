"use strict";
exports.__esModule = true;
exports.getFileContents = exports.filenameToTitle = exports.extractTokens = exports.saveToFile = exports.scanDir = exports.removeNullValues = void 0;
var fs = require("fs");
var path = require("path");
// Remove any null values from the object
var removeNullValues = function (obj) {
    Object.keys(obj).forEach(function (key) {
        if (obj[key] === null) {
            delete obj[key];
        }
        else if (typeof obj[key] === 'object') {
            (0, exports.removeNullValues)(obj[key]);
        }
    });
};
exports.removeNullValues = removeNullValues;
var scanDir = function (directoryPath, filesList) {
    if (filesList === void 0) { filesList = []; }
    var files = fs.readdirSync(directoryPath);
    for (var _i = 0, files_1 = files; _i < files_1.length; _i++) {
        var file = files_1[_i];
        var filePath = path.join(directoryPath, file);
        var fileStat = fs.statSync(filePath);
        if (fileStat.isFile()) {
            filesList.push(path.relative(process.cwd(), filePath));
        }
        else if (fileStat.isDirectory() && file !== '.git') {
            console.log('file', file);
            (0, exports.scanDir)(filePath, filesList);
        }
    }
    return filesList;
};
exports.scanDir = scanDir;
var saveToFile = function (filename, yaml) {
    fs.writeFileSync(filename, yaml);
};
exports.saveToFile = saveToFile;
var extractTokens = function (text) {
    // TODO only return token from an approved list?
    var lines = text.split(/\r?\n/); // split on Windows and Linux line breaks
    var hash = {};
    for (var _i = 0, lines_1 = lines; _i < lines_1.length; _i++) {
        var line = lines_1[_i];
        var colonIndex = line.indexOf(':');
        if (colonIndex >= 0) {
            var key = line.slice(0, colonIndex).trim();
            var value = line.slice(colonIndex + 1).trim();
            hash[key] = value;
        }
    }
    return hash;
};
exports.extractTokens = extractTokens;
function filenameToTitle(filename) {
    // Remove the directory path and file extension
    var baseFilename = filename.replace(/^.*\//, '').replace(/\.md$/, '');
    // Split the filename into words using '-' as a delimiter
    var words = baseFilename.split('-');
    // Capitalize the first letter of each word and join them with spaces
    var title = words
        .map(function (word) { return word.charAt(0).toUpperCase() + word.slice(1); })
        .join(' ');
    return title;
}
exports.filenameToTitle = filenameToTitle;
var getFileContents = function (filePath) { return fs.readFileSync(filePath, 'utf-8'); };
exports.getFileContents = getFileContents;
