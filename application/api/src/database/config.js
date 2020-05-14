const dbHost = process.env.DB_HOST || "127.0.0.1";
const dbName = process.env.MYSQL_DATABASE || "database";
const dbUser = process.env.MYSQL_USER || "user";
const dbPassword = process.env.MYSQL_PASSWORD || "password";

module.exports = {
  development: {
    dialect: "sqlite",
    storage: `./${dbName}.sqlite3`,
    logging: console.info,
  },

  test: {
    dialect: "sqlite",
    storage: `:memory:`,
    benchmark: true,
    logging: (log, benchmark) => {
      console.debug("query executed:", log, "duration:", benchmark);
    },
  },

  production: {
    dialect: "mysql",
    logging: false,
    host: dbHost,
    username: dbUser,
    password: dbPassword,
    database: dbName,
  },
};
