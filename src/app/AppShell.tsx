"use client";

import { ReactNode, useEffect } from "react";
import Header from "@/components/Header";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const { initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        background: "#fde047",
      }}
    >
      <Header />
      <main 
        style={{ 
          flex: 1, 
          display: "flex", 
          flexDirection: "column",
          paddingTop: isHome ? 0 : "64px" 
        }}
      >
        {children}
      </main>
    </div>
  );
}



