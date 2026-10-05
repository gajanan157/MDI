import * as Yup from "yup";
import { pinRegex } from "@/app/pages/AdminDepartment/tpabranches/schema";

const asOptionalTrimmedString = (value: unknown): string | undefined => {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed === "" ? undefined : trimmed;
};
const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

const asRequiredTrimmedString = (value: unknown): string => {
  if (typeof value !== "string") return "";
  return value.trim();
};

export type InwardStep = "insurer" | "corporate" | "broker" | "spoc" | "policy";

export interface InwardFormData {
  //Insurer Section
  insurerType: "PSU" | "PRIVATE";

  insurer_id: string;
  master_product_id: string;
  insurer_issuing_office_id: string;
  insurer_regional_office_id: string;
  insurer_divisional_office_id: string;

  //Corporate  section
  groupName: string;
  corporateId: string;
  policy_proposer_gst_number: string;
  policy_proposer_pan_number: string;
  corporateIndustrySectorId: string;
  corpEmail: string;
  corpMobile: string;
  policy_proposer_contact_telephone_no: string;
  address: string;
  city: string;
  stateName: string;
  postalCode: string;

  channelType: "BROKER" | "AGENT" | "DIRECT";

  // Broker
  broker_id?: string;
  policy_broker_code?: string;
  policy_broker_contact_email_id?: string;
  policy_broker_contact_mobile_no?: string;
  policy_broker_contact_telephone_no?: string;

  // Agent
  agent_id?: string;
  policy_agent_code?: string;
  policy_agent_contact_email_id?: string;
  policy_agent_contact_mobile_no?: string;
  policy_agent_contact_telephone_no?: string;


  tpa_spoc_contact_email_id: string;
  tpa_spoc_contact_telephone_no: string;
  tpa_spoc_contact_mobile_no: string;

  tpa_fees: string;
  tpa_servicing_branch: string;
  tpa_spoc_id: string;

  //Corporate HR section
  clientHrName?: string;
  clientContactNo?: string;
  clientEmailId?: string;
  physicalCardsRequired: "YES" | "NO";
  clientWelcomeMailer: "YES" | "NO";

  //policy section

  policyRecordType: "LIVE" | "DUMMY";
  policySubType: string;
  policySubTypePolicyNumber?: number;
  dummyPolicyNumber: string;
  policyPlan: "INDIVIDUAL" | "FAMILY_FLOATER" | "GROUP";
  policyRenewalType: "FRESH" | "RENEWAL";
  policyNumber: string;
  previousPolicyNumber?: string;
  policyStartDate: string;
  policyEndDate: string | null;
  totalSumInsured: number;
  policyCorporateBufferFlag: "YES" | "NO";
  policyCorporateBufferAmount?: number;
  policyCopaymentFlag: "YES" | "NO";
  policyCopaymentPercentage?: number;
  policyCopaymentAmount?: number;
  sumInsured: number;
  netPremium: number;
  grossPremium: number;
  totalLivesInsured?: string;

  totalEmployee?: string;
  totalDependent?: string;

  policy_divisional_officer_code?: string;
  policy_divisional_officer_contact_email_id?: string;
  policy_divisional_officer_contact_mobile_no?: string;
  policy_divisional_officer_contact_telephone_no?: string;
  policy_divisional_officer_name?: string;
  policy_proposal_date?: string;
  policy_proposal_number?: string;

  gradeEnabled: boolean;
  designationEnabled: boolean;
  grades: {
    name: string;
    sumInsured: number | string;
  }[];

  designations: {
    name: string;
    sumInsured: number | string;
  }[];

  policy_co_insurer_Flag: "YES" | "NO";

  co_insurers: {
    co_insurer_name: string | null;
    policy_co_insurer_share_percentage: number | null;
    policy_coinsurance_type: "PRIMARY" | "SECONDARY" | "TERTIARY" | "QUATERNARY" | null;
  }[];

  physical_cards_required?: "YES" | "NO";
  vip_tagging?: "YES" | "NO";
  client_welcome_mailer?: "YES" | "NO";
  corporate_payee?: boolean;
  insured_payee?: boolean;
  e_card_type: "PHOTO" | "NON_PHOTO";

  parentType: string | null;
  showSibling: boolean;

  linkDummyNumber: boolean;

