import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import { MapPin, Phone, Mail, Clock, MessageCircle, ExternalLink } from "lucide-react";
import "./landing.css";

// ---------------------------------------------------------------------------
// Reveal-on-scroll: a single IntersectionObserver hook. The .reveal CSS class
// already renders in its final (visible) state by default; this only adds
// .in-view to trigger the transition, and prefers-reduced-motion (handled in
// landing.css) removes the transition entirely rather than the content.
// ---------------------------------------------------------------------------
function useReveal<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { ref, inView };
}

// ---------------------------------------------------------------------------
// Instrument gauge — the page's one signature element. A semicircular dial
// with a printed redline zone (like a real tachometer face) and a needle that
// sweeps into position when scrolled into view. Only the satisfaction gauge
// (98%) encodes a real percentage; the other three (years, units, clients
// served) share one consistent decorative sweep on purpose — encoding them
// individually would imply a false comparison between unrelated quantities.
// ---------------------------------------------------------------------------
const GAUGE_CX = 100;
const GAUGE_CY = 100;
const GAUGE_R = 80;
const GAUGE_LEN = Math.PI * GAUGE_R;

function polar(cx: number, cy: number, r: number, deg: number) {
  const rad = (deg * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy - r * Math.sin(rad) };
}

function arcPath(fromValue: number, toValue: number) {
  const a1 = 180 - 1.8 * fromValue;
  const a2 = 180 - 1.8 * toValue;
  const p1 = polar(GAUGE_CX, GAUGE_CY, GAUGE_R, a1);
  const p2 = polar(GAUGE_CX, GAUGE_CY, GAUGE_R, a2);
  return `M ${p1.x} ${p1.y} A ${GAUGE_R} ${GAUGE_R} 0 0 1 ${p2.x} ${p2.y}`;
}

const GAUGE_TICKS = [0, 20, 40, 60, 80, 100];
const TRACK_PATH = arcPath(0, 100);
const REDLINE_PATH = arcPath(85, 100);

