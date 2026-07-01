import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, useSpring, useMotionValue } from "framer-motion";
import type { PortfolioData, Experience, Project } from "@/lib/portfolio-render";
import { DEFAULT_DATA } from "@/lib/portfolio-render";

// ============ CUSTOM CURSOR ============
function CustomCursor() {
  const cursorX = useMotionValue(0);
  const cursorY = useMotionValue(0);
  const [isHovering, setIsHovering] = useState(false);
  const cursorXSpring = useSpring(cursorX, { damping: 25, stiffness: 400 });
  const cursorYSpring = useSpring(cursorY, { damping: 25, stiffness: 400 });

  useEffect(() => {
    const moveCursor = (e: MouseEvent) => { cursorX.set(e.clientX); cursorY.set(e.clientY); };
    const handleMouseOver = (e: MouseEvent) => { if ((e.target as HTMLElement).closest("a, button, [data-hover]")) setIsHovering(true); };
    const handleMouseOut = () => setIsHovering(false);
    window.addEventListener("mousemove", moveCursor);
    document.addEventListener("mouseover", handleMouseOver);
    document.addEventListener("mouseout", handleMouseOut);
    return () => { window.removeEventListener("mousemove", moveCursor); document.removeEventListener("mouseover", handleMouseOver); document.removeEventListener("mouseout", handleMouseOut); };
  }, [cursorX, cursorY]);

  return (
    <motion.div className="fixed pointer-events-none z-[9999] mix-blend-difference" style={{ x: cursorXSpring, y: cursorYSpring, translateX: "-50%", translateY: "-50%" }}>
      <motion.div className="rounded-full bg-white" animate={{ width: isHovering ? 50 : 10, height: isHovering ? 50 : 10 }} transition={{ type: "spring", damping: 20 }} />
    </motion.div>
  );
}

// ============ ANIMATED COUNTER ============
function AnimatedCounter({ value }: { value: number | string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const target = typeof value === "string" ? parseInt(value.replace(/\D/g, "")) || 0 : value;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const duration = 2000;
          const start = performance.now();
          const animate = (t: number) => {
            const p = Math.min((t - start) / duration, 1);
            setCount(Math.floor(p * p * p * target));
            if (p < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
        }
      });
    }, { threshold: 0.5 });
    observer.observe(el);
    return () => observer.disconnect();
  }, [target]);

  return <span ref={ref}>{count}</span>;
}

// ============ ANIMATED BACKGROUND ============
function AnimatedBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <motion.div
        className="absolute w-[600px] h-[600px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(201,168,76,0.15) 0%, transparent 70%)",
          top: "20%",
          left: "-10%",
        }}
        animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className="absolute w-[400px] h-[400px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(201,168,76,0.1) 0%, transparent 70%)",
          bottom: "10%",
          right: "-5%",
        }}
        animate={{ scale: [1, 1.3, 1], rotate: [0, -180, -360] }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
      />
      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(rgba(201,168,76,0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(201,168,76,0.3) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />
      {/* Floating particles */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-[#c9a84c]/40 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.2, 0.6, 0.2],
          }}
          transition={{
            duration: 5 + Math.random() * 5,
            repeat: Infinity,
            delay: Math.random() * 3,
          }}
        />
      ))}
    </div>
  );
}

