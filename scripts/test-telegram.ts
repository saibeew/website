import dotenv from "dotenv";

dotenv.config({ path: ".env.local", override: true });

function normalizeToken(raw?: string) {
  return (raw || "").trim().replace(/^["']|["']$/g, "").replace(/^bot/i, "");
}

function normalizeChatId(raw?: string) {
  return (raw || "").trim().replace(/^["']|["']$/g, "");
}

async function main() {
  const token = normalizeToken(process.env.TELEGRAM_BOT_TOKEN);
  const chatId = normalizeChatId(process.env.TELEGRAM_CHAT_ID);

  console.log("TELEGRAM_BOT_TOKEN:", token ? `configured, length=${token.length}` : "missing");
  console.log("TELEGRAM_CHAT_ID:", chatId ? `configured, length=${chatId.length}` : "missing");

  if (!token || !chatId) {
    process.exitCode = 1;
    return;
  }

  const botRes = await fetch(`https://api.telegram.org/bot${token}/getMe`);
  const botData = await botRes.json();
  console.log("getMe:", JSON.stringify({ ok: botData.ok, description: botData.description, username: botData.result?.username }, null, 2));

  if (!botData.ok) {
    console.log("Fix TELEGRAM_BOT_TOKEN first. Get a fresh token from @BotFather.");
    process.exitCode = 1;
    return;
  }

  const messageRes = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text: "BEEW Studio Telegram test message.",
    }),
  });
  const messageData = await messageRes.json();
  console.log(
    "sendMessage:",
    JSON.stringify({ ok: messageData.ok, description: messageData.description, message_id: messageData.result?.message_id }, null, 2)
  );

  if (!messageData.ok) {
    console.log("If this is a channel/group, add the bot there and grant permission to post.");
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
