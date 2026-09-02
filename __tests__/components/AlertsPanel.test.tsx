import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AlertsBellDropdown from "@/components/alerts/AlertsBellDropdown";
import { useAlertStore } from "@/stores/alertStore";
import type { Alert } from "@/lib/types";

function makeAlert(overrides: Partial<Alert> = {}): Alert {
  return {
    id: "alert-1",
    type: "rate_spike",
    severity: "critical",
    is_new: true,
    is_read: false,
    title: "Rate spike detected",
    message: "Shanghai-Europe up 12% week over week",
    location_label: "Shanghai-Europe",
    magnitude_pct: 12,
    created_at: new Date().toISOString(),
    ...overrides,
  };
}

const markAllAsRead = jest.fn();

beforeEach(() => {
  markAllAsRead.mockClear();
  useAlertStore.setState({ alerts: [], isLoading: false, markAllAsRead });
});

describe("AlertsBellDropdown", () => {
  it("keeps the panel closed until the bell is clicked", async () => {
    useAlertStore.setState({ alerts: [makeAlert()] });
    render(<AlertsBellDropdown />);

    expect(screen.queryByText("Alerts")).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole("button"));

    expect(screen.getByText("Alerts")).toBeInTheDocument();
    expect(screen.getByText("Rate spike detected")).toBeInTheDocument();
  });

  it("counts only unread alerts", async () => {
    useAlertStore.setState({
      alerts: [
        makeAlert({ id: "a", is_read: false }),
        makeAlert({ id: "b", is_read: false }),
        makeAlert({ id: "c", is_read: true }),
      ],
    });
    render(<AlertsBellDropdown />);

    await userEvent.click(screen.getByRole("button"));

    expect(screen.getByText("2 unread")).toBeInTheDocument();
  });

  it("shows an empty state when there are no alerts", async () => {
    render(<AlertsBellDropdown />);

    await userEvent.click(screen.getByRole("button"));

    expect(screen.getByText(/no alerts right now/i)).toBeInTheDocument();
  });

  it("caps the panel at six alerts", async () => {
    useAlertStore.setState({
      alerts: Array.from({ length: 10 }, (_, i) =>
        makeAlert({ id: `a-${i}`, title: `Alert number ${i}` }),
      ),
    });
    render(<AlertsBellDropdown />);

    await userEvent.click(screen.getByRole("button"));

    expect(screen.getByText("Alert number 5")).toBeInTheDocument();
    expect(screen.queryByText("Alert number 6")).not.toBeInTheDocument();
  });

  it("gives the icon-only bell an accessible name carrying the unread count", () => {
    useAlertStore.setState({
      alerts: [makeAlert({ id: "a" }), makeAlert({ id: "b" })],
    });
    render(<AlertsBellDropdown />);

    expect(
      screen.getByRole("button", { name: "Alerts, 2 unread" }),
    ).toBeInTheDocument();
  });

  it("says so when nothing is unread", () => {
    useAlertStore.setState({ alerts: [makeAlert({ is_read: true })] });
    render(<AlertsBellDropdown />);

    expect(
      screen.getByRole("button", { name: "Alerts, none unread" }),
    ).toBeInTheDocument();
  });

  it("reports its expanded state to assistive tech", async () => {
    render(<AlertsBellDropdown />);
    const bell = screen.getByRole("button");

    expect(bell).toHaveAttribute("aria-expanded", "false");
    await userEvent.click(bell);
    expect(bell).toHaveAttribute("aria-expanded", "true");
  });

  it("closes on a click outside and marks the alerts read", async () => {
    useAlertStore.setState({ alerts: [makeAlert()] });
    render(
      <div>
        <AlertsBellDropdown />
        <button>somewhere else</button>
      </div>,
    );

    await userEvent.click(screen.getByRole("button", { name: /^Alerts, / }));
    expect(screen.getByRole("region", { name: "Alerts" })).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "somewhere else" }));

    expect(screen.queryByRole("region", { name: "Alerts" })).not.toBeInTheDocument();
    expect(markAllAsRead).toHaveBeenCalledTimes(1);
  });

  it("stays open when clicking inside the panel", async () => {
    useAlertStore.setState({ alerts: [makeAlert()] });
    render(<AlertsBellDropdown />);

    await userEvent.click(screen.getByRole("button", { name: /^Alerts, / }));
    await userEvent.click(screen.getByText("Rate spike detected"));

    expect(screen.getByRole("region", { name: "Alerts" })).toBeInTheDocument();
    expect(markAllAsRead).not.toHaveBeenCalled();
  });

  it("closes on Escape and returns focus to the bell", async () => {
    useAlertStore.setState({ alerts: [makeAlert()] });
    render(<AlertsBellDropdown />);
    const bell = screen.getByRole("button", { name: /^Alerts, / });

    await userEvent.click(bell);
    await userEvent.keyboard("{Escape}");

    expect(screen.queryByRole("region", { name: "Alerts" })).not.toBeInTheDocument();
    expect(markAllAsRead).toHaveBeenCalledTimes(1);
    expect(bell).toHaveFocus();
  });

  it("points aria-controls at the panel only while it is open", async () => {
    render(<AlertsBellDropdown />);
    const bell = screen.getByRole("button", { name: /^Alerts, / });

    expect(bell).not.toHaveAttribute("aria-controls");
    // The panel is a read-only list, so it must not claim to be a menu.
    expect(bell).not.toHaveAttribute("aria-haspopup");

    await userEvent.click(bell);

    const panel = screen.getByRole("region", { name: "Alerts" });
    expect(bell).toHaveAttribute("aria-controls", panel.id);
  });

  it("marks alerts read on close, not on open", async () => {
    useAlertStore.setState({ alerts: [makeAlert()] });
    render(<AlertsBellDropdown />);
    const bell = screen.getByRole("button");

    await userEvent.click(bell);
    expect(markAllAsRead).not.toHaveBeenCalled();

    await userEvent.click(bell);
    expect(markAllAsRead).toHaveBeenCalledTimes(1);
  });
});
