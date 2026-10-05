import { describe, it, expect } from "vitest";
import {
  hospitalRegistrationSchema,
  type HospitalRegistrationFormValues,
} from "./schema";

describe("hospitalRegistrationSchema", () => {
  const validData: HospitalRegistrationFormValues = {
    hospitalName: "City General Hospital",
    address: {
      address: "123 Main Street, Downtown",
      city: "Mumbai",
      stateName: "Maharashtra",
      postalCode: "400001",
    },
    contact: {
      contactPerson: "John Doe",
      email: "john@hospital.com",
      contactNumber: "9876543210",
    },
    rohini: {
      rohiniCode: "ROH123456",
      registrationValidTill: "2026-01-14",
      rohiniCertificate: "certificate.pdf",
    },
  };

  const validDataWithoutRohini: HospitalRegistrationFormValues = {
    hospitalName: validData.hospitalName,
    address: validData.address,
    contact: validData.contact,
  };

  describe("hospitalName", () => {
    it("accepts valid hospital name", async () => {
      const result = await hospitalRegistrationSchema.validateAt(
        "hospitalName",
        { hospitalName: "City General Hospital" },
      );
      expect(result).toBe("City General Hospital");
    });

    it("rejects empty hospital name", async () => {
      await expect(
        hospitalRegistrationSchema.validateAt("hospitalName", {
          hospitalName: "",
        }),
      ).rejects.toThrow("Provider name is required");
    });

    it("rejects hospital name with only whitespace", async () => {
      await expect(
        hospitalRegistrationSchema.validateAt("hospitalName", {
          hospitalName: "   ",
        }),
      ).rejects.toThrow("Provider name is required");
    });

    it("rejects hospital name shorter than 2 characters", async () => {
      await expect(
        hospitalRegistrationSchema.validateAt("hospitalName", {
          hospitalName: "A",
        }),
      ).rejects.toThrow("Provider name must be at least 2 characters");
    });
  });

  describe("address", () => {
    it("accepts valid address", async () => {
      const result = await hospitalRegistrationSchema.validateAt("address", {
        address: validData.address,
      });
      expect(result.address).toBe("123 Main Street, Downtown");
      expect(result.city).toBe("Mumbai");
      expect(result.stateName).toBe("Maharashtra");
      expect(result.postalCode).toBe("400001");
    });

    it("rejects empty address", async () => {
      await expect(
        hospitalRegistrationSchema.validateAt("address", {
          address: { ...validData.address, address: "" },
        }),
      ).rejects.toThrow("Address is required");
    });

    it("rejects address shorter than 5 characters", async () => {
      await expect(
        hospitalRegistrationSchema.validateAt("address", {
          address: { ...validData.address, address: "123" },
        }),
      ).rejects.toThrow("Address must be at least 5 characters");
    });

    it("rejects empty city", async () => {
      await expect(
        hospitalRegistrationSchema.validateAt("address", {
          address: { ...validData.address, city: "" },
        }),
      ).rejects.toThrow("City is required");
    });

    it("rejects empty state", async () => {
      await expect(
        hospitalRegistrationSchema.validateAt("address", {
          address: { ...validData.address, stateName: "" },
        }),
      ).rejects.toThrow("State is required");
    });

    it("rejects empty pin code", async () => {
      await expect(
        hospitalRegistrationSchema.validateAt("address", {
          address: { ...validData.address, postalCode: "" },
        }),
      ).rejects.toThrow("Pin code is required");
    });

    it("rejects invalid 6-digit pin code", async () => {
      await expect(
        hospitalRegistrationSchema.validateAt("address", {
          address: { ...validData.address, postalCode: "12345" },
        }),
      ).rejects.toThrow("Pin code must be a valid 6-digit number");

      await expect(
        hospitalRegistrationSchema.validateAt("address", {
          address: { ...validData.address, postalCode: "1234567" },
        }),
      ).rejects.toThrow("Pin code must be a valid 6-digit number");

      await expect(
        hospitalRegistrationSchema.validateAt("address", {
          address: { ...validData.address, postalCode: "12a456" },
        }),
      ).rejects.toThrow("Pin code must be a valid 6-digit number");
    });

    it("accepts valid 6-digit pin code", async () => {
      const result = await hospitalRegistrationSchema.validateAt("address", {
        address: validData.address,
      });
      expect(result.postalCode).toBe("400001");
    });
  });

  describe("rohini (step 2)", () => {
    it("accepts valid ROHINI data when present", async () => {
      const result = await hospitalRegistrationSchema.validateAt("rohini", {
        rohini: validData.rohini,
      });
      expect(result.rohiniCode).toBe("ROH123456");
      expect(result.registrationValidTill).toBe("2026-01-14");
      expect(result.rohiniCertificate).toBe("certificate.pdf");
    });

    it("requires rohini fields when rohini object is present", async () => {
      await expect(
        hospitalRegistrationSchema.validate({
          ...validDataWithoutRohini,
          rohini: {
            rohiniCode: "",
            registrationValidTill: "",
            rohiniCertificate: "",
          },
        }),
      ).rejects.toThrow("ROHINI certificate is required");
    });

    it("rejects empty ROHINI code", async () => {
      await expect(
        hospitalRegistrationSchema.validateAt("rohini", {
          rohini: {
            ...validData.rohini!,
            rohiniCode: "",
          },
        }),
      ).rejects.toThrow("ROHINI code is required");
    });

    it("rejects ROHINI code with only whitespace", async () => {
      await expect(
        hospitalRegistrationSchema.validateAt("rohini", {
          rohini: {
            ...validData.rohini!,
            rohiniCode: "   ",
          },
        }),
      ).rejects.toThrow("ROHINI code is required");
    });

    it("rejects empty registration valid till", async () => {
      await expect(
        hospitalRegistrationSchema.validateAt("rohini", {
          rohini: {
            ...validData.rohini!,
            registrationValidTill: "",
          },
        }),
      ).rejects.toThrow("Registration valid till is required");
    });

    it("rejects invalid date for registration valid till", async () => {
      await expect(
        hospitalRegistrationSchema.validateAt("rohini", {
          rohini: {
            ...validData.rohini!,
            registrationValidTill: "not-a-date",
          },
        }),
      ).rejects.toThrow("Registration valid till must be a valid date");
    });

    it("accepts DD/MM/YYYY format for registration valid till", async () => {
      const result = await hospitalRegistrationSchema.validateAt("rohini", {
        rohini: {
          ...validData.rohini!,
          registrationValidTill: "14/01/2026",
        },
      });
      expect(result.registrationValidTill).toBe("14/01/2026");
    });

    it("rejects empty ROHINI certificate", async () => {
      await expect(
        hospitalRegistrationSchema.validateAt("rohini", {
          rohini: {
            ...validData.rohini!,
            rohiniCertificate: "",
          },
        }),
      ).rejects.toThrow("ROHINI certificate is required");
    });

    it("trims whitespace from ROHINI code", async () => {
      const result = await hospitalRegistrationSchema.validateAt("rohini", {
        rohini: {
          ...validData.rohini!,
          rohiniCode: "  ROH999  ",
        },
      });
      expect(result.rohiniCode).toBe("ROH999");
    });
  });

  describe("contact", () => {
    it("accepts valid contact data", async () => {
      const result = await hospitalRegistrationSchema.validateAt("contact", {
        contact: validData.contact,
      });
      expect(result.contactPerson).toBe("John Doe");
      expect(result.email).toBe("john@hospital.com");
      expect(result.contactNumber).toBe("9876543210");
    });

    it("rejects empty contact person", async () => {
      await expect(
        hospitalRegistrationSchema.validateAt("contact", {
          contact: { ...validData.contact, contactPerson: "" },
        }),
      ).rejects.toThrow("Contact person is required");
    });

    it("rejects contact person shorter than 2 characters", async () => {
      await expect(
        hospitalRegistrationSchema.validateAt("contact", {
          contact: { ...validData.contact, contactPerson: "A" },
        }),
      ).rejects.toThrow("Contact person must be at least 2 characters");
    });

    it("rejects empty email", async () => {
      await expect(
        hospitalRegistrationSchema.validateAt("contact", {
          contact: { ...validData.contact, email: "" },
        }),
      ).rejects.toThrow("Email is required");
    });

    it("rejects invalid email format", async () => {
      await expect(
        hospitalRegistrationSchema.validateAt("contact", {
          contact: { ...validData.contact, email: "not-an-email" },
        }),
      ).rejects.toThrow("Enter a valid email address");
    });

    it("rejects empty contact number", async () => {
      await expect(
        hospitalRegistrationSchema.validateAt("contact", {
          contact: { ...validData.contact, contactNumber: "" },
        }),
      ).rejects.toThrow("Contact number is required");
    });

    it("rejects contact number not 10 digits", async () => {
      await expect(
        hospitalRegistrationSchema.validateAt("contact", {
          contact: { ...validData.contact, contactNumber: "12345" },
        }),
      ).rejects.toThrow("Contact number must be a valid 10-digit number");

      await expect(
        hospitalRegistrationSchema.validateAt("contact", {
          contact: { ...validData.contact, contactNumber: "12345678901" },
        }),
      ).rejects.toThrow("Contact number must be a valid 10-digit number");

      await expect(
        hospitalRegistrationSchema.validateAt("contact", {
          contact: { ...validData.contact, contactNumber: "987654321a" },
        }),
      ).rejects.toThrow("Contact number must be a valid 10-digit number");
    });

    it("accepts valid 10-digit contact number", async () => {
      const result = await hospitalRegistrationSchema.validateAt("contact", {
        contact: validData.contact,
      });
      expect(result.contactNumber).toBe("9876543210");
    });
  });

  describe("full validation", () => {
    it("validates complete valid form data", async () => {
      const result = await hospitalRegistrationSchema.validate(validData);
      expect(result).toEqual(validData);
    });

    it("validates complete form data with ROHINI step", async () => {
      const result = await hospitalRegistrationSchema.validate(validData);
      expect(result).toEqual(validData);
    });

    it("trims whitespace from string fields", async () => {
      const result = await hospitalRegistrationSchema.validate({
        hospitalName: "  Apollo Hospital  ",
        address: {
          address: "  456 Health Street  ",
          city: "  Delhi  ",
          stateName: "  Delhi  ",
          postalCode: "110001",
        },
        contact: {
          contactPerson: "  Jane  ",
          email: " jane@test.com ",
          contactNumber: "9876543210",
        },
        rohini: {
          rohiniCode: "  ROH001  ",
          registrationValidTill: "2026-01-14",
          rohiniCertificate: "certificate.pdf",
        },
      });
      expect(result.hospitalName).toBe("Apollo Hospital");
      expect(result.address.address).toBe("456 Health Street");
      expect(result.address.city).toBe("Delhi");
      expect(result.address.stateName).toBe("Delhi");
      expect(result.contact.contactPerson).toBe("Jane");
      expect(result.contact.email).toBe("jane@test.com");
      expect(result.rohini?.rohiniCode).toBe("ROH001");
    });
  });
});
