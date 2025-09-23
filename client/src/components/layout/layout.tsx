import { useState } from "react";
import Sidebar from "./sidebar";
import Header from "./header";
import { useUnit } from "@/contexts/unit-context";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { selectedUnit, setSelectedUnit } = useUnit();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar 
        selectedUnit={selectedUnit}
        setSelectedUnit={setSelectedUnit}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />
      
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header 
          selectedUnit={selectedUnit}
          setMobileMenuOpen={setMobileMenuOpen}
        />
        
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
