# WEBLog
Simple self-hosted blog website.


## URLS
- `<host>/b/<post-id>` - A post id is constructed off of the post title + its creation timestamp. E.g. `TITLE + TIMESTAMP = POST_ID (ADLER32)`
- `<host>/admin/new-post` - Create new Post, login required !