import { motion } from "framer-motion";
import { PropsWithChildren } from "react";

/** Wrap a whole page for subtle route enter/exit animation. */
export default function PageWrapper({ children }: PropsWithChildren) {
  return (
    <motion.main
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      className="min-h-dvh"
    >
      {children}
    </motion.main>
  );
}
