require("dotenv").config();
const express = require("express");
const expressEjsLayouts = require("express-ejs-layouts");

const app = express();
const PORT = process.env.PORT || 5000;
const CONFIG = {
    locals: {
        content_language: process.env.LANGUAGE,
        copyright_name: process.env.COPYRIGHT_NAME,
        blog_name: process.env.BLOG_NAME,
    }
}


app.use(express.static("./public"));
app.use(expressEjsLayouts);
app.set("layout", "./layouts/main");
app.set("view engine", "ejs");

app.use("/", require("./server/routes/main")(CONFIG));


const server = app.listen(PORT, () => {
    console.log(`[ CMS ] Weblog is up and running @ 127.0.0.1:${PORT}`);

    process.on('SIGINT', function() {
        console.log("Caught interrupt signal");
    
        server.close();
        process.exit();
    });
})