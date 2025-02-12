import { Sequelize } from "sequelize";
import db from "../config/Database.js";

const { DataTypes } = Sequelize;

const WisataModel = db.define(
  "wisata",
  {
    nama: {
      type: DataTypes.STRING,
      allowNull: false
    },
    kategori: {
      type: DataTypes.STRING,
      allowNull: false
    },
    lokasi: {
      type: DataTypes.STRING,
      allowNull: false
    },
    deskripsi: {
      type: DataTypes.STRING,
      allowNull: false
    },
    url: {
      type: DataTypes.STRING,
      allowNull: false
    },
    img_id: {
      type: DataTypes.STRING,
      allowNull: false
    },
    latitude: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    longitude: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    total_rating: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    total_viewers: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  },
  {
    freezeTableName: true
  }
);

export default WisataModel;