  showSelf: boolean;
  noLimit: boolean;
  childCount: number;
  siblingCount: number;
  selfAge: AgeRange;
  spouseAge: AgeRange;
  childAge: AgeRange;
  parentAge: AgeRange;
  siblingAge: AgeRange;
}
type AgeRange = { from: string; to: string };

export interface DocumentItem {
  documentType: string;
  files: File[];
}
const toNumber = (value: any, originalValue: any) => {
  if (typeof originalValue === "string") {
    const cleaned = originalValue.replace(/,/g, "");
    return cleaned === "" ? undefined : Number(cleaned);
  }
  return value;
};

const nonNegativeAge = Yup.number()
  .transform((value, originalValue) =>
    originalValue === "" ? undefined : value
  )
  .nullable()
  .notRequired()
  .typeError("Please enter a valid age")
  .moreThan(18, "Please enter a valid age");

const nonNegativeAgeForChild = Yup.number()
  .transform((value, originalValue) =>
    originalValue === "" ? undefined : value
  )
  .nullable()
  .notRequired()
  .typeError("Please enter a valid age")
  .min(0, "Please enter a valid age");

const min18Age = Yup.number()
  .transform((value, originalValue) =>
    originalValue === "" ? undefined : value
  )
  .nullable()
  .notRequired()
  .typeError("Please enter a valid age")
  .min(18, "Minimum age is 18");

const optionalMin18Age = Yup.number()
  .transform((value, originalValue) =>
    originalValue === "" ? undefined : value
  )
  .nullable()
  .notRequired()
  .typeError("Please enter a valid age")
  .min(18, "Minimum age is 18");

const optionalToAge = Yup.number()
  .transform((value, originalValue) =>
    originalValue === "" ? undefined : value
  )
  .nullable()
  .notRequired()
  .typeError("Please enter a valid age")
  .min(1, "Age must be greater than 0");

export const insurerSchema = Yup.object().shape({
  insurerType: Yup.string()
    .transform((value) => (value === "" ? undefined : value))
    .nullable()
    .required("Insurer Type is required")
    .oneOf(["PSU", "PRIVATE"], "Invalid Insurer Type"),

  insurer_id: Yup.string().required("Insurer Name is required"),

  master_product_id: Yup.string().required("Product Name is required"),

  insurer_issuing_office_id: Yup.string().when(
    "insurerType",
    ([type], schema) =>
      type === "PSU"
        ? schema.required("Issuing Office is required")
        : schema.notRequired(),
  ),

  insurer_regional_office_id: Yup.string().when(
    "insurerType",
    ([type], schema) =>
      type === "PSU"
        ? schema.required("Regional Office is required")
        : schema.notRequired(),
  ),

  insurer_divisional_office_id: Yup.string()
    .nullable()
    .notRequired(),
});

