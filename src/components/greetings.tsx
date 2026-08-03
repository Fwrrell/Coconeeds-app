"use client";

import { useState, useEffect, useSyncExternalStore } from "react";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) {
    return "Selamat Pagi";
  } else if (hour >= 12 && hour < 15) {
    return "Selamat Siang";
  } else if (hour >= 15 && hour < 18) {
    return "Selamat Sore";
  } else {
    return "Selamat Malam";
  }
}

// Hydration-safe hook to check if we are on the client and mounted
function useIsClient() {
  return useSyncExternalStore(
    () => () => {}, // subscribe, does nothing
    () => true, // getSnapshot on client
    () => false // getSnapshot on server
  );
}

export default function Greeting() {
  const [greeting] = useState(getGreeting); // Lazy init, runs once
  const [name, setName] = useState("");
  const isClient = useIsClient();

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const res = await fetch("/api/auth/session");
        if (res.ok) {
          const session = await res.json();
          const firstName = session?.user?.name?.split(" ")[0] || "Pengguna";
          setName(firstName);
        } else {
          setName("Pengguna");
        }
      } catch {
        setName("Pengguna");
      }
    };

    fetchSession();
  }, []);

  if (!isClient) {
    return (
      <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
        <span className="inline-block w-48 h-8 bg-gray-200 rounded animate-pulse align-middle"></span>
      </h1>
    );
  }

  return (
    <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
      {greeting}, {name} 👋
    </h1>
  );
}
