# WEBLog
Simple self-hosted blog website.

## Build
```console
$ git clone https://github.com/b3yc0d3/weblog.git
$ cd weblog
$ npm install
$ npm run build
```

## Development
```console
$ git clone https://github.com/b3yc0d3/weblog.git
$ cd weblog
$ npm run dev:build
```

## Supported Markdown in articles
| Element       | Markdown Syntax                                                                                                                                                                       |
| :------------ | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Header        | # H1<br>## H2<br>### H3                                                                                                                                                               |
| Bold          | \*\*Bold\*\*                                                                                                                                                                          |
| Italic        | \*Italic\*                                                                                                                                                                            |
| Bold & Italic | \*\*\*Bold Italic\*\*\*                                                                                                                                                               |
| Code Inline   | \`inline code\`                                                                                                                                                                       |
| Code Block    | \`\`\`c<br>// ...<br>\`\`\`<br>or<br>\`\`\`c<br>//...<br>\`\`\`main.c;https://www.example.com/main.c;<br>**CAUTION** the config line must always end with a semicolon when not empty. |
| Blockquote    | \> blockquote                                                                                                                                                                         |

## URLS
- `<host>/b/<post-id>` - A post id is constructed off of the post title + its creation timestamp. E.g. `TITLE + TIMESTAMP = POST_ID (ADLER32)`
- `<host>/admin/new-post` - Create new Post, login required !