export const corporateSchema = Yup.object().shape({
  groupName: Yup.string().optional(),
  corporateIndustrySectorId: Yup.string().required("Sector is required"),
  corporateId: Yup.string().required("Corporate Name is required"),
  address: Yup.string()
    .transform((_, originalValue) => asRequiredTrimmedString(originalValue))
    .required("Address is required"),
  city: Yup.string()
    .transform((_, originalValue) => asRequiredTrimmedString(originalValue))
    .required("City is required"),
  stateName: Yup.string()
    .transform((_, originalValue) => asRequiredTrimmedString(originalValue))
    .required("State name is required"),
  postalCode: Yup.mixed()
    .transform((_, val) => (val ? String(val) : ""))
    .test(
      "valid-pin",
      "Postal code must be a valid 6-digit number",
      (value: any) => !value || pinRegex.test(value),
    )
    .required("Postal code is required"),
  corpEmail: Yup.string()
    .transform((_, originalValue) => asOptionalTrimmedString(originalValue))
    .test(
      "email-valid",
      "Invalid email format",
      (value) => !value || emailRegex.test(value)
    )
    .notRequired(),

  corpMobile: Yup.string()
    .transform((_, originalValue) => asOptionalTrimmedString(originalValue))
    .matches(/^[0-9]{10}$/, {
      message: "Mobile number must be 10 digits",
      excludeEmptyString: true,
    })
    .notRequired(),

  policy_proposer_contact_telephone_no: Yup?.string()
    .transform((_, originalValue) => {
      return asOptionalTrimmedString(originalValue);
    })
    .test("is-valid-telephone", "Enter a valid telephone number", (value) => {
      if (!value) return true;
      return /^(\+?\d{1,4}[\s-]?)?(\(?\d{2,5}\)?[\s-]?)?\d{6,10}$/.test(value);
    })
    .notRequired(),
  policy_proposer_pan_number: Yup.string()
    .strict()
    .transform((value, originalValue) => {
      if (typeof originalValue !== "string") return undefined;
      return originalValue.trim() === "" ? undefined : originalValue;
    })
    .nullable()
    .notRequired()
    .test(
      "pan-valid",
      "Enter a valid PAN",
      (value) => !value || /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(value),
    ),

  policy_proposer_gst_number: Yup.string()
    .strict()
    .transform((value, originalValue) => {
      if (typeof originalValue !== "string") return undefined;
      return originalValue.trim() === "" ? undefined : originalValue;
    })
    .nullable()
    .notRequired()
    .test(
      "gstin-valid",
      "Enter a valid GSTIN",
      (value) =>
        !value ||
        /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(value),
    ),
});
export const channelSchema = Yup.object().shape({
  channelType: Yup.string().required("Channel Type is required"),

  // BROKER VALIDATION
  broker_id: Yup.string().when("channelType", ([channelType], schema) =>
    channelType === "BROKER"
      ? schema.required("Broker Name is required")
      : schema.notRequired(),
  ),

  policy_broker_code: Yup.string().when("channelType", ([channelType], schema) =>
    channelType === "BROKER"
      ? schema.required("Broker Code is required")
      : schema.notRequired(),
  ),

  policy_broker_contact_email_id: Yup.string()
    .nullable()
    .notRequired()
    .email("Invalid email format"),

  policy_broker_contact_mobile_no: Yup.string()
    .nullable()
    .notRequired()
    .test(
      "valid-mobile",
      "Mobile number must be 10 digits",
      (value) => !value || /^[0-9]{10}$/.test(value),
    ),
  policy_broker_contact_telephone_no: Yup.string()
    .transform((_, originalValue) => {
      return asOptionalTrimmedString(originalValue);
    })
    .test("is-valid-telephone", "Enter a valid telephone number", (value) => {
      if (!value) return true; // ✅ skip validation if empty (optional field)

      return /^(\+?\d{1,4}[\s-]?)?(\(?\d{2,5}\)?[\s-]?)?\d{6,10}$/.test(value);
    })
    .notRequired(),

  agent_id: Yup.string().when("channelType", ([channelType], schema) =>
    channelType === "AGENT"
      ? schema.required("Agent Name is required")
      : schema.notRequired(),
  ),

  policy_agent_code: Yup.string().when("channelType", ([channelType], schema) =>
    channelType === "AGENT"
      ? schema.required("Agent Code is required")
      : schema.notRequired(),
  ),

  policy_agent_contact_email_id: Yup.string()
    .nullable()
    .notRequired()
    .email("Invalid email format"),

  policy_agent_contact_mobile_no: Yup.string()
    .nullable()
    .notRequired()
    .test(
      "valid-mobile",
      "Mobile number must be 10 digits",
      (value) => !value || /^[0-9]{10}$/.test(value),
    ),

  policy_agent_contact_telephone_no: Yup.string()
    .transform((_, originalValue) => {
      return asOptionalTrimmedString(originalValue);
    })
    .test("is-valid-telephone", "Enter a valid telephone number", (value) => {
      if (!value) return true; // ✅ skip validation if empty (optional field)

      return /^(\+?\d{1,4}[\s-]?)?(\(?\d{2,5}\)?[\s-]?)?\d{6,10}$/.test(value);
    })
    .notRequired(),
});
export const spocSchema = Yup.object().shape({
  tpa_servicing_branch: Yup.string().required("TPA servicing branch is required"),
  tpa_spoc_contact_email_id: Yup.string()
    .transform((value) => (value === "" ? undefined : value))
    .email("Invalid email format")
    .notRequired(),

  tpa_spoc_contact_mobile_no: Yup.string()
    .transform((value) => (value === "" ? undefined : value))
    .matches(/^[0-9]{10}$/, "Mobile number must be 10 digits")
    .notRequired(),

  tpa_spoc_contact_telephone_no: Yup.string()
    .transform((_, originalValue) => {
      return asOptionalTrimmedString(originalValue);
    })
    .test("is-valid-telephone", "Enter a valid telephone number", (value) => {
      if (!value) return true; // ✅ skip validation if empty (optional field)

      return /^(\+?\d{1,4}[\s-]?)?(\(?\d{2,5}\)?[\s-]?)?\d{6,10}$/.test(value);
    })
    .notRequired(),

  tpa_fees: Yup.number()
    .transform((value, originalValue) =>
      originalValue === "" ? undefined : value
    )
    .typeError("TPA Fees must be a number")
    .max(100, "TPA Fees cannot be greater than 100 %.")
    .notRequired(),
});

