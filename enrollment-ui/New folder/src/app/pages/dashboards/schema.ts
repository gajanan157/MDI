import * as Yup from "yup";

export interface InsurerFormValues {
  insurerId: string;
}
export interface EcardValue {
  insurerId: string;
  corporateId: string;
  policyId: string;
}

export const insurerSchema = Yup.object().shape({
  insurerId: Yup.string().trim().required("Insurer Name is required"),
});
export const ecardSchema = Yup.object().shape({
  insurerId: Yup.string()
    .trim()
    .required("Insurer Name is required"),
  corporateId: Yup.string().trim(),
  policyId: Yup.string().trim(),
});