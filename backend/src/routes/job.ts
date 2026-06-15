import { Router } from "express";
import {
  getJobs,
  getJob,
  createJob,
  updateJob,
  deleteJob,
  getStats,
  uploadCV,
  deleteCV,
  sendReminderNow,
} from "../controllers/jobControllers";
import { authMiddleware } from "../middleware/authMiddlewares";
import { upload } from "../config/multer";

const router = Router();

router.use(authMiddleware);

router.get("/", getJobs);
router.get("/stats", getStats);
router.get("/:id", getJob);
router.post("/", createJob);
router.patch("/:id", updateJob);
router.delete("/:id", deleteJob);

router.post("/:id/cv", upload.single("cv"), uploadCV);
router.delete("/:id/cv", deleteCV);

// Manual reminder trigger for a job
router.post("/:id/remind", sendReminderNow);

export default router;
