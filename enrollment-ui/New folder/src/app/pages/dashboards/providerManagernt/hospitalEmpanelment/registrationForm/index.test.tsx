import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import RegistrationForm from "./index";

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

vi.mock("@/store/hooks/useAppSelector", () => ({
  useAppSelector: vi.fn(() => ({ cityList: [], stateList: [] })),
}));

vi.mock("@/app/pages/AdminDepartment/tpa/AddressSection", () => ({
  AddressSection: () => <div data-testid="address-section">Address Section</div>,
}));

describe("RegistrationForm", () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it("sets document title for create form", () => {
    render(
      <MemoryRouter>
        <RegistrationForm />
      </MemoryRouter>,
    );
    expect(document.title).toContain("Create - Hospital Management");
  });

  it("renders provider, ROHINI, and contact sections", () => {
    render(
      <MemoryRouter>
        <RegistrationForm />
      </MemoryRouter>,
    );
    expect(screen.getByText("Providers Details")).toBeInTheDocument();
    expect(screen.getByText("ROHINI Registration")).toBeInTheDocument();
    expect(screen.getByText("Contact Details")).toBeInTheDocument();
  });

  it("renders Submit and Cancel actions", () => {
    render(
      <MemoryRouter>
        <RegistrationForm />
      </MemoryRouter>,
    );
    expect(screen.getByRole("button", { name: "Submit" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();
  });

  it("renders individual and group mode toggles", () => {
    render(
      <MemoryRouter>
        <RegistrationForm />
      </MemoryRouter>,
    );
    expect(screen.getByRole("button", { name: /Individual/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Group/i })).toBeInTheDocument();
  });

  it("navigates back to empanel list when Cancel is clicked", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <RegistrationForm />
      </MemoryRouter>,
    );
    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(mockNavigate).toHaveBeenCalledWith("/provider-masters/empanel");
  });
});
