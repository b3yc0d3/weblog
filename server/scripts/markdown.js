/**
 * Weblog Markdown Lexer & Parser
 * 
 * This markdown parser currently supports:
 * 
 * | Element    | Markdown Syntax                  |
 * |------------|----------------------------------|
 * |              Basic Syntax                     |
 * | Heading    | # h1                             |
 * |            | ## h1                            |
 * |            | ### h1                           |
 * | Bold       | **bold text**                    |
 * | Italic     | *italic*                         |
 * | Blockquote | > blockquote                     |
 * | Link       | [title](https://www.example.de/) |
 * | Image      | ![alt text](image.jpg)           |
 * | Code       | `inline code`                    |
 */

/**
 * # = NUMBER SIGN
 * * = ASTERISK
 * _ = LOW LINE
 * - = HYPHEN
 * ! = EXCLAMATION MARK
 * [ = LEFT SQUARE BRACKET
 * ] = RIGHT SQUARE BRACKET
 * ( = LEFT PARENTHESIS
 * ) = RIGHT PARENTHESIS
 * ~ = TILDE
 * \r\n | \n | \n\r = LINE BREAK
 * \s = SPACE
 * < = LESS-THAN SIGN
 * > = GREATER-THAN SIGN
 * / = SOLIDUS
 * ` = GRAVE ACCENT
 * . = FULL STOP
 */
const TOKEN_TYPE = {
    TOKEN_TEXT: "text",                 // any type not listed here
    TOKEN_DIGIT: "digit",               // 0-9
    TOKEN_SPACE: "space",               //
    TOKEN_FS: "full_stop",              // .
    TOKEN_LB: "line_break",             // \n, \r, \r\n
    TOKEN_GT: "greater_then",           // >
    TOKEN_EXCMA: "exclamation_mark",    // !
    TOKEN_LSB: "left_square_bracket",   // [
    TOKEN_RSB: "right_square_bracket",  // ]
    TOKEN_LP: "left_parenthesis",       // (
    TOKEN_RP: "right_parenthesis",      // )
    TOKEN_GA: "grave_accent",           // `

    TOKEN_HEADER: "header",
    TOKEN_ITALIC: "italic",
    TOKEN_BOLD: "bold",
    TOKEN_BOLD_ITALIC: "bold_and_italic",
    TOKEN_CODE_INLINE: "code_inline",
    TOKEN_CODE_BLOCK: "code_block",
    TOKEN_MARK: "mark",
    TOKEN_PARAGRAPH: "paragraph",
    TOKEN_BLOCKQUOTE: "blockquote",
    TOKEN_KBD: "kbd",                   // shortcut display, e.g. <kbd>Ctrl+S</kbd>

    TOKEN_EOF: "end_of_file",
    TOKEN_EOL: "end_of_line",
    TOKEN_ERROR: "error",
}

class Token {
    /**
     * Create new Token
     * @param {TOKEN_TYPE} type Type
     * @param {String} value Value
     * @param {*} option Optional options
     */
    constructor(type, value, option = null) {
        this.type = type;
        this.value = value;
        this.option = option;
    }
}

class WEMPLexer {
    constructor(input) {
        this.source = input;
        this.char = '';
        this.lastChar = '';
        this.pos = -1;
        this._digits = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
        this.next();
    }

    next(range = 1) {
        if (this.source[this.pos + range]) {
            this.pos += range;
            this.char = this.source[this.pos];
            return;
        }

        this.char = null;
    }

    peek(range = 1) {
        if (this.source[this.pos + range])
            return this.source[this.pos + range];

        return null;
    }

    back(range = 1) {
        if (this.source[this.pos - range]) {
            this.pos -= range;
            this.char = this.source[this.pos];
            return;
        }

        this.char = null;
    }

