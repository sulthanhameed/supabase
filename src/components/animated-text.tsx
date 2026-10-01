"use client";

import { motion } from "framer-motion";

/** Splits text into words that slide up with a stagger when scrolled into view. */
export function AnimatedText({
  text,
  className = "",
  delay = 0,
  as: Tag = "span",
}: {
  text: string;
  className?: string;
  delay?: number;
  as?: "span" | "h1" | "h2" | "h3" | "p";
}) {
  const words = text.split(" ");
  return (
    <Tag className={className} aria-label={text}>
      {words.map((w, i) => (
        <span key={i} className="inline-block overflow-hidden pb-[0.08em] align-bottom">
          <motion.span
            initial={{ y: "110%", opacity: 0, rotate: 3 }}
            whileInView={{ y: 0, opacity: 1, rotate: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ delay: delay + i * 0.07, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="inline-block"
          >
            {w}
            {i < words.length - 1 ? "\u00A0" : ""}
          </motion.span>
        </span>
      ))}
    </Tag>
  );
}
