import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import HospitalEmpanelmentLanding from "./index";

const mockNavigate = vi.fn();

vi.mock("react-router", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router")>();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock("@/hooks/useBreadcrumbs", () => ({
  useBreadcrumb: vi.fn(),
}));

describe("HospitalEmpanelmentLanding", () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it("renders the landing page title and hero section", () => {
    render(
      <MemoryRouter>
        <HospitalEmpanelmentLanding />
      </MemoryRouter>,
    );
    expect(screen.getByText("Empanel Your Hospital Today")).toBeInTheDocument();
    expect(
      screen.getByText(/Join our network of trusted healthcare providers/),
    ).toBeInTheDocument();
  });

  it("renders benefit cards", () => {
    render(
      <MemoryRouter>
        <HospitalEmpanelmentLanding />
      </MemoryRouter>,
    );
    expect(screen.getAllByText("Why Empanel With Us?").length).toBeGreaterThan(0);
    expect(screen.getByText("Verified Network")).toBeInTheDocument();
    expect(screen.getByText("Wide Reach")).toBeInTheDocument();
    expect(screen.getByText("Quick Onboarding")).toBeInTheDocument();
    expect(screen.getByText("Quality Recognition")).toBeInTheDocument();
  });

  it("renders CTA section with Register Now button", () => {
    render(
      <MemoryRouter>
        <HospitalEmpanelmentLanding />
      </MemoryRouter>,
    );
    expect(screen.getByText("Ready to Get Started?")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Register Now/i }),
    ).toBeInTheDocument();
  });

  it("navigates to create form when Register Now is clicked", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <HospitalEmpanelmentLanding />
      </MemoryRouter>,
    );
    await user.click(screen.getByRole("button", { name: /Register Now/i }));
    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith("/provider-masters/create");
  });

  it("renders footer with current year", () => {
    render(
      <MemoryRouter>
        <HospitalEmpanelmentLanding />
      </MemoryRouter>,
    );
    const year = new Date().getFullYear();
    expect(
      screen.getByText(new RegExp(`© ${year} All rights reserved`)),
    ).toBeInTheDocument();
  });
});
