import * as Yup from "yup";
export const policySchema = Yup.object({
  policyNumber: Yup.string().required("Policy Number is required"),
  clientName: Yup.string().required("Client Name is required"),
  insurer: Yup.string().required("Insurer is required"),

  numberOfLives: Yup.number()
    .typeError("Number of Lives must be a number")
    .positive("Number of Lives must be greater than 0")
    .required("Number of Lives is required"),

  sumInsured: Yup.string().required("Sum Insured is required"),
  premiumAmount: Yup.string().required("Premium Amount is required"),

  policyStart: Yup.string().required("Start Date is required"),

  policyEnd: Yup.string()
    .required("End Date is required")
    .test("is-after", "End Date must be after Start Date", function (value) {
      const { policyStart } = this.parent;
      if (!policyStart || !value) return true;
      return new Date(value) > new Date(policyStart);
    })
    .test(
      "not-equal",
      "Start Date and End Date cannot be the same",
      function (value) {
        const { policyStart } = this.parent;
        if (!policyStart || !value) return true;
        return new Date(value).getTime() !== new Date(policyStart).getTime();
      },
    ),

  priority: Yup.string().required("Priority is required"),

  receivedDate: Yup.string().nullable().optional(),

  policyType: Yup.string().required("Policy Type is required"),

  documents: Yup.array()
    .transform((value) => value?.filter(Boolean) ?? []) // <--- FIX
    .of(
      Yup.mixed<File>()
        .required("File is required")
        .test("fileType", "Only PDF allowed", (file) =>
          file ? file.type === "application/pdf" : false,
        )
        .test("fileSize", "Max size 10MB", (file) =>
          file ? file.size <= 10 * 1024 * 1024 : false,
        ),
    )
    .min(1, "Please upload a PDF")
    .default([]),
});

export const POLICY_SECTION_CONFIG = [
  { key: "definitions", label: "Definitions" },
  { key: "base_covers", label: "Base Covers" },
  { key: "exclusions", label: "Exclusions" },
  { key: "modern_treatments", label: "Modern Treatments" },
  { key: "maternity_benefits", label: "Maternity Benefits" },
  { key: "additional_benefits", label: "Additional Benefits" },
  { key: "ancillary_benefits", label: "Ancillary Benefits" },
  { key: "co_payment_conditions", label: "Co-Payment Conditions" },
  { key: "claims_process", label: "Claims Process" },
  { key: "policy_management", label: "Policy Management" },
] as const;


type ReorderOptions<T> = {
  order?: (keyof T)[];
  remove?: (keyof T)[];
};

export function reorderObjectByKeys<T extends Record<string, any>>(
  data: T,
  options: ReorderOptions<T>,
): T {
  if (!data) return data;

  const { order = [], remove = [] } = options;
  const result: Partial<T> = {};

  // 1️⃣ Add ordered keys (if not removed)
  order.forEach((key) => {
    if (key in data && !remove.includes(key)) {
      result[key] = data[key];
    }
  });

  // 2️⃣ Add remaining keys (excluding ordered + removed)
  Object.keys(data).forEach((key) => {
    const typedKey = key as keyof T;

    if (!order.includes(typedKey) &&!remove.includes(typedKey)) {
      result[typedKey] = data[typedKey];
    }
  });

  return result as T;
}

