import { renderHook, act } from "@testing-library/react";
import { useWebSocketAlerts } from "@/hooks/useWebSocketAlerts";
import { useAlertStore } from "@/stores/alertStore";

// Minimal stand-in for the browser WebSocket: it never connects on its own, so
// each test drives open/message/close explicitly.
class FakeWebSocket {
  static instances: FakeWebSocket[] = [];

  url: string;
  close = jest.fn();
  onopen: (() => void) | null = null;
  onmessage: ((event: { data: string }) => void) | null = null;
  onclose: ((event: { code: number }) => void) | null = null;
  onerror: ((err: unknown) => void) | null = null;

  constructor(url: string) {
    this.url = url;
    FakeWebSocket.instances.push(this);
  }

  static get latest() {
    return FakeWebSocket.instances[FakeWebSocket.instances.length - 1];
  }

  static reset() {
    FakeWebSocket.instances = [];
  }
}

const originalWebSocket = global.WebSocket;

beforeAll(() => {
  jest.spyOn(console, "log").mockImplementation(() => {});
  jest.spyOn(console, "error").mockImplementation(() => {});
});

beforeEach(() => {
  jest.useFakeTimers();
  FakeWebSocket.reset();
  global.WebSocket = FakeWebSocket as unknown as typeof WebSocket;
useAlertStore.setState({ alerts: [], fetchAlerts: jest.fn() });
});

afterEach(() => {
  jest.useRealTimers();
  global.WebSocket = originalWebSocket;
});

describe("useWebSocketAlerts", () => {
  it("opens a connection carrying the user id", () => {
    renderHook(() => useWebSocketAlerts("user-123"));

    expect(FakeWebSocket.instances).toHaveLength(1);
    expect(FakeWebSocket.latest.url).toContain("user-123");
  });

  it("does not connect without a user id", () => {
    renderHook(() => useWebSocketAlerts(""));

    expect(FakeWebSocket.instances).toHaveLength(0);
  });

  it("pushes a received alert into the store", () => {
    renderHook(() => useWebSocketAlerts("user-123"));

    act(() => {
      FakeWebSocket.latest.onmessage?.({
        data: JSON.stringify({
          id: "alert-1",
          alert_type: "rate_spike",
          trade_lane: "Shanghai-Europe",
          message: "Rates up 12%",
          magnitude_pct: 12,
        }),
      });
    });

    const { alerts } = useAlertStore.getState();
    expect(alerts).toHaveLength(1);
    expect(alerts[0].title).toBe("Rate spike detected");
    expect(alerts[0].location_label).toBe("Shanghai-Europe");
    expect(alerts[0].is_read).toBe(false);
  });

  it("survives a malformed message without adding an alert", () => {
    renderHook(() => useWebSocketAlerts("user-123"));

    act(() => {
      FakeWebSocket.latest.onmessage?.({ data: "not json" });
    });

    expect(useAlertStore.getState().alerts).toHaveLength(0);
  });

  it("backs off exponentially, capped at 30s, and resets after a successful open", () => {
    renderHook(() => useWebSocketAlerts("user-123"));

    // 1s → 2s → 4s … each close schedules the next attempt one step later.
    const expectedDelays = [1000, 2000, 4000, 8000, 16000, 30000, 30000];

    expectedDelays.forEach((delay, i) => {
      act(() => {
        FakeWebSocket.latest.onclose?.({ code: 1006 });
      });

      // Nothing reconnects a tick early.
      act(() => {
        jest.advanceTimersByTime(delay - 1);
      });
      expect(FakeWebSocket.instances).toHaveLength(i + 1);

      act(() => {
        jest.advanceTimersByTime(1);
      });
      expect(FakeWebSocket.instances).toHaveLength(i + 2);
    });

    // A successful open puts the backoff back to 1s.
    act(() => {
      FakeWebSocket.latest.onopen?.();
      FakeWebSocket.latest.onclose?.({ code: 1006 });
    });

    const countBefore = FakeWebSocket.instances.length;
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    expect(FakeWebSocket.instances).toHaveLength(countBefore + 1);
  });

  // Walks the socket through three consecutive failures. Each close only
  // schedules a reconnect, so the backoff delay has to elapse before the next
  // socket exists to fail again.
  function tripFallback() {
    act(() => {
      FakeWebSocket.latest.onclose?.({ code: 1006 });
      jest.advanceTimersByTime(1000);
    });
    act(() => {
      FakeWebSocket.latest.onclose?.({ code: 1006 });
      jest.advanceTimersByTime(2000);
    });
    act(() => {
      FakeWebSocket.latest.onclose?.({ code: 1006 });
    });
  }

  it("falls back to polling /alerts after three consecutive failures", () => {
    const fetchAlerts = jest.fn();
    useAlertStore.setState({ fetchAlerts });
    renderHook(() => useWebSocketAlerts("user-123"));

    act(() => {
      FakeWebSocket.latest.onclose?.({ code: 1006 });
      jest.advanceTimersByTime(1000);
    });
    act(() => {
      FakeWebSocket.latest.onclose?.({ code: 1006 });
      jest.advanceTimersByTime(2000);
    });
    // Two failures are still within normal reconnect territory.
    expect(fetchAlerts).not.toHaveBeenCalled();

    act(() => {
      FakeWebSocket.latest.onclose?.({ code: 1006 });
    });
    // The third trips the fallback, which pulls once straight away.
    expect(fetchAlerts).toHaveBeenCalledTimes(1);

    act(() => {
      jest.advanceTimersByTime(30000);
    });
    expect(fetchAlerts).toHaveBeenCalledTimes(2);
  });

  it("stops polling once the socket comes back", () => {
    const fetchAlerts = jest.fn();
    useAlertStore.setState({ fetchAlerts });
    renderHook(() => useWebSocketAlerts("user-123"));

    tripFallback();
    expect(fetchAlerts).toHaveBeenCalledTimes(1);

    // Let the next reconnect attempt produce a socket, then open it.
    act(() => {
      jest.advanceTimersByTime(4000);
    });
    act(() => {
      FakeWebSocket.latest.onopen?.();
    });

    act(() => {
      jest.advanceTimersByTime(120000);
    });
    expect(fetchAlerts).toHaveBeenCalledTimes(1);
  });

  it("stops polling after unmount", () => {
    const fetchAlerts = jest.fn();
    useAlertStore.setState({ fetchAlerts });
    const { unmount } = renderHook(() => useWebSocketAlerts("user-123"));

    tripFallback();
    expect(fetchAlerts).toHaveBeenCalledTimes(1);

    unmount();
    act(() => {
      jest.advanceTimersByTime(120000);
    });
    expect(fetchAlerts).toHaveBeenCalledTimes(1);
  });

  it("stops reconnecting after unmount", () => {
    const { unmount } = renderHook(() => useWebSocketAlerts("user-123"));
    const socket = FakeWebSocket.latest;

    unmount();
    act(() => {
      socket.onclose?.({ code: 1006 });
      jest.advanceTimersByTime(60000);
    });

    expect(FakeWebSocket.instances).toHaveLength(1);
  });
});
