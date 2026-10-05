import { ApiResponse, brokerApi, patchApi, postApi } from '@/app/api/apiService';
import { pinRegex } from '@/app/pages/AdminDepartment/tpabranches/schema';
import * as Yup from 'yup';

export interface BrokerFormValues {
  legalName: string;
  contactPhone?: string;
  contactEmail?: string;
  address?: {
    address?: string;
    city?: string;
    stateName?: string;
    postalCode?: string | null;
  } | null;
}
export const BrokerSchema = Yup.object().shape({
  legalName: Yup.string().trim().required("Broker name is required"),
  irdaBrokerCode: Yup.string().notRequired(),

address: Yup.object({
  address: Yup.string()
    .trim()
    .required("Address is required"),

  city: Yup.string()
    .trim()
    .required("City is required"),

  stateName: Yup.string()
    .trim()
    .required("State is required"),

  postalCode: Yup.string()
    .trim()
    .required("Postal code is required")
    .test(
      "valid-pin",
      "Postal code must be a valid 6-digit number",
      function (value) {
        return pinRegex.test(value);
      }
    ),
}).required("Address is required"),

  contactEmail: Yup.string().test(
    "multiple-emails",
    "Enter valid email addresses",
    (value) => {
      if (!value?.trim()) return true;

      const emails = value
        .split(",")
        .map((e) => e.trim())
        .filter(Boolean);

      return emails.every((email) =>
        Yup.string().email().isValidSync(email),
      );
    }
  ),

  contactPhone: Yup.string()
    .trim()
    .test(
      "multiple-phones-landline",
      "Enter valid phone numbers (10/12 digit mobile or landline like 022-62799505)",
      (value) => {
        if (!value?.trim()) return true;

        const phones = value
          .split(",")
          .map((p) => p.trim())
          .filter(Boolean);

        const phoneRegex = /^(\d{10}|\d{12}|\d{3}-\d{8}|\d{3}\d{8})$/;

        return phones.every((phone) => phoneRegex.test(phone));
      },
    ),

});

export const saveAndUpdateBroker = async <T extends object>(
  payload: T,
  id?: string,
): Promise<ApiResponse<any>> => {
  try {
    const endpoint = id ? `/v1/brokers/${id}` : `/v1/brokers`;
    return id
      ? await patchApi<any, T>(brokerApi, endpoint, payload)
      : await postApi<any, T>(brokerApi, endpoint, payload);
  } catch (error: any) {
    return { success: false, data: null, error: error.message };
  }
};