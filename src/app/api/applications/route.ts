import { NextResponse } from "next/server";
import { z } from "zod";
import { getSql, isPostgresConfigured } from "@/lib/postgres/client";
import { databaseUnavailableResponse, serverErrorResponse } from "@/lib/auth/user";

export const dynamic = "force-dynamic";

const applicationSchema = z.object({
  name: z.string().trim().min(2, "Name is required"),
  email: z.string().trim().email("A valid email is required"),
  country: z.string().trim().min(2, "Country is required"),
  broker: z.string().trim().optional().default(""),
  accountSize: z.enum(["Under $25K", "$25K-$50K", "$50K-$100K", "$100K-$250K", "$250K+"]),
});

async function ensureLeadApplicationsTable() {
  await getSql().unsafe(`
    create table if not exists public.beta_applications (
      id uuid primary key default gen_random_uuid(),
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now(),
      name text not null,
      email text not null,
      country text not null,
      broker text,
      account_size text not null,
      status text not null default 'pending',
      source text not null default 'landing_page'
    );
    create unique index if not exists beta_applications_email_unique_idx on public.beta_applications (email);
    create index if not exists beta_applications_created_idx on public.beta_applications (created_at desc);
  `);
}

async function sendConfirmationEmail(input: z.infer<typeof applicationSchema>) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return;

  const from = process.env.RESEND_FROM_EMAIL || "beew.ai <onboarding@resend.dev>";
  const telegramUrl = process.env.TELEGRAM_WAR_ROOM_URL || "https://t.me/";
  const platformUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: input.email.toLowerCase(),
        subject: "Your beew.ai application received",
        text: [
          `Hi ${input.name},`,
          "",
          "Thanks for applying for beew.ai founding access. We will review your application within 24 hours.",
          "",
          `Telegram war room: ${telegramUrl}`,
          `Forward-test platform: ${platformUrl}`,
          "",
          "beew.ai is a software vendor, not a financial adviser. Trading involves risk.",
        ].join("\n"),
      }),
    });
  } catch (error) {
    console.error("Application confirmation email failed:", error);
  }
}

export async function POST(request: Request) {
  try {
    if (!isPostgresConfigured()) return databaseUnavailableResponse();

    const input = applicationSchema.parse(await request.json());
    const sql = getSql();
    await ensureLeadApplicationsTable();

    const [existing] = await sql`
      select id from beta_applications where email = ${input.email.toLowerCase()} limit 1
    `;

    if (existing) {
      return NextResponse.json({ error: "You've already applied. Check your inbox." }, { status: 409 });
    }

    const [application] = await sql`
      insert into beta_applications (name, email, country, broker, account_size)
      values (${input.name}, ${input.email.toLowerCase()}, ${input.country}, ${input.broker || null}, ${input.accountSize})
      returning id, status
    `;

    await sendConfirmationEmail(input);

    return NextResponse.json({ success: true, applicationId: application.id, status: application.status }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message || "Invalid application data" }, { status: 400 });
    }
    return serverErrorResponse(error);
  }
}
