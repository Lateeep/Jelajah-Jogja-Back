import { Sequelize } from "sequelize";
import db from "../config/Database.js";
import WisataModel from "./WisataModel.js";

const { DataTypes } = Sequelize;

const HotelModel = db.define(
  "hotel",
  {
    nama: {
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
    },
    max_harga: {
      type: DataTypes.STRING,
      allowNull: true
    },
    type_kamar: {
      type: DataTypes.JSON,
      allowNull: true,
      get() {
        const rawValue = this.getDataValue('type_kamar');
        return rawValue ? (typeof rawValue === 'string' ? JSON.parse(rawValue) : rawValue) : [];
      },
      set(value) {
        this.setDataValue('type_kamar', typeof value === 'string' ? value : JSON.stringify(value));
      }
    },
    fasilitas: {
      type: DataTypes.JSON,
      allowNull: true,
      get() {
        const rawValue = this.getDataValue('fasilitas');
        return rawValue ? (typeof rawValue === 'string' ? JSON.parse(rawValue) : rawValue) : [];
      },
      set(value) {
        this.setDataValue('fasilitas', typeof value === 'string' ? value : JSON.stringify(value));
      }
    },
    latitude: {
      type: DataTypes.STRING,
      allowNull: true
    },
    longitude: {
      type: DataTypes.STRING,
      allowNull: true
    }
  },
  {
    freezeTableName: true
  }
);

WisataModel.hasMany(HotelModel);
HotelModel.belongsTo(WisataModel);

export default HotelModel;
