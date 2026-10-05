import * as Yup from "yup";

export interface AssignContactFormValues {
  allocation: string;
  contact_person: string;
  designation: string;
  department: string;
  priority: string;
  remarks: string | null | undefined;
  contact_type_array: { type: string; value: string }[];

}

export const assignContactSchema = Yup.object({
  contact_person: Yup.string().required("Contact Person is required"),
  // allocation: Yup.string().required("Allocation is required"),
  // designation: Yup.string().trim().required("Designation is required"),
  department: Yup.string().trim().notRequired(),
  officeName: Yup.string().trim().notRequired(),
  officeCode: Yup.string().trim().notRequired(),
  // contact_type_array: Yup
  //.array()
  //.of(
  //     Yup.object({
  //       type: Yup.string().required("Select contact type"),
  //       value: Yup
  //         .string()
  //         .nullable()
  //         .when("type", {
  //               is: (type: string) => !!type,
  //                 then: (schema) =>
  //                   schema
  //                     .required("Contact value is required")
  //                     .when("type", {
  //                       is: "email",
  //                       then: (s) =>
  //                         s.matches(
  //                           /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  //                           "Enter a valid email"
  //                         ),
  //                     })
  //                     .when("type", {
  //                       is: "mobile",
  //                       then: (s) =>
  //                         s.matches(
  //                           /^\d{10}$/,
  //                           "Enter a valid 10-digit mobile"
  //                         ),
  //                     })
  //                     .when("type", {
  //                       is: "landline",
  //                       then: (s) =>
  //                         s.matches(
  //                           /^(\d{2,4}-\d{8}|\d{2,4}\d{8})$/,
  //                           "Enter a valid landline number"
  //                         ),
  //                     }),
  //               }),
  //           })
  //         ),
  // priority: Yup.string().required("Priority is required"),
  // remarks: Yup.string().nullable().notRequired(), 
});
