import express from "express";
import Assignment from "../models/Assignment.js";
import Course from "../models/Course.js";
import User from "../models/User.js";
import { verifyToken } from "../config/jwt.js";
import { Op } from "sequelize";

const router = express.Router();

router.get("/:id", verifyToken, async (req, res) => {
  try {
    // Buscar la tarea por el id
    const assignment = await Assignment.findByPk(req.params.id);
    if (!assignment)
      return res.status(404).json({ error: "Tarea no encontrada" });

    // Obtener el course_id (id de la clase) y teacher_id (id del maestro) de la tarea
    const { course_id } = assignment;

    // Buscar los datos de la clase usando el course_id
    const course = await Course.findByPk(course_id); // Suponiendo que tienes un modelo Course
    if (!course) return res.status(404).json({ error: "Clase no encontrada" });

    // Obtener el course_id (id de la clase) y teacher_id (id del maestro) de la tarea
    const { teacher_id } = course;

    // Buscar los datos del maestro usando el teacher_id
    const teacher = await User.findByPk(teacher_id); // Suponiendo que tienes un modelo Teacher
    if (!teacher)
      return res.status(404).json({ error: "Maestro no encontrado" });

    // Devolver la tarea junto con la información adicional de la clase y el maestro
    res.json({
      ...assignment.toJSON(),
      courseName: course.name, // Asegúrate de que "name" es el campo correcto para el nombre de la clase
      teacherName: `${teacher.name} ${teacher.lastname}`, // Asegúrate de que "name" es el campo correcto para el nombre del maestro
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/course/:course_id", verifyToken, async (req, res) => {
  try {
    const assignments = await Assignment.findAll({
      where: { course_id: req.params.course_id },
    });
    res.json(assignments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/", verifyToken, async (req, res) => {
  try {
    const {
      title,
      description,
      course_id,
      delivery_date,
      file_url,
      assignment_type,
      quiz_id,
    } = req.body;

    // Validar tipo de tarea
    if (!assignment_type) {
      return res
        .status(400)
        .json({ error: "assignment_type is required (file or quiz)" });
    }

    if (assignment_type === "quiz") {
      if (!quiz_id) {
        return res
          .status(400)
          .json({ error: "Quiz ID is required for quiz assignments." });
      }
    }

    const assignment = await Assignment.create({
      title,
      description,
      course_id,
      delivery_date,
      createdAt: new Date(),
      file_url,
      assignment_type,
      quiz_id,
      status: true,
    });

    res.status(201).json(assignment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put("/:id", verifyToken, async (req, res) => {
  try {
    const { title, description, delivery_date, status } = req.body;
    const assignment = await Assignment.findByPk(req.params.id);

    if (!assignment)
      return res.status(404).json({ error: "Tarea no encontrada" });

    await assignment.update({
      title,
      description,
      delivery_date,
      status,
    });

    res.json({ message: "Tarea actualizada correctamente", assignment });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const deleted = await Assignment.destroy({
      where: { id: req.params.id },
    });

    if (!deleted) return res.status(404).json({ error: "Tarea no encontrada" });

    res.json({ message: "Tarea eliminada correctamente" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.patch("/status/:id", verifyToken, async (req, res) => {
  try {
    const { status } = req.body;
    const assignment = await Assignment.findByPk(req.params.id);

    if (!assignment)
      return res.status(404).json({ error: "Tarea no encontrada" });

    await assignment.update({ status });

    res.json({
      message: "Estado de la tarea actualizado correctamente",
      assignment,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
