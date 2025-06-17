const knexConfig = require("../knexfile.js");
const knex = require("knex")(knexConfig.development);
module.exports = knex;
