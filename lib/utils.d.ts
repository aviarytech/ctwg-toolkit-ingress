export declare const removeNullValues: (obj: Record<string, unknown>) => void;
export declare const scanDir: (directoryPath: string, filesList?: string[]) => string[];
export declare const saveToFile: (filename: string, yaml: string) => void;
interface MarkdownData {
    title: string;
    content: string | null;
}
export declare const extractTokens: (text: string) => MarkdownData;
export declare function filenameToTitle(filename: string): string;
export declare const getFileContents: (filePath: string) => string;
export {};
