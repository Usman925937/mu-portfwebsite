import { useRef, useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { ProjectCard } from "../components/ProjectCard";
import { GradientText } from "../components/TextAnimations";
import type { Project } from "@/lib/portfolio-render";

interface ProjectsSectionProps {
  items: Project[];
}

const categories = ["All", "Excel", "Finance", "PowerBI", "SQL", "Python"];

export function ProjectsSection({ items }: ProjectsSectionProps) {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });
  const [activeFilter, setActiveFilter] = useState("All");
  const [hoveredFilter, setHoveredFilter] = useState<string | null>(null);

  const filteredItems =
    activeFilter === "All"
      ? items
      : items.filter(
          (p) =>
            p.category.toLowerCase().includes(activeFilter.toLowerCase()) ||
            p.type.toLowerCase().includes(activeFilter.toLowerCase())
        );

  return (
    <section
      ref={ref}
      id="projects"
      className="relative py-32 overflow-hidden"
    >
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <div
          className="absolute bottom-0 left-0 right-0 h-1/2"
          style={{
            background: "linear-gradient(to top, rgba(201,168,76,0.05), transparent)",
          }}
        />
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 relative z-10">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <motion.p
            className="text-[#c9a84c] text-xs uppercase tracking-[0.3em] mb-4"
          >
            Portfolio
          </motion.p>
          <motion.h2
            className="text-4xl md:text-5xl font-serif text-white mb-4"
          >
            <GradientText>Featured Projects</GradientText>
          </motion.h2>
          <motion.p
            className="text-[#6b7a99] max-w-xl mx-auto"
          >
            Real-world financial models, dashboards, and analytics projects
            demonstrating audit-ready skills.
          </motion.p>
        </motion.div>

        {/* Filters */}
        <motion.div
          className="flex flex-wrap justify-center gap-3 mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          {categories.map((cat) => (
            <motion.button
              key={cat}
              className={`relative px-5 py-2 text-xs uppercase tracking-[0.15em] rounded-full transition-colors ${
                activeFilter === cat
                  ? "text-[#0a0f1c]"
                  : "text-[#c9a84c]/70 hover:text-[#c9a84c]"
              }`}
              onClick={() => setActiveFilter(cat)}
              onMouseEnter={() => setHoveredFilter(cat)}
              onMouseLeave={() => setHoveredFilter(null)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {/* Background */}
              <AnimatePresence>
                {activeFilter === cat && (
                  <motion.div
                    className="absolute inset-0 bg-[#c9a84c] rounded-full"
                    layoutId="filterBg"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </AnimatePresence>
              {/* Hover background */}
              {hoveredFilter === cat && activeFilter !== cat && (
                <motion.div
                  className="absolute inset-0 bg-[#c9a84c]/10 rounded-full"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                />
              )}
              <span className="relative z-10">{cat}</span>
            </motion.button>
          ))}
        </motion.div>

        {/* Projects grid */}
        <motion.div
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          layout
        >
          <AnimatePresence mode="popLayout">
            {filteredItems.map((project, i) => (
              <motion.div
                key={project.name}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
              >
                <ProjectCard
                  title={project.name}
                  category={project.type}
                  description={project.desc}
                  tags={project.pillsFront}
                  index={i}
                  link={project.githubUrl}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* View more */}
        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <motion.a
            href="https://github.com/Usman925937"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 border border-[#c9a84c]/30 text-[#c9a84c] text-sm uppercase tracking-[0.15em] rounded-lg hover:border-[#c9a84c] hover:bg-[#c9a84c]/5 transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
            </svg>
            View All on GitHub
          </motion.a>
        </motion.div>
      </div>

      {/* Decorative */}
      <motion.div
        className="absolute right-0 top-1/4 w-64 h-64 opacity-10"
        animate={{ rotate: 360 }}
        transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
      >
        <div className="w-full h-full border-2 border-dashed border-[#c9a84c] rounded-full" />
      </motion.div>
    </section>
  );
}
