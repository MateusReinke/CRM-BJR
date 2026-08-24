import { useEffect, useState } from "react";
import { unidades, type CodigoUnidade } from "@/content/site";

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number) {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const FALLBACK: CodigoUnidade = "SP1";

/**
 * Detects the nearest unit via navigator.geolocation, falling back to SP1
 * (matriz) silently on denial, timeout, or an unsupported browser. Exposes
 * setCodigo so the utility bar's "[TROCAR]" control can override manually —
 * the whole page (utility bar, mobile action bar, promo CTAs) reads this
 * one shared hook instance, not independent copies, so switching once
 * updates every "call this unit" affordance at once.
 */
export function useNearestUnit() {
  const [codigo, setCodigo] = useState<CodigoUnidade>(FALLBACK);
  const [distanciaKm, setDistanciaKm] = useState<number | null>(null);
  const [origem, setOrigem] = useState<"geolocalizacao" | "padrao">("padrao");

  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) return;

    let cancelled = false;
    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (cancelled) return;
        const { latitude, longitude } = position.coords;
        let nearest = unidades[0];
        let nearestKm = Infinity;
        for (const unidade of unidades) {
          const km = haversineKm(latitude, longitude, unidade.lat, unidade.lng);
          if (km < nearestKm) {
            nearestKm = km;
            nearest = unidade;
          }
        }
        setCodigo(nearest.codigo);
        setDistanciaKm(nearestKm);
        setOrigem("geolocalizacao");
      },
      () => {
        // negado, indisponível ou expirou — mantém o fallback SP1 em silêncio
      },
      { maximumAge: 5 * 60 * 1000, timeout: 8000 },
    );

    return () => {
      cancelled = true;
    };
  }, []);

  return { codigo, distanciaKm, origem, setCodigo };
}
