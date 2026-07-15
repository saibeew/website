type EmailMessage = { to: string; subject: string; text: string };

export async function sendTransactionalEmail(message: EmailMessage) {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.RESEND_FROM_EMAIL?.trim();
  if (!apiKey || !from) throw new Error("Transactional email is not configured.");

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, to: message.to, subject: message.subject, text: message.text }),
  });

  if (!response.ok) {
    console.error("Transactional email provider rejected a request", response.status);
    throw new Error("Transactional email could not be sent.");
  }
}
