"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import type { ReactNode } from "react";

type RevealProps = {
  children: ReactNode;
  delay?: number;
  className?: string;
  from?: "up" | "left" | "right";
};

const distanceByDirection = {
  up: { y: 32, x: 0 },
  left: { y: 0, x: -32 },
  right: { y: 0, x: 32 },
};

export function Reveal({ children, delay = 0, className, from = "up" }: RevealProps) {
  const shouldReduceMotion = useReducedMotion();
  const offset = distanceByDirection[from];

  const variants: Variants = {
    hidden: shouldReduceMotion ? { opacity: 0 } : { opacity: 0, ...offset },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: { duration: 0.6, delay, ease: [0.25, 0.46, 0.45, 0.94] },
    },
  };

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      variants={variants}
    >
      {children}
    </motion.div>
  );
}
