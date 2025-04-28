import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Quiz = sequelize.define(
  "Quiz",
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },

    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    class_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "courses",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },

    questions: {
      type: DataTypes.JSONB,
      allowNull: false,
    },

    start_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    end_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    time_limit_minutes: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    feedback_enabled: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },

    createdAt: {
      type: DataTypes.DATE,
      defaultValue: Date.now(),
      allowNull: false,
    },
  },
  {
    timestamps: false,
    tableName: "quizzes",
  }
);

export default Quiz;
