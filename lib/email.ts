import { Resend } from "resend";
import { env } from "./env";

let _resend: Resend | null = null;
function client() {
  if (_resend) return _resend;
  _resend = new Resend(env.resendApiKey());
  return _resend;
}

export type EmailMsg = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

export async function sendEmail(msg: EmailMsg) {
  const r = client();
  const { data, error } = await r.emails.send({
    from: env.resendFromEmail(),
    to: msg.to,
    subject: msg.subject,
    html: msg.html,
    text: msg.text,
  });
  if (error) throw error;
  return data;
}

// ---------- Templates ----------

export function assessmentLinkEmail(params: {
  parentName: string;
  childFirstName: string;
  assessmentUrl: string;
}) {
  const { parentName, childFirstName, assessmentUrl } = params;
  return {
    subject: `Your Hunch assessment link for ${childFirstName}`,
    html: `
      <p>Hi ${escapeHtml(parentName)},</p>
      <p>Thanks for booking a Hunch assessment for <strong>${escapeHtml(
        childFirstName
      )}</strong>. Your payment is confirmed.</p>
      <p><strong>What to do next:</strong></p>
      <ul>
        <li>Have ${escapeHtml(
          childFirstName
        )} take the test on a laptop or tablet (Chrome or Safari works best).</li>
        <li>Pick a quiet 60-minute block. The test itself is ~40 minutes.</li>
        <li>Please don't help with the answers — we want to see what they actually know.</li>
      </ul>
      <p><a href="${assessmentUrl}" style="display:inline-block;background:#2F5FEB;color:#fff;padding:10px 18px;border-radius:8px;text-decoration:none">Open assessment</a></p>
      <p style="color:#6B7280;font-size:13px">Or copy this link: ${assessmentUrl}</p>
      <p>We'll email you the report within 1–2 days after they finish.</p>
      <p>— Hunch</p>
    `,
  };
}

export function reportReadyEmail(params: {
  parentName: string;
  childFirstName: string;
  reportUrl: string;
  calComLink?: string;
}) {
  const { parentName, childFirstName, reportUrl, calComLink } = params;
  return {
    subject: `${childFirstName}'s Hunch report is ready`,
    html: `
      <p>Hi ${escapeHtml(parentName)},</p>
      <p>${escapeHtml(childFirstName)}'s report is ready.</p>
      <p><a href="${reportUrl}" style="display:inline-block;background:#2F5FEB;color:#fff;padding:10px 18px;border-radius:8px;text-decoration:none">View the report</a></p>
      ${
        calComLink
          ? `<p>Please also book your 30-minute consultation: <a href="${calComLink}">${calComLink}</a></p>`
          : ""
      }
      <p>— Hunch</p>
    `,
  };
}

export function adminNewSubmissionEmail(params: {
  childFirstName: string;
  grade: string;
  adminUrl: string;
}) {
  const { childFirstName, grade, adminUrl } = params;
  return {
    subject: `New assessment: ${childFirstName} (Class ${grade})`,
    html: `
      <p>New assessment submitted for <strong>${escapeHtml(
        childFirstName
      )}</strong> (Class ${escapeHtml(grade)}).</p>
      <p><a href="${adminUrl}">Review in admin</a></p>
    `,
  };
}

function escapeHtml(s: string) {
  return s.replace(
    /[&<>"']/g,
    (c) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      }[c]!)
  );
}
