import * as yup from "yup";

export const contactUpdateSchema = yup.object({
  designation: yup.string().required("Designation is required"),
  department: yup.string().required("Department is required"),
  contact_type_array: yup
        .array()
        .of(
          yup.object({
            type: yup.string().required("Select contact type"),
            value: yup
              .string()
              .nullable()
              .when("type", ([type], schema) => {
                if (!type) return schema;
                let result = schema.required("Contact value is required");
                if (type === "email") {
                  result = result.email("Enter a valid email");
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
        .nullable()
        .notRequired()
        .min(1, "At least one contact is required"),
  priority: yup.string().required("Priority is required"),
});
