import express from "express";
import Submission from "../models/Submission.js";
import { verifyToken } from "../config/jwt.js";

const router = express.Router();

// Obtener todas las entregas de un estudiante
router.get("/student/:student_id", verifyToken, async (req, res) => {
  try {
    const submissions = await Submission.findAll({
      where: { student_id: req.params.student_id },
    });
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener todas las entregas de una tarea (assignment)
router.get("/assignment/:assignment_id", verifyToken, async (req, res) => {
  try {
    const submissions = await Submission.findAll({
      where: { assignment_id: req.params.assignment_id },
    });
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener la entrega de un estudiante específico para una tarea específica
router.get("/student/:student_id/assignment/:assignment_id", verifyToken, async (req, res) => {
  try {
    const { student_id, assignment_id } = req.params;

    // Buscar la entrega específica
    const submission = await Submission.findOne({
      where: { student_id, assignment_id },
    });

    if (!submission) {
      return res.status(404).json({ error: "Entrega no encontrada" });
    }

    res.json(submission);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// Obtener una entrega específica
router.get("/:id", verifyToken, async (req, res) => {
  try {
    const submission = await Submission.findByPk(req.params.id);
    if (!submission) return res.status(404).json({ error: "Entrega no encontrada" });
    res.json(submission);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Crear una nueva entrega de tarea
router.post("/", verifyToken, async (req, res) => {
  try {
    const { student_id, assignment_id, file_url } = req.body;

    const submission = await Submission.create({
      student_id,
      assignment_id,
      file_url,
      createdAt: new Date(),
    });

    res.status(201).json(submission);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Actualizar calificación de una entrega
router.patch("/:id", verifyToken, async (req, res) => {
  try {
    const { grade, status } = req.body; 

    const submission = await Submission.findByPk(req.params.id);

    if (!submission) return res.status(404).json({ error: "Entrega no encontrada" });

    await submission.update({ grade, status });

    res.json({ message: "Entrega actualizada correctamente", submission });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Eliminar una entrega
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const deleted = await Submission.destroy({
      where: { id: req.params.id },
    });

    if (!deleted) return res.status(404).json({ error: "Entrega no encontrada" });

    res.json({ message: "Entrega eliminada correctamente" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/check-submission", verifyToken, async (req, res) => {
  try {
    const { student_id, assignment_id } = req.query;  // Recibimos los parámetros en la query

    // Verificamos si ya existe una entrega para ese estudiante y tarea
    const submission = await Submission.findOne({
      where: { student_id, assignment_id },
    });

    if (submission) {
      // Si existe la entrega, devolvemos un mensaje indicando que ya entregó la tarea
      return res.json({ submitted: true, submission });
    }

    // Si no existe, devolvemos false
    res.json({ submitted: false });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
