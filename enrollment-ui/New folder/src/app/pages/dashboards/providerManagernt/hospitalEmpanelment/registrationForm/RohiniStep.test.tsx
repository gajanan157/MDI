import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FormProvider, useForm } from "react-hook-form";
import { useLayoutEffect } from "react";
import { RohiniStep } from "./RohiniStep";
import type { HospitalRegistrationFormValues } from "./schema";

vi.mock("@/components/ui", () => ({
  Input: ({
    label,
    placeholder,
    error,
    type,
    ...rest
  }: Readonly<{
    label: React.ReactNode;
    placeholder?: string;
    error?: string;
    type?: string;
  }>) => (
    <div data-testid={type === "date" ? "registration-valid-till-wrapper" : "rohini-code-input-wrapper"}>
      <label>{label}</label>
      <input
        placeholder={placeholder}
        type={type}
        data-testid={type === "date" ? "registration-valid-till-input" : "rohini-code-input"}
        {...rest}
      />
      {error ? <span data-testid="rohini-code-error">{error}</span> : null}
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

describe("RohiniStep", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("rendering", () => {
    it("renders ROHINI Registration heading and subtitle", () => {
      render(
        <Wrapper>
          <RohiniStep />
        </Wrapper>
      );
      expect(
        screen.getByRole("heading", { name: "ROHINI Registration" })
      ).toBeInTheDocument();
      expect(
        screen.getByText("Provide your ROHINI registration details.")
      ).toBeInTheDocument();
    });

    it("renders ROHINI Code input with required indicator and placeholder", () => {
      render(
        <Wrapper>
          <RohiniStep />
        </Wrapper>
      );
      expect(screen.getByText(/ROHINI Code/)).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText("Enter ROHINI code")
      ).toBeInTheDocument();
      expect(screen.getByTestId("rohini-code-input")).toBeInTheDocument();
    });

    it("renders Registration Valid Till date field", () => {
      render(
        <Wrapper>
          <RohiniStep />
        </Wrapper>
      );
      expect(screen.getByText(/Registration Valid Till/)).toBeInTheDocument();
      const dateInput = screen.getByTestId("registration-valid-till-input");
      expect(dateInput).toBeInTheDocument();
      expect(dateInput).toHaveAttribute("type", "date");
    });

    it("renders Upload ROHINI Certificate section with hint", () => {
      render(
        <Wrapper>
          <RohiniStep />
        </Wrapper>
      );
      expect(
        screen.getByText(/Upload ROHINI Certificate/)
      ).toBeInTheDocument();
      expect(screen.getByText("Click to upload")).toBeInTheDocument();
      expect(screen.getByText(/PDF, JPG, PNG \(Max 5MB\)/)).toBeInTheDocument();
    });

    it("renders file input for certificate upload", () => {
      render(
        <Wrapper>
          <RohiniStep />
        </Wrapper>
      );
      const fileInput = document.querySelector('input[type="file"]');
      expect(fileInput).toBeInTheDocument();
      expect(fileInput).toHaveAttribute("accept", ".pdf,.jpg,.jpeg,.png");
    });
  });

  describe("user interaction", () => {
    it("allows typing in ROHINI Code and updates value", async () => {
      const user = userEvent.setup();
      render(
        <Wrapper>
          <RohiniStep />
        </Wrapper>
      );
      const input = screen.getByPlaceholderText("Enter ROHINI code");
      await user.type(input, "ROH123456");
      expect(input).toHaveValue("ROH123456");
    });

    it("allows entering Registration Valid Till date", async () => {
      const user = userEvent.setup();
      render(
        <Wrapper>
          <RohiniStep />
        </Wrapper>
      );
      const dateInput = screen.getByTestId("registration-valid-till-input");
      await user.type(dateInput, "2026-02-10");
      expect(dateInput).toHaveValue("2026-02-10");
    });

    it("shows selected filename after file selection", async () => {
      const user = userEvent.setup();
      render(
        <Wrapper>
          <RohiniStep />
        </Wrapper>
      );
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      const file = new File(["content"], "certificate.pdf", { type: "application/pdf" });
      await user.upload(fileInput, file);
      expect(screen.getByText("Selected: certificate.pdf")).toBeInTheDocument();
    });
  });

  describe("validation errors", () => {
    function RohiniWithCodeError() {
      const methods = useForm<HospitalRegistrationFormValues>({ defaultValues });
      useLayoutEffect(() => {
        methods.setError("rohini.rohiniCode", {
          type: "required",
          message: "ROHINI code is required",
        });
      }, [methods]);
      return (
        <FormProvider {...methods}>
          <RohiniStep />
        </FormProvider>
      );
    }

    function RohiniWithCertificateError() {
      const methods = useForm<HospitalRegistrationFormValues>({ defaultValues });
      useLayoutEffect(() => {
        methods.setError("rohini.rohiniCertificate", {
          type: "required",
          message: "ROHINI certificate is required",
        });
      }, [methods]);
      return (
        <FormProvider {...methods}>
          <RohiniStep />
        </FormProvider>
      );
    }

    it("displays ROHINI code error when present", async () => {
      render(<RohiniWithCodeError />);
      await waitFor(() => {
        expect(screen.getByTestId("rohini-code-error")).toHaveTextContent(
          "ROHINI code is required",
        );
      });
    });

    it("displays certificate error when present", async () => {
      render(<RohiniWithCertificateError />);
      await waitFor(() => {
        expect(
          screen.getByText("ROHINI certificate is required"),
        ).toBeInTheDocument();
      });
    });
  });
});
