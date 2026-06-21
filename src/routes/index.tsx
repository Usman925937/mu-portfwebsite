import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { getPortfolioHtml } from "@/lib/site-content.functions";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Muhammad Usman — Data-Driven Audit Professional" },
      {
        name: "description",
        content:
          "Portfolio of Muhammad Usman, data-driven audit professional.",
      },
    ],
  }),
  component: PortfolioPage,
});

function PortfolioPage() {
  const fetchHtml = useServerFn(getPortfolioHtml);
  const [html, setHtml] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const r = await fetchHtml();
        if (!cancelled) {
          setHtml(r.html);
          setLoaded(true);
        }
      } catch {
        if (!cancelled) setLoaded(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [fetchHtml]);

  return (
    <iframe
      srcDoc={html ?? ""}
      title="Portfolio"
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        border: 0,
        background: "#08121f",
        visibility: loaded ? "visible" : "hidden",
      }}
    />
  );
}
