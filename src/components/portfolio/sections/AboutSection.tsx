import { useRef } from "react";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { AnimatedCounter, BlurReveal, GradientText } from "../components/TextAnimations";

const skills = [
  { name: "Excel", level: 95, category: "Analysis" },
  { name: "SQL", level: 85, category: "Analysis" },
  { name: "Python", level: 80, category: "Analysis" },
  { name: "Power BI", level: 90, category: "Visualization" },
  { name: "Financial Modeling", level: 95, category: "Finance" },
  { name: "Audit Tools", level: 88, category: "Audit" },
  { name: "Data Analysis", level: 92, category: "Analysis" },
  { name: "DCF Valuation", level: 90, category: "Finance" },
];

const certifications = [
  "ACCA Candidate",
  "Excel Expert",
  "Financial Modeling",
  "Data Analytics",
  "Big 4 Ready",
];

export function AboutSection() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const x = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);

  return (
    <section
      ref={ref}
      id="about"
      className="relative py-32 overflow-hidden"
    >
      {/* Background elements */}
      <div className="absolute inset-0 z-0">
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `
              linear-gradient(90deg, #c9a84c 1px, transparent 1px),
              linear-gradient(180deg, #c9a84c 1px, transparent 1px)
            `,
            backgroundSize: "50px 50px",
          }}
        />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Section header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <motion.p
            className="text-[#c9a84c] text-xs uppercase tracking-[0.3em] mb-4"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            About Me
          </motion.p>
          <motion.h2
            className="text-4xl md:text-5xl font-serif text-white mb-4"
          >
            <GradientText>Big 4 Ready</GradientText>
          </motion.h2>
          <motion.p
            className="text-[#6b7a99] max-w-2xl mx-auto text-lg"
          >
            A finance professional combining accounting expertise with data analytics
            to deliver exceptional audit performance.
          </motion.p>
        </motion.div>

        {/* Main content grid */}
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: Text content */}
          <div className="space-y-8">
            <BlurReveal>
              <h3 className="text-2xl font-serif text-white mb-4">
                Data-Driven Audit Professional
              </h3>
              <p className="text-[#6b7a99] leading-relaxed">
                A finance and accounting student with deep expertise in data analytics,
                financial modeling, and audit tools. Bringing a rare combination of
                accounting acumen and data technology skills to the external audit
                profession.
              </p>
            </BlurReveal>

            <BlurReveal delay={0.2}>
              <h4 className="text-lg font-semibold text-[#c9a84c] mb-3">
                Certifications & Achievements
              </h4>
              <div className="flex flex-wrap gap-3">
                {certifications.map((cert, i) => (
                  <motion.div
                    key={cert}
                    className="px-4 py-2 bg-[#c9a84c]/10 border border-[#c9a84c]/20 rounded-lg text-sm text-[#c9a84c]"
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    whileHover={{ scale: 1.05, borderColor: "rgba(201,168,76,0.5)" }}
                  >
                    {cert}
                  </motion.div>
                ))}
              </div>
            </BlurReveal>

            <BlurReveal delay={0.4}>
              <div className="grid grid-cols-2 gap-6 pt-4">
                <div className="text-center p-4 bg-[#0f1e33]/50 rounded-xl border border-[#c9a84c]/10">
                  <div className="text-3xl font-serif text-[#c9a84c] mb-1">
                    <AnimatedCounter value={53} suffix=" WPM" />
                  </div>
                  <div className="text-[10px] uppercase tracking-wider text-[#6b7a99]">
                    Typing Speed
                  </div>
                </div>
                <div className="text-center p-4 bg-[#0f1e33]/50 rounded-xl border border-[#c9a84c]/10">
                  <div className="text-3xl font-serif text-[#c9a84c] mb-1">
                    <AnimatedCounter value={95} suffix="%" />
                  </div>
                  <div className="text-[10px] uppercase tracking-wider text-[#6b7a99]">
                    Accuracy
                  </div>
                </div>
              </div>
            </BlurReveal>
          </div>

          {/* Right: Skill bars */}
          <div className="space-y-6" ref={containerRef}>
            <motion.h4 className="text-lg font-semibold text-white mb-6">
              Core Competencies
            </motion.h4>
            {skills.map((skill, i) => (
              <motion.div
                key={skill.name}
                className="group"
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <span className="text-sm text-white group-hover:text-[#c9a84c] transition-colors">
                      {skill.name}
                    </span>
                    <span className="ml-2 text-[9px] uppercase tracking-wider text-[#6b7a99]/50">
                      {skill.category}
                    </span>
                  </div>
                  <span className="text-sm text-[#c9a84c] font-mono">
                    <AnimatedCounter value={skill.level} suffix="%" delay={i * 0.05} />
                  </span>
                </div>
                <div className="h-2 bg-[#0f1e33] rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-[#c9a84c]/40 via-[#c9a84c] to-[#c9a84c]/40 rounded-full relative"
                    initial={{ width: 0 }}
                    whileInView={{ width: `${skill.level}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.5, delay: i * 0.1, ease: "easeOut" }}
                  >
                    {/* Shimmer effect */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                      animate={{ x: ["-100%", "100%"] }}
                      transition={{ duration: 2, repeat: Infinity, repeatType: "loop" }}
                    />
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Floating decorative elements */}
        <motion.div
          className="absolute -right-20 top-20 w-40 h-40 opacity-20"
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        >
          <div className="w-full h-full border border-dashed border-[#c9a84c]/30 rounded-full" />
        </motion.div>
      </div>
    </section>
  );
}
