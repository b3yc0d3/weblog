/**
 * Sish - Simple Syntax Highlighter
 */

const FALL_BACK_SYNTAX = {
    "string": [],
    "comments": [],
    "patterns": [],
    "symbols": {}
}

function isEven(n) {
    return n % 2 == 0;
}

function isOdd(n) {
    return Math.abs(n % 2) == 1;
}


class SishLexer {
    constructor(input, options = { syntax: null }) {
        this.input = input;
        this.tokens = [];
        this.pos = 0;
        this.syntax = options.syntax || FALL_BACK_SYNTAX;

        this.isStringOpen = false;
    }

    tokenize() {
        while (this.pos < this.input.length) {
            let char = this.input[this.pos];

            // Match strings
            let string = this.matchString();
            if (string) {
                this.tokens.push({ type: string[0], action: string[2], value: string[1] });
                continue;
            }


            // Match symbols
            let symbol = this.matchSymbol();
            if (symbol) {
                this.tokens.push({ type: symbol[0], value: symbol[1] });
                continue;
            }

            // Match patterns
            let pattern = this.matchPattern();
            if (pattern) {
                this.tokens.push({ type: pattern[0], action: pattern[2], value: pattern[1] });
                continue;
            }


            this.tokens.push({ type: 'text', value: char });
            this.pos++;
        }

        return this.tokens
    }


    /**
     * 
     * @returns {Array} 0: TYPE, 1: VALUE
     */
    matchSymbol() {
        for (let symbol of Object.keys(this.syntax.symbols)) {
            let regexPattern = new RegExp(`\\b${symbol}\\b`);
            let match = this.input.slice(this.pos).match(regexPattern);
            if (match && match.index === 0) {
                this.pos += match[0].length;
                return [this.syntax.symbols[symbol], match[0]];
            }
        }
        return null;
    }

    /**
     * 
     * @returns {Array} 0: TYPE, 1: VALUE, 2: ACTION ('open', 'close', none)
     */
    matchPattern() {
        for (let pattern of this.syntax.patterns) {
            if (!Array.isArray(pattern.pattern)) {
                let regexPattern = new RegExp(`${pattern.pattern}`);
                let match = this.input.slice(this.pos).match(regexPattern);
                if (match && match.index === 0) {
                    this.pos += match[0].length;
                    return [pattern.type, match[0], null];
                }
            } else {
                let regexPatternOpen = new RegExp(`${pattern.pattern[0]}`);
                let regexPatternClose = new RegExp(`${pattern.pattern[1]}`);

                let matchOpen = this.input.slice(this.pos).match(regexPatternOpen);
                let matchClose = this.input.slice(this.pos).match(regexPatternClose);

                if (matchOpen && matchOpen.index === 0) {
                    this.pos += matchOpen[0].length;
                    return [pattern.type, matchOpen[0], 'open'];
                }

                if (matchClose && matchClose.index === 0) {
                    this.pos += matchClose[0].length;
                    return [pattern.type, matchClose[0], 'close'];
                }
            }
        }

        return null;
    }

    /**
     * 
     * @returns {Array} 0: TYPE, 1: VALUE, 2: ACTION ('open', 'close', none)
     */
    matchString() {
        if (this.syntax.string.includes(this.input[this.pos])) {
            var char = this.input[this.pos];
            if (this.input[this.pos - 1] == '\\') {
                this.pos++;
                return ["text", char];
            }

            this.pos++;

            if (this.isStringOpen) {
                this.isStringOpen = false;
                return ["string", char, "close"];
            }

            this.isStringOpen = true;
            return ["string", char, "open"];
        }

        return null;
    }
}

class Sish {
    constructor(selector = "codeblock") {
        this.selector = selector;
        this.syntax_url = "/sish/{{LNG}}.json";
    }

    run() {
        document.querySelectorAll(this.selector).forEach((codeBlock) => {
            var container = codeBlock.getElementsByTagName('pre')[0];
            var language = codeBlock.getAttribute('lng');
            var inputCode = container.innerText;

            this.highlight(language, inputCode).then((src) => {
                container.innerHTML = src;
            });
        });
    }

    async highlight(language, code) {
        var lexer = new SishLexer(code, {
            syntax: await this.fetchSyntaxJSON(language)
        });
        const tokens = lexer.tokenize();
        var highlightedCode = "";

        for (let token of tokens) {
            switch (token.action) {
                case 'open':
                    highlightedCode += `<span class="sish-${token.type}">${token.value}`;
                    break;

                case 'close':
                    highlightedCode += `${token.value}</span>`;
                    break;

                default:
                    if (token.type == 'text') {
                        highlightedCode += `${token.value}`;
                        break;
                    }

                    highlightedCode += `<span class="sish-${token.type}">${token.value}</span>`;
                    break;
            }
        }

        lexer = null;
        return highlightedCode;
    }

    async fetchSyntaxJSON(language) {
        var data = await makeRequest("GET", this.syntax_url.replace("{{LNG}}", language));
        if (data) {
            return JSON.parse(data);
        }

        return FALL_BACK_SYNTAX;
    }
}

function makeRequest(method, url) {
    return new Promise(function (resolve, reject) {
        let xhr = new XMLHttpRequest();
        xhr.open(method, url);
        xhr.onload = function () {
            if (this.status >= 200 && this.status < 300) {
                resolve(xhr.response);
            } else {
                reject({
                    status: this.status,
                    statusText: xhr.statusText
                });
            }
        };
        xhr.onerror = function () {
            reject({
                status: this.status,
                statusText: xhr.statusText
            });
        };
        xhr.send();
    });
}

window.addEventListener("DOMContentLoaded", () => {
    console.log("SISH")
    const sish = new Sish();
    sish.run();
});