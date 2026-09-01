import { render, screen } from "@testing-library/react";
import {
  SeverityBadge,
  severityTone,
} from "@/components/common/SeverityBadge";

describe("severityTone", () => {
  // The two feeds disagree on wording — advisories say "high", alerts say
  // "critical" — so the aliases have to collapse onto the same colour.
  it("treats high and critical as the same tone", () => {
    expect(severityTone("high")).toBe(severityTone("critical"));
  });

  it("treats low and normal as the same tone", () => {
    expect(severityTone("low")).toBe(severityTone("normal"));
  });

  it("is case insensitive", () => {
    expect(severityTone("CRITICAL")).toBe(severityTone("critical"));
  });

  it("falls back to a neutral tone for null or unknown values", () => {
    expect(severityTone(null)).toBe(severityTone(undefined));
    expect(severityTone("banana")).toBe(severityTone(null));
  });

  it("keeps the alert default (info) blue rather than green", () => {
    expect(severityTone("info")).toBe(severityTone("advisory"));
    expect(severityTone("info")).not.toBe(severityTone("normal"));
  });
});

describe("SeverityBadge", () => {
  it("renders the severity label", () => {
    render(<SeverityBadge severity="elevated" />);
    expect(screen.getByText("elevated")).toBeInTheDocument();
  });

  it("uses a border in the outlined variant and none in solid", () => {
    const { rerender } = render(
      <SeverityBadge severity="critical" variant="outlined" />,
    );
    expect(screen.getByText("critical").className).toContain("border");

    rerender(<SeverityBadge severity="critical" variant="solid" />);
    expect(screen.getByText("critical").className).not.toContain("border");
  });

  it("labels a missing severity as unknown", () => {
    render(<SeverityBadge severity={null} />);
    expect(screen.getByText("unknown")).toBeInTheDocument();
  });
});
