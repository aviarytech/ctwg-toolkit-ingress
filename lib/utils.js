import * as fs from 'fs';
import * as path from 'path';
// Remove any null values from the object
export const removeNullValues = (obj) => {
    Object.keys(obj).forEach(key => {
        if (obj[key] === null) {
            delete obj[key];
        }
        else if (typeof obj[key] === 'object') {
            removeNullValues(obj[key]);
        }
    });
};
export const scanDir = (directoryPath, filesList = []) => {
    const files = fs.readdirSync(directoryPath);
    for (const file of files) {
        const filePath = path.join(directoryPath, file);
        const fileStat = fs.statSync(filePath);
        if (fileStat.isFile()) {
            filesList.push(path.relative(process.cwd(), filePath));
        }
        else if (fileStat.isDirectory() && file !== '.git') {
            console.log('file', file);
            scanDir(filePath, filesList);
        }
    }
    return filesList;
};
export const saveToFile = (filename, yaml) => {
    fs.writeFileSync(filename, yaml);
};
export const extractTokens = (text) => {
    // TODO only return token from an approved list?
    const lines = text.split(/\r?\n/); // split on Windows and Linux line breaks
    const hash = {};
    for (const line of lines) {
        const colonIndex = line.indexOf(':');
        if (colonIndex >= 0) {
            const key = line.slice(0, colonIndex).trim();
            const value = line.slice(colonIndex + 1).trim();
            hash[key] = value;
        }
    }
    return hash;
};
export function filenameToTitle(filename) {
    // Remove the directory path and file extension
    const baseFilename = filename.replace(/^.*\//, '').replace(/\.md$/, '');
    // Split the filename into words using '-' as a delimiter
    const words = baseFilename.split('-');
    // Capitalize the first letter of each word and join them with spaces
    const title = words
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    return title;
}
export const getFileContents = (filePath) => fs.readFileSync(filePath, 'utf-8');
