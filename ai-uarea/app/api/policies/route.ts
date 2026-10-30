import { NextResponse } from "next/server";
import { z } from "zod";
import { updatePolicy } from "@/lib/store";

export const dynamic = "force-dynamic";

const Patch = z.object({
  id: z.string().min(1),
  value: z.union([z.string(), z.number(), z.boolean()]),
});

export async function PATCH(req: Request) {
  const parsed = Patch.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "ข้อมูลไม่ถูกต้อง" }, { status: 400 });
  const policy = await updatePolicy(parsed.data.id, parsed.data.value);
  if (!policy) return NextResponse.json({ error: "policy not found" }, { status: 404 });
  return NextResponse.json({ policy });
}
