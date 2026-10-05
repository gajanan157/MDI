import * as yup from "yup";

const phoneRegex = /^[6-9]\d{9}$/;
const landlineRegex = /^0\d{2,4}-?\d{6,8}$/;

export const personSchema = yup.object({
  name: yup.string().nullable().notRequired(),

  phone: yup
    .string()
    .nullable()
    .notRequired()
    .when("name", ([name], schema) => {
      if (!name) return schema;
      return schema.test(
        "is-valid-phone",
        "Invalid mobile or landline number",
        (value) => {
          if (!value) return true;
          return phoneRegex.test(value) || landlineRegex.test(value);
        }
      );
    }),

  email: yup
    .string()
    .nullable()
    .notRequired()
    .when("name", ([name], schema) => {
      if (!name) return schema;
      return schema
        .required("Email is required")
        .email("Invalid email");
    }),
});

export const escalationSchema = yup.object({
  query: yup.string().required("Query is required"),

  contactPerson: personSchema.notRequired(),
  escalationLevel1: personSchema.notRequired(),
  escalationLevel2: personSchema.notRequired(),
  escalationLevel3: personSchema.notRequired(),
  escalationLevel4: personSchema.notRequired(),
});
