import { Sequelize } from "sequelize";
import db from "../config/Database.js";
import HotelModel from "./HotelModel.js";
const { DataTypes } = Sequelize;

const ReviewHotelModel = db.define(
  "review_hotel",
  {
    name: {
      type: DataTypes.STRING,
      allowNull: true
    },
    review: {
      type: DataTypes.STRING,
      allowNull: true
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    date: {
      type: DataTypes.DATE,
      allowNull: true
    }
  },
  {
    freezeTableName: true
  }
);

HotelModel.hasMany(ReviewHotelModel);
ReviewHotelModel.belongsTo(HotelModel);

export default ReviewHotelModel;
