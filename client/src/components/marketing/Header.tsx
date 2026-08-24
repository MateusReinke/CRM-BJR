import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { CTAButton } from "./shared";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import type { Unidade } from "@/content/site";

const NAV = [
  { href: "#promocoes", label: "Promoções" },
  { href: "#servicos", label: "Serviços" },
  { href: "#unidades", label: "Unidades" },
  { href: "#depoimentos", label: "Depoimentos" },
  { href: "#faq", label: "FAQ" },
];

export function Header({ unidade }: { unidade: Unidade }) {
  const [scrolled, setScrolled] = useState(false);
  const [progress, setProgress] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > window.innerHeight * 0.6);
      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight;
      setProgress(max > 0 ? Math.min(1, window.scrollY / max) : 0);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const whatsappUrl = buildWhatsAppUrl(unidade.whatsapp, `Olá! Vim pelo site e quero falar com a unidade ${unidade.codigo}.`);

  return (
    <>
      <div className="fixed inset-x-0 top-0 z-50 h-0.5 bg-aco/20" aria-hidden="true">
        <div className="h-full bg-bjr transition-[width] duration-150 ease-out" style={{ width: `${progress * 100}%` }} />
      </div>
      <header
        className={cn(
          "sticky top-0 z-40 border-b transition-colors duration-200",
          scrolled ? "border-aco/20 bg-oleo" : "border-transparent bg-transparent",
        )}
      >
        <div className="mx-auto flex max-w-[1280px] items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <a href="#top" className="flex flex-col leading-none text-concreto">
            <span className="font-display text-titulo font-extrabold uppercase tracking-tight">BJR</span>
            <span className="font-data text-[0.6rem] uppercase tracking-[0.18em] text-aco">Centro Automotivo</span>
          </a>

          <nav className="hidden items-center gap-6 font-body text-nota text-concreto lg:flex">
            {NAV.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="transition-colors hover:text-bjr focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bjr"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-4 lg:flex">
            <CTAButton href={whatsappUrl} variant="primary">
              WhatsApp
            </CTAButton>
            <Link
              href="/auth"
              className="font-data text-legenda uppercase tracking-wide text-aco transition-colors hover:text-concreto focus-visible:outline focus-visible:outline-2 focus-visible:outline-bjr"
            >
              Acesso Sistema ›
            </Link>
          </div>

          <button
            type="button"
            className="text-concreto focus-visible:outline focus-visible:outline-2 focus-visible:outline-bjr lg:hidden"
            aria-expanded={menuOpen}
            aria-controls="menu-mobile"
            aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
            onClick={() => setMenuOpen((v) => !v)}
          >
            {menuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
          </button>
        </div>

        {menuOpen && (
          <div id="menu-mobile" className="border-t border-aco/20 bg-oleo px-4 py-4 lg:hidden">
            <nav className="flex flex-col gap-4 font-body text-corpo-lg text-concreto">
              {NAV.map((item) => (
                <a key={item.href} href={item.href} onClick={() => setMenuOpen(false)} className="hover:text-bjr">
                  {item.label}
                </a>
              ))}
              <CTAButton href={whatsappUrl} variant="primary" className="mt-2 w-full">
                WhatsApp
              </CTAButton>
              <Link href="/auth" className="font-data text-legenda uppercase tracking-wide text-aco" onClick={() => setMenuOpen(false)}>
                Acesso Sistema ›
              </Link>
            </nav>
          </div>
        )}
      </header>
    </>
  );
}
