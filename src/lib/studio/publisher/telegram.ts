export async function publishToTelegram(params: {
  mediaUrl?: string;
  caption?: string;
}): Promise<{ success: boolean; externalId?: string; error?: string }> {
  const token = process.env.TELEGRAM_BOT_TOKEN?.trim().replace(/^["']|["']$/g, "").replace(/^bot/i, "");
  const chatId = process.env.TELEGRAM_CHAT_ID?.trim().replace(/^["']|["']$/g, "");

  if (!token || !chatId) {
    console.error("[Publisher] Telegram credentials are missing.");
    return {
      success: false,
      error: "Telegram publishing is not configured.",
    };
  }

  try {
    const mediaUrl = params.mediaUrl?.trim();
    const isPublicMediaUrl = Boolean(mediaUrl && /^https?:\/\//i.test(mediaUrl));
    const isVideo = isPublicMediaUrl && mediaUrl?.match(/\.(mp4|mov|avi|webm)(?:\?.*)?$/i);
    const isPhoto = isPublicMediaUrl && mediaUrl?.match(/\.(jpg|jpeg|png|webp)(?:\?.*)?$/i);
    const localMediaNote = mediaUrl && !isPublicMediaUrl ? `\n\nMedia output: ${mediaUrl}` : "";
    
    let url = `https://api.telegram.org/bot${token}/sendMessage`;
    const body: Record<string, string> = { chat_id: chatId };

    if (isVideo) {
      url = `https://api.telegram.org/bot${token}/sendVideo`;
      body.video = mediaUrl!;
      body.caption = params.caption || "";
    } else if (isPhoto) {
      url = `https://api.telegram.org/bot${token}/sendPhoto`;
      body.photo = mediaUrl!;
      body.caption = params.caption || "";
    } else {
      body.text = `${params.caption || "Beew Studio Update"}${localMediaNote}`;
    }

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    if (!res.ok || !data.ok) {
      throw new Error(data.description || `HTTP ${res.status}`);
    }

    return {
      success: true,
      externalId: String(data.result.message_id),
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[Publisher] Telegram publish failed:", message);
    return {
      success: false,
      error: message,
    };
  }
}
