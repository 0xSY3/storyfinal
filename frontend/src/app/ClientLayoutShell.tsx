"use client";

import React from "react";
import ModernNavbar from "@/components/navigation/modern-navbar";

interface ClientLayoutShellProps {
  children: React.ReactNode;
}

const ClientLayoutShell: React.FC<ClientLayoutShellProps> = ({ children }) => {
  return (
    <>
      <ModernNavbar />
      <main className="min-h-screen">
        {children}
      </main>
    </>
  );
};

export default ClientLayoutShell;
