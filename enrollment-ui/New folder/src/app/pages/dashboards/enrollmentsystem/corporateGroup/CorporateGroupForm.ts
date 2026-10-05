import * as Yup from "yup";
import { ApiResponse, corporateApi, patchApi, postApi} from "@/app/api/apiService";

export interface CorporateGroupFormValues {
  groupName: string;
  legalName: string;
  cin?: string | null;
  pan?: string | null;
  gstin?: string | null;
  websiteUrl?: string | null;
  notes?: string | null;
  effectiveFrom: string;
  effectiveTo?: string | null;
}

const emptyStringToUndefined = (value: string | undefined) =>
  value === "" ? undefined : value;

export const CorporateGroupSchema = Yup.object().shape({
  groupName: Yup.string()
    .trim()
    .required("Group name is required"),
  legalName: Yup.string()
    .trim()
    .notRequired(),

  cin: Yup.string()
    .transform(emptyStringToUndefined)
    .nullable()
    .matches(
      /^([A-Z]{1})([0-9]{5})([A-Z]{2})([0-9]{4})([A-Z]{3})([0-9]{6})$/,
      {
        message: "Enter a valid CIN",
        excludeEmptyString: true,
      },
    )
    .notRequired(),

  pan: Yup.string()
    .transform(emptyStringToUndefined)
    .nullable()
    .matches(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, {
      message: "Enter a valid PAN",
      excludeEmptyString: true,
    })
    .notRequired(),

  gstin: Yup.string()
    .transform(emptyStringToUndefined)
    .nullable()
    .matches(
      /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
      {
        message: "Enter a valid GSTIN",
        excludeEmptyString: true,
      },
    )
    .notRequired(),

  websiteUrl: Yup.string()
    .transform(emptyStringToUndefined)
    .nullable()
    .url("Enter a valid website URL")
    .notRequired(),

  notes: Yup.string()
    .transform(emptyStringToUndefined)
    .nullable()
    .notRequired(),
  effectiveFrom: Yup.string()
    .transform(emptyStringToUndefined)
    .nullable()
    .notRequired(),

  effectiveTo: Yup.string()
    .transform(emptyStringToUndefined)
    .nullable()
    .when("effectiveFrom", ([effectiveFrom], schema) =>
      effectiveFrom
        ? schema.test(
            "date-check",
            "Effective To must be after Effective From",
            function (this: Yup.TestContext, value: string | null | undefined) {
              const { effectiveFrom } = this.parent as { effectiveFrom?: string };
              if (!value || !effectiveFrom) return true;
              return new Date(value) >= new Date(effectiveFrom);
            },
          )
        : schema.notRequired(),
    ),
});




export const saveAndUpdateCorporateGroup = async <T extends object>(
  payload: T,
  id?: string,
): Promise<ApiResponse<any>> => {
  try {
    const endpoint = id
      ? `/v1/corporate-group/${id}`
      : `/v1/corporate-group`;

    return id
      ? await patchApi<any, T>(corporateApi, endpoint, payload)
      : await postApi<any, T>(corporateApi, endpoint, payload);
  } catch (error: any) {
    return {
      success: false,
      data: null,
      error: error.message,
    };
  }
};
