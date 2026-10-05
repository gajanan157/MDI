import * as Yup from "yup";
import { agentApi, ApiResponse, patchApi, postApi } from "@/app/api/apiService";
export interface AgentFormValues {
    agentType: string;
    agentCategory: string;
    irdaAgentCode?: string;
    legalName: string;
    licenseValidFrom?: string | null;
    licenseValidTo?: string | null;
    contactPhone?: string;
    contactEmail?: string;
    address?: {
        address?: string;
        city?: string;
        stateName?: string;
        postalCode?: string | null;
    } | null;
}


const phoneRegex = /^(\d{10}|\d{12}|\d{3}-\d{8}|\d{3}\d{8})$/;
const pinRegex = /^[1-9][0-9]{5}$/;

export const AgentSchema = Yup.object().shape({
    agentType: Yup.string()
        .trim()
        .required("Agent type is required"),
    legalName: Yup.string().trim().required("Legal name is required"),
    irdaAgentCode: Yup.string().trim().required("IRDA Agent Code is required"),
    licenseValidFrom: Yup.date()
        .nullable()
        .transform((originalValue) => {
            if (originalValue === "" || originalValue === null) return null;
            const parsed = new Date(originalValue);
            return Number.isNaN(parsed.getTime()) ? undefined : parsed;
        })
        .typeError("Enter a valid date")
        .notRequired(),

    licenseValidTo: Yup.date()
        .nullable()
        .transform((originalValue) => {
            if (originalValue === "" || originalValue === null) return null;
            const parsed = new Date(originalValue);
            return Number.isNaN(parsed.getTime()) ? undefined : parsed;
        })
        .typeError("Enter a valid date")
        .when("licenseValidFrom", (licenseValidFrom: any, schema: any) => {
            if (!licenseValidFrom || Number.isNaN(new Date(licenseValidFrom).getTime())) {
                return schema.notRequired();
            }
            return schema.min(
                new Date(licenseValidFrom),
                "License valid to must be after valid from date"
            );
        }),
    contactEmail: Yup.string().test(
        "multiple-emails",
        "Enter valid email addresses",
        (value) => {
            if (!value?.trim()) return true;

            const emails = value
                .split(",")
                .map((e) => e.trim())
                .filter(Boolean);

            return emails.every((email) => Yup.string().email().isValidSync(email));
        }
    ),
    contactPhone: Yup.string().test(
        "multiple-phones",
        "Enter valid phone numbers",
        (value) => {
            if (!value?.trim()) return true;

            const phones = value
                .split(",")
                .map((p) => p.trim())
                .filter(Boolean);

            return phones.every((phone) => phoneRegex.test(phone));
        }
    ),
    address: Yup.object({
        address: Yup.string().trim().required("Address is required"),
        city: Yup.string().trim().required("City is required"),
        stateName: Yup.string().trim().required("State name is required"),
        postalCode: Yup.string()
            .trim()
            .matches(pinRegex, "Postal code must be a valid 6-digit number")
            .required("Postal code is required"),
    }),

});
export const saveAndUpdateAgent = async <T extends object>(
    payload: T,
    id?: string,
): Promise<ApiResponse<any>> => {
    try {
        const endpoint = id ? `/v1/agents/${id}` : `/v1/agents`;
        return id
            ? await patchApi<any, T>(agentApi, endpoint, payload)
            : await postApi<any, T>(agentApi, endpoint, payload);
    } catch (error: any) {
        return { success: false, data: null, error: error.message };
    }
};
export const AGENT_CATEGORY_OPTIONS = [
    { label: "Individual Agent", value: "AGENT" },
    { label: "POSP (Point of Sales Person)", value: "POSP" },
    { label: "Corporate Agent", value: "CORPORATE_AGENT" },
    { label: "Broker Sub-Agent", value: "BROKER_SUBAGENT" },
    { label: "Other", value: "OTHER" },
];
export const AGENT_TYPE_OPTIONS = [
    { label: "Individual", value: "INDIVIDUAL" },
    { label: "Firm", value: "FIRM" },
    { label: "Company", value: "COMPANY" },
    { label: "LLP", value: "LLP" },
    { label: "Other", value: "OTHER" },
];