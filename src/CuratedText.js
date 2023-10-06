"use strict";
exports.__esModule = true;
exports.CuratedTextParser = void 0;
var yaml = require("js-yaml");
var CuratedTextParser = /** @class */ (function () {
    function CuratedTextParser(markdownText, options) {
        this.markdownText = markdownText;
        this.options = options;
        // Extract "Definition" section and set as glossaryText
        var definitionMatch = this.markdownText.match(/#{1,2} Definition\n([\s\S]*?)(?=\n#{1,2}|$)/);
        if (definitionMatch && definitionMatch[1]) {
            this.options.glossaryText = definitionMatch[1].trim();
        }
    }
    CuratedTextParser.prototype.toYAML = function () {
        var frontmatter = yaml.dump(this.options);
        return "---\n".concat(frontmatter, "---\n").concat(this.markdownText);
    };
    return CuratedTextParser;
}());
exports.CuratedTextParser = CuratedTextParser;
