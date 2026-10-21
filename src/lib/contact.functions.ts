import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { publicSupabase } from "./supabase-public.server";

const contactSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  subject: z.string().trim().min(2).max(150),
  message: z.string().trim().min(10).max(2000),
});

export const enviarConsulta = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => contactSchema.parse(input))
  .handler(async ({ data }) => {
    const supabase = publicSupabase();
    const { error } = await supabase.from("contact_messages").insert({
      name: data.name,
      email: data.email,
      phone: data.phone || null,
      subject: data.subject,
      message: data.message,
    });
    if (error) throw new Error("No se pudo enviar la consulta.");
    return { ok: true };
  });
