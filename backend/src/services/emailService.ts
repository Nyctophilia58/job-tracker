import { Resend } from "resend";

let resend: Resend | null = null;

const getResend = () => {
  if (!resend) {
    const key = process.env.RESEND_API_KEY;
    if (!key) {
      throw new Error("RESEND_API_KEY is not set in environment variables");
    }
    resend = new Resend(key);
  }
  return resend;
};

export const sendResetEmail = async (email: string, resetUrl: string) => {
  // Always log the URL as a fallback
  console.log(`Password reset URL: ${resetUrl}`);

  const client = getResend();
  await client.emails.send({
    from: "JobTracker <onboarding@resend.dev>",
    to: email,
    subject: "JobTracker - Reset Your Password",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #3b82f6;">JobTracker</h2>
        <p>You requested a password reset.</p>
        <p>Click the button below to reset your password. This link expires in 15 minutes.</p>
        <a href="${resetUrl}" style="display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 16px 0;">Reset Password</a>
        <p style="color: #999; font-size: 13px; word-break: break-all; margin-top: 16px;">If the button doesn't work, copy this link:<br/>${resetUrl}</p>
        <p style="color: #666; font-size: 14px;">If you didn't request this, you can ignore this email.</p>
      </div>
    `,
  });
};

export const sendFollowUpEmail = async (
  to: string,
  job: { company: string; role: string; _id: any; appliedDate?: string | Date },
) => {
  // If RESEND_API_KEY is not configured, log the reminder instead of throwing
  if (!process.env.RESEND_API_KEY) {
    console.log(
      `(No RESEND_API_KEY) Reminder for ${to}: ${job.role} @ ${job.company} (job ${job._id})`,
    );
    return;
  }

  const client = getResend();
  const jobUrl = process.env.FRONTEND_URL
    ? `${process.env.FRONTEND_URL}/jobs/${job._id}`
    : `http://localhost:5173/jobs`;

  const applied = job.appliedDate
    ? new Date(job.appliedDate).toLocaleDateString()
    : "-";

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #3b82f6;">JobTracker — Follow-up Reminder</h2>
      <p>This is a reminder to follow up on your application:</p>
      <ul style="font-size:14px;">
        <li><strong>Company:</strong> ${job.company}</li>
        <li><strong>Role:</strong> ${job.role}</li>
        <li><strong>Applied:</strong> ${applied}</li>
      </ul>
      <p style="margin-top:12px;">
        <a href="${jobUrl}" style="display:inline-block;background:#3b82f6;color:white;padding:10px 16px;border-radius:8px;text-decoration:none;">Open in JobTracker</a>
      </p>
      <p style="color:#666;font-size:13px;margin-top:14px;">If you already followed up, you can ignore this reminder.</p>
    </div>
  `;

  try {
    await client.emails.send({
      from: "JobTracker <onboarding@resend.dev>",
      to,
      subject: `Reminder: follow up on ${job.role} @ ${job.company}`,
      html,
    });
    console.log(`Reminder sent to ${to} for job ${job._id}`);
  } catch (err) {
    console.error("Failed to send reminder email:", err);
    throw err;
  }
};
