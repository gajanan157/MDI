import * as Yup from 'yup';
import { landlineRegex, mobileRegex, pinRegex } from '../tpabranches/schema';

function isAllSameDigit(str: string): boolean {
  if (!str || str.length === 0) return true;
  const first = str[0];
  return str.split("").every((c) => c === first);
}

export interface TPAFormValues {
  tpaCode: string;
  legalName: string;
  cinNumber: string;
  contactEmail: string;
  contactPhone: string;
  address: {
    address: string;
    city: string;
    stateName: string;
    postalCode: string;
  }; 
}
export const tpaSchema = Yup.object().shape({
  tpaCode: Yup.string().trim().required("TPA Code is required"),
  legalName: Yup.string().trim().required("Legal Name is required"),
  address: Yup.object({
    address: Yup.string().trim().required("Address is required"),
    city: Yup.string().trim().required("City is required"),
    stateName: Yup.string().trim().required("State name is required"),
    postalCode: Yup.string()
      .trim()
      .matches(pinRegex, "Postal code must be a valid 6-digit number")
      .required("Postal code is required"),
  }),
  cinNumber: Yup.string()
    .trim()
    .required("CIN Number is required"),
  contactEmail: Yup.string()
    .trim()
    .email("Enter a valid email")
    .required("Contact Email is required"),
  contactPhone: Yup.string()
    .trim()
    .required("Contact phone is required")
    .test(
      "phone-or-landline",
      "Enter valid mobile (10 digits, 6–9) or landline (e.g. 022-62799505 or 02224XXXXX)",
      (value) => {
        if (!value) return false;
        const digitsOnly = value.replace(/\D/g, "");
        if (landlineRegex.test(value)) return true;
        if (digitsOnly.length === 10 && mobileRegex.test(digitsOnly) && !isAllSameDigit(digitsOnly)) return true;
        return false;
      },
    ),
});
