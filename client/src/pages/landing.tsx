import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import {
  Instagram,
  Globe,
  MapPin,
  Menu,
  MessageCircle,
  Navigation,
  Phone,
  ShieldCheck,
  Wrench,
  X,
} from "lucide-react";

import RedeViasLogo from "@/components/landing/logo";
import { FotoOuCena } from "@/components/landing/media";
import {
  ICONES_DIFERENCIAIS,
  ICONES_SERVICOS,
} from "@/components/landing/service-icons";
import {
  DIFERENCIAIS,
  FOTOS,
  MARCA,
  SERVICOS,
  UNIDADES,
  UNIDADE_PADRAO,
  embedMapa,
  linkMapa,
  linkTelefone,
  linkWhatsApp,
} from "@/data/rede-vias";
import "./landing.css";

const MENU = [
  { href: "#inicio", rotulo: "Início" },
  { href: "#servicos", rotulo: "Serviços" },
  { href: "#unidades", rotulo: "Unidades" },
  { href: "#sobre", rotulo: "Sobre" },
  { href: "#contato", rotulo: "Contato" },
];

const CTA_WHATSAPP = linkWhatsApp(
  UNIDADE_PADRAO.whatsapp,
  `Olá! Vim pelo site da ${MARCA.nome} e gostaria de agendar um serviço.`,
);

/** Revela um bloco quando ele entra na viewport (uma vez só). */
function useRevelar<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [visivel, setVisivel] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Sem IntersectionObserver o conteúdo aparece direto — a animação é
    // enfeite, nunca pode ser a razão de um bloco ficar invisível.
    if (typeof IntersectionObserver === "undefined") {
      setVisivel(true);
      return;
    }
    const observador = new IntersectionObserver(
      ([entrada]) => {
        if (entrada.isIntersecting) {
          setVisivel(true);
          observador.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    observador.observe(el);
    return () => observador.disconnect();
  }, []);

  return { ref, className: `rv-revelar ${visivel ? "rv-visivel" : ""}` };
}

/** Headline no recurso da marca: linha 1 neutra + linha 2 vermelha. */
function TituloDuplo({
  linha1,
  linha2,
  hero = false,
  id,
}: {
  linha1: string;
  linha2: string;
  hero?: boolean;
  id?: string;
}) {
  const Tag = hero ? "h1" : "h2";
  return (
    <Tag id={id} className={`rv-titulo ${hero ? "rv-titulo--hero" : ""}`}>
      <span className="rv-titulo__l1">{linha1}</span>
      <span className="rv-titulo__l2">{linha2}</span>
    </Tag>
  );
}

// ---------------------------------------------------------------------------
// Header
// ---------------------------------------------------------------------------

function Header() {
  const [aberto, setAberto] = useState(false);

  // Fecha no Esc e trava o scroll do corpo enquanto o painel está aberto.
  useEffect(() => {
    if (!aberto) return;
    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAberto(false);
    };
    const overflowAnterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", aoTeclar);
    return () => {
      document.body.style.overflow = overflowAnterior;
      window.removeEventListener("keydown", aoTeclar);
    };
  }, [aberto]);

  return (
    <header className="rv-header">
      <div className="rv-wrap">
        <div className="rv-header__barra">
          <a href="#inicio" aria-label={`${MARCA.nomeCompleto} — início`}>
            <RedeViasLogo className="rv-header__logo" />
          </a>

          <nav className="rv-nav" aria-label="Navegação principal">
            {MENU.map((item) => (
              <a key={item.href} href={item.href} className="rv-nav__link">
                {item.rotulo}
              </a>
            ))}
          </nav>

          <div className="rv-header__acoes">
            <a
              className="rv-btn rv-btn--whats"
              href={CTA_WHATSAPP}
              target="_blank"
              rel="noopener noreferrer"
            >
              <MessageCircle aria-hidden="true" size={18} />
              Agende pelo WhatsApp
            </a>
          </div>

          <button
            type="button"
            className="rv-header__menu-btn"
            aria-expanded={aberto}
            aria-controls="rv-menu-mobile"
            onClick={() => setAberto((v) => !v)}
          >
            {aberto ? (
              <X aria-hidden="true" size={20} />
            ) : (
              <Menu aria-hidden="true" size={20} />
            )}
            {aberto ? "Fechar" : "Menu"}
          </button>
        </div>
      </div>

      {aberto && (
        <div className="rv-menu-mobile" id="rv-menu-mobile">
          <div className="rv-wrap">
            <ul className="rv-menu-mobile__lista">
              {MENU.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    className="rv-menu-mobile__link"
                    onClick={() => setAberto(false)}
                  >
                    {item.rotulo}
                  </a>
                </li>
              ))}
            </ul>
            <div className="rv-menu-mobile__acoes">
              <a
                className="rv-btn rv-btn--whats rv-btn--bloco"
                href={CTA_WHATSAPP}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setAberto(false)}
              >
                <MessageCircle aria-hidden="true" size={18} />
                Agende pelo WhatsApp
              </a>
              <Link
                href="/auth"
                className="rv-btn rv-btn--contorno-claro rv-btn--bloco"
                onClick={() => setAberto(false)}
              >
                Acesso ao sistema
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

