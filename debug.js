const fs = require('fs');
const { WEMP } = require('./server/scripts/markdown');

var mdp = new WEMP();
var inputText = `Markdown Parser Test

As you can see this markdown parser supports paragraphs, as you already see, and the following stuff:

**bold**<br>*italic*<br><mark>marked</mark><br>***bold and italic***<br>\`inline code\`

\`\`\`c
#include <stdio.h>

int main() {
    printf("Hello World\\n");
    return 0;
}
\`\`\`main.c;https://github.com/b3yc0d3/spm/blob/master/spm.h;
> You even can quote stuff`;

var rawInput = inputText;
rawInput = rawInput.replace(/\>/g, "&gt;");
rawInput = rawInput.replace(/\</g, "&lt;");

const fileContent = `<head><meta charset="UTF-8"><meta http-equiv="X-UA-Compatible" content="IE=edge"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>{{ BLOG_POST_TITLE }} Weblog</title><link rel="stylesheet" href="public/fonts/font.css"><link rel="stylesheet" href="public/css/style.min.css"><link rel="stylesheet" href="public/css/sish.min.css"></head><body style="display: flex;"><div class="content-wrapper" style="margin: 32px 0;max-width: 500px;"><article class="post-container card"><div class="post-content">${mdp.parse(inputText)}</div></article></div><div class="content-wrapper" style="margin: 32px 0;max-width: 800px;"><article class="post-container card"><div class="post-content"><div class="sish highlight" lng="markdown"><pre>${rawInput}</pre></div></div></article></div></body></html>`
fs.writeFileSync("./debug.html", fileContent);