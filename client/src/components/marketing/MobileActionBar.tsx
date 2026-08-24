import { MessageCircle, Navigation, Phone } from "lucide-react";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import type { Unidade } from "@/content/site";

export function MobileActionBar({ unidade }: { unidade: Unidade }) {
  const whatsappUrl = buildWhatsAppUrl(unidade.whatsapp, `Olá! Quero falar com a unidade ${unidade.codigo}.`);
  const telefoneDigits = unidade.telefone.replace(/\D/g, "");
  const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${unidade.lat},${unidade.lng}`;

  const items = [
    { href: whatsappUrl, label: "WhatsApp", Icon: MessageCircle },
    { href: telefoneDigits ? `tel:${telefoneDigits}` : undefined, label: "Ligar", Icon: Phone },
    { href: mapsUrl, label: "Rota", Icon: Navigation },
  ];

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-3 border-t border-aco/25 bg-oleo pb-[env(safe-area-inset-bottom)] lg:hidden">
      {items.map(({ href, label, Icon }) =>
        href ? (
          <a
            key={label}
            href={href}
            target={href.startsWith("http") ? "_blank" : undefined}
            rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
            className="flex flex-col items-center gap-1 py-2.5 font-data text-legenda uppercase tracking-wide text-concreto focus-visible:outline focus-visible:outline-2 focus-visible:outline-bjr"
          >
            <Icon aria-hidden="true" className="h-5 w-5" />
            {label}
          </a>
        ) : (
          <span key={label} className="flex flex-col items-center gap-1 py-2.5 font-data text-legenda uppercase tracking-wide text-aco/50">
            <Icon aria-hidden="true" className="h-5 w-5" />
            {label}
          </span>
        ),
      )}
    </div>
  );
}
