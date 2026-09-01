import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RateOverviewTable from "@/components/rates/RateOverviewTable";
import type { LaneSummary } from "@/lib/types";

const LANES: LaneSummary[] = [
  {
    trade_lane: "Shanghai-Europe",
    container_type: "40ft",
    current_rate_usd: 2450,
    change_7d_pct: 8.2,
    trend: "rising",
    source: "Drewry",
    rate_date: "2026-08-30",
  },
  {
    trade_lane: "Shanghai-Jebel Ali",
    container_type: "20ft",
    current_rate_usd: 1180,
    change_7d_pct: -3.4,
    trend: "falling",
    source: "Freightos",
    rate_date: "2026-08-30",
  },
];

describe("RateOverviewTable", () => {
  it("renders a row per lane with a formatted rate", () => {
    render(<RateOverviewTable lanes={LANES} />);

    expect(screen.getByText("Shanghai → Europe")).toBeInTheDocument();
    expect(screen.getByText("Shanghai → Jebel Ali")).toBeInTheDocument();
    // Thousands separator matters here — a raw "2450" is a formatting regression.
    expect(screen.getByText(/2,450/)).toBeInTheDocument();
  });

  it("labels the trend direction for each lane", () => {
    render(<RateOverviewTable lanes={LANES} />);

    expect(screen.getByText("Rising")).toBeInTheDocument();
    expect(screen.getByText("Falling")).toBeInTheDocument();
  });

  it("shows an empty state instead of a bare table when there are no lanes", () => {
    render(<RateOverviewTable lanes={[]} />);

    expect(
      screen.getByText(/no trade lanes match your search criteria/i),
    ).toBeInTheDocument();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });

  it("calls onSelectLane with the clicked lane", async () => {
    const onSelectLane = jest.fn();
    render(<RateOverviewTable lanes={LANES} onSelectLane={onSelectLane} />);

    await userEvent.click(screen.getByText("Shanghai → Jebel Ali"));

    expect(onSelectLane).toHaveBeenCalledWith(LANES[1]);
  });
});