function InstrumentGauge({
  value,
  displayValue,
  label,
  inView,
  delay = 0,
}: {
  value: number;
  displayValue: string;
  label: string;
  inView: boolean;
  delay?: number;
}) {
  const needleAngle = inView ? value * 1.8 - 90 : -90;
  const dashoffset = inView ? GAUGE_LEN * (1 - value / 100) : GAUGE_LEN;

  return (
    <div>
      <svg viewBox="0 0 200 112" className="w-full h-auto" aria-hidden="true">
        <path d={TRACK_PATH} fill="none" strokeWidth={10} strokeLinecap="round" style={{ stroke: "var(--bjr-border)" }} />
        <path d={REDLINE_PATH} fill="none" strokeWidth={10} strokeLinecap="round" style={{ stroke: "var(--bjr-redline)", opacity: 0.55 }} />
        {GAUGE_TICKS.map((t) => {
          const outer = polar(GAUGE_CX, GAUGE_CY, GAUGE_R + 9, 180 - 1.8 * t);
          const inner = polar(GAUGE_CX, GAUGE_CY, GAUGE_R - 1, 180 - 1.8 * t);
          return (
            <line
              key={t}
              x1={inner.x}
              y1={inner.y}
              x2={outer.x}
              y2={outer.y}
              strokeWidth={2}
              style={{ stroke: t >= 85 ? "var(--bjr-redline)" : "var(--bjr-text-muted)" }}
            />
          );
        })}
        <path
          d={TRACK_PATH}
          fill="none"
          strokeWidth={10}
          strokeLinecap="round"
          className="bjr-arc-value"
          style={{
            stroke: "var(--bjr-amber)",
            strokeDasharray: GAUGE_LEN,
            strokeDashoffset: dashoffset,
            transitionDelay: `${delay}ms`,
          }}
        />
        <line
          x1={GAUGE_CX}
          y1={GAUGE_CY}
          x2={GAUGE_CX}
          y2={GAUGE_CY - 60}
          strokeWidth={3}
          strokeLinecap="round"
          className="bjr-needle"
          style={{
            stroke: "var(--bjr-text)",
            transform: `rotate(${needleAngle}deg)`,
            transformOrigin: `${GAUGE_CX}px ${GAUGE_CY}px`,
            transitionDelay: `${delay}ms`,
          }}
        />
        <circle cx={GAUGE_CX} cy={GAUGE_CY} r={6} style={{ fill: "var(--bjr-amber)" }} />
      </svg>
      <div className="text-center -mt-3">
        <div className="bjr-display text-3xl md:text-4xl font-bold" style={{ color: "var(--bjr-text)" }}>
          {displayValue}
        </div>
        <div className="text-[0.7rem] md:text-xs uppercase tracking-[0.14em]" style={{ color: "var(--bjr-text-muted)" }}>
          {label}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Bespoke line icons for the three services (deliberately not a generic icon
// library glyph — each one is drawn for what the service actually does).
// ---------------------------------------------------------------------------
const iconProps = {
  viewBox: "0 0 24 24",
  fill: "none" as const,
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

function IconOilCan() {
  return (
    <svg {...iconProps} className="h-7 w-7">
      <path d="M12 3c2.2 3 3.5 5.6 3.5 8a3.5 3.5 0 1 1-7 0c0-2.4 1.3-5 3.5-8Z" />
      <path d="M9 12.5h6" />
      <path d="M9 15.5h6" />
    </svg>
  );
}

function IconBrakeDisc() {
  return (
    <svg {...iconProps} className="h-7 w-7">
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="2.6" />
      <path d="M12 6.2v2.2M12 15.6v2.2M17.8 12h-2.2M8.4 12H6.2M16.1 7.9l-1.5 1.5M9.4 14.6l-1.5 1.5M16.1 16.1l-1.5-1.5M9.4 9.4 7.9 7.9" />
      <path d="M16.5 5.5h3.5v3.5h-3.5z" />
    </svg>
  );
}

function IconSuspension() {
  return (
    <svg {...iconProps} className="h-7 w-7">
      <path d="M12 2.5v2.3" />
      <path d="M8 5.5h8l-8 2.6h8l-8 2.6h8l-8 2.6h8l-8 2.6h8" />
      <path d="M12 18.2V21" />
      <circle cx="12" cy="21.4" r="0.8" fill="currentColor" stroke="none" />
    </svg>
  );
}

const SERVICES = [
  {
    icon: IconOilCan,
    title: "Manutenção Preventiva",
    description: "Revisões completas, troca de óleo, filtros e fluidos",
    items: ["Troca de óleo e filtros", "Revisão do sistema elétrico", "Verificação de fluidos"],
  },
  {
    icon: IconBrakeDisc,
    title: "Sistemas de Freios",
    description: "Manutenção e reparo de sistemas de frenagem",
    items: ["Troca de pastilhas e discos", "Sangria do sistema", "Reparo de cilindros"],
  },
  {
    icon: IconSuspension,
    title: "Suspensão e Direção",
    description: "Alinhamento, balanceamento e reparos",
    items: ["Alinhamento 3D", "Balanceamento", "Troca de amortecedores"],
  },
];

const STORES = [
  {
    code: "SP1",
    name: "São Paulo SP1",
    tag: "Matriz",
    tagStyle: "amber" as const,
    description: "Nossa unidade principal",
    address: "Av. Paulista, 1234 - Bela Vista, SP",
    phone: "(11) 3333-1111",
    hours: "Seg-Sex: 07:00-18:00 | Sáb: 07:00-12:00",
  },
  {
    code: "SP2",
    name: "São Paulo SP2",
    tag: "Filial",
    tagStyle: "steel" as const,
    description: "Zona Sul de São Paulo",
    address: "R. Domingos de Morais, 5678 - Vila Mariana, SP",
    phone: "(11) 3333-2222",
    hours: "Seg-Sex: 07:00-18:00 | Sáb: 07:00-12:00",
  },
  {
    code: "SOR",
    name: "Sorocaba SOR",
    tag: "Filial",
    tagStyle: "steel" as const,
    description: "Atendendo Sorocaba e região",
    address: "Av. Ipiranga, 9999 - Centro, Sorocaba",
    phone: "(15) 3333-3333",
    hours: "Seg-Sex: 07:00-18:00 | Sáb: 07:00-12:00",
  },
];

const FAQS = [
  {
    q: "Qual o prazo para orçamento?",
    a: "Nossos orçamentos são elaborados em até 24 horas úteis. Para serviços simples, conseguimos dar o valor na mesma hora.",
  },
  {
    q: "Vocês trabalham com seguro?",
    a: "Sim, somos credenciados com as principais seguradoras do mercado. Entre em contato para verificar sua cobertura.",
  },
  {
    q: "Oferecem garantia nos serviços?",
    a: "Todos os nossos serviços têm garantia de 90 dias ou 3.000 km, o que ocorrer primeiro. Peças originais têm garantia do fabricante.",
  },
  {
    q: "Fazem agendamento online?",
    a: "Sim! Entre em contato pelo WhatsApp ou ligue para nossa central. Também temos sistema online para nossos clientes cadastrados.",
  },
];

function ServiceCard({ service, index }: { service: (typeof SERVICES)[number]; index: number }) {
  const { ref, inView } = useReveal<HTMLDivElement>();
  const Icon = service.icon;
  return (
    <div
      ref={ref}
      className={`reveal bjr-card p-6 ${inView ? "in-view" : ""}`}
      style={{ transitionDelay: `${index * 90}ms` }}
    >
      <div
        className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg"
        style={{ background: "var(--bjr-surface-2)", color: "var(--bjr-amber)", border: "1px solid var(--bjr-border-soft)" }}
      >
        <Icon />
      </div>
      <h4 className="bjr-display text-lg font-semibold mb-1" style={{ color: "var(--bjr-text)" }}>
        {service.title}
      </h4>
      <p className="text-sm mb-4" style={{ color: "var(--bjr-text-muted)" }}>
        {service.description}
      </p>
      <ul className="space-y-2 text-sm">
        {service.items.map((item) => (
          <li key={item} className="flex items-center gap-2" style={{ color: "var(--bjr-text)" }}>
            <span
              className="inline-block h-1.5 w-1.5 rounded-full flex-shrink-0"
              style={{ background: "var(--bjr-amber)" }}
              aria-hidden="true"
            />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function StoreCard({ store, index }: { store: (typeof STORES)[number]; index: number }) {
  const { ref, inView } = useReveal<HTMLDivElement>();
  const isMatriz = store.tagStyle === "amber";
  return (
    <div
      ref={ref}
      className={`reveal bjr-card overflow-hidden ${inView ? "in-view" : ""}`}
      style={{ transitionDelay: `${index * 90}ms` }}
    >
      <div
        className="flex items-center justify-between px-5 py-4"
        style={{
          background: isMatriz ? "var(--bjr-amber)" : "var(--bjr-surface-2)",
          borderBottom: "1px solid var(--bjr-border-soft)",
        }}
      >
        <span
          className="bjr-plate text-2xl font-bold"
          style={{ color: isMatriz ? "#0d0f11" : "var(--bjr-text)" }}
        >
          {store.code}
        </span>
        <span
          className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] px-2.5 py-1 rounded"
          style={{
            background: isMatriz ? "rgba(13,15,17,0.15)" : "var(--bjr-bg)",
            color: isMatriz ? "#0d0f11" : "var(--bjr-amber)",
            border: isMatriz ? "1px solid rgba(13,15,17,0.25)" : "1px solid var(--bjr-border)",
          }}
        >
          {store.tag}
        </span>
      </div>
      <div className="p-5 space-y-4">
        <div>
          <h4 className="bjr-display text-lg font-semibold" style={{ color: "var(--bjr-text)" }}>
            {store.name}
          </h4>
          <p className="text-sm" style={{ color: "var(--bjr-text-muted)" }}>
            {store.description}
          </p>
        </div>
        <div className="space-y-2.5 text-sm" style={{ color: "var(--bjr-text)" }}>
          <div className="flex items-start gap-2.5">
            <MapPin className="h-4 w-4 flex-shrink-0 mt-0.5" style={{ color: "var(--bjr-amber)" }} />
            <span>{store.address}</span>
          </div>
          <div className="flex items-center gap-2.5">
            <Phone className="h-4 w-4 flex-shrink-0" style={{ color: "var(--bjr-amber)" }} />
            <span>{store.phone}</span>
          </div>
          <div className="flex items-center gap-2.5">
            <Clock className="h-4 w-4 flex-shrink-0" style={{ color: "var(--bjr-amber)" }} />
            <span>{store.hours}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Landing() {
  const metrics = useReveal<HTMLDivElement>();
  const hero = useReveal<HTMLDivElement>();

  const handleWhatsApp = () => {
    window.open(
      "https://wa.me/5511999999999?text=Olá! Gostaria de saber mais sobre os serviços da BJR Centro Automotivo",
      "_blank"
    );
  };

  const handleChat = () => {
    alert("Chat online será implementado em breve. Por favor, use o WhatsApp no momento.");
  };

  return (
    <div className="bjr-landing min-h-screen">
      {/* Header */}
      <header
        className="sticky top-0 z-40 bjr-brushed"
        style={{ background: "rgba(13,15,17,0.92)", backdropFilter: "blur(8px)", borderBottom: "1px solid var(--bjr-border-soft)" }}
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3 md:gap-4">
              <img
                src="https://static.wixstatic.com/media/c97016_f40c4aa13f3045d580bd10f6983b15be~mv2.png/v1/fill/w_325,h_147,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/image-removebg-preview%20-%202024-11-05T142157_349.png"
                alt="BJR Centro Automotivo"
                className="h-10 md:h-12 w-auto"
              />
              <div>
                <h1 className="bjr-display text-lg md:text-2xl font-bold" style={{ color: "var(--bjr-text)" }}>
                  BJR Centro Automotivo
                </h1>
                <p className="text-xs md:text-sm" style={{ color: "var(--bjr-text-muted)" }}>
                  Excelência em serviços automotivos
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleChat}
                className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors"
                style={{ border: "1px solid var(--bjr-border)", color: "var(--bjr-text)", background: "transparent" }}
              >
                <MessageCircle className="h-4 w-4" />
                Chat Online
              </button>
              <button
                onClick={handleWhatsApp}
                className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-white transition-colors"
                style={{ background: "var(--bjr-green)" }}
              >
                <Phone className="h-4 w-4" />
                WhatsApp
              </button>
              <Link href="/auth">
                <button
                  className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors"
                  style={{ border: "1px solid var(--bjr-border)", color: "var(--bjr-text)", background: "transparent" }}
                >
                  Acesso Sistema
                </button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bjr-brushed bjr-vignette relative py-16 md:py-24 overflow-hidden">
        <div className="container mx-auto px-4 relative">
          <div ref={hero.ref} className={`reveal max-w-3xl ${hero.inView ? "in-view" : ""}`}>
            <div
              className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] mb-5 px-3 py-1.5 rounded-full"
              style={{ color: "var(--bjr-amber)", border: "1px solid var(--bjr-border)" }}
            >
              Oficina credenciada · 3 unidades
            </div>
            <h2
              className="bjr-display text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-[1.05]"
              style={{ color: "var(--bjr-text)" }}
            >
              Seu Centro Automotivo <span style={{ color: "var(--bjr-amber)" }}>de Confiança</span>
            </h2>
            <p className="text-lg md:text-xl mb-8 max-w-2xl" style={{ color: "var(--bjr-text-muted)" }}>
              Com mais de 15 anos de experiência, oferecemos serviços automotivos de qualidade com
              tecnologia avançada e atendimento personalizado em nossas 3 unidades.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleWhatsApp}
                className="inline-flex items-center justify-center gap-2 rounded-md px-6 py-3 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5"
                style={{ background: "var(--bjr-redline-deep)" }}
              >
                <Phone className="h-4 w-4" />
                Solicitar Orçamento
              </button>
              <button
                onClick={() => document.getElementById("services")?.scrollIntoView({ behavior: "smooth" })}
                className="inline-flex items-center justify-center gap-2 rounded-md px-6 py-3 text-sm font-semibold transition-colors"
                style={{ border: "1px solid var(--bjr-border)", color: "var(--bjr-text)" }}
              >
                Nossos Serviços
              </button>
            </div>
          </div>

          {/* Signature element: instrument-panel metrics */}
          <div
            ref={metrics.ref}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 mt-16 max-w-4xl"
          >
            <InstrumentGauge value={80} displayValue="15+" label="Anos de Experiência" inView={metrics.inView} delay={0} />
            <InstrumentGauge value={80} displayValue="3" label="Unidades Ativas" inView={metrics.inView} delay={120} />
            <InstrumentGauge value={80} displayValue="5000+" label="Clientes Atendidos" inView={metrics.inView} delay={240} />
            <InstrumentGauge value={98} displayValue="98%" label="Satisfação" inView={metrics.inView} delay={360} />
          </div>
        </div>
      </section>

      <div className="bjr-divider" />

      {/* Services */}
      <section id="services" className="py-20 scroll-mt-20" style={{ background: "var(--bjr-bg-alt)" }}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-14 max-w-2xl mx-auto">
            <h3 className="bjr-display text-3xl md:text-4xl font-bold mb-4" style={{ color: "var(--bjr-text)" }}>
              Nossos Serviços
            </h3>
            <p className="text-lg" style={{ color: "var(--bjr-text-muted)" }}>
              Oferecemos uma gama completa de serviços automotivos com qualidade garantida
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {SERVICES.map((service, i) => (
              <ServiceCard key={service.title} service={service} index={i} />
            ))}
          </div>
        </div>
      </section>

      <div className="bjr-divider" />

      {/* Stores */}
      <section className="py-20" style={{ background: "var(--bjr-bg)" }}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <h3 className="bjr-display text-3xl md:text-4xl font-bold mb-4" style={{ color: "var(--bjr-text)" }}>
              Nossas Unidades
            </h3>
            <p className="text-lg" style={{ color: "var(--bjr-text-muted)" }}>
              Escolha a unidade mais próxima de você
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {STORES.map((store, i) => (
              <StoreCard key={store.code} store={store} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20" style={{ background: "var(--bjr-bg-alt)" }}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <h3 className="bjr-display text-3xl md:text-4xl font-bold mb-4" style={{ color: "var(--bjr-text)" }}>
              Dúvidas Frequentes
            </h3>
            <p className="text-lg" style={{ color: "var(--bjr-text-muted)" }}>
              Respostas para as perguntas mais comuns
            </p>
          </div>
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-5">
            {FAQS.map((faq, i) => (
              <div key={faq.q} className="bjr-card p-6">
                <div className="flex items-start gap-3">
                  <span
                    className="bjr-display text-xs font-bold px-2 py-1 rounded flex-shrink-0"
                    style={{ background: "var(--bjr-surface-2)", color: "var(--bjr-amber)" }}
                  >
                    P.{String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h4 className="font-semibold mb-2" style={{ color: "var(--bjr-text)" }}>
                      {faq.q}
                    </h4>
                    <p className="text-sm" style={{ color: "var(--bjr-text-muted)" }}>
                      {faq.a}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section
        className="py-20 bjr-brushed"
        style={{ background: `linear-gradient(120deg, var(--bjr-redline-deep), var(--bjr-bg))` }}
      >
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-2xl mx-auto">
            <h3 className="bjr-display text-3xl md:text-4xl font-bold mb-4 text-white">
              Pronto para cuidar do seu veículo?
            </h3>
            <p className="text-lg md:text-xl mb-8 text-white/85">
              Entre em contato agora e agende seu atendimento com nossa equipe especializada
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <button
                onClick={handleWhatsApp}
                className="inline-flex items-center justify-center gap-2 rounded-md px-6 py-3 text-sm font-semibold"
                style={{ background: "var(--bjr-text)", color: "#0d0f11" }}
              >
                <Phone className="h-4 w-4" />
                WhatsApp: (11) 99999-9999
              </button>
              <button
                className="inline-flex items-center justify-center gap-2 rounded-md px-6 py-3 text-sm font-semibold border border-white/70 text-white transition-colors hover:bg-white hover:text-[#0d0f11]"
              >
                <Mail className="h-4 w-4" />
                contato@bjrautomotivo.com.br
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 bjr-brushed" style={{ background: "var(--bjr-bg-alt)", borderTop: "1px solid var(--bjr-border-soft)" }}>
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4">
              <img
                src="https://static.wixstatic.com/media/c97016_f40c4aa13f3045d580bd10f6983b15be~mv2.png/v1/fill/w_325,h_147,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/image-removebg-preview%20-%202024-11-05T142157_349.png"
                alt="BJR Centro Automotivo"
                className="h-8 w-auto"
              />
              <div>
                <div className="font-semibold" style={{ color: "var(--bjr-text)" }}>
                  BJR Centro Automotivo
                </div>
                <div className="text-sm" style={{ color: "var(--bjr-text-muted)" }}>
                  CNPJ: 12.345.678/0001-99
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm" style={{ color: "var(--bjr-text-muted)" }}>
              <span>© 2024 BJR Centro Automotivo. Todos os direitos reservados.</span>
              <span style={{ width: 1, height: 16, background: "var(--bjr-border)" }} />
              <Link href="/auth">
                <button className="inline-flex items-center gap-2 hover:text-[var(--bjr-amber)] transition-colors" style={{ color: "var(--bjr-text-muted)" }}>
                  <ExternalLink className="h-4 w-4" />
                  Sistema
                </button>
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
