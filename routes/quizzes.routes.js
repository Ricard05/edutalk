import express from "express";
import Quiz from "../models/Quiz.js";
import { verifyToken } from "../config/jwt.js";

const router = express.Router();

// Crear un nuevo quiz
router.post("/", verifyToken, async (req, res) => {
  try {
    const { 
      title, 
      class_id, 
      questions, 
      start_date, 
      end_date, 
      time_limit_minutes, 
      feedback_enabled 
    } = req.body;

    // Validar que manden preguntas
    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ error: "Debes enviar al menos una pregunta para crear el quiz." });
    }

    const quiz = await Quiz.create({
      title,
      class_id,
      questions,
      start_date,
      end_date,
      time_limit_minutes,
      feedback_enabled,
      createdAt: new Date(),
    });

    res.status(201).json(quiz);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener todos los quizzes
router.get("/", verifyToken, async (req, res) => {
  try {
    const { class_id } = req.query;

    const where = {};
    if (class_id) where.class_id = class_id;

    const quizzes = await Quiz.findAll({ where });

    res.json(quizzes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener un quiz por ID
router.get("/:id", verifyToken, async (req, res) => {
  try {
    const quiz = await Quiz.findByPk(req.params.id);
    if (!quiz) return res.status(404).json({ error: "Quiz no encontrado" });

    res.json(quiz);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Actualizar un quiz
router.put("/:id", verifyToken, async (req, res) => {
  try {
    const quiz = await Quiz.findByPk(req.params.id);
    if (!quiz) return res.status(404).json({ error: "Quiz no encontrado" });

    const { title, questions, start_date, end_date, time_limit_minutes, feedback_enabled } = req.body;

    // Validar si envían questions que siga siendo un array
    if (questions && (!Array.isArray(questions) || questions.length === 0)) {
      return res.status(400).json({ error: "Si actualizas questions debe ser un arreglo válido con al menos una pregunta." });
    }

    await quiz.update({
      title,
      questions,
      start_date,
      end_date,
      time_limit_minutes,
      feedback_enabled,
    });

    res.json({ message: "Quiz actualizado correctamente", quiz });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Eliminar un quiz
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const deleted = await Quiz.destroy({ where: { id: req.params.id } });
    if (!deleted) return res.status(404).json({ error: "Quiz no encontrado" });

    res.json({ message: "Quiz eliminado correctamente" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
