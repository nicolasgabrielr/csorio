"use client";

import { useEffect, useState } from "react";

function getTimeLeft(targetDate: string) {
  const target = new Date(targetDate + "T12:00:00").getTime();
  const now = Date.now();
  const diff = target - now;

  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, past: true };

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return { days, hours, minutes, seconds, past: false };
}

export default function CountdownTimer({ targetDate }: { targetDate: string }) {
  const [timeLeft, setTimeLeft] = useState(getTimeLeft(targetDate));
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => {
      setTimeLeft(getTimeLeft(targetDate));
    }, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  if (!mounted) return null;

  if (timeLeft.past) {
    return (
      <div className="text-center text-white/80">
        <p className="font-display text-2xl">¡El gran día ha llegado! 🎉</p>
      </div>
    );
  }

  const units = [
    { label: "Días", value: timeLeft.days },
    { label: "Horas", value: timeLeft.hours },
    { label: "Minutos", value: timeLeft.minutes },
    { label: "Segundos", value: timeLeft.seconds },
  ];

  return (
    <div className="flex items-center justify-center gap-4 sm:gap-6">
      {units.map(({ label, value }, i) => (
        <div key={label} className="flex items-start gap-4 sm:gap-6">
          <div className="text-center">
            <div className="bg-white/10 backdrop-blur rounded-lg px-4 py-3 sm:px-6 sm:py-4 min-w-[64px] sm:min-w-[80px]">
              <span className="font-display text-3xl sm:text-5xl text-white leading-none">
                {String(value).padStart(2, "0")}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-white/60 mt-2 uppercase tracking-widest">
              {label}
            </p>
          </div>
          {i < 3 && (
            <span className="font-display text-2xl sm:text-4xl text-white/40 mt-3">:</span>
          )}
        </div>
      ))}
    </div>
  );
}
