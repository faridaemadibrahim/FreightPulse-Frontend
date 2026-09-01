import { render, screen } from "@testing-library/react";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";

function Boom(): React.ReactElement {
  throw new Error("chart blew up");
}

beforeAll(() => {
  // React logs the caught error itself; keep the test output readable.
  jest.spyOn(console, "error").mockImplementation(() => {});
});

describe("ErrorBoundary", () => {
  it("renders children while nothing throws", () => {
    render(
      <ErrorBoundary>
        <p>chart</p>
      </ErrorBoundary>,
    );

    expect(screen.getByText("chart")).toBeInTheDocument();
  });

  it("catches a throwing child instead of propagating", () => {
    render(
      <ErrorBoundary label="The rate trend chart failed to load">
        <Boom />
      </ErrorBoundary>,
    );

    expect(
      screen.getByText("The rate trend chart failed to load"),
    ).toBeInTheDocument();
  });

  it("prefers a custom fallback when given one", () => {
    render(
      <ErrorBoundary fallback={<p>custom fallback</p>}>
        <Boom />
      </ErrorBoundary>,
    );

    expect(screen.getByText("custom fallback")).toBeInTheDocument();
  });
});
