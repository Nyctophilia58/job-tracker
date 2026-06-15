import Job from "../models/Job";
import User from "../models/User";
import { sendFollowUpEmail } from "./emailService";

export const checkAndSendReminders = async () => {
  try {
    const now = new Date();
    // find jobs with followUpDate <= now and reminderSent = false
    const dueJobs = await Job.find({
      followUpDate: { $lte: now },
      reminderSent: false,
    });

    if (!dueJobs || dueJobs.length === 0) return;

    for (const job of dueJobs) {
      try {
        const user = await User.findById(job.user);
        if (!user || !user.email) {
          console.warn(`No user/email for job ${job._id}, skipping reminder`);
          continue;
        }

        await sendFollowUpEmail(user.email, {
          company: job.company,
          role: job.role,
          _id: job._id,
          appliedDate: job.appliedDate,
        });

        job.reminderSent = true;
        // optionally set a timestamp
        // job.reminderSentAt = new Date();
        await job.save();
      } catch (err) {
        console.error(`Error sending reminder for job ${job._id}:`, err);
        // don't rethrow; continue with other jobs
      }
    }
  } catch (err) {
    console.error("Failed to check/send reminders:", err);
  }
};

export default checkAndSendReminders;
