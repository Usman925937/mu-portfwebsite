import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { MagneticElement } from "../components/MagneticCursor";
import { GradientText, TypeWriter } from "../components/TextAnimations";
import type { PortfolioData } from "@/lib/portfolio-render";

interface ContactSectionProps {
  data: PortfolioData;
}

export function ContactSection({ data }: ContactSectionProps) {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });
  const [copied, setCopied] = useState(false);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(data.hero.secondaryCtaHref);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section
      ref={ref}
      id="contact"
      className="relative py-32 overflow-hidden"
    >
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-10"
          style={{
            background: "radial-gradient(circle, #c9a84c 0%, transparent 70%)",
          }}
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 relative z-10">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <motion.p
            className="text-[#c9a84c] text-xs uppercase tracking-[0.3em] mb-4"
          >
            Get In Touch
          </motion.p>
          <motion.h2
            className="text-4xl md:text-6xl font-serif text-white mb-6"
          >
            <GradientText>Let's Connect</GradientText>
          </motion.h2>
          <motion.div
            className="max-w-xl mx-auto"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <p className="text-[#6b7a99] text-lg mb-2">
              Open for opportunities in external audit at Big 4 firms.
            </p>
            <p className="text-[#c9a84c]/80">
              Let's discuss how my skills can add value to your team.
            </p>
          </motion.div>
        </motion.div>

        {/* Main CTA */}
        <motion.div
          className="flex flex-col items-center justify-center gap-8"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
        >
          {/* Email button */}
          <MagneticElement strength={0.3}>
            <motion.a
              href={data.hero.secondaryCtaHref}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative px-12 py-6 bg-[#c9a84c] text-[#0a0f1c] text-lg font-semibold uppercase tracking-[0.15em] rounded overflow-hidden"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="relative z-10 flex items-center gap-3">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.396 7-2.575 7 2.296v6.939z"/>
                </svg>
                Connect on LinkedIn
              </span>
              <motion.div
                className="absolute inset-0 bg-white"
                initial={{ x: "-100%" }}
                whileHover={{ x: "100%" }}
                transition={{ duration: 0.4 }}
              />
            </motion.a>
          </MagneticElement>

          {/* Alternative contact */}
          <motion.div
            className="flex items-center gap-6"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex items-center gap-2 text-[#6b7a99]">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
              <span className="text-sm">Rawalpindi, Pakistan</span>
            </div>
            <span className="text-[#c9a84c]/30">|</span>
            <motion.button
              onClick={handleCopyEmail}
              className="flex items-center gap-2 text-[#c9a84c] text-sm hover:underline"
              whileHover={{ scale: 1.05 }}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              {copied ? "Copied!" : "Copy LinkedIn URL"}
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Availability badge */}
        <motion.div
          className="flex justify-center mt-12"
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
            <motion.span
              className="w-2 h-2 bg-emerald-500 rounded-full"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <span className="text-emerald-400 text-xs uppercase tracking-[0.15em]">
              Available for Opportunities
            </span>
          </div>
        </motion.div>

        {/* Decorative text */}
        <motion.div
          className="mt-20 overflow-hidden"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <motion.div
            className="text-[15vw] font-serif text-[#c9a84c]/[0.03] text-center leading-none select-none"
          >
            CONTACT
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