// ============ HERO SECTION ============
function HeroSection({ data }: { data: PortfolioData }) {
  const h = data.hero;
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);

  return (
    <section ref={containerRef} className="relative min-h-screen flex items-center justify-center overflow-hidden" id="home">
      <motion.div className="absolute inset-0 z-0" style={{ y }}>
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0f1c] via-[#08121f] to-[#0f1e33]" />
      </motion.div>

      <div className="relative z-10 container mx-auto px-6 py-24 grid lg:grid-cols-2 gap-12 items-center">
        <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
          <motion.p className="text-[#c9a84c] text-xs uppercase tracking-[0.3em] mb-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
            {h.eyebrow}
          </motion.p>
          <motion.h1 className="text-4xl md:text-6xl lg:text-7xl font-serif text-white leading-[0.9] mb-4" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <motion.span className="inline-block" animate={{ y: [0, -3, 0] }} transition={{ duration: 3, repeat: Infinity }}>{h.firstName}</motion.span>
            <br />
            <motion.span className="text-[#c9a84c]" animate={{ y: [0, 3, 0] }} transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}>{h.lastName}</motion.span>
          </motion.h1>
          <motion.h2 className="text-lg md:text-xl text-[#6b7a99] mb-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>{h.subtitle}</motion.h2>
          <motion.div className="text-[#ccd6f6] mb-8 max-w-lg" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} dangerouslySetInnerHTML={{ __html: h.description }} />
          <motion.div className="flex flex-wrap gap-4 mb-12" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}>
            <motion.a href="#experience" className="px-6 py-3 bg-[#c9a84c] text-[#08121f] font-semibold text-sm uppercase tracking-wider rounded hover:bg-[#e8c97a] transition-colors" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }} data-hover>{h.primaryCtaText}</motion.a>
            <motion.a href={h.secondaryCtaHref} target="_blank" rel="noopener noreferrer" className="px-6 py-3 border border-[#c9a84c]/50 text-[#c9a84c] font-medium text-sm uppercase tracking-wider rounded hover:bg-[#c9a84c]/10 transition-colors" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }} data-hover>{h.secondaryCtaText}</motion.a>
          </motion.div>
          <motion.div className="flex flex-wrap gap-8 pt-8 border-t border-[#c9a84c]/20" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}>
            {h.stats.map((stat, i) => (
              <motion.div key={i} className="text-center" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1 + i * 0.1 }}>
                <div className="text-2xl md:text-3xl font-serif text-[#c9a84c]"><AnimatedCounter value={stat.num} /></div>
                <div className="text-[10px] uppercase tracking-wider text-[#6b7a99]">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
        <motion.div className="hidden lg:flex items-center justify-center h-[400px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
          <OrbitDiagram />
        </motion.div>
      </div>

      <motion.div className="absolute bottom-8 left-1/2 -translate-x-1/2" animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity }}>
        <div className="w-5 h-8 border-2 border-[#c9a84c]/30 rounded-full flex justify-center pt-1">
          <motion.div className="w-1 h-2 bg-[#c9a84c] rounded-full" animate={{ y: [0, 8, 0], opacity: [1, 0, 1] }} transition={{ duration: 1.5, repeat: Infinity }} />
        </div>
      </motion.div>
    </section>
  );
}

// ============ ORBIT DIAGRAM ============
function OrbitDiagram() {
  const skills = [
    { icon: "XLS", label: "Excel" },
    { icon: "{}", label: "SQL" },
    { icon: "Py", label: "Python" },
    { icon: "BI", label: "Power BI" },
  ];

  return (
    <div className="relative w-[350px] h-[350px]">
      {[80, 130, 170].map((r, i) => (
        <motion.div
          key={i}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#c9a84c]/15"
          style={{ width: r * 2, height: r * 2 }}
          animate={{ rotate: i % 2 === 0 ? 360 : -360 }}
          transition={{ duration: 20 + i * 10, repeat: Infinity, ease: "linear" }}
        />
      ))}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-gradient-to-br from-[#c9a84c]/30 to-[#c9a84c]/5 border-2 border-[#c9a84c]/50 flex flex-col items-center justify-center"
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 3, repeat: Infinity }}
      >
        <span className="text-2xl">📈</span>
        <span className="text-[8px] uppercase text-[#c9a84c] font-bold mt-0.5">Finance</span>
      </motion.div>
      {skills.map((s, i) => (
        <motion.div
          key={s.label}
          className="absolute flex flex-col items-center gap-1"
          style={{ top: `${20 + i * 20}%`, left: `${10 + i * 25}%` }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1, y: [0, -6, 0] }}
          transition={{ opacity: { delay: i * 0.2 }, y: { duration: 3 + i, repeat: Infinity } }}
          whileHover={{ scale: 1.15 }}
        >
          <div className="w-10 h-10 rounded-lg bg-[#0f1e33]/90 border border-[#c9a84c]/30 flex items-center justify-center text-xs font-bold text-[#c9a84c]">{s.icon}</div>
          <span className="text-[9px] uppercase tracking-wider text-[#6b7a99]">{s.label}</span>
        </motion.div>
      ))}
    </div>
  );
}

