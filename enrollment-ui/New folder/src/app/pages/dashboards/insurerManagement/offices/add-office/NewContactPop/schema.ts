import * as yup from "yup";
import { contactPersonsSchema } from "../../../contactPerson/contactPersons";

export const newcontactPersonsSchema = yup.object().shape({
  contactPersons: contactPersonsSchema,
  });
