import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser, serverErrorResponse, unauthorizedResponse } from "@/lib/auth/user";
import { getSql } from "@/lib/postgres/client";

export const dynamic = "force-dynamic";

const cloneSchema = z.object({
  name: z.string().min(1),
  risk: z.enum(["Low", "Medium", "High"]).default("Medium"),
  description: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorizedResponse();

    const input = cloneSchema.parse(await request.json());
    const [strategy] = await getSql()`
      insert into strategies (user_id, name, risk, description, active)
      values (${user.id}, ${input.name + " (Clone)"}, ${input.risk}, ${input.description || "Cloned strategy"}, false)
      returning id, created_at, name, description, risk, active, roi, pairs
    `;

    return NextResponse.json({ strategy }, { status: 201 });
  } catch (error) {
    return serverErrorResponse(error);
  }
}
