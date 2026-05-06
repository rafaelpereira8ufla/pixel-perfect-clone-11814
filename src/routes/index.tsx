import { createFileRoute, Link } from "@tanstack/react-router";
import { Activity, CalendarCheck, Stethoscope, Video, ShieldCheck, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Saúde Total — Agendamento Inteligente" },
      { name: "description", content: "Agende consultas presenciais e por telemedicina com a Clínica Saúde Total. Rápido, simples e seguro." },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-background/80 backdrop-blur sticky top-0 z-30">
        <div className="mx-auto max-w-6xl flex items-center justify-between px-6 h-16">
          <Link to="/" className="flex items-center gap-2 font-semibold">
            <span className="grid place-items-center h-8 w-8 rounded-lg bg-primary text-primary-foreground">
              <Activity className="h-4 w-4" />
            </span>
            <span>Saúde Total</span>
          </Link>
          <nav className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link to="/login">Entrar</Link>
            </Button>
            <Button asChild size="sm">
              <Link to="/cadastro">Agendar consulta</Link>
            </Button>
          </nav>
        </div>
      </header>

      <main>
        <section className="mx-auto max-w-6xl px-6 pt-20 pb-24 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5 text-primary" /> Plataforma segura para clínicas
          </span>
          <h1 className="mt-6 text-5xl md:text-6xl font-semibold tracking-tight">
            Sua saúde, <span className="text-primary">no seu tempo</span>.
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
            Agende, gerencie e acompanhe suas consultas médicas em poucos cliques —
            presenciais ou por telemedicina, com os melhores profissionais.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg">
              <Link to="/cadastro">Agendar consulta</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/login">Já tenho conta</Link>
            </Button>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 pb-24 grid md:grid-cols-3 gap-6">
          {[
            { icon: CalendarCheck, title: "Agendamento simples", desc: "Escolha especialidade, médico e horário em segundos." },
            { icon: Video, title: "Telemedicina", desc: "Atendimentos online com link enviado automaticamente." },
            { icon: Stethoscope, title: "Resultados online", desc: "Receba diagnósticos e observações direto no portal." },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="rounded-2xl border border-border bg-card p-6">
              <div className="grid place-items-center h-10 w-10 rounded-lg bg-accent text-primary">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-medium">{title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
            </div>
          ))}
        </section>

        <section className="border-t border-border bg-card/40">
          <div className="mx-auto max-w-6xl px-6 py-16 grid md:grid-cols-3 gap-8 text-center">
            <Stat value="8" label="Médicos especialistas" />
            <Stat value="200+" label="Pacientes por semana" icon={Clock} />
            <Stat value="100%" label="Dados protegidos" icon={ShieldCheck} />
          </div>
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto max-w-6xl px-6 py-8 text-sm text-muted-foreground flex items-center justify-between">
          <span>© {new Date().getFullYear()} Clínica Saúde Total</span>
          <span>Sistema interno e portal do paciente</span>
        </div>
      </footer>
    </div>
  );
}

function Stat({ value, label, icon: Icon }: { value: string; label: string; icon?: React.ComponentType<{ className?: string }> }) {
  return (
    <div>
      <div className="text-4xl font-semibold text-primary flex items-center justify-center gap-2">
        {Icon && <Icon className="h-6 w-6" />} {value}
      </div>
      <div className="mt-2 text-sm text-muted-foreground">{label}</div>
    </div>
  );
}