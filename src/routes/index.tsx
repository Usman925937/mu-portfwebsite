import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { getPublicPortfolioData } from "@/lib/portfolio-data.function";
import Portfolio from "@/components/portfolio/Portfolio";
import type { PortfolioData } from "@/lib/portfolio-render";
import { DEFAULT_DATA } from "@/lib/portfolio-render";
import { motion } from "framer-motion";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Muhammad Usman — Data-Driven Audit Professional" },
      {
        name: "description",
        content:
          "Portfolio of Muhammad Usman, data-driven audit professional with expertise in financial modeling, Excel, SQL, and Python.",
      },
    ],
  }),
  component: PortfolioPage,
});

function PortfolioPage() {
  const fetchData = useServerFn(getPublicPortfolioData);
  const [data, setData] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const r = await fetchData();
        if (!cancelled) {
          setData(r.data);
        }
      } catch (e) {
        console.error("Failed to load portfolio data:", e);
        if (!cancelled) {
          setData(DEFAULT_DATA);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [fetchData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#08121f] flex items-center justify-center">
        <LoadingScreen />
      </div>
    );
  }

  return <Portfolio data={data || undefined} />;
}

function LoadingScreen() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((p) => Math.min(p + Math.random() * 15, 100));
    }, 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-64">
      <div className="mb-4 text-center">
        <motion.span
          className="text-[#c9a84c] font-serif text-2xl"
          animate={{ opacity: [1, 0.5, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          MU.
        </motion.span>
      </div>
      <div className="h-1 bg-[#c9a84c]/20 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-[#c9a84c] rounded-full"
          style={{ width: `${progress}%` }}
          transition={{ duration: 0.1 }}
        />
      </div>
      <p className="mt-3 text-center text-[#6b7a99] text-xs uppercase tracking-wider">
        Loading Experience...
      </p>
    </div>
  );
}
