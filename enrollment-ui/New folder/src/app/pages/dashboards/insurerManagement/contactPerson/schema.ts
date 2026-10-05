import * as yup from "yup";

export interface ContactPersonFormValues {
    insurerId: string;
    prefix: string;
    firstName: string;
    lastName: string;
    middleName: string;
    dateOfBirth: string;  
    gender: string;
    notes?: string | null;
}

export const contactPersonSchema = yup.object().shape({
  insurerId: yup.string().required("Insurer is required"),
  prefix: yup
  .string()
  .required("Prefix is required")
  .test("valid-prefix-male", "Invalid prefix for male", function (value) {
    if (!value) return true;
    return this.parent.gender !== "male" || ["Mr", "Dr"].includes(value);
  })
  .test("valid-prefix-female", "Invalid prefix for female", function (value) {
    if (!value) return true;
    return this.parent.gender !== "female" || ["Ms", "Mrs", "Dr"].includes(value);
  }),
  firstName: yup.string().required("First name is required"),
  middleName: yup.string().required("Middle name is required"),
  lastName: yup.string().required("Last name is required"),
  dateOfBirth: yup
  .string()
  .required("Date of birth is required")
  .test("valid-format", "Invalid date format", (value) => {
    if (!value) return false;
    return !Number.isNaN(new Date(value).getTime());
  })
  .test("no-future", "Future date is not allowed", (value) => {
    if (!value) return false;
    return new Date(value) <= new Date();
  })
  .test("age-limit", "Person must be at least 18 years old", (value) => {
    if (!value) return false;

    const dob = new Date(value);
    const today = new Date();
    const minDate = new Date(
      today.getFullYear() - 18,
      today.getMonth(),
      today.getDate()
    );

    return dob <= minDate;
  }),
  gender: yup.string().required("Gender is required"),
  notes: yup.string().nullable().optional(), // ✅ correct
});

