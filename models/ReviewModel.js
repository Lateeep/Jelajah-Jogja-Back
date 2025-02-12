import { Sequelize } from 'sequelize';
import db from '../config/Database.js';
import WisataModel from './WisataModel.js';
const { DataTypes } = Sequelize;

const ReviewModel = db.define(
  'review',
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    review: {
      type: DataTypes.STRING,
      allowNull: false
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

WisataModel.hasMany(ReviewModel);
ReviewModel.belongsTo(WisataModel);

export default ReviewModel;