export const policySchema = Yup.object().shape({
  gradeEnabled: Yup.boolean().default(false),
  designationEnabled: Yup.boolean().default(false),
  grades: Yup.array().when("gradeEnabled", ([gradeEnabled], schema) =>
    gradeEnabled
      ? schema.min(1, "At least one grade is required").of(
        Yup.object({
          name: Yup.string().required("Grade is required"),
          sumInsured: Yup.number()
            .typeError("Must be a number")
            .required("Amount required"),
        }),
      )
      : schema.notRequired(),
  ),
  designations: Yup.array().when("designationEnabled", ([designationEnabled], schema) =>
    designationEnabled
      ? schema.min(1, "At least one designation is required").of(
        Yup.object({
          name: Yup.string().required("Designation is required"),
          sumInsured: Yup.number()
            .typeError("Must be a number")
            .required("Amount required"),
        }),
      )
      : schema.notRequired(),
  ),
  policyRecordType: Yup.string()
    .oneOf(["LIVE", "DUMMY"], "Select a valid Policy Record Type")
    .required("Policy Record Type is required"),
  policySubType: Yup.string()
    .required("Policy Sub Type is required"),
  policyPlan: Yup.string()
    .oneOf(["INDIVIDUAL", "FAMILY_FLOATER", "GROUP"], "Select a valid Coverage Type")
    .required("Coverage Type is required"),
  policyRenewalType: Yup.string()
    .oneOf(["FRESH", "RENEWAL"], "Select a valid Policy Renewal Type")
    .required("Policy Renewal Type is required"),
  policyNumber: Yup.string().required("Policy Number is required"),

  previousPolicyNumber: Yup.string().notRequired(),
  policyStartDate: Yup.date()
    .transform((value, originalValue) => (originalValue === "" ? null : value))
    .nullable()
    .required("Policy Start Date is required"),
  policyEndDate: Yup.date()
    .transform((value, originalValue) => (originalValue === "" ? null : value))
    .nullable()
    .required("Policy End Date is required")
    .min(
      Yup.ref("policyStartDate"),
      "Policy End Date cannot be before Start Date",
    ),

  policySubTypePolicyNumber: Yup.string()
    .transform((value, originalValue) =>
      originalValue === "" ? null : value
    )
    .nullable()
    .notRequired(),
  policyCorporateBufferFlag: Yup.string()
    .oneOf(["YES", "NO"], "Select a valid Corporate Buffer Flag")
    .notRequired(),
  policyCorporateBufferAmount: Yup.string().when("policyCorporateBufferFlag", ([flag], schema) =>
    flag === "YES"
      ? schema.required("Corporate Buffer Amount is required")
      : schema.notRequired(),
  ),
  policyCopaymentFlag: Yup.string().notRequired(),
  totalLivesInsured: Yup.number()
    .nullable()
    .transform((value, originalValue) =>
      originalValue === "" ? null : value
    )
    .moreThan(0, "Value must be greater than 0")
    .notRequired(),

  totalEmployee: Yup.number()
    .nullable()
    .transform((value, originalValue) =>
      originalValue === "" ? null : value
    )
    .moreThan(0, "Value must be greater than 0")
    .notRequired(),

  totalDependent: Yup.number()
    .nullable()
    .transform((value, originalValue) =>
      originalValue === "" ? null : value
    )
    .moreThan(0, "Value must be greater than 0")
    .notRequired(),



  policy_divisional_officer_code: Yup.string().notRequired(),
  policy_divisional_officer_contact_email_id: Yup.string()
    .nullable()
    .notRequired()
    .email("Invalid email format"),
  policy_divisional_officer_contact_mobile_no: Yup.string()
    .nullable()
    .notRequired()
    .test(
      "valid-mobile",
      "Mobile number must be 10 digits",
      (value) => !value || /^[0-9]{10}$/.test(value),
    ),
  policy_divisional_officer_contact_telephone_no: Yup.string()
    .transform((_, originalValue) => {
      return asOptionalTrimmedString(originalValue);
    })
    .test("is-valid-telephone", "Enter a valid telephone number", (value) => {
      if (!value) return true; // ✅ skip validation if empty (optional field)

      return /^(\+?\d{1,4}[\s-]?)?(\(?\d{2,5}\)?[\s-]?)?\d{6,10}$/.test(value);
    })
    .notRequired(),
  policy_divisional_officer_name: Yup.string().notRequired(),
  // policy_proposal_date: Yup.string().notRequired(),
  // policy_proposal_number: Yup.string().notRequired(),

  policyCopaymentPercentage: Yup.number()
    .transform((value, originalValue) =>
      originalValue === "" ? undefined : value
    )
    .typeError("Co-Payment must be a number")
    .max(100, "Co-Payment cannot be greater than 100 %.")
    .notRequired(),
  policyCopaymentAmount: Yup.number()
    .transform((value, originalValue) =>
      originalValue === "" ? undefined : value
    )
    .typeError("Co-Payment must be a number")
    .notRequired(),

  sumInsured: Yup.number()
    .transform(toNumber)
    .typeError("Sum Insured must be a number")
    .required("Sum Insured is required")
    .moreThan(0, "Sum Insured must be greater than 0"),

  netPremium: Yup.number()
    .transform(toNumber)
    .typeError("Net Premium must be a number")
    .required("Net Premium is required")
    .moreThan(0, "Net Premium must be greater than 0"),

  grossPremium: Yup.number()
    .transform(toNumber)
    .typeError("Gross Premium must be a number")
    .required("Gross Premium is required")
    .moreThan(0, "Gross Premium must be greater than 0"),
  policy_co_insurer_Flag: Yup.string().notRequired(),

  co_insurers: Yup.array().when(
    "policy_co_insurer_Flag",
    ([flag], schema) =>
      flag === "YES"
        ? schema
          .of(
            Yup.object().shape({
              co_insurer_name: Yup.string().required(
                "Co-Insurer Name is required"
              ),

              policy_co_insurer_share_percentage: Yup.number()
                .typeError("Share percentage is required")
                .max(100, "Share percentage cannot be greater than 100%.")
                .required("Share percentage is required"),

              policy_coinsurance_type: Yup.string().required(
                "Co-insurer type is required"
              ),
            })
          )
          .min(1, "At least one co-insurer is required")
          .test(
            "total-share-percentage",
            "Total share percentage cannot exceed 100%",
            function (value) {
              if (!value) return true;

              const total = value.reduce(
                (sum, item) =>
                  sum + (Number(item?.policy_co_insurer_share_percentage) || 0),
                0
              );

              if (total <= 100) return true;

              return this.createError({
                path: `co_insurers.${value.length - 1}.policy_co_insurer_share_percentage`,
                message: "Total share percentage cannot exceed 100%",
              });
            }
          )
        : schema.notRequired()
  ),

  physical_cards_required: Yup.string()
    .oneOf(["YES", "NO"])
    .notRequired()
    .nullable(),

  vip_tagging: Yup.string().oneOf(["YES", "NO"]).notRequired().nullable(),
  client_welcome_mailer: Yup.string()
    .oneOf(["YES", "NO"])
    .notRequired()
    .nullable(),

  parentType: Yup.string().nullable(),
  showSibling: Yup.boolean()
    .transform((value, originalValue) => (originalValue === "" ? false : value))
    .nullable()
    .notRequired(),
  noLimit: Yup.boolean().default(false),

  childCount: Yup.number()
    .nullable()
    .transform((value, originalValue) =>
      originalValue === "" ? null : value
    )
    .max(4, "Maximum child count is 4")
    .notRequired(),


  siblingCount: Yup.number()
    .when("showSibling", {
      is: true,
      then: (schema) =>
        schema
          .notRequired()
          .max(4, "Maximum sibling count is 4"),
      otherwise: (schema) => schema.notRequired(),
    }),
  selfAge: Yup.object({
    from: min18Age.required("Self From is required"),
    to: nonNegativeAge.required("Self To is required"),
  }),

  parentAge: Yup.object().when("policySubType", ([policySubType], schema) =>
    schema.shape({
      from:
        policySubType === "Parental Policy"
          ? min18Age.when("parentType", ([parentType], s) =>
            parentType
              ? s.required("Parent From is required")
              : s.notRequired()
          )
          : optionalMin18Age,

      to:
        policySubType === "Parental Policy"
          ? nonNegativeAge
            .required("Parent To is required")
            .test(
              "parent-to-required",
              "Parent To is required if From is filled",
              function (value) {
                const { from } = this.parent;
                return !from || value != null;
              }
            )
          : optionalToAge.test(
            "parent-to-required",
            "Parent To is required if From is filled",
            function (value) {
              const { from } = this.parent;
              return !from || value != null;
            }
          ),
    })
  ),

  spouseAge: Yup.object({
    from: min18Age,
    to: nonNegativeAge.test(
      "spouse-to-required",
      "Spouse To is required if From is filled",
      function (value) {
        const { from } = this.parent;
        return !from || value !== undefined;
      }
    ),
  }),
  childAge: Yup.object({
    from: nonNegativeAgeForChild,
    to: nonNegativeAgeForChild.test(
      "child-to-required",
      "Child To is required if From is filled",
      function (value) {
        const { from } = this.parent;
        return !from || !!value;
      },
    ),
  }),
  siblingAge: Yup.object()
    .transform((value, originalValue) =>
      originalValue === "" ? { from: "", to: "" } : value)
    .shape({
      from: min18Age.when("showSibling", ([showSibling], s) =>
        showSibling ? s.required("Sibling From is required") : s.notRequired(),
      ),
      to: nonNegativeAge.test(
        "sibling-to-required",
        "Sibling To is required if From is filled",
        function (value) {
          const { from } = this.parent;
          return !from || !!value;
        },
      ),
    }),
  corporate_payee: Yup.boolean().notRequired(),
  insured_payee: Yup.boolean().notRequired(),
  e_card_type: Yup.string()
    .oneOf(["PHOTO", "NON_PHOTO"])
    .notRequired(),
})

