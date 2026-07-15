import { sendTransactionalEmail } from "@/lib/email";

function appUrl() {
  const value = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
  if (!value) throw new Error("NEXT_PUBLIC_APP_URL is not configured.");
  return value;
}

export function sendVerificationEmail(email: string, name: string, token: string) {
  const link = `${appUrl()}/api/auth/verify-email?token=${encodeURIComponent(token)}`;
  return sendTransactionalEmail({
    to: email,
    subject: "Verify your beew.ai account",
    text: `Hi ${name},\n\nVerify your email address to activate your beew.ai account:\n${link}\n\nThis link expires in 24 hours. If you did not create this account, ignore this email.`,
  });
}

export function sendPasswordResetEmail(email: string, name: string, token: string) {
  const link = `${appUrl()}/reset-password?token=${encodeURIComponent(token)}`;
  return sendTransactionalEmail({
    to: email,
    subject: "Reset your beew.ai password",
    text: `Hi ${name},\n\nReset your beew.ai password using this one-time link:\n${link}\n\nThis link expires in 30 minutes. If you did not request this, ignore this email and your password will remain unchanged.`,
  });
}
