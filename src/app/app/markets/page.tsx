import type { Metadata } from "next";
import { MarketsView } from "@/features/markets/MarketsView";

export const metadata: Metadata = {
  title: "Energy Markets",
  description: "Historical day-ahead electricity prices by bidding zone and the implied electricity input cost of hydrogen.",
};

export default function MarketsPage() {
  return <MarketsView />;
}