const formatIndianNumber = (num: number): string => {
  return new Intl.NumberFormat("en-IN").format(num);
};

const numberToWords = (num: number): string => {
  if (num === 0) return "Zero";

  const belowTwenty = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];

  const tens = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];

  const getWords = (n: number): string => {
    if (!n) {
      return "-";
    }
    n = Math.floor(n);

    if (n < 20) return belowTwenty[n];
    if (n < 100)
      return (
        tens[Math.floor(n / 10)] + (n % 10 ? " " + belowTwenty[n % 10] : "")
      );
    if (n < 1000)
      return (
        belowTwenty[Math.floor(n / 100)] +
        " Hundred" +
        (n % 100 ? " " + getWords(n % 100) : "")
      );
    if (n < 100000)
      return (
        getWords(Math.floor(n / 1000)) +
        " Thousand" +
        (n % 1000 ? " " + getWords(n % 1000) : "")
      );
    if (n < 10000000)
      return (
        getWords(Math.floor(n / 100000)) +
        " Lakh" +
        (n % 100000 ? " " + getWords(n % 100000) : "")
      );

    return (
      getWords(Math.floor(n / 10000000)) +
      " Crore" +
      (n % 10000000 ? " " + getWords(n % 10000000) : "")
    );
  };

  return getWords(num)?.trim();
};

