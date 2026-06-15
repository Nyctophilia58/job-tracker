import Job from "../models/Job";
import User from "../models/User";
import { Request, Response } from "express";
import { JwtPayload } from "jsonwebtoken";
import { Types } from "mongoose";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { sendFollowUpEmail } from "../services/emailService";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const getUserId = (req: Request): string => {
  return (req.user as JwtPayload).id;
};

export const getJobs = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = getUserId(req);
    const {
      status,
      sort,
      search,
      page: pageQuery,
      limit: limitQuery,
      tag,
    } = req.query;

    const page = Number(pageQuery) || 1;
    const limit = Number(limitQuery) || 10;

    const filter: Record<string, unknown> = { user: userId };
    if (status) filter.status = status;

    if (search) {
      filter.$or = [
        { company: { $regex: search, $options: "i" } },
        { role: { $regex: search, $options: "i" } },
      ];
    }

    if (tag) {
      filter.tags = { $in: [tag] };
    }

    const sortOption: Record<string, 1 | -1> =
      sort === "oldest" ? { appliedDate: 1 } : { appliedDate: -1 };

    const total = await Job.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);
    const jobs = await Job.find(filter)
      .sort(sortOption)
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({ jobs, total, page, totalPages });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
};

export const getJob = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = getUserId(req);
    const job = await Job.findOne({ _id: req.params.id, user: userId });

    if (!job) {
      res.status(404).json({ error: "Job not found" });
      return;
    }

    res.json(job);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
};

export const createJob = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = getUserId(req);
    const {
      company,
      role,
      status,
      appliedDate,
      jobUrl,
      salary,
      notes,
      cv,
      tags,
      followUpDate,
    } = req.body;

    if (!company || !role) {
      res.status(400).json({ error: "Company and role are required" });
      return;
    }

    const initialStatus = status || "applied";
    const initialDate = appliedDate ? new Date(appliedDate) : new Date();

    const job = new Job({
      company,
      role,
      status: initialStatus,
      appliedDate,
      jobUrl,
      salary,
      notes,
      cv,
      tags,
      followUpDate,
      timeline: [{ status: initialStatus, date: initialDate }],
      user: userId,
    });

    await job.save();
    res.status(201).json(job);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
};

export const updateJob = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = getUserId(req);

    const job = await Job.findOne({ _id: req.params.id, user: userId });
    if (!job) {
      res.status(404).json({ error: "Job not found" });
      return;
    }

    const oldStatus = job.status;
    const oldFollowUp = job.followUpDate
      ? new Date(job.followUpDate).getTime()
      : null;

    // Apply updates from body
    job.set(req.body);

    // If followUpDate changed, reset reminderSent so we can send the new reminder later
    if (Object.prototype.hasOwnProperty.call(req.body, "followUpDate")) {
      const newFollowUp = job.followUpDate
        ? new Date(job.followUpDate).getTime()
        : null;
      if (newFollowUp !== oldFollowUp) {
        job.reminderSent = false;
      }
    }

    const newStatus = job.status;
    if (newStatus && newStatus !== oldStatus) {
      job.timeline = job.timeline || [];
      job.timeline.push({ status: newStatus, date: new Date() });
    }

    await job.save();
    res.json(job);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
};

export const deleteJob = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = getUserId(req);

    const job = await Job.findOneAndDelete({
      _id: req.params.id,
      user: userId,
    });

    if (!job) {
      res.status(404).json({ error: "Job not found" });
      return;
    }

    res.json({ message: "Job deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
};

export const sendReminderNow = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const userId = getUserId(req);
    const job = await Job.findOne({ _id: req.params.id, user: userId });

    if (!job) {
      res.status(404).json({ error: "Job not found" });
      return;
    }

    const user = await User.findById(userId);
    if (!user || !user.email) {
      res.status(400).json({ error: "No email found for user" });
      return;
    }

    await sendFollowUpEmail(user.email, {
      company: job.company,
      role: job.role,
      _id: job._id,
      appliedDate: job.appliedDate,
    });

    job.reminderSent = true;
    await job.save();

    res.json({ message: "Reminder sent" });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
};

export const getStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const rawId = getUserId(req);
    const userId = new Types.ObjectId(rawId);

    const statusCounts = await Job.aggregate([
      { $match: { user: userId } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyApplications = await Job.aggregate([
      {
        $match: {
          user: userId,
          appliedDate: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$appliedDate" },
            month: { $month: "$appliedDate" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    const twelveWeeksAgo = new Date();
    twelveWeeksAgo.setDate(twelveWeeksAgo.getDate() - 12 * 7);

    const weeklyApplications = await Job.aggregate([
      {
        $match: {
          user: userId,
          appliedDate: { $gte: twelveWeeksAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $isoWeekYear: "$appliedDate" },
            week: { $isoWeek: "$appliedDate" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.week": 1 } },
    ]);

    const yearlyApplications = await Job.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: { year: { $year: "$appliedDate" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1 } },
    ]);

    const total = await Job.countDocuments({ user: userId });

    const respondedCount =
      statusCounts
        .filter((s) => s._id !== "applied")
        .reduce((sum, s) => sum + s.count, 0) ?? 0;

    const responseRate =
      total > 0 ? Math.round((respondedCount / total) * 1000) / 10 : 0;

    const offeredCount =
      statusCounts.find((s) => s._id === "offered")?.count ?? 0;
    const offerRate =
      total > 0 ? Math.round((offeredCount / total) * 1000) / 10 : 0;

    const rejectedCount =
      statusCounts.find((s) => s._id === "rejected")?.count ?? 0;
    const rejectionRate =
      total > 0 ? Math.round((rejectedCount / total) * 1000) / 10 : 0;

    const responseTimeResult = await Job.aggregate([
      {
        $match: {
          user: userId,
          status: { $ne: "applied" },
        },
      },
      {
        $group: {
          _id: null,
          avgDays: {
            $avg: {
              $divide: [
                { $subtract: ["$createdAt", "$appliedDate"] },
                1000 * 60 * 60 * 24,
              ],
            },
          },
        },
      },
    ]);

    const averageResponseTime =
      responseTimeResult.length > 0
        ? Math.round(responseTimeResult[0].avgDays * 10) / 10
        : 0;

    res.json({
      total,
      statusCounts,
      monthlyApplications,
      weeklyApplications,
      yearlyApplications,
      responseRate,
      offerRate,
      rejectionRate,
      averageResponseTime,
    });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
};

export const uploadCV = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = getUserId(req);
    const file = req.file;

    if (!file) {
      res.status(400).json({ error: "No file uploaded" });
      return;
    }

    const job = await Job.findOne({ _id: req.params.id, user: userId });

    if (!job) {
      fs.unlinkSync(file.path);
      res.status(404).json({ error: "Job not found" });
      return;
    }

    if (job.cv) {
      const oldFilePath = path.join(
        __dirname,
        "../../uploads",
        path.basename(job.cv),
      );
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
      }
    }

    const cvUrl = `/uploads/${file.filename}`;
    job.cv = cvUrl;
    await job.save();

    res.json({ message: "CV uploaded successfully", cvUrl });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
};

export const deleteCV = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = getUserId(req);

    const job = await Job.findOne({ _id: req.params.id, user: userId });

    if (!job) {
      res.status(404).json({ error: "Job not found" });
      return;
    }

    if (!job.cv) {
      res.status(400).json({ error: "No CV attached to this job" });
      return;
    }

    const filePath = path.join(
      __dirname,
      "../../uploads",
      path.basename(job.cv),
    );
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    job.cv = undefined;
    await job.save();

    res.json({ message: "CV deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
};
