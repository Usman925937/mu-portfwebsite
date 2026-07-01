import { useEffect, useRef, useState } from "react";
import { motion, useInView, useSpring, useMotionValue, useTransform } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// Animated counter with easing
export function AnimatedCounter({
  value,
  suffix = "",
  prefix = "",
  duration = 2,
  className = "",
}: {
  value: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
  className?: string;
}) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;

    let startTime: number;
    const animate = (t: number) => {
      if (!startTime) startTime = t;
      const progress = Math.min((t - startTime) / (duration * 1000), 1);
      const eased = 1 - Math.pow(1 - progress, 4); // easeOutQuart
      setCount(Math.floor(eased * value));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [isInView, value, duration]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {count}
      {suffix}
    </span>
  );
}

// Split text animation
export function SplitText({
  children,
  className = "",
  delay = 0,
}: {
  children: string;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const chars = el.querySelectorAll(".char");
    gsap.fromTo(
      chars,
      { opacity: 0, y: 100, rotateX: -90 },
      {
        opacity: 1,
        y: 0,
        rotateX: 0,
        duration: 0.8,
        delay,
        stagger: 0.02,
        ease: "power3.out",
      }
    );
  }, [delay]);

  return (
    <div ref={ref} className={`overflow-hidden ${className}`}>
      {children.split("").map((char, i) => (
        <span
          key={i}
          className="char inline-block origin-bottom"
          style={{ opacity: 0 }}
        >
          {char === "n" ? "\u00A0" : char}
        </span>
      ))}
    </div>
  );
}

// Marquee / infinite scroll
export function Marquee({
  children,
  speed = 50,
  direction = "left",
  className = "",
}: {
  children: React.ReactNode;
  speed?: number;
  direction?: "left" | "right";
  className?: string;
}) {
  return (
    <div className={`overflow-hidden ${className}`}>
      <motion.div
        className="flex gap-16 whitespace-nowrap"
        animate={{ x: direction === "left" ? [0, -speed * 10] : [-speed * 10, 0] }}
        transition={{ duration: speed, repeat: Infinity, ease: "linear" }}
      >
        {children}
        {children}
        {children}
      </motion.div>
    </div>
  );
}

// Glitch text effect
export function GlitchText({
  children,
  className = "",
}: {
  children: string;
  className?: string;
}) {
  return (
    <div className={`relative ${className}`}>
      <span className="relative z-10">{children}</span>
      <motion.span
        className="absolute inset-0 text-[#ff0080] z-0"
        animate={{ x: [-1, 1, -1], opacity: [0.8, 0.5, 0.8] }}
        transition={{ duration: 0.1, repeat: Infinity, repeatType: "reverse" }}
        aria-hidden
      >
        {children}
      </motion.span>
      <motion.span
        className="absolute inset-0 text-[#00ffff] z-0"
        animate={{ x: [1, -1, 1], opacity: [0.8, 0.5, 0.8] }}
        transition={{ duration: 0.1, repeat: Infinity, repeatType: "reverse" }}
        aria-hidden
      >
        {children}
      </motion.span>
    </div>
  );
}

// Typewriter effect
export function TypeWriter({
  text,
  delay = 50,
  className = "",
  loop = false,
}: {
  text: string;
  delay?: number;
  className?: string;
  loop?: boolean;
}) {
  const [displayText, setDisplayText] = useState("");
  const [cursorVisible, setCursorVisible] = useState(true);

  useEffect(() => {
    let index = 0;
    setDisplayText("");

    const typeInterval = setInterval(() => {
      if (index <= text.length) {
        setDisplayText(text.slice(0, index));
        index++;
      } else if (loop) {
        setTimeout(() => {
          setDisplayText("");
          index = 0;
        }, 2000);
      } else {
        clearInterval(typeInterval);
      }
    }, delay);

    return () => clearInterval(typeInterval);
  }, [text, delay, loop]);

  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setCursorVisible((v) => !v);
    }, 530);
    return () => clearInterval(cursorInterval);
  }, []);

  return (
    <span className={className}>
      {displayText}
      <span className={`${cursorVisible ? "opacity-100" : "opacity-0"}`}>|</span>
    </span>
  );
}

// Stagger text reveal
export function StaggerReveal({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

// Floating label
export function FloatingLabel({
  children,
  className = "",
}: {
  children: string;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    gsap.fromTo(
      el,
      { opacity: 0, y: 20 },
      {
        opacity: 1,
        y: 0,
        duration: 1,
        scrollTrigger: {
          trigger: el,
          start: "top 80%",
          toggleActions: "play none none reverse",
        },
      }
    );
  }, []);

  return (
    <motion.div
      ref={ref}
      className={`inline-flex items-center gap-2 uppercase tracking-[0.2em] ${className}`}
      animate={{ y: [0, -2, 0] }}
      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
    >
      <span className="w-8 h-px bg-current" />
      {children}
    </motion.div>
  );
}

export function GradientText({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`bg-gradient-to-r from-[#c9a84c] via-[#e8c97a] to-[#c9a84c] bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient ${className}`}
    >
      {children}
    </span>
  );
}

// Blur reveal text
export function BlurReveal({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ filter: "blur(20px)", opacity: 0, y: 30 }}
      whileInView={{ filter: "blur(0px)", opacity: 1, y: 0 }}
      transition={{ duration: 1, delay, ease: "easeOut" }}
      viewport={{ once: true }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Perspective text on hover
export function PerspectiveText({
  children,
  className = "",
}: {
  children: string;
  className?: string;
}) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-100, 100], [10, -10]);
  const rotateY = useTransform(x, [-100, 100], [-10, 10]);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    x.set(e.clientX - rect.left - rect.width / 2);
    y.set(e.clientY - rect.top - rect.height / 2);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      className={`perspective-[1000px] ${className}`}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </motion.div>
  );
}
