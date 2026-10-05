import * as Yup from "yup";

const pinRegex = /^\d{6}$/;
const phoneRegex = /^\d{10}$/;

/** Date string (e.g. YYYY-MM-DD or DD/MM/YYYY); validation ensures non-empty and valid date */
const dateSchema = Yup.string()
  .trim()
  .required("Registration valid till is required")
  .test(
    "valid-date",
    "Registration valid till must be a valid date",
    (value) => {
      if (!value) return false;
      const normalized = value.includes("/")
        ? value.split("/").reverse().join("-")
        : value;
      const d = new Date(normalized);
      return !Number.isNaN(d.getTime());
    },
  );

export interface HospitalRegistrationFormValues {
  hospitalName: string;
  address: {
    address: string;
    city: string;
    stateName: string;
    postalCode: string;
  };
  rohini?: {
    rohiniCode: string;
    registrationValidTill: string;
    rohiniCertificate: string;
  };
  contact: {
    contactPerson: string;
    email: string;
    contactNumber: string;
  };
}

export const hospitalRegistrationSchema = Yup.object().shape({
  hospitalName: Yup.string()
    .trim()
    .required("Provider name is required")
    .min(2, "Provider name must be at least 2 characters"),
  address: Yup.object().shape({
    address: Yup.string()
      .trim()
      .required("Address is required")
      .min(5, "Address must be at least 5 characters"),
    city: Yup.string().trim().required("City is required"),
    stateName: Yup.string().trim().required("State is required"),
    postalCode: Yup.string()
      .trim()
      .required("Pin code is required")
      .matches(pinRegex, "Pin code must be a valid 6-digit number"),
  }),
  rohini: Yup.object()
    .shape({
      rohiniCode: Yup.string()
        .trim()
        .required("ROHINI code is required")
        .min(1, "ROHINI code is required"),
      registrationValidTill: dateSchema,
      rohiniCertificate: Yup.string()
        .trim()
        .required("ROHINI certificate is required"),
    })
    .optional(),
  contact: Yup.object().shape({
    contactPerson: Yup.string()
      .trim()
      .required("Contact person is required")
      .min(2, "Contact person must be at least 2 characters"),
    email: Yup.string()
      .trim()
      .required("Email is required")
      .email("Enter a valid email address"),
    contactNumber: Yup.string()
      .trim()
      .required("Contact number is required")
      .matches(phoneRegex, "Contact number must be a valid 10-digit number"),
  }),
});
