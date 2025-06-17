const dotenv = require("dotenv");
dotenv.config({ path: "./.env" });
const knexConfig = {
  development: {
    client: "pg",
    connection: {
      host: process.env.POSTGRES_HOST,
      port: process.env.POSTGRES_PORT,
      user: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DB,
    },
    pool: { min: 0, max: 10 },
    migrations: {
      directory: "./migrations",
    },
  },
};

module.exports = knexConfig;
