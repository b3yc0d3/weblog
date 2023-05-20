const fs = require("fs");
const path = require("path");

const yargs = require("yargs");
const sass = require("sass");
const jsmin = require("jsmin").jsmin;

// Paths
const PATH_PUBLIC = path.join(__dirname, "public");
const PATH_DEV = path.join(__dirname, "public_dev");
const PATH_DEV_SCSS = path.join(PATH_DEV, "scss");
const PATH_DEV_JS = path.join(PATH_DEV, "js");
const PATH_CSS = path.join(PATH_PUBLIC, "css");
const PATH_JS = path.join(PATH_PUBLIC, "js");
var IS_PRODUCTION = false;

function main() {

    const args = yargs.argv;

    if (args.clean)
        clean();

    if (args.dev)
        IS_PRODUCTION = false;

    if (args.production)
        IS_PRODUCTION = true;

    if (args.build) {
        clean();
        build();
    }
}

function clean() {
    fs.rmSync(PATH_CSS, { recursive: true, force: true });
    fs.rmSync(PATH_JS, { recursive: true, force: true });
}

function build() {
    sassCompress(IS_PRODUCTION);
    jsCompress(IS_PRODUCTION);
}

function sassCompress(minify = false) {

    if (!fs.existsSync(PATH_CSS))
        fs.mkdirSync(PATH_CSS, { recursive: true });

    fs.readdirSync(PATH_DEV_SCSS).forEach((file) => {
        if (!file.startsWith("_") && file.endsWith(".scss")) {
            const outName = file.split('.')[0];
            const compressed = sass.compile(path.join(PATH_DEV_SCSS, file), { style: minify ? "compressed" : "expanded" });

            fs.writeFileSync(path.join(PATH_CSS, `${outName}.css`), compressed.css);
        }
    })
}

function jsCompress(minify = false) {
    if (!fs.existsSync(PATH_JS))
        fs.mkdirSync(PATH_JS, { recursive: true });

    fs.readdirSync(PATH_DEV_JS).forEach((file) => {
        if (file.endsWith(".js")) {
            const outName = file.split('.')[0];
            const compressed = jsmin(fs.readFileSync(path.join(PATH_DEV_JS, file), "utf-8"), minify ? 3 : 0);

            fs.writeFileSync(path.join(PATH_JS, `${outName}.js`), compressed);
        }
    })
}

main();