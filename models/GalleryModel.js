import { Sequelize } from "sequelize";
import db from "../config/Database.js";
import WisataModel from "./WisataModel.js";
const { DataTypes } = Sequelize;

const GalleryModel = db.define(
  "gallery",
  {
    url: {
      type: DataTypes.STRING,
      allowNull: false
    },
    img_id: {
      type: DataTypes.STRING,
      allowNull: false
    }
  },
  {
    freezeTableName: true
  }
);

WisataModel.hasMany(GalleryModel);
GalleryModel.belongsTo(WisataModel);

export default GalleryModel;
