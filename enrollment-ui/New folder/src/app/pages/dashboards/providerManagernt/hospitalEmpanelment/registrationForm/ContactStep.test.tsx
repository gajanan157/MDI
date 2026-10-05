import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FormProvider, useForm } from "react-hook-form";
import { ContactStep } from "./ContactStep";
import type { HospitalRegistrationFormValues } from "./schema";

vi.mock("@/components/ui", () => ({
  Input: ({
    label,
    placeholder,
    type,
    ...rest
  }: Readonly<{
    label: string;
    placeholder?: string;
    type?: string;
    isRequired?: boolean;
    error?: unknown;
  }>) => (
    <div data-testid="input-wrapper">
      <label>{label}</label>
      <input
        placeholder={placeholder}
        type={type}
        data-testid={`input-${(rest as { name?: string }).name?.replace(".", "-") ?? "unknown"}`}
        {...rest}
      />
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
  contact: {
    contactPerson: "",
    email: "",
    contactNumber: "",
  },
};

function Wrapper({ children }: Readonly<{ children: React.ReactNode }>) {
  const methods = useForm<HospitalRegistrationFormValues>({
    defaultValues,
  });
  return <FormProvider {...methods}>{children}</FormProvider>;
}

describe("ContactStep", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("rendering", () => {
    it("renders Contact Details heading and subtitle", () => {
      render(
        <Wrapper>
          <ContactStep />
        </Wrapper>
      );
      expect(screen.getByText("Contact Details")).toBeInTheDocument();
      expect(
        screen.getByText("Provide contact person and communication details")
      ).toBeInTheDocument();
    });

    it("renders Contact Person, Email, and Contact Number inputs", () => {
      render(
        <Wrapper>
          <ContactStep />
        </Wrapper>
      );
      expect(screen.getByText("Contact Person")).toBeInTheDocument();
      expect(screen.getByText("Email")).toBeInTheDocument();
      expect(screen.getByText("Contact Number")).toBeInTheDocument();
    });

    it("renders inputs with correct placeholders", () => {
      render(
        <Wrapper>
          <ContactStep />
        </Wrapper>
      );
      expect(
        screen.getByPlaceholderText("Enter contact person name")
      ).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText("Enter email address")
      ).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText("Enter 10-digit contact number (digits only)"),
      ).toBeInTheDocument();
    });
  });

  describe("form integration", () => {
    it("registers contact fields with form context", async () => {
      const user = userEvent.setup();
      render(
        <Wrapper>
          <ContactStep />
        </Wrapper>
      );
      const contactPersonInput = screen.getByPlaceholderText(
        "Enter contact person name"
      );
      const emailInput = screen.getByPlaceholderText("Enter email address");
      const contactNumberInput = screen.getByPlaceholderText(
        "Enter 10-digit contact number (digits only)",
      );

      await user.type(contactPersonInput, "Jane Doe");
      await user.type(emailInput, "jane@hospital.com");
      await user.type(contactNumberInput, "9876543210");

      expect(contactPersonInput).toHaveValue("Jane Doe");
      expect(emailInput).toHaveValue("jane@hospital.com");
      expect(contactNumberInput).toHaveValue("9876543210");
    });
  });
});
