import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

export function NoiseOverlay() {
  return (
    <div
      className="fixed inset-0 pointer-events-none z-[100] opacity-[0.025] mix-blend-overlay"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
      }}
    />
  );
}

export function GradientOrbs() {
  const { scrollYProgress } = useScroll();
  const x1 = useTransform(scrollYProgress, [0, 1], ["0%", "10%"]);
  const y1 = useTransform(scrollYProgress, [0, 1], ["10%", "40%"]);
  const x2 = useTransform(scrollYProgress, [0, 1], ["100%", "80%"]);
  const y2 = useTransform(scrollYProgress, [0, 1], ["50%", "10%"]);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      <motion.div
        className="absolute w-[800px] h-[800px] -top-40 -left-40"
        style={{ x: x1, y: y1 }}
      >
        <div
          className="w-full h-full bg-[#c9a84c] rounded-full"
          style={{
            filter: "blur(120px)",
            opacity: 0.08,
          }}
        />
      </motion.div>
      <motion.div
        className="absolute w-[600px] h-[600px] -bottom-20 right-0"
        style={{ x: x2, y: y2 }}
      >
        <div
          className="w-full h-full bg-[#c9a84c] rounded-full"
          style={{
            filter: "blur(100px)",
            opacity: 0.05,
          }}
        />
      </motion.div>
      <motion.div
        className="absolute w-[400px] h-[400px] top-1/2 left-1/3"
        animate={{
          scale: [1, 1.2, 1],
          x: [0, 20, 0],
          y: [0, -20, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <div
          className="w-full h-full bg-[#c9a84c] rounded-full"
          style={{
            filter: "blur(80px)",
            opacity: 0.03,
          }}
        />
      </motion.div>
    </div>
  );
}

export function DotPattern() {
  return (
    <div
      className="fixed inset-0 pointer-events-none z-0 opacity-[0.015]"
      style={{
        backgroundImage: `radial-gradient(circle, #c9a84c 1px, transparent 1px)`,
        backgroundSize: "40px 40px",
      }}
    />
  );
}

export function GridPattern() {
  return (
    <div
      className="fixed inset-0 pointer-events-none z-0 opacity-[0.03]"
      style={{
        backgroundImage: `
          linear-gradient(to right, #c9a84c 1px, transparent 1px),
          linear-gradient(to bottom, #c9a84c 1px, transparent 1px)
        `,
        backgroundSize: "80px 80px",
        maskImage: "radial-gradient(ellipse at center, black 20%, transparent 70%)",
      }}
    />
  );
}

export function FloatingParticles() {
  const particles = [...Array(20)].map((_, i) => ({
    id: i,
    x: 10 + Math.random() * 80,
    y: 10 + Math.random() * 80,
    size: 2 + Math.random() * 4,
    duration: 15 + Math.random() * 20,
    delay: Math.random() * 5,
  }));

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-[#c9a84c]/30"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.2, 0.5, 0.2],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

export function ScrollIndicator() {
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, 100], [1, 0]);

  return (
    <motion.div
      className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40"
      style={{ opacity }}
    >
      <motion.div
        className="w-6 h-10 border-2 border-[#c9a84c]/40 rounded-full flex justify-center"
        animate={{ y: [0, 5, 0] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        <motion.div
          className="w-1.5 h-3 bg-[#c9a84c] rounded-full mt-2"
          animate={{ y: [0, 8, 0], opacity: [1, 0, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      </motion.div>
      <p className="text-[9px] uppercase tracking-[0.2em] text-[#c9a84c]/60 mt-2 text-center">
        Scroll
      </p>
    </motion.div>
  );
}

export function SectionDivider({
  variant = "fade",
}: {
  variant?: "fade" | "wave" | "dots" | "gradient";
}) {
  if (variant === "wave") {
    return (
      <div className="relative h-32 overflow-hidden">
        <svg
          className="absolute bottom-0 w-full h-16"
          viewBox="0 0 1440 74"
          preserveAspectRatio="none"
        >
          <path
            fill="rgba(201,168,76,0.05)"
            d="M0,0 C480,74 960,0 1440,74 L1440,74 L0,74 Z"
          />
        </svg>
      </div>
    );
  }

  if (variant === "dots") {
    return (
      <div className="flex items-center justify-center gap-2 py-16">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="w-2 h-2 rounded-full bg-[#c9a84c]/30"
            animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 2, delay: i * 0.2, repeat: Infinity }}
          />
        ))}
      </div>
    );
  }

  if (variant === "gradient") {
    return (
      <div className="h-32 bg-gradient-to-b from-transparent via-[#c9a84c]/5 to-transparent" />
    );
  }

  return (
    <div className="h-24">
      <div className="h-px bg-gradient-to-r from-transparent via-[#c9a84c]/20 to-transparent mt-12" />
    </div>
  );
}

export function AnimatedBackgroundLines() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-px bg-gradient-to-b from-[#c9a84c]/0 via-[#c9a84c]/10 to-[#c9a84c]/0"
          style={{
            left: `${20 + i * 15}%`,
            height: "200%",
            top: "-50%",
          }}
          animate={{
            y: ["-50%", "50%"],
          }}
          transition={{
            duration: 20 + i * 5,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
}

export function SpotlightEffect() {
  const ref = useRef<HTMLDivElement>(null);

  return (
    <motion.div
      ref={ref}
      className="fixed inset-0 pointer-events-none z-0"
      style={{
        background:
          "radial-gradient(circle at 50% 50%, transparent 0%, rgba(10,15,28,0.5) 70%)",
      }}
    />
  );
}