    token() {
        let token = new Token(TOKEN_TYPE.TOKEN_ERROR, "");
        let chars = "";

        switch (this.char) {
            case null:
                token.type = TOKEN_TYPE.TOKEN_EOF;
                token.value = this.char;
                break;

            // Titles
            case "#":
                var level = 1;
                chars = "#"
                this.next();

                while (this.char == "#") {
                    level++;
                    chars += "#";
                    this.next();
                }

                // Idk why but the while loop above sucks up one char
                this.back();

                token.type = TOKEN_TYPE.TOKEN_HEADER;
                token.value = chars;
                token.option = level;
                break;

            // Space
            case " ":
                token.type = TOKEN_TYPE.TOKEN_SPACE;
                token.value = this.char;
                break;

            // Text styles (bold, italic, bold & italic)
            case "*":
                chars = "*";

                while (this.peek() == "*") {
                    chars += "*";
                    this.next();
                }

                switch (chars.length) {
                    case 1:
                        token.type = TOKEN_TYPE.TOKEN_ITALIC;
                        token.value = chars;
                        break;

                    case 2:
                        token.type = TOKEN_TYPE.TOKEN_BOLD;
                        token.value = chars;
                        break;

                    case 3:
                        token.type = TOKEN_TYPE.TOKEN_BOLD_ITALIC;
                        token.value = chars;
                        break;

                    default:
                        // TODO: error handling
                        break;
                }

                break;

            // Blockquote
            case ">":
                if (this.lastChar != "\n") {
                    token.type = TOKEN_TYPE.TOKEN_TEXT;
                    token.value = this.char;
                    break;
                }

                token.type = TOKEN_TYPE.TOKEN_BLOCKQUOTE;
                token.value = this.char;
                break;

            // Full stop
            case ".":
                token.type = TOKEN_TYPE.FS;
                token.value = this.char;
                break;

            // Left Square Bracket
            case "[":
                token.type = TOKEN_TYPE.TOKEN_LSB;
                token.value = this.char;
                break;

            // Right Square Bracket
            case "]":
                token.type = TOKEN_TYPE.TOKEN_RSB;
                token.value = this.char;
                break;

            // Left Parenthesis
            case "[":
                token.type = TOKEN_TYPE.TOKEN_LP;
                token.value = this.char;
                break;

            // Right Parenthesis
            case "[":
                token.type = TOKEN_TYPE.TOKEN_RP;
                token.value = this.char;
                break;

            // Grave Accent
            case "`":
                token.type = TOKEN_TYPE.TOKEN_CODE_INLINE;
                chars = "`";

                if (this.peek() === "`") {
                    chars += "`";
                    this.next();

                    if (this.peek() === "`") {
                        this.next();
                        chars += "`";
                        token.type = TOKEN_TYPE.TOKEN_CODE_BLOCK;
                        token.value = chars;

                        this.next();
                        var argString = "";
                        while (true) {
                            if (this.char == "\n") break;
                            if (this.char == null) break;
                            argString += this.char;
                            this.next();
                        }

                        if (argString) {
                            // Check if it sets the lnaguage or if it sets name or name and source link
                            if (argString.includes(";")) {
                                var configLine = argString.split(";");
                                token.option = { fileName: configLine[0] ? configLine[0] : null, sourceLink: configLine[1] ? configLine[1] : null };
                                break;
                            }

                            token.option = { language: argString }
                            break;
                        }
                        break;
                    }

                    token.type = TOKEN_TYPE.TOKEN_CODE_INLINE;
                    token.value = chars;
                    break;
                }
                break;

            // Line break
            case "\n":
                if (this.peek() == "\n") {
                    token.type = TOKEN_TYPE.TOKEN_PARAGRAPH;
                    token.value = this.char;
                    this.next();
                    break;
                }

                token.type = TOKEN_TYPE.TOKEN_EOL;
                token.value = this.char;
                break;

            // Escape sequenze
            case "\\":
                if (this.peek() != " ") {
                    this.next();
                    token.type = TOKEN_TYPE.TOKEN_TEXT;
                    token.value = this.char;
                }

                token.type = TOKEN_TYPE.TOKEN_TEXT;
                token.value = this.char;

                break;

            default:
                if (this._digits.includes(this.char)) {
                    token.type = TOKEN_TYPE.TOKEN_DIGIT;
                    token.value = this.char;
                    break;
                }

                token.type = TOKEN_TYPE.TOKEN_TEXT;
                token.value = this.char;
                break;
        }

        this.lastChar = this.char;
        this.next();
        return token;
    }
}

