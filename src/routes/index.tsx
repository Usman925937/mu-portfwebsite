import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Muhammad Usman — Data-Driven Audit Professional" },
      { name: "description", content: "Portfolio of Muhammad Usman, data-driven audit professional." },
    ],
  }),
  component: PortfolioPage,
});

function PortfolioPage() {
  return (
    <iframe
      src="/portfolio.html"
      title="Portfolio"
      style={{ position: "fixed", inset: 0, width: "100vw", height: "100vh", border: 0 }}
    />
  );
}
