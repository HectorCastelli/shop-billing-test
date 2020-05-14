const dbHost = process.env.DB_HOST || "127.0.0.1";
const dbName = process.env.MYSQL_DATABASE || "database";
const dbUser = process.env.MYSQL_USER || "user";
const dbPassword = process.env.MYSQL_PASSWORD || "password";

module.exports = {
  development: {
    dialect: "sqlite",
    storage: `./${dbName}.sqlite3`,
    logging: console.info,
    sync: {
      force: true,
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  },

  test: {
    dialect: "sqlite",
    storage: `:memory:`,
    benchmark: true,
    logging: (log, benchmark) => {
      console.debug("query executed:", log, "duration:", benchmark);
    },
    sync: {
      force: true,
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  },

  production: {
    dialect: "mysql",
    logging: false,
    host: dbHost,
    username: dbUser,
    password: dbPassword,
    database: dbName,
    sync: {
      force: false,
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  },
};
