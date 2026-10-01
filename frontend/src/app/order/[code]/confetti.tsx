"use client";

import { useEffect, useState } from "react";

export function SuccessConfetti() {
  const [pieces, setPieces] = useState<{ left: number; delay: number; color: string; size: number }[]>([]);
  useEffect(() => {
    const colors = ["#15803d", "#22c55e", "#0a0a0a", "#fff"];
    setPieces(Array.from({ length: 40 }, () => ({ left: Math.random() * 100, delay: Math.random() * 1.5, color: colors[Math.floor(Math.random() * colors.length)], size: 6 + Math.random() * 8 })));
    const t = setTimeout(() => setPieces([]), 5000);
    return () => clearTimeout(t);
  }, []);
  return (
    <div className="pointer-events-none fixed inset-0 z-40 overflow-hidden">
      {pieces.map((p, i) => (
        <span
          key={i}
          className="absolute -top-4 block rounded-sm"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size * 0.6,
            background: p.color,
            animation: `confettiFall 3.5s ${p.delay}s ease-in forwards`,
          }}
        />
      ))}
      <style>{`@keyframes confettiFall { to { transform: translateY(110vh) rotate(720deg); opacity: 0.2; } }`}</style>
    </div>
  );
}
