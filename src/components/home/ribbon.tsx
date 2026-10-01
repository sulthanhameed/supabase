const WORDS = ["Dim Sum", "Hakka Noodles", "Schezwan", "Manchurian", "Fried Rice", "Bubble Tea", "Chilli Chicken", "Wonton Soup"];

export function Ribbon({ dark = false }: { dark?: boolean }) {
  const items = [...WORDS, ...WORDS];
  return (
    <div className={`overflow-hidden border-y py-4 ${dark ? "border-white/10 bg-ink" : "border-line bg-cream"}`}>
      <div className="flex w-max animate-marquee gap-10 whitespace-nowrap">
        {items.map((w, i) => (
          <span key={i} className={`flex items-center gap-10 font-heading text-lg italic ${dark ? "text-white/60" : "text-muted"}`}>
            {w}
            <span className={`h-1 w-1 rounded-full ${dark ? "bg-paper/30" : "bg-primary/60"}`} />
          </span>
        ))}
      </div>
    </div>
  );
}
