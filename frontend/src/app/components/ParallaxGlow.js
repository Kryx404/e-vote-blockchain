"use client";
import { useRef } from "react";
import { motion, useScroll, useSpring, useTransform } from "motion/react";

export default function ParallaxGlow({ className = "" }) {
    const ref = useRef(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start end", "end start"],
    });

    const softY = useSpring(useTransform(scrollYProgress, [0, 1], [0, -120]), {
        stiffness: 90,
        damping: 16,
        mass: 0.4,
    });
    const midY = useSpring(useTransform(scrollYProgress, [0, 1], [0, -180]), {
        stiffness: 90,
        damping: 16,
        mass: 0.4,
    });
    const hardY = useSpring(useTransform(scrollYProgress, [0, 1], [0, -260]), {
        stiffness: 90,
        damping: 16,
        mass: 0.4,
    });

    return (
        <div
            ref={ref}
            className={`pointer-events-none absolute inset-0 ${className}`}>
            <motion.div
                style={{ y: softY }}
                className="absolute -left-20 -top-24 h-80 w-80 rounded-full bg-blue-500/18 blur-3xl"
            />
            <motion.div
                style={{ y: midY }}
                className="absolute right-[-140px] top-12 h-96 w-96 rounded-full bg-cyan-400/15 blur-3xl"
            />
            <motion.div
                style={{ y: hardY }}
                className="absolute left-1/3 bottom-[-160px] h-96 w-96 rounded-full bg-purple-500/14 blur-3xl"
            />
        </div>
    );
}