class WEMPCodeBlock {
    constructor(content = "", language = null, fileName = null, sourceLink = null) {
        this.content = content;
        this.language = language;
        this.fileName = fileName;
        this.sourceLink = sourceLink;
    }

    toHTML() {
        var codeBlockSource = this.sourceLink ? `<a href="${this.sourceLink}" target="_blank" class="sish-info-src">source</a>` : null;
        var codeBlockFilename = this.fileName ? `<div class="sish-info-filename">${this.fileName}</div>` : null;
        var codeBlockInfoHead = codeBlockFilename ? `<div class="sish-info">${codeBlockFilename}${codeBlockSource ? codeBlockSource : ""}</div>` : "";
        var codeBlockHTML = `<div class="sish highlight" lng="${this.language}">${codeBlockInfoHead}<pre>${this.content}</pre></div>`

        return codeBlockHTML;
    }

    append(text) {
        this.content += text;
    }
}

class WEMP {
    constructor() {
        this._openTags = {
        }
        this._link = [];
        this._out = "";
        this._lastToken = null;
        this._headerLevel = 1;
        this._token = null;
        this._codeBlock = null;
    }

    parse(input) {
        let lexer = new WEMPLexer(input);

        /**
         * TODOs:
         * - Ordered List
         * - Unordered List
         */

        let lastToken = null;
        this.token = lexer.token();
        while (this.token.type != TOKEN_TYPE.TOKEN_EOF) {
            switch (this.token.type) {
                // Header
                case TOKEN_TYPE.TOKEN_HEADER:
                    if (this._codeBlock) {
                        this.append(this.token.value);
                        break;
                    }

                    this.closeAllTags();

                    this._headerLevel = this.token.option;
                    this.openTag("header", `<h${this._headerLevel}>`);
                    break;

                // Bold
                case TOKEN_TYPE.TOKEN_BOLD:
                    if (this.isTagOpen("bold")) {
                        this.closeTag("bold", "</b>");
                        break;
                    }

                    this.openTag("bold", "<b>");
                    break;

                // Iatlic
                case TOKEN_TYPE.TOKEN_ITALIC:
                    if (this.isTagOpen("italic")) {
                        this.closeTag("italic", "</i>");
                        break;
                    }

                    this.openTag("italic", "<i>");
                    break;

                // Bold & Italic
                case TOKEN_TYPE.TOKEN_BOLD_ITALIC:
                    if (this.isTagOpen("bolditalic")) {
                        this.closeTag("bolditalic", "</bi>");
                        break;
                    }

                    this.openTag("bolditalic", "<bi>");
                    break;

                // Code Inline
                case TOKEN_TYPE.TOKEN_CODE_INLINE:
                    if (this.isTagOpen("code_inline")) {
                        this.closeTag("code_inline", "</code>");
                        break;
                    }

                    this.openTag("code_inline", "<code>");
                    break;

                // Code Block
                case TOKEN_TYPE.TOKEN_CODE_BLOCK:
                    console.log(this._codeBlock);
                    if (this._codeBlock != null) {
                        console.log("1 :: ", this.token.option);
                        if (this.token.option && this.token.option.fileName)
                            this._codeBlock.fileName = this.token.option.fileName;

                        if (this.token.option && this.token.option.sourceLink)
                            this._codeBlock.sourceLink = this.token.option.sourceLink;

                        var codeBlockHtml = this._codeBlock.toHTML();
                        this._codeBlock = null;
                        this.closeAllTags();
                        this.append(codeBlockHtml);
                        break;
                    }

                    this._codeBlock = new WEMPCodeBlock();
                    this._codeBlock.language = "none";
                    console.log("2 :: ", this.token.option);
                    if (this.token.option && this.token.option.language)
                        this._codeBlock.language = this.token.option.language;

                    break;

                // Blockquote
                case TOKEN_TYPE.TOKEN_BLOCKQUOTE:
                    if (this._codeBlock) {
                        this.append(this.token.value);
                        break;
                    }

                    if (this.isTagOpen("blockquote"))
                        break;

                    if (this.isTagOpen("paragraph")) {
                        this.closeTag("paragraph", "</p>");
                    }

                    this.openTag("blockquote", "<blockquote>");
                    this.openTag("paragraph", "<p>");
                    break;

                // Paragraph (\n\n)
                case TOKEN_TYPE.TOKEN_PARAGRAPH:
                    if (this.isTagOpen("header")) {
                        this.closeTag("header", `</h${this._headerLevel}>`);
                    }

                    if (this.isTagOpen("paragraph")) {
                        this.closeTag("paragraph", "</p>");
                    }

                    if (this.isTagOpen("blockquote")) {
                        this.closeTag("blockquote", "</blockquote>");
                    }

                    this.openTag("paragraph", "<p>");
                    break;

                // Line break
                case TOKEN_TYPE.TOKEN_LB:
                    this.append("<br>");
                    break;

                // End Of Line
                case TOKEN_TYPE.TOKEN_EOL:
                    if (this._codeBlock) {
                        this._codeBlock.append("\n");
                        break;
                    }

                    if (this.isTagOpen("header")) {
                        this.closeTag("header", `</h${this._headerLevel}>`);
                        this.openTag("paragraph", "<p>");
                    }
                    break;

                default:
                    if (lastToken && lastToken.type == TOKEN_TYPE.TOKEN_EOL && !this._codeBlock)
                        this.append(" ");

                    this.append(this.token.value);
                    break;
            }

            lastToken = this.token;
            this.token = lexer.token();
        }

        this.closeAllTags();
        return this.stripEmptyTags();
    }

