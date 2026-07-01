"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Components
import { MagneticCursor } from "./components/MagneticCursor";
import { Navigation, Footer } from "./components/Navigation";
import {
  NoiseOverlay,
  GradientOrbs,
  DotPattern,
  GridPattern,
  FloatingParticles,
  AnimatedBackgroundLines,
} from "./components/Effects";

// Sections
import { HeroSection } from "./sections/HeroSection";
import { AboutSection } from "./sections/AboutSection";
import { ExperienceSection } from "./sections/ExperienceSection";
import { ProjectsSection } from "./sections/ProjectsSection";
import { ContactSection } from "./sections/ContactSection";

// Data
import type { PortfolioData } from "@/lib/portfolio-render";
import { DEFAULT_DATA } from "@/lib/portfolio-render";
import { useScrollAnimation } from "./components/ScrollController";

gsap.registerPlugin(ScrollTrigger);

export default function PortfolioPremium({
  data,
}: {
  data?: PortfolioData;
}) {
  const portfolioData = data || DEFAULT_DATA;
  useScrollAnimation();

  // Initialize Lenis smooth scroll
  useEffect(() => {
    // Refresh ScrollTrigger on mount
    ScrollTrigger.refresh();

    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  return (
    <div className="relative bg-[#0a0f1c] text-white overflow-x-hidden antialiased">
      {/* Global effects */}
      <div className="hidden lg:block">
        <MagneticCursor />
      </div>
      <NoiseOverlay />
      <GradientOrbs />
      <DotPattern />
      {/* <GridPattern /> */}
      <FloatingParticles />
      <AnimatedBackgroundLines />

      {/* Navigation */}
      <Navigation />

      {/* Main content */}
      <main className="relative z-10">
        <HeroSection data={portfolioData} />

        <div id="about">
          <AboutSection />
        </div>

        <ExperienceSection items={portfolioData.experience} />

        <ProjectsSection items={portfolioData.projects} />

        <ContactSection data={portfolioData} />
      </main>

      {/* Footer */}
      <Footer />

      {/* Global styles */}
      <style jsx global>{`
        * {
          cursor: none;
        }

        @media (max-width: 1024px) {
          * {
            cursor: auto;
          }
        }

        html {
          scroll-behavior: smooth;
        }

        body {
          overflow-x: hidden;
        }

        ::selection {
          background: rgba(201, 168, 76, 0.3);
          color: white;
        }

        ::-webkit-scrollbar {
          width: 6px;
        }

        ::-webkit-scrollbar-track {
          background: #0a0f1c;
        }

        ::-webkit-scrollbar-thumb {
          background: rgba(201, 168, 76, 0.3);
          border-radius: 3px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: rgba(201, 168, 76, 0.5);
        }

        @keyframes gradient {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }

        .animate-gradient {
          animation: gradient 4s ease infinite;
        }

        .perspective-\[1000px\] {
          perspective: 1000px;
        }

        .backface-hidden {
          backface-visibility: hidden;
        }

        .origin-bottom-left {
          transform-origin: bottom left;
        }

        .font-serif {
          font-family: "Playfair Display", ui-serif, Georgia, serif;
        }
      `}</style>
    </div>
  );
}
