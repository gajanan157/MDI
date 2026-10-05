import * as yup from "yup";

/** Bounded quantifiers avoid ReDoS from unbounded `+` backtracking. */
export const EMAIL_FORMAT_REGEX = /^[^\s@]{1,64}@[^\s@]{1,63}\.[^\s@]{2,63}$/;

export const contactPersonsSchema = yup.array().of(  yup.object({
    prefix: yup
      .string()
      .required("Prefix is required")
      .nullable()
      .test(
        "valid-prefix-male",
        "Invalid prefix for male",
        function (value) {
          const { gender } = this.parent;
          if (!value || !gender) return true;
          return gender !== "male" || ["Mr", "Dr"].includes(value);
        }
      )
      .test(
        "valid-prefix-female",
        "Invalid prefix for female",
        function (value) {
          const { gender } = this.parent;
          if (!value || !gender) return true;
          return gender !== "female" || ["Ms", "Mrs", "Dr"].includes(value);
        }
      ),

    firstName: yup.string().trim().required("First name is required").nullable(),
    middleName: yup.string().trim().nullable(),
    lastName: yup.string().trim().required("Last name is required").nullable(),
    domainId: yup.string().trim().required("Domain is required").nullable(),
    roleId: yup.string().trim().required("Role is required").nullable(),
    gender: yup.string().required("Gender is required").nullable(),
    designation: yup.string().trim().required("Designation is required").nullable(),
    department: yup.string().trim().required("Department is required").nullable(),
    priority: yup.string().required("Priority rank is required").nullable(),
    notes: yup.string().nullable().max(500, "Notes cannot exceed 500 characters"),
    
    dateOfBirth: yup.string().nullable()
      .test("valid-format", "Invalid date format", (value) => {
        if (!value) return true;
        return !Number.isNaN(new Date(value).getTime());
      })
      .test("no-future", "Future date is not allowed", (value) => {
        if (!value) return true;
        return new Date(value) <= new Date();
      })
      .test(
        "age-limit",
        "Person must be at least 18 years old",
        (value) => {
          if (!value) return true;
          const dob = new Date(value);
          const today = new Date();
          const minAge = new Date(
            today.getFullYear() - 18,
            today.getMonth(),
            today.getDate()
          );
          return dob <= minAge;
        }
      ),

    contact_type_array: yup
      .array()
      .of(
        yup.object({
          type: yup
            .string()
            .required("Contact type is required")
            .nullable(),

          value: yup
            .string()
            .nullable()
            .when("type", ([type], schema) => {
              if (!type) return schema;
              let result = schema.required("Contact value is required");
              if (type === "email") {
                result = result
                  .max(254, "Email is too long")
                  .matches(EMAIL_FORMAT_REGEX, "Enter a valid email");
              } else if (type === "mobile") {
                result = result.matches(
                  /^\d{10}$/,
                  "Enter a valid 10-digit mobile",
                );
              } else if (type === "landline") {
                result = result.matches(
                  /^\d{8,11}$/,
                  "Enter a valid landline number",
                );
              }
              return result;
            }),
        })
      )
      .min(1, "At least one contact is required")
      .required("Contact information is required"),
  })
);
