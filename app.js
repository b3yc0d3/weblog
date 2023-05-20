const express = require("express");
const expressEjsLayouts = require("express-ejs-layouts");
const userConfig = require("./config/index");

const app = express();
const PORT = userConfig.port || 5000;
const ICONS = require("./config/icons");
const CONFIG = {}


app.use(express.static("./public"));
app.use(expressEjsLayouts);
app.set("layout", "./layouts/main");
app.set("view engine", "ejs");
app.locals = {
    copyright_name: userConfig.copyrightHolder,
    page: {
        title: userConfig.blogName,
        icons: ICONS
    },
    blog: {
        name: userConfig.blogName,
        lng: userConfig.language
    },
    owner: {
        name: userConfig.owner.name,
        email: userConfig.owner.email,
        welcome: userConfig.owner.welcome,
        description: userConfig.owner.description,
        socials: userConfig.owner.socials
    }
}

app.use("/", require("./server/routes/main")(CONFIG));


const server = app.listen(PORT, () => {
    console.log(`[ CMS ] Weblog is up and running @ 127.0.0.1:${PORT}`);

    process.on('SIGINT', function () {
        console.log("Caught interrupt signal");

        server.close();
        process.exit();
    });
})