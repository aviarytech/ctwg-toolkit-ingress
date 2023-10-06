interface CuratedTextOptions {
    term: string;
    termType: string;
    isa?: string;
    glossaryText?: string;
    synonymOf?: string;
    groupTags?: string[];
    formPhrases?: string[];
    status?: string;
    created?: string;
    updated?: string;
    contributors?: string;
    attribution?: string;
    originalLicense?: string;
}
export declare class CuratedTextParser {
    private markdownText;
    private options;
    constructor(markdownText: string, options: CuratedTextOptions);
    toYAML(): string;
}
export {};
