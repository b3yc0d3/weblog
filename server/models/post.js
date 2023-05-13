module.exports = class {
    constructor(id = null, authors = [], creationTime = null, tags = [], title = "", content = "", contentRaw = "") {
        this._id = id;
        this._authors = authors;
        this._creationTime = creationTime; // UNIX-Timestamp
        this._tags = tags;
        this._title = title;
        this._content = content; // Already parsed markdwon
        this._contentRaw = contentRaw; // Raw markdown written by user
    }

    get id() {
        return this._id;
    }

    get authors() {
        return this._authors;
    }

    get creationTime() {
        return this._creationTime;
    }

    get tags() {
        return this._tags;
    }

    get title() {
        return this._title;
    }

    get content() {
        return this._content;
    }

    get contentRaw() {
        return this._contentRaw;
    }

    toJSON() {
        return {
            id: this._id,
            creationTime: this.creationTime,
            authors: this._authors,
            tags: this._tags,
            title: this._title,
            content: this._content,
            contentRaw: this._contentRaw,
        };
    }
}