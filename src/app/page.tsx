import React from "react";
import { NavbarLanding } from "@/components/landingPage/NavbarPage";
import { Hero } from "@/components/landingPage/hero";
import { Core } from "@/components/landingPage/Core";
import Features from "@/components/landingPage/Features";
import { Faq } from "@/components/landingPage/Faq";
import { Footer } from "@/components/landingPage/Footer";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col w-full overflow-x-hidden bg-[#FEFEFC]">
      <NavbarLanding />
      <div className="w-full flex flex-col gap-10">
        <Hero />
        <Core />
        <Features />
        <Faq />
      </div>
      <Footer />
    </main>
  );
}
