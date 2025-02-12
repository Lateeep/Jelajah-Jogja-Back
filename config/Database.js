import { Sequelize } from "sequelize";
import mysql2 from "mysql2";

const db = new Sequelize(
  "jejak_latep",
  "root",
  "",
  {
    host: "localhost",
    dialect: "mysql",
    port: "3306",
    dialectModule: mysql2,
    logging: false
  }
);

export default db;
