import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { PlaceholderStep } from "./PlaceholderStep";

describe("PlaceholderStep", () => {
  it("renders title and default description", () => {
    render(<PlaceholderStep title="ROHINI" />);
    expect(screen.getByText("ROHINI")).toBeInTheDocument();
    expect(screen.getByText("This step is coming soon.")).toBeInTheDocument();
  });

  it("renders custom description when provided", () => {
    render(
      <PlaceholderStep
        title="Contact"
        description="Enter your contact details."
      />
    );
    expect(screen.getByText("Contact")).toBeInTheDocument();
    expect(screen.getByText("Enter your contact details.")).toBeInTheDocument();
  });

  it("renders icon when provided", () => {
    const icon = <span data-testid="custom-icon">Icon</span>;
    render(<PlaceholderStep title="Verify" icon={icon} />);
    expect(screen.getByTestId("custom-icon")).toBeInTheDocument();
    expect(screen.getByText("Icon")).toBeInTheDocument();
  });

  it("renders without icon when not provided", () => {
    render(<PlaceholderStep title="Complete" />);
    expect(screen.queryByTestId("custom-icon")).not.toBeInTheDocument();
  });
});