// Final function
export const formatAmountWithWords = (amount?: number | null): string => {
  if (amount === undefined || amount === null || Number.isNaN(amount)) {
    return "-";
  }

  const isNegative = amount < 0;

  const absoluteAmount = Math.abs(amount);

  const formatted = formatIndianNumber(amount);

  const integerPart = Math.floor(absoluteAmount);

  const decimalPart = Math.round((absoluteAmount - integerPart) * 100);

  const words = numberToWords(integerPart);

  const decimalWords =
    decimalPart > 0 ? ` and ${numberToWords(decimalPart)} Paise` : "";

  return `${formatted} (${isNegative ? "Minus " : ""}${words}${decimalWords})`;
};
export const formatAmountWithWords2 = (newamount?: any): any => {
  if (!newamount) return " ";

  const cleanValue = newamount?.replace(/,/g, "");
  const amount = Number(cleanValue);

  if (Number.isNaN(amount)) return "-";

  const isNegative = amount < 0;

  const absoluteAmount = Math.abs(amount);
  const integerPart = Math.floor(absoluteAmount);
  const decimalPart = Math.round((absoluteAmount - integerPart) * 100);

  const words = numberToWords(integerPart);

  const decimalWords =
    decimalPart > 0 ? ` and ${numberToWords(decimalPart)} Paise` : "";

  const text = `${isNegative ? "Minus " : ""}${words}${decimalWords}`;

  return isNegative ? `(${text})` : text;
};