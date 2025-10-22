import { motion } from "framer-motion";
import { PropsWithChildren } from "react";

/** Micro interaction: slight scale on hover/tap for any child. */
export default function HoverScale({ children, className = "" }: PropsWithChildren<{ className?: string }>) {
  return (
    <motion.div
      className={className}
      whileHover={{ scale: 1.015 }}
      whileTap={{ scale: 0.985 }}
      transition={{ duration: 0.15 }}
    >
      {children}
    </motion.div>
  );
}
