import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FormProvider, useForm } from "react-hook-form";
import { HospitalDetailsStep } from "./HospitalDetailsStep";
import type { HospitalRegistrationFormValues } from "./schema";

vi.mock("@/app/pages/AdminDepartment/tpa/AddressSection", () => ({
  AddressSection: () => (
    <div data-testid="address-section">Address Section</div>
  ),
}));

vi.mock("@/components/ui", () => ({
  Input: ({
    label,
    placeholder,
    ...rest
  }: Readonly<{
    label: string;
    placeholder?: string;
    isRequired?: boolean;
    error?: unknown;
  }>) => (
    <div data-testid="input-wrapper">
      <label>{label}</label>
      <input placeholder={placeholder} data-testid="hospital-name-input" {...rest} />
    </div>
  ),
}));

const defaultValues: HospitalRegistrationFormValues = {
  hospitalName: "",
  address: {
    address: "",
    city: "",
    stateName: "",
    postalCode: "",
  },
  rohini: {
    rohiniCode: "",
    registrationValidTill: "",
    rohiniCertificate: "",
  },
};

function Wrapper({ children }: Readonly<{ children: React.ReactNode }>) {
  const methods = useForm<HospitalRegistrationFormValues>({
    defaultValues,
  });
  return <FormProvider {...methods}>{children}</FormProvider>;
}

describe("HospitalDetailsStep", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("rendering", () => {
    it("renders Providers Details heading and subtitle", () => {
      render(
        <Wrapper>
          <HospitalDetailsStep />
        </Wrapper>,
      );
      expect(
        screen.getByRole("heading", { name: "Providers Details" }),
      ).toBeInTheDocument();
      expect(
        screen.getByText("Enter your hospital's basic information"),
      ).toBeInTheDocument();
    });

    it("renders Provider Name input with required indicator and placeholder", () => {
      render(
        <Wrapper>
          <HospitalDetailsStep />
        </Wrapper>,
      );
      expect(screen.getByText("Provider Name")).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText("Enter provider name"),
      ).toBeInTheDocument();
      expect(screen.getByTestId("hospital-name-input")).toBeInTheDocument();
    });

    it("renders AddressSection component", () => {
      render(
        <Wrapper>
          <HospitalDetailsStep />
        </Wrapper>
      );
      expect(screen.getByTestId("address-section")).toBeInTheDocument();
      expect(screen.getByText("Address Section")).toBeInTheDocument();
    });
  });

  describe("user interaction", () => {
    it("allows typing in Provider Name input and updates value", async () => {
      const user = userEvent.setup();
      render(
        <Wrapper>
          <HospitalDetailsStep />
        </Wrapper>,
      );
      const input = screen.getByPlaceholderText("Enter provider name");
      await user.type(input, "City General Hospital");
      expect(input).toHaveValue("City General Hospital");
    });
  });
});
