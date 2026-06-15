import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import swaggerUi from "swagger-ui-express";
import { fileURLToPath } from "url";
import { connectDB } from "./config/db";
import { swaggerSpec } from "./config/swagger";
import jobRoutes from "./routes/job.js";
import authRoutes from "./routes/auth.js";
import checkAndSendReminders from "./services/reminderService";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json());

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.use("/api/jobs", jobRoutes);
app.use("/api/auth", authRoutes);

const port = Number(process.env.PORT) || 3000;

app.listen(port, "0.0.0.0", async () => {
  await connectDB();
  console.log(`Server is running on port ${port}`);

  // Start reminders worker if explicitly enabled
  if (process.env.ENABLE_REMINDER_WORKER === "true") {
    try {
      // run immediately on startup
      await checkAndSendReminders();
    } catch (err) {
      console.error("Error running initial reminder sweep:", err);
    }

    const intervalMs = Number(process.env.REMINDER_CHECK_MS) || 1000 * 60 * 60; // default 1 hour
    setInterval(() => {
      void checkAndSendReminders();
    }, intervalMs);
  } else {
    console.log(
      "Reminder worker not enabled. Set ENABLE_REMINDER_WORKER=true to enable it.",
    );
  }
});
