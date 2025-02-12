import { Sequelize } from "sequelize";
import db from "../config/Database.js";

const { DataTypes } = Sequelize;

const HotelBobotModel = db.define(
  "hotel_bobot",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    bobot_harga: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0
    },
    bobot_jarak: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0
    },
    bobot_tipe_kamar: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0
    },
    bobot_fasilitas: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0
    },
    total_bobot: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0
    }
  },
  {
    freezeTableName: true,
    timestamps: false
  }
);

export default HotelBobotModel; 