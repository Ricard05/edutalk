import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const QuizAttempt = sequelize.define(
  "QuizAttempt",
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },

    quiz_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "quizzes",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },

    student_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "students", // Asegúrate que tengas la tabla "students"
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },

    responses: {
      type: DataTypes.JSONB,
      allowNull: false,
      // responses será un array de objetos tipo:
      // { question_text: "Pregunta 1", student_answer: "Respuesta del alumno" }
    },

    score: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },

    submitted_at: {
      type: DataTypes.DATE,
      defaultValue: Date.now(),
      allowNull: false,
    },

    time_taken_minutes: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    timestamps: false,
    tableName: "quiz_attempts",
  }
);

export default QuizAttempt;
