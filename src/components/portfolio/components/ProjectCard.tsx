import { useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

interface ProjectCardProps {
  title: string;
  category: string;
  description: string;
  tags: string[];
  index: number;
  link?: string;
}

export function ProjectCard({
  title,
  category,
  description,
  tags,
  index,
  link,
}: ProjectCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { damping: 20, stiffness: 300 });
  const mouseYSpring = useSpring(y, { damping: 20, stiffness: 300 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["15deg", "-15deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-15deg", "15deg"]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
    setIsHovered(false);
  };

  return (
    <motion.div
      ref={cardRef}
      className="relative group"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "100px" }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      style={{
        perspective: 1500,
      }}
    >
      <motion.div
        className="relative bg-gradient-to-br from-[#0f1e33] to-[#08121f] rounded-2xl border border-[#c9a84c]/20 overflow-hidden"
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.2 }}
      >
        {/* Glow effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-[#c9a84c]/0 via-[#c9a84c]/5 to-[#c9a84c]/0"
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        />

        {/* Corner accent */}
        <div className="absolute top-0 right-0 w-32 h-32">
          <svg viewBox="0 0 100 100" className="w-full h-full text-[#c9a84c]/20">
            <path
              d="M0 0 L100 0 L100 100"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
            />
          </svg>
        </div>

        <div className="p-6 relative z-10">
          {/* Category pill */}
          <motion.div
            className="flex justify-between items-start mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <span className="text-[10px] uppercase tracking-[0.2em] text-[#c9a84c] bg-[#c9a84c]/10 px-3 py-1 rounded-full border border-[#c9a84c]/20">
              {category}
            </span>
            <motion.span
              className="text-[#6b6b6b] font-mono text-xs"
              whileHover={{ color: "#c9a84c" }}
            >
              {String(index + 1).padStart(2, "0")}
            </motion.span>
          </motion.div>

          {/* Title */}
          <motion.h3
            className="text-xl font-semibold text-white mb-3 group-hover:text-[#c9a84c] transition-colors"
            style={{ transform: "translateZ(30px)" }}
          >
            {title}
          </motion.h3>

          {/* Description */}
          <p className="text-[#6b7a99] text-sm leading-relaxed mb-4">
            {description}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-6">
            {tags.map((tag, i) => (
              <motion.span
                key={tag}
                className="text-[9px] uppercase tracking-[0.15em] text-[#c9a84c]/70 bg-[#c9a84c]/5 px-2 py-1 rounded border border-[#c9a84c]/10"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 + i * 0.05 }}
              >
                {tag}
              </motion.span>
            ))}
          </div>

          {/* Link */}
          {link && (
            <motion.a
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-white text-xs uppercase tracking-[0.1em] group/link"
              whileHover={{ x: 5 }}
            >
              <span className="relative">
                View Project
                <span className="absolute bottom-0 left-0 w-0 h-px bg-[#c9a84c] group-hover/link:w-full transition-all duration-300" />
              </span>
              <motion.svg
                className="w-4 h-4 text-[#c9a84c]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                animate={{ x: isHovered ? 4 : 0 }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </motion.svg>
            </motion.a>
          )}
        </div>

        {/* Background pattern */}
        <div className="absolute inset-0 opacity-[0.03]">
          <div
            className="w-full h-full"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, #c9a84c 1px, transparent 0)`,
              backgroundSize: "24px 24px",
            }}
          />
        </div>

        {/* Spotlight effect */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(600px at ${mouseXSpring.get() }px ${mouseYSpring.get()}px, rgba(201,168,76,0.06), transparent 40%)`,
          }}
        />
      </motion.div>
    </motion.div>
  );
}