// ============ EXPERIENCE SECTION ============
function ExperienceSection({ items }: { items: Experience[] }) {
  return (
    <section id="experience" className="relative py-20 px-6">
      <div className="container mx-auto">
        <motion.div className="mb-12" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-[#c9a84c] text-xs uppercase tracking-[0.25em] mb-2">Career Journey</p>
          <h2 className="text-3xl md:text-4xl font-serif text-white">Work Experience</h2>
        </motion.div>
        <div className="relative">
          <div className="absolute left-0 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-[#c9a84c] via-[#c9a84c]/30 to-transparent" />
          {items.map((exp, i) => (
            <motion.div
              key={i}
              className={`relative flex flex-col md:flex-row gap-6 mb-8 ${i % 2 === 0 ? "" : "md:flex-row-reverse"}`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="absolute left-0 md:left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-[#c9a84c]" />
              <motion.div className={`w-full md:w-[calc(50%-30px)] ml-6 md:ml-0 ${i % 2 === 0 ? "md:mr-auto md:pr-8" : "md:ml-auto md:pl-8"}`} whileHover={{ scale: 1.02 }}>
                <div className="bg-[#0f1e33]/80 border border-[#c9a84c]/20 rounded-lg p-5 relative overflow-hidden group hover:border-[#c9a84c]/40 transition-colors">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#c9a84c]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-lg font-semibold text-white group-hover:text-[#c9a84c] transition-colors">{exp.role}</h3>
                        <p className="text-[#c9a84c] text-sm">{exp.org}</p>
                      </div>
                      <div className="text-right text-xs text-[#6b7a99]">{exp.date}</div>
                    </div>
                    <ul className="space-y-1.5 mb-3">
                      {exp.bullets.slice(0, 3).map((b, j) => (
                        <li key={j} className="text-[#6b7a99] text-sm pl-3 relative before:content-['•'] before:absolute before:left-0 before:text-[#c9a84c]">{b}</li>
                      ))}
                    </ul>
                    <div className="flex flex-wrap gap-1.5">
                      {exp.skills.slice(0, 5).map((s, j) => (
                        <span key={j} className="px-2 py-0.5 text-[10px] uppercase border border-[#c9a84c]/20 text-[#c9a84c]/70 rounded">{s}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============ PROJECTS SECTION ============
function ProjectsSection({ items }: { items: Project[] }) {
  const [filter, setFilter] = useState("all");
  const categories = ["all", ...new Set(items.flatMap((p) => p.category.split(" ")))];
  const filtered = filter === "all" ? items : items.filter((p) => p.category.includes(filter));

  return (
    <section id="projects" className="relative py-20 px-6">
      <div className="container mx-auto">
        <motion.div className="mb-12" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
          <p className="text-[#c9a84c] text-xs uppercase tracking-[0.25em] mb-2">Portfolio</p>
          <h2 className="text-3xl md:text-4xl font-serif text-white mb-4">Featured Projects</h2>
        </motion.div>
        <motion.div className="flex flex-wrap gap-2 mb-8" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
          {categories.slice(0, 5).map((cat) => (
            <motion.button key={cat} className={`px-3 py-1.5 text-xs uppercase border rounded transition-colors ${filter === cat ? "bg-[#c9a84c] border-[#c9a84c] text-[#08121f]" : "border-[#c9a84c]/30 text-[#c9a84c] hover:border-[#c9a84c]"}`} onClick={() => setFilter(cat)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>{cat}</motion.button>
          ))}
        </motion.div>
        <motion.div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4" layout>
          {filtered.map((p, i) => <ProjectCard key={p.name} project={p} index={i} />)}
        </motion.div>
      </div>
    </section>
  );
}

function ProjectCard({ project, index }: { project: Project; index: number }) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <motion.div
      className="relative h-[240px] cursor-pointer"
      style={{ perspective: 800 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      onHoverStart={() => setIsFlipped(true)}
      onHoverEnd={() => setIsFlipped(false)}
    >
      <motion.div className="relative w-full h-full" style={{ transformStyle: "preserve-3d" }} animate={{ rotateY: isFlipped ? 180 : 0 }} transition={{ type: "spring", damping: 20 }}>
        <div className={`absolute inset-0 backface-hidden bg-[#0f1e33]/90 border border-[#c9a84c]/20 rounded-lg p-4 ${isFlipped ? "invisible" : ""}`}>
          <span className="inline-block px-2 py-0.5 text-[10px] uppercase tracking-wider text-[#c9a84c] border border-[#c9a84c]/30 rounded mb-2">{project.type}</span>
          <h3 className="text-base font-semibold text-white mb-2">{project.name}</h3>
          <p className="text-[#6b7a99] text-sm mb-3 line-clamp-2">{project.desc}</p>
          <div className="flex flex-wrap gap-1">
            {project.pillsFront.slice(0, 3).map((pill, j) => (
              <span key={j} className="px-1.5 py-0.5 text-[9px] uppercase bg-[#c9a84c]/10 text-[#c9a84c]/80 rounded">{pill}</span>
            ))}
          </div>
        </div>
        <div className={`absolute inset-0 backface-hidden bg-[#c9a84c]/10 border border-[#c9a84c]/40 rounded-lg p-4 ${isFlipped ? "" : "invisible"}`} style={{ transform: "rotateY(180deg)" }}>
          <span className="text-[9px] uppercase tracking-wider text-[#c9a84c] mb-1 block">What's Inside</span>
          <p className="text-[#ccd6f6] text-sm mb-3 line-clamp-4">{project.insideText}</p>
          <div className="flex flex-wrap gap-1 mb-3">
            {project.pillsBack.map((pill, j) => (
              <span key={j} className="px-1.5 py-0.5 text-[9px] uppercase bg-[#c9a84c]/20 text-[#c9a84c] rounded">{pill}</span>
            ))}
          </div>
          <motion.a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 border border-white/20 rounded text-white text-xs uppercase hover:bg-[#c9a84c] hover:text-[#08121f] transition-colors" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98}}>
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/></svg>
            GitHub
          </motion.a>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ============ CONTACT SECTION ============
function ContactSection({ data }: { data: PortfolioData }) {
  return (
    <section id="contact" className="relative py-20 px-6">
      <div className="container mx-auto text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-[#c9a84c] text-xs uppercase tracking-[0.25em] mb-2">Get In Touch</p>
          <h2 className="text-3xl md:text-4xl font-serif text-white mb-4">Let's Connect</h2>
          <p className="text-[#6b7a99] max-w-lg mx-auto mb-8">Open for opportunities in external audit at Big 4 firms. Let's discuss how my skills can add value to your team.</p>
          <div className="flex justify-center gap-4">
            <motion.a href={data.hero.secondaryCtaHref} target="_blank" rel="noopener noreferrer" className="px-6 py-3 bg-[#c9a84c] text-[#08121f] font-semibold text-sm uppercase tracking-wider rounded hover:bg-[#e8c97a] transition-colors" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>LinkedIn Profile</motion.a>
          </div>
        </motion.div>
      </div>
      <footer className="mt-16 pt-8 border-t border-[#c9a84c]/10 text-center text-[#6b7a99] text-sm" dangerouslySetInnerHTML={{ __html: data.footerCopy }} />
    </section>
  );
}

// ============ NAV ============
function Nav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <motion.nav
      className={`fixed top-0 left-0 right-0 z-50 transition-colors ${scrolled ? "bg-[#08121f]/95 backdrop-blur-lg border-b border-[#c9a84c]/10" : "bg-transparent"}`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
    >
      <div className="container mx-auto px-6 py-3 flex items-center justify-between">
        <motion.a href="#home" className="text-[#c9a84c] font-serif text-lg font-bold" whileHover={{ scale: 1.05 }}>MU.</motion.a>
        <div className="flex items-center gap-4">
          {["About", "Experience", "Projects", "Contact"].map((item) => (
            <motion.a key={item} href={`#${item.toLowerCase()}`} className="text-[10px] uppercase tracking-wider text-[#6b7a99] hover:text-[#c9a84c] transition-colors hidden md:block" whileHover={{ y: -1 }}>{item}</motion.a>
          ))}
        </div>
      </div>
    </motion.nav>
  );
}

// ============ MAIN PORTFOLIO ============
export default function Portfolio({ data }: { data?: PortfolioData }) {
  const portfolioData = data || DEFAULT_DATA;

  return (
    <div className="relative bg-[#08121f] text-white overflow-x-hidden">
      <AnimatedBackground />
      <div className="hidden lg:block"><CustomCursor /></div>
      <Nav />
      <main className="relative z-10">
        <HeroSection data={portfolioData} />
        <ExperienceSection items={portfolioData.experience} />
        <ProjectsSection items={portfolioData.projects} />
        <ContactSection data={portfolioData} />
      </main>
      <div className="fixed inset-0 pointer-events-none z-[100] opacity-[0.012]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` }} />
    </div>
  );
}
