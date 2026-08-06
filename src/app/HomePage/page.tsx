import React from "react";
import Link from "next/link";
import { Hero } from "@/components/landingPage/hero";
import { Core } from "@/components/landingPage/Core";
import Features from "@/components/landingPage/Features";
import { Faq } from "@/components/landingPage/Faq";
export default function HomePage() {
  return (
    <main className=" w-full flex flex-col gap-10 overflow-x-hidden">
      <Hero />
      <Core />
      <Features />
      <Faq />
    </main>
  );
}
