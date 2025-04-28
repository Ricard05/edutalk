import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import userRoutes from "./routes/user.routes.js";
import authRoutes from "./routes/auth.routes.js";
import teacherRoutes from "./routes/teacher.routes.js";
import messageRoutes from "./routes/message.routes.js";
import conversationRoutes from "./routes/conversation.routes.js";
import assignmentRoutes from "./routes/assigment.routes.js";
import courseRoutes from "./routes/course.routes.js";
import enrollmentRoutes from "./routes/enrollment.routes.js";
import submissionRoutes from "./routes/submission.routes.js";
import commentsRoutes from "./routes/comment.routes.js";
import quizzesRoutes from "./routes/quizzes.routes.js";
import quizAttemptsRoutes from "./routes/quizAttempts.routes.js";
import sequelize from "./config/db.js";
import "./models/User.js";
import "./models/Conversation.js";
import "./models/Message.js";
import "./models/Student.js";
import "./models/Teacher.js";
import "./models/Assignment.js";
import "./models/Course.js";
import "./models/Enrollment.js";
import "./models/Submission.js";
import "./models/Comment.js";
import "./models/Quiz.js";
import "./models/QuizAttempt.js";
import dotenv from "dotenv";
import Message from "./models/Message.js";

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  req.io = io;
  next();
});

//Routes
app.use("/api/user/", userRoutes);
app.use("/api/auth/", authRoutes);
app.use("/api/teacher/", teacherRoutes);
app.use("/api/message/", messageRoutes);
app.use("/api/conversation/", conversationRoutes);
app.use("/api/assignment/", assignmentRoutes);
app.use("/api/course/", courseRoutes);
app.use("/api/enrollment/", enrollmentRoutes);
app.use("/api/submission/", submissionRoutes);
app.use("/api/comments/", commentsRoutes);
app.use("/api/quizzes/", quizzesRoutes);
app.use("/api/quiz-attempts/", quizAttemptsRoutes);

io.on("connection", (socket) => {
  console.log("Client connected: ", socket.io);

  socket.on("chat.message.state", async (data) => {
    try {
      const { message_id, state } = data;

      // Actualizar en la base de datos
      const message = await Message.findByPk(message_id);
      if (message) {
        message.state = state;
        await message.save();

        // Re-emitir a todos los clientes
        io.emit("chat.message.state", data);
      }
    } catch (error) {
      console.error("Error actualizando estado del mensaje:", error);
    }
  });

  socket.on("disconnect", () => {
    console.log("Cliente desconectado:", socket.id);
  });
});

const startServer = async () => {
  try {
    await sequelize.sync({ alter: true });
    console.log("Connected to db");

    server.listen(PORT, () => console.log(`Server running on ${PORT}`));
  } catch (error) {
    console.error("Error running server:", error);
  }
};

startServer();
