import { useCallback } from "react";
import { BackgroundCanvas } from "@/components/marketing/BackgroundCanvas";
import { UtilityBar } from "@/components/marketing/UtilityBar";
import { Header } from "@/components/marketing/Header";
import { Hero } from "@/components/marketing/Hero";
import { Promotions } from "@/components/marketing/Promotions";
import { Services } from "@/components/marketing/Services";
import { Units } from "@/components/marketing/Units";
import { Credentialing } from "@/components/marketing/Credentialing";
import { Testimonials } from "@/components/marketing/Testimonials";
import { FAQ } from "@/components/marketing/FAQ";
import { ContactFooter } from "@/components/marketing/ContactFooter";
import { MobileActionBar } from "@/components/marketing/MobileActionBar";
import { useNearestUnit } from "@/hooks/use-nearest-unit";
import { empresa, unidades, unidadePorCodigo, type HorarioSemanal, type Unidade } from "@/content/site";

function buildOpeningHours(horario: HorarioSemanal) {
  const specs: Record<string, unknown>[] = [];
  if (horario.segSex) {
    specs.push({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: horario.segSex.abertura,
      closes: horario.segSex.fechamento,
    });
  }
  if (horario.sabado) {
    specs.push({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Saturday"],
      opens: horario.sabado.abertura,
      closes: horario.sabado.fechamento,
    });
  }
  if (horario.domingo) {
    specs.push({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Sunday"],
      opens: horario.domingo.abertura,
      closes: horario.domingo.fechamento,
    });
  }
  return specs;
}

function buildAutoRepairSchema(unidade: Unidade) {
  return {
    "@context": "https://schema.org",
    "@type": "AutoRepair",
    name: `${empresa.nome} — ${unidade.nome}`,
    address: {
      "@type": "PostalAddress",
      streetAddress: unidade.endereco,
      addressLocality: unidade.cidade,
      addressRegion: unidade.uf,
      postalCode: unidade.cep,
      addressCountry: "BR",
    },
    geo: { "@type": "GeoCoordinates", latitude: unidade.lat, longitude: unidade.lng },
    telephone: unidade.telefone,
    openingHoursSpecification: buildOpeningHours(unidade.horario),
  };
}

export default function Landing() {
  const { codigo, distanciaKm, setCodigo } = useNearestUnit();
  const unidadeAtual = unidadePorCodigo(codigo);

  const handleTrocar = useCallback(() => {
    const idx = unidades.findIndex((u) => u.codigo === codigo);
    const proxima = unidades[(idx + 1) % unidades.length];
    setCodigo(proxima.codigo);
  }, [codigo, setCodigo]);

  return (
    <div className="min-h-screen bg-oleo pb-16 lg:pb-0">
      <BackgroundCanvas />

      {unidades.map((u) => (
        <script
          key={u.codigo}
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(buildAutoRepairSchema(u)) }}
        />
      ))}

      <UtilityBar unidade={unidadeAtual} distanciaKm={distanciaKm} onTrocar={handleTrocar} />
      <Header unidade={unidadeAtual} />

      <main>
        <Hero unidade={unidadeAtual} />
        <Promotions nearestCodigo={codigo} />
        <Services nearestCodigo={codigo} />
        <Units nearestCodigo={codigo} />
        <Credentialing />
        <Testimonials />
        <FAQ />
      </main>

      <ContactFooter nearestCodigo={codigo} />
      <MobileActionBar unidade={unidadeAtual} />
    </div>
  );
}
