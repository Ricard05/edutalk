import express from "express";
import QuizAttempt from "../models/QuizAttempt.js";
import Quiz from "../models/Quiz.js"; // Importante: ahora necesitamos leer los datos del Quiz
import { verifyToken } from "../config/jwt.js";

const router = express.Router();

router.post("/", verifyToken, async (req, res) => {
  try {
    const { quiz_id, student_id, responses, time_taken_minutes } = req.body;

    if (!quiz_id || !student_id || !responses || !Array.isArray(responses)) {
      return res
        .status(400)
        .json({
          error: "Datos incompletos o inválidos para crear el intento.",
        });
    }

    // 1. Verificar si ya existe un intento
    const existingAttempt = await QuizAttempt.findOne({
      where: {
        quiz_id,
        student_id,
      },
    });

    if (existingAttempt) {
      return res
        .status(409)
        .json({
          error: "Ya existe un intento para este quiz por este estudiante.",
        });
    }

    // 2. Buscar el quiz
    const quiz = await Quiz.findByPk(quiz_id);
    if (!quiz) return res.status(404).json({ error: "Quiz no encontrado" });

    const quizQuestions = quiz.questions;

    // 3. Calcular el score
    let totalQuestions = quizQuestions.length;
    let correctAnswers = 0;

    responses.forEach((response) => {
      const question = quizQuestions.find(
        (q) => q.question_text === response.question_text
      );
      if (question && response.student_answer != null) {
        if (
          question.type === "multiple_choice" ||
          question.type === "open_ended"
        ) {
          if (
            response.student_answer.trim().toLowerCase() ===
            question.correct_answer.trim().toLowerCase()
          ) {
            correctAnswers++;
          }
        }
      }
    });

    const score = (correctAnswers / totalQuestions) * 100;

    // 4. Crear el nuevo intento
    const attempt = await QuizAttempt.create({
      quiz_id,
      student_id,
      responses,
      score,
      time_taken_minutes,
      submitted_at: new Date(),
    });

    res.status(201).json(attempt);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener todos los intentos de un quiz
router.get("/quiz/:quiz_id", verifyToken, async (req, res) => {
  try {
    const attempts = await QuizAttempt.findAll({
      where: { quiz_id: req.params.quiz_id },
    });

    res.json(attempts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener todos los intentos de un estudiante
router.get("/student/:student_id", verifyToken, async (req, res) => {
  try {
    const attempts = await QuizAttempt.findAll({
      where: { student_id: req.params.student_id },
    });

    res.json(attempts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener un intento por ID
router.get("/:id", verifyToken, async (req, res) => {
  try {
    const attempt = await QuizAttempt.findByPk(req.params.id);
    if (!attempt)
      return res.status(404).json({ error: "Intento no encontrado" });

    res.json(attempt);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
