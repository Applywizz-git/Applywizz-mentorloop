import { motion, Variants } from "framer-motion";
import { PropsWithChildren } from "react";

type Dir = "up" | "down" | "left" | "right" | "none";
const offY = (d: Dir) => (d === "up" ? 16 : d === "down" ? -16 : 0);
const offX = (d: Dir) => (d === "left" ? 16 : d === "right" ? -16 : 0);

const variants: Variants = {
  hidden: ({ dir }: { dir: Dir }) => ({
    opacity: 0, y: offY(dir), x: offX(dir), filter: "blur(2px)",
  }),
  visible: {
    opacity: 1, y: 0, x: 0, filter: "blur(0)",
    transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] }
  }
};

export default function Reveal({
  children, delay = 0, dir = "up", once = true, className = "",
}: PropsWithChildren<{ delay?: number; dir?: Dir; once?: boolean; className?: string }>) {
  return (
    <motion.div
      className={className}
      custom={{ dir }}
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount: 0.2 }}
      transition={{ delay }}
    >
      {children}
    </motion.div>
  );
}
