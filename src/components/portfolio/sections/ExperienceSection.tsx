import { useRef } from "react";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { ExperienceTimeline } from "../components/ExperienceTimeline";
import { GradientText, Marquee } from "../components/TextAnimations";
import type { Experience } from "@/lib/portfolio-render";

interface ExperienceSectionProps {
  items: Experience[];
}

export function ExperienceSection({ items }: ExperienceSectionProps) {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], ["5%", "-5%"]);

  return (
    <section
      ref={ref}
      id="experience"
      className="relative py-32 overflow-hidden"
    >
      {/* Background gradient */}
      <div className="absolute inset-0 z-0">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full opacity-20"
          style={{
            background: "radial-gradient(circle, #c9a84c 0%, transparent 70%)",
            filter: "blur(100px)",
          }}
        />
      </div>

      {/* Section header */}
      <motion.div
        className="container mx-auto px-6 mb-16 relative z-10"
        style={{ y }}
      >
        <motion.p
          className="text-[#c9a84c] text-xs uppercase tracking-[0.3em] mb-4 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          Career Journey
        </motion.p>
        <motion.h2
          className="text-4xl md:text-5xl font-serif text-white text-center mb-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
        >
          <GradientText>Work Experience</GradientText>
        </motion.h2>
        <motion.p
          className="text-[#6b7a99] text-center max-w-xl mx-auto"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          From internships to specialized roles, building expertise in audit,
          finance, and data analytics.
        </motion.p>
      </motion.div>

      {/* Timeline */}
      <div className="relative z-10">
        <ExperienceTimeline items={items} />
      </div>

      {/* Skills marquee */}
      <motion.div
        className="mt-24 relative z-10 overflow-hidden"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        <Marquee speed={80} className="py-6">
          {[...items.flatMap((e) => e.skills), "Audit", "Finance", "Data Analytics"].map(
            (skill, i) => (
              <span
                key={i}
                className="text-sm uppercase tracking-[0.2em] text-[#c9a84c]/30 whitespace-nowrap"
              >
                {skill}
              </span>
            )
          )}
        </Marquee>
      </motion.div>

      {/* Decorative elements */}
      <motion.div
        className="absolute left-10 top-1/3 w-48 h-48"
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
      >
        <div className="w-full h-full border border-dashed border-[#c9a84c]/10 rounded-full" />
      </motion.div>
      <motion.div
        className="absolute right-10 bottom-1/3 w-32 h-32"
        animate={{ rotate: [360, 0] }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
      >
        <div className="w-full h-full border border-dashed border-[#c9a84c]/10 rounded-full" />
      </motion.div>
    </section>
  );
}
