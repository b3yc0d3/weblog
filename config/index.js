const isProduction = process.env.NODE_ENV === 'production';

module.exports = isProduction ? require("./production.json") : require("./development.json");