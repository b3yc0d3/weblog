const fs = require("fs");
const path = require("path");

const yargs = require("yargs");
const sass = require("sass");
const { exit } = require("process");
const jsmin = require("jsmin").jsmin;

// Template Config
var CONF_TEMPLATE = {
    "port": 5000,
    "language": "en",
    "blogName": "Weblog",
    "mongodb": {
        "username": "USERNAME",
        "password": "PASSWORD"
    },
    "owner": {
        "name": "John Dow",
        "email": "doejohn@example.com",
        "welcome": "Hi, I am John",
        "description": "Some interessting things about you",
        "socials": [
            {
                "display": "Admin Panel",
                "link": "/admin/panel",
                "symbol": "ubadge"
            }
        ]
    }
}

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

    if (args.init)
        init();

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

function init() {
    if (!fs.existsSync("/etc/weblog.json")) {
        fs.writeFile("/etc/weblog.json", JSON.stringify(CONF_TEMPLATE), { flag: 'wx' }, function (err) {
            if (err) {
                console.group(err.message);
                console.log(`code: ${err.code}`);
                console.log(`syscall: ${err.syscall}`);
                console.groupEnd();
                console.log("Run this command with root privilege");
                exit(1);
            }
            console.log("Created config file at \"/etc/weblog.json\"");
        });
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