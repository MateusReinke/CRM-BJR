import { useEffect, useState } from "react";
import type { HorarioSemanal } from "@/content/site";

export interface StatusAbertura {
  aberta: boolean;
  label: string;
}

const DIAS = ["DOMINGO", "SEGUNDA", "TERÇA", "QUARTA", "QUINTA", "SEXTA", "SÁBADO"];

function faixaDoDia(horario: HorarioSemanal, day: number) {
  if (day === 0) return horario.domingo;
  if (day === 6) return horario.sabado;
  return horario.segSex;
}

function computeStatus(horario: HorarioSemanal): StatusAbertura {
  const now = new Date();
  const day = now.getDay();
  const minutosAgora = now.getHours() * 60 + now.getMinutes();
  const faixa = faixaDoDia(horario, day);

  if (faixa) {
    const [hAbre, mAbre] = faixa.abertura.split(":").map(Number);
    const [hFecha, mFecha] = faixa.fechamento.split(":").map(Number);
    const abre = hAbre * 60 + mAbre;
    const fecha = hFecha * 60 + mFecha;
    if (minutosAgora >= abre && minutosAgora < fecha) {
      return { aberta: true, label: `ABERTA · FECHA ${faixa.fechamento}` };
    }
    if (minutosAgora < abre) {
      return { aberta: false, label: `FECHADA · ABRE ${faixa.abertura}` };
    }
  }

  for (let offset = 1; offset <= 7; offset++) {
    const proximoDia = (day + offset) % 7;
    const proximaFaixa = faixaDoDia(horario, proximoDia);
    if (proximaFaixa) {
      return { aberta: false, label: `FECHADA · ABRE ${DIAS[proximoDia]} ${proximaFaixa.abertura}` };
    }
  }

  return { aberta: false, label: "FECHADA" };
}

/** Recomputed on mount and every 60s — cheap enough for a live status dot. */
export function useOpenStatus(horario: HorarioSemanal): StatusAbertura {
  const [status, setStatus] = useState<StatusAbertura>(() => computeStatus(horario));

  useEffect(() => {
    setStatus(computeStatus(horario));
    const id = window.setInterval(() => setStatus(computeStatus(horario)), 60_000);
    return () => window.clearInterval(id);
  }, [horario]);

  return status;
}
