import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Mail, MapPin, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EMPRESA } from "@/lib/site";
import { enviarConsulta } from "@/lib/contact.functions";

export const Route = createFileRoute("/contacto")({
  head: () => ({
    meta: [
      { title: "Contacto | Urban Print Orihuela" },
      {
        name: "description",
        content:
          "Contacta con Urban Print en Calle Comunidad Valenciana 2, Orihuela. Presupuestos de impresión sin compromiso.",
      },
      { property: "og:title", content: "Contacto | Urban Print Orihuela" },
      { property: "og:description", content: "Escríbenos y te preparamos un presupuesto a medida." },
    ],
  }),
  component: ContactoPage,
});

const schema = z.object({
  name: z.string().trim().min(2, "Indica tu nombre").max(100),
  email: z.string().trim().email("Email no válido").max(255),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  subject: z.string().trim().min(2, "Indica el asunto").max(150),
  message: z.string().trim().min(10, "Cuéntanos algo más (mín. 10 caracteres)").max(2000),
});

function ContactoPage() {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [enviando, setEnviando] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const parsed = schema.safeParse(Object.fromEntries(new FormData(form)));
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) next[String(issue.path[0])] = issue.message;
      setErrors(next);
      return;
    }
    setErrors({});
    setEnviando(true);
    try {
      await enviarConsulta({ data: parsed.data });
      form.reset();
      toast.success("Consulta enviada. Te responderemos lo antes posible.");
    } catch {
      toast.error("No se ha podido enviar la consulta.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="w-full px-4 py-12">
      <div className="mx-auto max-w-7xl">
        <h1 className="font-display text-3xl tracking-tight uppercase md:text-4xl">Contacto</h1>
        <span className="mt-2 block h-0.5 w-12 bg-primary" />
        <p className="mt-4 max-w-2xl text-muted-foreground">
          Cuéntanos tu proyecto y te preparamos un presupuesto sin compromiso.
        </p>

        <div className="mt-10 grid gap-12 lg:grid-cols-[1.3fr_1fr]">
          <form onSubmit={onSubmit} className="space-y-5" noValidate>
            <div className="grid gap-5 sm:grid-cols-2">
              <Campo id="name" label="Nombre" error={errors['name']} />
              <Campo id="email" label="Email" type="email" error={errors['email']} />
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <Campo id="phone" label="Teléfono (opcional)" error={errors['phone']} />
              <Campo id="subject" label="Asunto" error={errors['subject']} />
            </div>
            <div>
              <label htmlFor="message" className="font-display text-xs tracking-widest uppercase">
                Mensaje
              </label>
              <textarea
                id="message"
                name="message"
                rows={6}
                maxLength={2000}
                className="mt-2 w-full border border-input bg-background p-3 text-sm outline-none focus:border-primary"
                aria-invalid={Boolean(errors['message'])}
              />
              {errors['message'] && <p className="mt-1 text-xs text-primary">{errors['message']}</p>}
            </div>
            <Button type="submit" size="lg" disabled={enviando}>
              {enviando ? "Enviando…" : "Enviar consulta"}
            </Button>
          </form>

          <aside className="space-y-6">
            <div className="border border-border p-6">
              <h2 className="font-display text-lg tracking-wide uppercase">Datos de contacto</h2>
              <span className="mt-2 block h-0.5 w-10 bg-primary" />
              <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
                <li className="flex gap-2">
                  <MapPin className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                  <span>{EMPRESA.direccion}</span>
                </li>
                <li className="flex gap-2">
                  <Phone className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                  <a href={`tel:${EMPRESA.telefonoLink}`} className="hover:text-primary">
                    {EMPRESA.telefono}
                  </a>
                </li>
                {EMPRESA.emails.map((email) => (
                  <li key={email} className="flex gap-2">
                    <Mail className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                    <a href={`mailto:${email}`} className="break-all hover:text-primary">
                      {email}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <iframe
              title="Ubicación de Urban Print en Orihuela"
              src="https://www.google.com/maps?q=Calle%20Comunidad%20Valenciana%202,%2003300%20Orihuela&output=embed"
              loading="lazy"
              className="h-72 w-full border border-border"
            />
          </aside>
        </div>
      </div>
    </div>
  );
}

function Campo({
  id,
  label,
  type = "text",
  error,
}: {
  id: string;
  label: string;
  type?: string;
  error?: string | undefined;
}) {
  return (
    <div>
      <label htmlFor={id} className="font-display text-xs tracking-widest uppercase">
        {label}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        className="mt-2 h-11 w-full border border-input bg-background px-3 text-sm outline-none focus:border-primary"
        aria-invalid={Boolean(error)}
      />
      {error && <p className="mt-1 text-xs text-primary">{error}</p>}
    </div>
  );
}
