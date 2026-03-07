"use client";
import { useRef } from "react";
import { motion, useInView } from "motion/react";

export default function ScrollReveal({ children, delay = 0, y = 40 }) {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: "-10% 0px" });

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y }}
            transition={{ duration: 0.6, ease: "easeOut", delay }}>
            {children}
        </motion.div>
    );
}
