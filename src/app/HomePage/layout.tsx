import React from "react";
import { NavbarLanding } from "@/components/landingPage/NavbarPage";
import { Footer } from "@/components/landingPage/Footer";
export default function HomePageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-full flex flex-col">
      <NavbarLanding />
      {children}
      <Footer />
    </main>
  );
}
