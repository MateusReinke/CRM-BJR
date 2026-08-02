import { createContext, useContext, useState, ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import type { Store } from "@shared/schema";

interface StoreContextType {
  stores: Store[];
  isLoading: boolean;
  selectedStoreId: string;
  setSelectedStoreId: (storeId: string) => void;
  getStoreName: (storeId?: string | null) => string;
  getStoreColor: (storeId?: string | null) => string;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [selectedStoreId, setSelectedStoreId] = useState<string>("all");

  // Query fails quietly (returns []) on public pages where the user isn't
  // authenticated yet - the sidebar/selectors simply have nothing to show.
  const { data: stores = [], isLoading } = useQuery<Store[]>({
    queryKey: ["/api/stores"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const getStoreName = (storeId?: string | null) => {
    if (!storeId || storeId === 'all') return 'Todas as Lojas';
    return stores.find(s => s.id === storeId)?.name || 'Loja desconhecida';
  };

  const getStoreColor = (storeId?: string | null) => {
    return stores.find(s => s.id === storeId)?.color || '#6b7280';
  };

  return (
    <StoreContext.Provider value={{ stores: stores || [], isLoading, selectedStoreId, setSelectedStoreId, getStoreName, getStoreColor }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error("useStore deve ser usado dentro de um StoreProvider");
  }
  return context;
}
