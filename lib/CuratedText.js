import * as yaml from 'js-yaml';
export class CuratedTextParser {
    markdownText;
    options;
    constructor(markdownText, options) {
        this.markdownText = markdownText;
        this.options = options;
        // Extract "Definition" section and set as glossaryText
        const definitionMatch = this.markdownText.match(/#{1,2} Definition\n([\s\S]*?)(?=\n#{1,2}|$)/);
        if (definitionMatch && definitionMatch[1]) {
            this.options.glossaryText = definitionMatch[1].trim();
        }
    }
    toYAML() {
        const frontmatter = yaml.dump(this.options);
        return `---\n${frontmatter}---\n${this.markdownText}`;
    }
}
