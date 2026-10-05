import * as Yup from "yup";

export interface AuthFormValues {
  tpaId: string;
  tenantId: string;
  parentBranchName: string;
  branchName: string;
  // branchCode: string;
  contactEmail: string;
  contactPhone: string;
  remark?: string | undefined;
  serviceType?: string[] | undefined;
  address: {
    address: string;
    city: string;
    stateName: string;
    addressType: string;
    postalCode: string;
    attentionTo: string;
  };
}

export const mobileRegex = /^[6-9]\d{9}$/;
export const landlineRegex = /^(?:\d{2,4}-\d{6,8}|0\d{9})$/;
export const phoneRegex = /^[6-9]\d{9}$/;
export const pinRegex = /^\d{6}$/;
/** Requires local-part@domain.tld (TLD at least 2 chars). Rejects incomplete values like user@gm */
export const emailRegex =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

function isValidBranchEmail(email: string): boolean {
  return emailRegex.test(email.trim());
}

function isAllSameDigit(str: string): boolean {
  if (!str || str.length === 0) return true;
  const first = str[0];
  return str.split("").every((c) => c === first);
}

export const schema = Yup.object().shape({
  parentBranchName: Yup.string()
    .trim()
    .required("Parent branch is required"),
  branchName: Yup.string().trim().required("Branch name is required"),
  // branchCode: Yup.string().trim().required("Branch code is required"),
  contactEmail: Yup.string()
    .trim()
    .required("Contact email is required")
    .test("multiple-emails", "Enter a valid email (e.g. name@example.com)", (value) => {
      if (!value) return false;
      const emails = value
        .split(",")
        .map((e) => e.trim())
        .filter(Boolean);
      if (emails.length === 0) return false;
      return emails.every((email) => isValidBranchEmail(email));
    }),
  contactPhone: Yup.string()
    .trim()
    .required("Contact phone is required")
    .test(
      "multiple-phones-landline",
      "Enter valid mobile (10 digits, 6–9) or landline (e.g. 022-62799505 or 02224XXXXX). Invalid numbers like 9999999999 are not allowed.",
      (value) => {
        if (!value) return false;

        const phones = value
          .split(",")
          .map((p) => p.trim())
          .filter(Boolean);

        if (phones.length === 0) return false;

        for (const phone of phones) {
          const digitsOnly = phone.replace(/\D/g, "");
          if (landlineRegex.test(phone)) continue;
          // Mobile: exactly 10 digits, starts with 6–9, not all same digit
          if (digitsOnly.length === 10) {
            if (!mobileRegex.test(digitsOnly)) return false;
            if (isAllSameDigit(digitsOnly)) return false;
            continue;
          }
          return false;
        }
        return true;
      },
    ),
      serviceType: Yup.array()
    .of(Yup.string().trim())
    .min(1, "At least one Business Unit is required.")
    .required("Business Unit is required."),




  address: Yup.object({
    address: Yup.string().trim().required("Address is required"),
    city: Yup.string().trim().required("City is required"),
    stateName: Yup.string().trim().required("State name is required"),
    addressType: Yup.string().trim().required("Address type is required"),
    postalCode: Yup.string()
      .trim()
      .matches(pinRegex, "Pin code must be a 6-digit number")
      .required("Postal code is required"),
  }),
});
