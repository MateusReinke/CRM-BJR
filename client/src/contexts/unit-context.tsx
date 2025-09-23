import { createContext, useContext, useState, ReactNode } from "react";

interface UnitContextType {
  selectedUnit: string;
  setSelectedUnit: (unit: string) => void;
}

const UnitContext = createContext<UnitContextType | undefined>(undefined);

export function UnitProvider({ children }: { children: ReactNode }) {
  const [selectedUnit, setSelectedUnit] = useState<string>("all");

  return (
    <UnitContext.Provider value={{ selectedUnit, setSelectedUnit }}>
      {children}
    </UnitContext.Provider>
  );
}

export function useUnit() {
  const context = useContext(UnitContext);
  if (!context) {
    throw new Error("useUnit deve ser usado dentro de um UnitProvider");
  }
  return context;
}