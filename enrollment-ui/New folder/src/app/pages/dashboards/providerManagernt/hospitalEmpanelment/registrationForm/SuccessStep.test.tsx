import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { FormProvider, useForm } from "react-hook-form";
import { MemoryRouter } from "react-router";
import { SuccessStep } from "./SuccessStep";
import type { HospitalRegistrationFormValues } from "./schema";

const defaultValues: HospitalRegistrationFormValues = {
  hospitalName: "City Hospital",
  address: {
    address: "123 Main St",
    city: "Pune",
    stateName: "Maharashtra",
    postalCode: "411001",
  },
  rohini: {
    rohiniCode: "123456789",
    registrationValidTill: "2026-12-31",
    rohiniCertificate: "cert.pdf",
  },
  contact: {
    contactPerson: "Pragya",
    email: "pkjha2787@gmail.com",
    contactNumber: "7304858016",
  },
};

function Wrapper({
  children,
  values = defaultValues,
}: Readonly<{
  children: React.ReactNode;
  values?: HospitalRegistrationFormValues;
}>) {
  const methods = useForm<HospitalRegistrationFormValues>({
    defaultValues: values,
    values,
  });
  return (
    <MemoryRouter>
      <FormProvider {...methods}>{children}</FormProvider>
    </MemoryRouter>
  );
}

describe("SuccessStep", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders Registration Complete heading", () => {
    render(
      <Wrapper>
        <SuccessStep />
      </Wrapper>
    );
    expect(screen.getByText("Registration Complete!")).toBeInTheDocument();
  });

  it("renders success message", () => {
    render(
      <Wrapper>
        <SuccessStep />
      </Wrapper>
    );
    expect(
      screen.getByText("Your hospital has been successfully registered")
    ).toBeInTheDocument();
  });

  it("renders Registration Details card title", () => {
    render(
      <Wrapper>
        <SuccessStep />
      </Wrapper>
    );
    expect(screen.getByText("Registration Details")).toBeInTheDocument();
  });

  it("displays hospital name from form", () => {
    render(
      <Wrapper>
        <SuccessStep />
      </Wrapper>
    );
    expect(screen.getByText("City Hospital")).toBeInTheDocument();
  });

  it("displays location as city, state", () => {
    render(
      <Wrapper>
        <SuccessStep />
      </Wrapper>
    );
    expect(screen.getByText("Pune, Maharashtra")).toBeInTheDocument();
  });

  it("displays ROHINI code from form", () => {
    render(
      <Wrapper>
        <SuccessStep />
      </Wrapper>
    );
    expect(screen.getByText("123456789")).toBeInTheDocument();
  });

  it("displays contact person, email, and contact number", () => {
    render(
      <Wrapper>
        <SuccessStep />
      </Wrapper>
    );
    expect(screen.getByText("Pragya")).toBeInTheDocument();
    expect(screen.getByText("pkjha2787@gmail.com")).toBeInTheDocument();
    expect(screen.getByText("7304858016")).toBeInTheDocument();
  });

  it("displays — for missing optional ROHINI code", () => {
    const valuesWithoutRohini: HospitalRegistrationFormValues = {
      ...defaultValues,
      rohini: undefined,
    };
    render(
      <Wrapper values={valuesWithoutRohini}>
        <SuccessStep />
      </Wrapper>
    );
    const dashes = screen.getAllByText("—");
    expect(dashes.length).toBeGreaterThanOrEqual(1);
  });
});