    stripEmptyTags() {
        // removing empty html tags
        var ret = this._out.replace(/<[^\/>]+>[\n\r\t]*<\/[^>]+>/g, "");

        return ret;
    }

    isTagOpen(tag) {
        if (this._openTags[tag]) {
            return this._openTags[tag] != 0;
        }

        return false;
    }

    closeTag(tag, seq, num = 1) {
        if (this._codeBlock && this.token.type != TOKEN_TYPE.TOKEN_HEADER) {
            this._codeBlock.append(this.escapeHtml(this.token.value));
            return;
        }

        if (this._openTags[tag] && this._openTags[tag] > 0) {

            this._openTags[tag] -= num;
            this.append(seq);

            if (this._openTags[tag] <= 0)
                delete this._openTags[tag];
        }
    }

    openTag(tag, seq) {
        if (this._codeBlock) {
            this._codeBlock.append(this.escapeHtml(this.token.value));
            return;
        }

        if (!this._openTags[tag])
            this._openTags[tag] = 0;

        this._openTags[tag]++;
        this.append(seq);
    }

    append(text) {
        if (this._codeBlock) {
            this._codeBlock.append(this.escapeHtml(text));
            return;
        }

        if(!this.isTagOpen("paragraph")) {
            this.openTag("paragraph", "<p>");
        }

        this._out += text;
    }

    closeAllTags() {
        this.closeAllStyleTags();

        if (this.isTagOpen("header")) {
            this.closeTag("header", `</h${this._headerLevel}>`);
        }

        if (this.isTagOpen("code")) {
            this.closeTag("code", `</code>`);
        }

        if (this.isTagOpen("paragraph")) {
            this.closeTag("paragraph", `</ps>`);
        }
    }

    closeAllStyleTags() {
        if (this.isTagOpen("bold")) {
            this.closeTag("bold", "</b>");
        }

        if (this.isTagOpen("italic")) {
            this.closeTag("italic", "</i>");
        }

        if (this.isTagOpen("mark")) {
            this.closeTag("mark", "</mark>");
        }

        if (this.isTagOpen("kbd")) {
            this.closeTag("kbd", "</kbd>");
        }
    }

    escapeHtml(html = "") {
        let input = html.split();
        let ret = "";

        const HTML_ESCAPE = {
            "<": "&lt;",
            ">": "&gt;",
        }

        input.forEach((char) => {
            if (HTML_ESCAPE[char]) {
                ret += HTML_ESCAPE[char];
            } else {
                ret += char;
            }
        })

        return ret;
    }
}

module.exports.WEMP = WEMP;