// ---------------------------------------------------------------------------
// Hero
// ---------------------------------------------------------------------------

function Hero() {
  return (
    <section id="inicio" className="rv-hero">
      <div className="rv-hero__fundo">
        <FotoOuCena foto={FOTOS.hero} prioridade />
      </div>
      <div className="rv-hero__veu" />

      <div className="rv-wrap">
        <div className="rv-hero__conteudo">
          <p className="rv-chapeu">4 unidades · São Paulo · Santos · Limeira</p>
          <TituloDuplo hero linha1="Com a Rede Vias," linha2="você viaja mais longe." />
          <p className="rv-hero__texto">
            Pneus, suspensão, freios, alinhamento, balanceamento e troca de óleo com equipe
            especializada. Previna problemas e viaje com segurança, confiança e tranquilidade.
          </p>
          <div className="rv-hero__ctas">
            <a
              className="rv-btn rv-btn--whats"
              href={CTA_WHATSAPP}
              target="_blank"
              rel="noopener noreferrer"
            >
              <MessageCircle aria-hidden="true" size={18} />
              Agende pelo WhatsApp
            </a>
            <a className="rv-btn rv-btn--contorno-claro" href="#unidades">
              <MapPin aria-hidden="true" size={18} />
              Unidade mais próxima
            </a>
          </div>

          <div className="rv-hero__selo">
            <span>
              <strong>6 serviços</strong> em um só lugar
            </span>
            <span>
              <strong>Atendimento</strong> pelo WhatsApp
            </span>
            <span>
              <strong>{MARCA.instagram.handle}</strong>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Diferenciais
// ---------------------------------------------------------------------------

function Diferenciais() {
  const revelar = useRevelar<HTMLDivElement>();

  return (
    <section className="rv-secao rv-secao--grafite" aria-labelledby="rv-diferenciais-titulo">
      <div className="rv-wrap">
        <h2 id="rv-diferenciais-titulo" className="rv-chapeu rv-chapeu--bloco">
          Por que a Rede Vias
        </h2>
        <div ref={revelar.ref} className={`rv-diferenciais ${revelar.className}`}>
          {DIFERENCIAIS.map((item) => {
            const Icone = ICONES_DIFERENCIAIS[item.id];
            return (
              <div key={item.id} className="rv-diferencial">
                <span className="rv-diferencial__icone">
                  <Icone />
                </span>
                <div>
                  <h3 className="rv-diferencial__titulo">{item.titulo}</h3>
                  <p className="rv-diferencial__desc">{item.descricao}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Serviços
// ---------------------------------------------------------------------------

function Servicos() {
  const revelar = useRevelar<HTMLDivElement>();

  return (
    <section id="servicos" className="rv-secao rv-secao--claro" aria-labelledby="rv-servicos-titulo">
      <div className="rv-wrap">
        <p className="rv-chapeu">Nossos serviços</p>
        <TituloDuplo
          id="rv-servicos-titulo"
          linha1="Tudo o que seu carro precisa,"
          linha2="em um só lugar."
        />
        <div ref={revelar.ref} className={`rv-servicos ${revelar.className}`}>
          {SERVICOS.map((servico) => {
            const Icone = ICONES_SERVICOS[servico.id];
            return (
              <article key={servico.id} className="rv-servico">
                <span className="rv-servico__icone">
                  <Icone />
                </span>
                <h3 className="rv-servico__nome">{servico.nome}</h3>
                <p className="rv-servico__desc">{servico.descricao}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Prevenção / confiança (âncora "Sobre")
// ---------------------------------------------------------------------------

function Prevencao() {
  const revelar = useRevelar<HTMLDivElement>();

  return (
    <section id="sobre" className="rv-secao rv-secao--escuro" aria-labelledby="rv-sobre-titulo">
      <div className="rv-wrap">
        <div ref={revelar.ref} className={`rv-prevencao ${revelar.className}`}>
          <div>
            <p className="rv-chapeu">Prevenção</p>
            <TituloDuplo
              id="rv-sobre-titulo"
              linha1="Cuidar do seu carro"
              linha2="é cuidar de você!"
            />
            <ul className="rv-prevencao__lista">
              <li className="rv-prevencao__item">
                <span className="rv-prevencao__marcador" aria-hidden="true" />
                <span>
                  Previna problemas. Viaje com segurança, confiança e tranquilidade — a revisão em
                  dia evita a parada no acostamento.
                </span>
              </li>
              <li className="rv-prevencao__item">
                <span className="rv-prevencao__marcador" aria-hidden="true" />
                <span>
                  A {MARCA.nome} reúne centros automotivos especializados em pneus, suspensão,
                  freios, alinhamento, balanceamento e troca de óleo.
                </span>
              </li>
              <li className="rv-prevencao__item">
                <span className="rv-prevencao__marcador" aria-hidden="true" />
                <span>
                  São {UNIDADES.length} unidades — Santo Amaro, Jardim Pedreira, Santos e Limeira —
                  com equipe especializada sempre pronta para te atender.
                </span>
              </li>
            </ul>

            <div className="rv-selo-revisao">
              <span className="rv-selo-revisao__icone">
                <Wrench aria-hidden="true" />
              </span>
              <p className="rv-selo-revisao__texto">
                Revisão em dia, <em>problemas ficam pelo caminho!</em>
              </p>
            </div>
          </div>

          <figure className="rv-prevencao__figura" style={{ margin: 0 }}>
            <FotoOuCena foto={FOTOS.prevencao} />
          </figure>
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Unidades — abas para não empurrar a página em um scroll longo
// ---------------------------------------------------------------------------

function Unidades() {
  const [ativa, setAtiva] = useState(UNIDADES[0].id);
  const unidade = UNIDADES.find((u) => u.id === ativa) ?? UNIDADES[0];
  const refsAbas = useRef<Record<string, HTMLButtonElement | null>>({});

  // Setas ↔ percorrem as abas, como manda o padrão ARIA de tablist.
  const aoTeclar = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    const indice = UNIDADES.findIndex((u) => u.id === ativa);
    let proximo: number | null = null;
    if (e.key === "ArrowRight") proximo = (indice + 1) % UNIDADES.length;
    if (e.key === "ArrowLeft") proximo = (indice - 1 + UNIDADES.length) % UNIDADES.length;
    if (e.key === "Home") proximo = 0;
    if (e.key === "End") proximo = UNIDADES.length - 1;
    if (proximo === null) return;
    e.preventDefault();
    const id = UNIDADES[proximo].id;
    setAtiva(id);
    refsAbas.current[id]?.focus();
  };

  return (
    <section id="unidades" className="rv-secao rv-secao--claro" aria-labelledby="rv-unidades-titulo">
      <div className="rv-wrap">
        <p className="rv-chapeu">Nossas unidades</p>
        <TituloDuplo
          id="rv-unidades-titulo"
          linha1="Procure uma Rede Vias"
          linha2="perto de você!"
        />

        <div className="rv-abas" role="tablist" aria-label="Escolha uma unidade">
          {UNIDADES.map((u) => (
            <button
              key={u.id}
              type="button"
              role="tab"
              id={`aba-${u.id}`}
              aria-selected={u.id === ativa}
              aria-controls={`painel-${u.id}`}
              tabIndex={u.id === ativa ? 0 : -1}
              ref={(el) => {
                refsAbas.current[u.id] = el;
              }}
              className="rv-aba"
              onClick={() => setAtiva(u.id)}
              onKeyDown={aoTeclar}
            >
              <MapPin className="rv-aba__pin" aria-hidden="true" />
              {u.nome}
            </button>
          ))}
        </div>

        <div
          role="tabpanel"
          id={`painel-${unidade.id}`}
          aria-labelledby={`aba-${unidade.id}`}
          tabIndex={0}
          className="rv-unidade"
        >
          <div className="rv-unidade__dados">
            <h3 className="rv-unidade__nome">
              Rede Vias <span>{unidade.nome}</span>
            </h3>

            <p className="rv-unidade__linha">
              <MapPin aria-hidden="true" />
              <span>
                {unidade.endereco}
                <span className="rv-unidade__complemento">{unidade.complemento}</span>
              </span>
            </p>

            <p className="rv-unidade__linha">
              <Phone aria-hidden="true" />
              <a
                href={linkTelefone(unidade.telefone)}
                style={{ color: "inherit", textDecoration: "none" }}
              >
                {unidade.telefone}
              </a>
            </p>

            <div className="rv-unidade__acoes">
              <a
                className="rv-btn rv-btn--whats"
                href={linkWhatsApp(
                  unidade.whatsapp,
                  `Olá! Gostaria de agendar um serviço na ${MARCA.nome} ${unidade.nome}.`,
                )}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle aria-hidden="true" size={18} />
                WhatsApp
              </a>
              <a
                className="rv-btn rv-btn--contorno-escuro"
                href={linkMapa(unidade.mapaQuery)}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Navigation aria-hidden="true" size={18} />
                Como chegar
              </a>
            </div>
          </div>

          <div className="rv-unidade__mapa">
            <div className="rv-unidade__mapa-alternativa" aria-hidden="true">
              <MapPin />
              <strong>Rede Vias {unidade.nome}</strong>
              <span>
                {unidade.endereco} — {unidade.cidade}
              </span>
            </div>
            {/* key força um iframe novo por unidade; loading=lazy evita baixar
                o mapa antes da seção aparecer. */}
            <iframe
              key={unidade.id}
              title={`Mapa da unidade ${unidade.nome}`}
              src={embedMapa(unidade.mapaQuery)}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
            <a
              className="rv-unidade__mapa-link"
              href={linkMapa(unidade.mapaQuery)}
              target="_blank"
              rel="noopener noreferrer"
            >
              Ver no Google Maps
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Chamada final
// ---------------------------------------------------------------------------

function ChamadaFinal() {
  return (
    <section id="contato" className="rv-secao rv-cta-final" aria-labelledby="rv-contato-titulo">
      <div className="rv-wrap">
        <TituloDuplo
          id="rv-contato-titulo"
          linha1="O fim de semana tá chegando!"
          linha2="Já fez a sua revisão?"
        />
        <p className="rv-cta-final__texto">
          Fale com a unidade mais próxima e garanta a revisão antes de pegar a estrada.
        </p>
        <div className="rv-cta-final__ctas">
          <a
            className="rv-btn rv-btn--primario"
            href={CTA_WHATSAPP}
            target="_blank"
            rel="noopener noreferrer"
          >
            <MessageCircle aria-hidden="true" size={18} />
            Agende pelo WhatsApp
          </a>
          <a className="rv-btn rv-btn--contorno-claro" href="#unidades">
            <ShieldCheck aria-hidden="true" size={18} />
            Ver as unidades
          </a>
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Rodapé
// ---------------------------------------------------------------------------

function Rodape() {
  return (
    <footer className="rv-rodape">
      <div className="rv-wrap">
        <div className="rv-rodape__grade">
          <div>
            <RedeViasLogo style={{ fontSize: "1.05rem" }} />
            <p className="rv-apoio" style={{ marginTop: "1rem", maxWidth: "26rem", fontSize: "0.95rem" }}>
              {MARCA.descricao}
            </p>
            <div className="rv-rodape__social">
              <a
                href={MARCA.instagram.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Instagram ${MARCA.instagram.handle}`}
              >
                <Instagram aria-hidden="true" />
              </a>
              <a href={MARCA.siteUrl} aria-label={MARCA.site}>
                <Globe aria-hidden="true" />
              </a>
            </div>
          </div>

          <nav aria-label="Links rápidos">
            <h2 className="rv-rodape__titulo">Links rápidos</h2>
            <ul className="rv-rodape__lista">
              {MENU.map((item) => (
                <li key={item.href}>
                  <a className="rv-rodape__link" href={item.href}>
                    {item.rotulo}
                  </a>
                </li>
              ))}
              <li>
                <Link href="/auth" className="rv-rodape__link">
                  Acesso ao sistema
                </Link>
              </li>
            </ul>
          </nav>

          <div>
            <h2 className="rv-rodape__titulo">Unidades</h2>
            <div className="rv-rodape__unidades">
              {UNIDADES.map((u) => (
                <div key={u.id} className="rv-rodape__unidade">
                  <strong>Rede Vias {u.nome}</strong>
                  {u.endereco}
                  <br />
                  {u.complemento}
                  <br />
                  <a
                    href={linkWhatsApp(
                      u.whatsapp,
                      `Olá! Gostaria de agendar um serviço na ${MARCA.nome} ${u.nome}.`,
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {u.telefone}
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="rv-rodape__base">
          <span>
            © {new Date().getFullYear()} {MARCA.nomeCompleto}. Todos os direitos reservados.
          </span>
          <span>
            <a href={MARCA.siteUrl}>{MARCA.site}</a> ·{" "}
            <a href={MARCA.instagram.url} target="_blank" rel="noopener noreferrer">
              {MARCA.instagram.handle}
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
}

// ---------------------------------------------------------------------------

export default function Landing() {
  return (
    <div className="rv-landing">
      <a className="rv-pular-para-conteudo" href="#inicio">
        Pular para o conteúdo
      </a>
      <Header />
      <main>
        <Hero />
        <div className="rv-faixa" />
        <Diferenciais />
        <Servicos />
        <Prevencao />
        <Unidades />
        <ChamadaFinal />
      </main>
      <Rodape />
    </div>
  );
}
