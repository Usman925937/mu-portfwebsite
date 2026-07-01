import { useRef } from "react";
import { motion, useScroll, useTransform, useSpring, useInView } from "framer-motion";

interface ExperienceItem {
  title: string;
  company: string;
  duration: string;
  type: string;
  location: string;
  bullets: string[];
  skills: string[];
}

interface ExperienceTimelineProps {
  items: ExperienceItem[];
}

function TimelineItem({
  item,
  index,
}: {
  item: ExperienceItem;
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <motion.div
      ref={ref}
      className="relative pl-8 md:pl-[calc(50%+40px)] mb-16 last:mb-0"
      initial={{ opacity: 0, y: 60 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, delay: 0.2 }}
    >
      {/* Timeline line */}
      <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px -translate-x-1/2 bg-gradient-to-b from-[#c9a84c] via-[#c9a84c]/30 to-transparent" />

      {/* Timeline dot */}
      <motion.div
        className="absolute left-4 md:left-1/2 -translate-x-1/2 -top-2 w-4 h-4 rounded-full bg-[#0a0f1c] border-2 border-[#c9a84c] z-10"
        animate={isInView ? { scale: [0, 1.2, 1] } : {}}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        <motion.div
          className="absolute inset-1 rounded-full bg-[#c9a84c]"
          animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </motion.div>

      {/* Card */}
      <motion.div
        className="relative bg-gradient-to-br from-[#0f1e33]/60 to-[#08121f]/60 backdrop-blur-sm rounded-xl border border-[#c9a84c]/10 p-6 overflow-hidden group"
        whileHover={{ scale: 1.02, borderColor: "rgba(201,168,76,0.3)" }}
        transition={{ duration: 0.2 }}
      >
        {/* Hover shine */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-[#c9a84c]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        />

        {/* Top row */}
        <div className="flex items-start justify-between mb-3">
          <div>
            <motion.h3
              className="text-xl font-semibold text-white group-hover:text-[#c9a84c] transition-colors"
              layout
            >
              {item.title}
            </motion.h3>
            <p className="text-[#c9a84c] text-sm font-medium mt-1">{item.company}</p>
          </div>
          <div className="text-right text-xs space-y-1">
            <p className="text-[#c9a84c]">{item.duration}</p>
            <p className="text-muted-foreground">{item.type}</p>
          </div>
        </div>

        {/* Location */}
        <p className="text-[10px] text-muted-foreground/70 mb-3 flex items-center gap-1">
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {item.location}
        </p>

        {/* Bullets */}
        <ul className="space-y-2 mb-4">
          {item.bullets.slice(0, 3).map((bullet, i) => (
            <motion.li
              key={i}
              className="text-muted-foreground text-sm pl-4 relative"
              initial={{ opacity: 0, x: -10 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: 0.4 + i * 0.1 }}
            >
              <span className="absolute left-0 top-2 w-1.5 h-1.5 rounded-full bg-[#c9a84c]/50" />
              {bullet}
            </motion.li>
          ))}
        </ul>

        {/* Skills */}
        <div className="flex flex-wrap gap-2">
          {item.skills.slice(0, 5).map((skill, i) => (
            <motion.span
              key={skill}
              className="text-[9px] uppercase tracking-[0.1em] text-[#c9a84c]/80 bg-[#c9a84c]/10 px-2 py-0.5 rounded border border-[#c9a84c]/10 transition-colors hover:border-[#c9a84c]/30"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: 0.5 + i * 0.05 }}
              whileHover={{ scale: 1.05 }}
            >
              {skill}
            </motion.span>
          ))}
        </div>

        {/* Number */}
        <div className="absolute top-4 right-4 text-[#c9a84c]/10 text-6xl font-bold pointer-events-none">
          {String(index + 1).padStart(2, "0")}
        </div>
      </motion.div>
    </motion.div>
  );
}

export function ExperienceTimeline({ items }: ExperienceTimelineProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const progressHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <div ref={containerRef} className="relative max-w-4xl mx-auto">
      {/* Progress indicator */}
      <motion.div
        className="fixed left-4 md:left-1/2 top-[20vh] bottom-[20vh] w-1 -translate-x-1/2 bg-[#c9a84c]/10 z-50 hidden md:block"
        style={{ position: "sticky" }}
      >
        <motion.div
          className="w-full bg-gradient-to-b from-[#c9a84c] to-[#c9a84c]/50"
          style={{ height: progressHeight }}
        />
      </motion.div>

      {items.map((item, i) => (
        <TimelineItem key={item.title + i} item={item} index={i} />
      ))}

      {/* Background decoration */}
      <div className="absolute left-1/2 top-0 -translate-x-1/2 w-[600px] h-[600px] pointer-events-none opacity-20">
        <div
          className="w-full h-full"
          style={{
            background: "radial-gradient(circle, #c9a84c 0%, transparent 70%)",
            filter: "blur(80px)",
          }}
        />
      </div>
    </div>
  );
}
