import { Sequelize } from "sequelize";
import mysql2 from "mysql2";

const db = new Sequelize(
  "byoxqg1xachfktgnknmc",
  "uknd7wis8uffehgp",
  "svY6NeAfbcKHtNowF71D",
  {
    host: "byoxqg1xachfktgnknmc-mysql.services.clever-cloud.com",
    dialect: "mysql",
    port: "3306",
    dialectModule: mysql2
  }
);

export default db;