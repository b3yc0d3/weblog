const express = require("express");
const Post = require("../models/post");

module.exports = (config) => {
    const router = express.Router();
    const page = {
        title: `${config.locals.blog_name}`,
    };

    router.get("/", (req, res) => {
        res.render("index", { locals: config.locals, page: page });
    });

    router.get("/post/:postId([a-zA-Z0-9]{8})", (req, res) => {
        const postId = req.params.postId;
        const post = new Post(postId, ["b3yc0d3@gmail.com"], "000000000000", ["first-post", "hello-world"], "This is my first post here", "Hello everyone", "Hello everyone");
        const page = {
            title: `${post.title} - ${config.locals.blog_name}`,
        };

        res.render("post", { locals: config.locals, page: page, post: post });
    });

    return router;
};