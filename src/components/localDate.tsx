import React, { useState, useEffect } from "react";

export default function LocalDate() {
  const [dateStr, setDateStr] = useState<string>("");

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();

      setDateStr(
        now.toLocaleDateString("id-ID", {
          weekday: "long",
          day: "2-digit",
          month: "long",
          year: "numeric",
        }),
      );
    };

    updateDateTime();

    const interval = setInterval(updateDateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  if (!dateStr) {
    return (
      <span className="inline-block w-32 h-3 sm:h-4 bg-gray-200 rounded animate-pulse align-middle"></span>
    );
  }

  return <span>{dateStr}</span>;
}
