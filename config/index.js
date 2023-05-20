const isProduction = process.env.NODE_ENV === 'production';

module.exports = isProduction ? require("/etc/weblog.json") : require("./development.json");