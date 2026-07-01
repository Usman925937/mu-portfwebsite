import { useRef, useEffect, useState } from "react";
import { motion, useScroll, useTransform, useSpring, useMotionValue } from "framer-motion";
import { AnimatedCounter, GradientText, FloatingLabel } from "../components/TextAnimations";
import { MagneticElement } from "../components/MagneticCursor";
import { WebGLScene } from "../components/WebGLScene";
import type { PortfolioData } from "@/lib/portfolio-render";

interface HeroSectionProps {
  data: PortfolioData;
}

export function HeroSection({ data }: HeroSectionProps) {
  const hero = data.hero;
  const ref = useRef<HTMLElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <section
      ref={ref}
      id="home"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* 3D Background */}
      <div className="absolute inset-0 z-0">
        <WebGLScene />
      </div>

      {/* Animated gradients */}
      <motion.div
        className="absolute inset-0 z-0"
        style={{
          background:
            "radial-gradient(ellipse at 60% 50%, rgba(201,168,76,0.07) 0%, transparent 50%)",
          x: mousePosition.x,
          y: mousePosition.y,
        }}
      />

      {/* Content */}
      <motion.div
        className="relative z-10 container mx-auto px-6 py-24 grid lg:grid-cols-2 gap-16 items-center"
        style={{ y, opacity, scale }}
      >
        {/* Left: Text content */}
        <div className="space-y-8">
          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <FloatingLabel className="text-[#c9a84c]/80">
              {hero.eyebrow.split("·")[0]}
            </FloatingLabel>
          </motion.div>

          {/* Main heading */}
          <div className="space-y-2">
            <motion.h1
              className="text-5xl md:text-7xl xl:text-8xl font-serif leading-[0.9] text-white overflow-hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <motion.span
                className="inline-block"
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                {hero.firstName}
              </motion.span>
              <br />
              <motion.span
                className="inline-block text-[#c9a84c]"
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
              >
                {hero.lastName}
              </motion.span>
              <motion.span className="inline-block text-white font-light opacity-60 text-3xl md:text-4xl ml-4">
                <motion.span
                  className="inline-block origin-bottom-left"
                  animate={{ rotate: [0, -8, 0], scale: [1, 1.05, 1] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  ↗
                </motion.span>
              </motion.span>
            </motion.h1>
          </div>

          {/* Subtitle */}
          <motion.p
            className="text-xl md:text-2xl text-[#6b7a99] font-light"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            {hero.subtitle}
          </motion.p>

          {/* Description */}
          <motion.div
            className="text-[#5a69a0] max-w-lg text-base leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            dangerouslySetInnerHTML={{ __html: hero.description }}
          />

          {/* CTAs */}
          <motion.div
            className="flex flex-wrap gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <MagneticElement>
              <motion.a
                href={hero.primaryCtaHref}
                className="relative group px-8 py-4 bg-[#c9a84c] text-[#0a0f1c] font-semibold text-sm uppercase tracking-[0.15em] rounded overflow-hidden"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="relative z-10">{hero.primaryCtaText}</span>
                <motion.div
                  className="absolute inset-0 bg-white"
                  initial={{ x: "-100%" }}
                  whileHover={{ x: "100%" }}
                  transition={{ duration: 0.4 }}
                />
              </motion.a>
            </MagneticElement>

            <MagneticElement>
              <motion.a
                href={hero.secondaryCtaHref}
                target="_blank"
                rel="noopener noreferrer"
                className="group px-8 py-4 border-2 border-[#c9a84c]/40 text-[#c9a84c] font-medium text-sm uppercase tracking-[0.15em] rounded hover:border-[#c9a84c] transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                  {hero.secondaryCtaText}
                </span>
              </motion.a>
            </MagneticElement>
          </motion.div>

          {/* Stats */}
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-8 border-t border-[#c9a84c]/10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.7 }}
          >
            {hero.stats.map((stat, i) => (
              <motion.div
                key={i}
                className="text-center md:text-left"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + i * 0.1 }}
              >
                <div className="text-3xl md:text-4xl font-serif text-[#c9a84c] mb-1">
                  <AnimatedCounter
                    value={parseInt(stat.num.replace(/\D/g, "")) || 0}
                    suffix={stat.num.replace(/[0-9]/g, "")}
                  />
                </div>
                <div className="text-[10px] uppercase tracking-[0.2em] text-[#6b7a99]">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Right: Orbit visualization */}
        <motion.div
          className="hidden lg:block relative h-[500px]"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.3 }}
        >
          <OrbitVisualization chips={hero.chips} />
        </motion.div>
      </motion.div>

      {/* Scroll hint */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="w-6 h-10 border-2 border-[#c9a84c]/30 rounded-full flex justify-center">
          <motion.div
            className="w-1.5 h-3 bg-[#c9a84c] rounded-full mt-2"
            animate={{ y: [0, 6, 0], opacity: [1, 0, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        </div>
      </motion.div>
    </section>
  );
}

function OrbitVisualization({ chips }: { chips: string[] }) {
  const skills = [
    { name: "Excel", icon: "XLS", angle: 0 },
    { name: "SQL", icon: "{}", angle: 60 },
    { name: "Python", icon: "Py", angle: 120 },
    { name: "PowerBI", icon: "BI", angle: 180 },
    { name: "Audit", icon: "📊", angle: 240 },
    { name: "Finance", icon: "📈", angle: 300 },
  ];

  const radius = 160;

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Orbital rings */}
      {[0.5, 0.75, 1, 1.25, 1.5].map((scale, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full border border-[#c9a84c]/10"
          style={{
            width: radius * 2 * scale,
            height: radius * 2 * scale,
          }}
          animate={{ rotate: i % 2 === 0 ? 360 : -360 }}
          transition={{ duration: 30 + i * 10, repeat: Infinity, ease: "linear" }}
        />
      ))}

      {/* Center */}
      <motion.div
        className="absolute w-24 h-24 rounded-full bg-gradient-to-br from-[#c9a84c]/20 to-[#c9a84c]/5 border-2 border-[#c9a84c]/30 flex flex-col items-center justify-center z-10"
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 3, repeat: Infinity }}
      >
        <span className="text-2xl">🎯</span>
        <span className="text-[9px] uppercase tracking-wider text-[#c9a84c] font-semibold mt-1">
          Focus
        </span>
      </motion.div>

      {/* Skill nodes */}
      {skills.map((skill, i) => {
        const x = Math.cos((skill.angle * Math.PI) / 180) * radius;
        const y = Math.sin((skill.angle * Math.PI) / 180) * radius;

        return (
          <motion.div
            key={skill.name}
            className="absolute"
            initial={{ x, y }}
            animate={{
              x: [x, x + 5, x],
              y: [y, y - 5, y],
              opacity: [0.8, 1, 0.8],
            }}
            transition={{
              duration: 4 + i,
              repeat: Infinity,
              delay: i * 0.3,
            }}
          >
            <motion.div
              className="relative group cursor-pointer"
              whileHover={{ scale: 1.15 }}
              data-magnetic
            >
              <div className="w-14 h-14 rounded-xl bg-[#0f1e33]/80 border border-[#c9a84c]/30 flex flex-col items-center justify-center backdrop-blur-sm group-hover:border-[#c9a84c] transition-colors">
                <span className="text-sm font-bold text-[#c9a84c] font-mono">
                  {skill.icon}
                </span>
                <span className="text-[8px] uppercase tracking-wider text-[#6b7a99] mt-0.5">
                  {skill.name}
                </span>
              </div>
              {/* Glow */}
              <div className="absolute inset-0 rounded-xl bg-[#c9a84c]/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity -z-10" />
            </motion.div>
          </motion.div>
        );
      })}

      {/* Floating chips */}
      {chips.map((chip, i) => (
        <motion.div
          key={i}
          className="absolute text-[10px] uppercase tracking-[0.1em] text-[#c9a84c]/60 bg-[#c9a84c]/5 px-3 py-1 rounded-full border border-[#c9a84c]/10"
          style={{
            left: `${15 + Math.random() * 70}%`,
            top: `${15 + Math.random() * 70}%`,
          }}
          animate={{
            y: [0, -10, 0],
            opacity: [0.5, 0.7, 0.5],
          }}
          transition={{
            duration: 5 + Math.random() * 3,
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
        >
          {chip}
        </motion.div>
      ))}
    </div>
  );
}
