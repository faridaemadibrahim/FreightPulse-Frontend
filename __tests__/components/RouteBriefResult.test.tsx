import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RouteBriefResult from "@/components/briefs/RouteBriefResult";
import type { RouteBriefResponse } from "@/lib/api/route-brief";
import { downloadRouteBriefPdf } from "@/lib/api/route-brief";

jest.mock("@/lib/api/route-brief", () => ({
  ...jest.requireActual("@/lib/api/route-brief"),
  downloadRouteBriefPdf: jest.fn(),
}));

const mockDownload = downloadRouteBriefPdf as jest.MockedFunction<
  typeof downloadRouteBriefPdf
>;

function makeBrief(overrides: Partial<RouteBriefResponse> = {}) {
  return {
    id: "brief-1",
    origin: "Shanghai",
    destination: "Rotterdam",
    carrier: "Maersk",
    cargo_type: "40ft",
    status: "completed",
    brief_markdown: "# Route Brief\n\nShip now.",
    recommendation: "ship_now",
    risk_level: "low",
    error_message: "",
    created_at: "2026-09-01T10:00:00Z",
    pdf_available: false,
    ...overrides,
  } as RouteBriefResponse;
}

beforeEach(() => {
  mockDownload.mockReset();
});

describe("RouteBriefResult", () => {
  it("renders GFM tables from the AI markdown", () => {
    // Without remark-gfm these rows collapse into a single paragraph of pipe
    // characters, which is what the user actually sees on the page.
    const markdown = [
      "## Rate comparison",
      "",
      "| Carrier | Rate |",
      "| --- | --- |",
      "| Maersk | $2,400 |",
      "| MSC | $2,610 |",
    ].join("\n");

    render(
      <RouteBriefResult
        data={makeBrief({ brief_markdown: markdown })}
        onNewBrief={jest.fn()}
      />,
    );

    expect(screen.getByRole("table")).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Carrier" })).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "$2,610" })).toBeInTheDocument();
    // The literal pipe syntax must not leak into the rendered output.
    expect(screen.queryByText(/\| --- \|/)).not.toBeInTheDocument();
  });

  it("renders ordinary markdown headings and emphasis", () => {
    render(
      <RouteBriefResult
        data={makeBrief({
          brief_markdown: "# Route Brief\n\nBook **this week**.",
        })}
        onNewBrief={jest.fn()}
      />,
    );

    expect(
      screen.getByRole("heading", { name: "Route Brief" }),
    ).toBeInTheDocument();
    expect(screen.getByText("this week")).toBeInTheDocument();
  });

  it("hides the PDF button when the backend has no PDF ready", () => {
    render(
      <RouteBriefResult
        data={makeBrief({ pdf_available: false })}
        onNewBrief={jest.fn()}
      />,
    );

    expect(
      screen.queryByRole("button", { name: /download pdf/i }),
    ).not.toBeInTheDocument();
  });

  it("downloads through the API client when a PDF is available", async () => {
    mockDownload.mockResolvedValue(new Blob(["pdf"], { type: "application/pdf" }));
    global.URL.createObjectURL = jest.fn(() => "blob:fake");
    global.URL.revokeObjectURL = jest.fn();

    render(
      <RouteBriefResult
        data={makeBrief({ pdf_available: true })}
        onNewBrief={jest.fn()}
      />,
    );

    await userEvent.click(screen.getByRole("button", { name: /download pdf/i }));

    expect(mockDownload).toHaveBeenCalledWith("brief-1");
  });

  it("surfaces a message when the download fails", async () => {
    mockDownload.mockRejectedValue(new Error("401"));

    render(
      <RouteBriefResult
        data={makeBrief({ pdf_available: true })}
        onNewBrief={jest.fn()}
      />,
    );

    await userEvent.click(screen.getByRole("button", { name: /download pdf/i }));

    expect(await screen.findByText(/could not download the pdf/i)).toBeInTheDocument();
  });

  it("calls onNewBrief from the reset button", async () => {
    const onNewBrief = jest.fn();
    render(<RouteBriefResult data={makeBrief()} onNewBrief={onNewBrief} />);

    await userEvent.click(screen.getByRole("button", { name: /new brief/i }));

    expect(onNewBrief).toHaveBeenCalledTimes(1);
  });
});
