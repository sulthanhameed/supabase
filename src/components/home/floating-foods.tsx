"use client";

import { LayoutGroup, motion, useMotionValue, useSpring, useTransform, type MotionValue } from "framer-motion";
import { useEffect, useState } from "react";
import Link from "next/link";

type Dish = { id: string; name: string; price: string; slug: string; image: string };

const DISHES: Dish[] = [
  { id: "hargow", name: "Prawn Har Gow", price: "₹249", slug: "dim-sum", image: "https://images.pexels.com/photos/31261436/pexels-photo-31261436.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=900&w=900" },
  { id: "noodles", name: "Hakka Noodles", price: "₹189", slug: "noodles-soups", image: "https://images.pexels.com/photos/30676160/pexels-photo-30676160.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=900&w=900" },
  { id: "rice", name: "Chicken Fried Rice", price: "₹179", slug: "rice-curry", image: "https://images.pexels.com/photos/5720819/pexels-photo-5720819.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=900&w=900" },
  { id: "chilli", name: "Chilli Chicken", price: "₹199", slug: "snacks", image: "https://images.pexels.com/photos/35071822/pexels-photo-35071822.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=900&w=900" },
];

/** Slot 0 is the big centre plate; slots 1–3 are the small satellites. */
const SLOTS = [
  { size: "h-64 w-64 sm:h-80 sm:w-80 lg:h-[26rem] lg:w-[26rem]", pos: "left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2", depth: 10, float: { y: [0, -14, 0] }, rotate: [0, 360], duration: { y: 6, rotate: 90 }, main: true },
  { size: "h-24 w-24 sm:h-32 sm:w-32 lg:h-40 lg:w-40", pos: "left-0 top-6 sm:left-2 lg:-left-4 lg:top-10", depth: 30, float: { y: [0, -18, 0] }, rotate: [-6, 6, -6], duration: { y: 5, rotate: 7 }, main: false },
  { size: "h-24 w-24 sm:h-32 sm:w-32 lg:h-44 lg:w-44", pos: "right-0 top-12 sm:-right-2 lg:-right-8 lg:top-4", depth: 40, float: { y: [0, 16, 0] }, rotate: [5, -5, 5], duration: { y: 6.5, rotate: 8 }, main: false },
  { size: "h-20 w-20 sm:h-28 sm:w-28 lg:h-36 lg:w-36", pos: "bottom-4 right-6 sm:right-10 lg:bottom-2 lg:right-4", depth: 25, float: { y: [0, -12, 0] }, rotate: [0, 8, 0], duration: { y: 5.5, rotate: 6 }, main: false },
];

export function FloatingFoods() {
  // order[slotIndex] = dish id currently occupying that slot
  const [order, setOrder] = useState<string[]>(DISHES.map((d) => d.id));
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 40, damping: 15 });
  const sy = useSpring(my, { stiffness: 40, damping: 15 });

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mx.set(e.clientX / window.innerWidth - 0.5);
      my.set(e.clientY / window.innerHeight - 0.5);
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, [mx, my]);

  /** Clicking a satellite swaps it with whatever is in the centre. */
  const promote = (slotIndex: number) => {
    if (slotIndex === 0) return;
    setOrder((prev) => {
      const next = [...prev];
      [next[0], next[slotIndex]] = [next[slotIndex], next[0]];
      return next;
    });
  };

  const centre = DISHES.find((d) => d.id === order[0])!;

  return (
    <LayoutGroup>
      <div className="relative mx-auto aspect-square w-full max-w-md lg:max-w-none">
        <div className="absolute left-1/2 top-1/2 h-[92%] w-[92%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-sand" />

        {SLOTS.map((slot, i) => {
          const dish = DISHES.find((d) => d.id === order[i])!;
          return <Plate key={slot.pos} slot={slot} dish={dish} sx={sx} sy={sy} onClick={() => promote(i)} />;
        })}

        {/* Centre dish caption */}
        <motion.div
          key={centre.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.5 }}
          className="pointer-events-none absolute left-1/2 top-[calc(50%+9rem)] z-20 -translate-x-1/2 whitespace-nowrap rounded-full border border-line bg-paper px-4 py-1.5 font-heading text-sm shadow-sm sm:top-[calc(50%+11rem)] lg:top-[calc(50%+14rem)]"
        >
          {centre.name} <span className="text-muted">{centre.price}</span>
        </motion.div>

        <p className="pointer-events-none absolute -bottom-8 left-1/2 hidden -translate-x-1/2 text-[11px] uppercase tracking-widest text-muted lg:block">
          Tap a dish to bring it forward
        </p>
      </div>
    </LayoutGroup>
  );
}

function Plate({
  slot,
  dish,
  sx,
  sy,
  onClick,
}: {
  slot: (typeof SLOTS)[number];
  dish: Dish;
  sx: MotionValue<number>;
  sy: MotionValue<number>;
  onClick: () => void;
}) {
  const x = useTransform(sx, (v) => v * slot.depth);
  const y = useTransform(sy, (v) => v * slot.depth);

  return (
    <motion.div style={{ x, y }} className={`absolute ${slot.pos} ${slot.main ? "z-10" : "z-20"}`}>
      <motion.div animate={{ y: slot.float.y }} transition={{ repeat: Infinity, duration: slot.duration.y, ease: "easeInOut" }} className="group relative">
        {slot.main ? (
          <Link href={`/menu?category=${dish.slug}`} className="block" aria-label={dish.name}>
            <PlateImage slot={slot} dish={dish} />
          </Link>
        ) : (
          <button type="button" onClick={onClick} className="block cursor-pointer" aria-label={`Show ${dish.name}`}>
            <PlateImage slot={slot} dish={dish} />
            <span className="pointer-events-none absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-line bg-paper px-3 py-1 text-[11px] font-medium shadow-sm transition group-hover:border-primary">
              {dish.name}
            </span>
          </button>
        )}
      </motion.div>
    </motion.div>
  );
}

function PlateImage({ slot, dish }: { slot: (typeof SLOTS)[number]; dish: Dish }) {
  return (
    <motion.div
      layoutId={`plate-${dish.id}`}
      transition={{ type: "spring", stiffness: 180, damping: 22 }}
      className={`${slot.size} overflow-hidden rounded-full ring-4 ring-cream shadow-[0_30px_60px_-30px_rgba(22,22,22,0.45)] transition-transform duration-500 group-hover:scale-105`}
    >
      <motion.div
        animate={{ rotate: slot.rotate }}
        transition={{ repeat: Infinity, duration: slot.duration.rotate, ease: slot.main ? "linear" : "easeInOut" }}
        className="h-full w-full"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={dish.image} alt={dish.name} className="photo h-full w-full object-cover" loading="eager" />
      </motion.div>
    </motion.div>
  );
}
