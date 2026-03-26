"use client";

import { motion, type MotionProps } from "framer-motion";
import type { ReactNode } from "react";

type RevealProps = MotionProps & {
  children: ReactNode;
  className?: string;
  delay?: number;
};

export function Reveal({ children, className, delay = 0, ...props }: RevealProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}
