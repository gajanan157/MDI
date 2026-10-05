// src/components/shared/JsonAccordionForm/schemaGenerator.ts
import * as yup from "yup";
import { AnyObject } from "./types";

/**
 * Generates a Yup validation schema from a JSON object structure
 */
export function generateSchema(data: AnyObject): yup.ObjectSchema<any> {
  const shape: Record<string, any> = {};

  function processValue(key: string, value: any): any {
    if (value === null || value === undefined) {
      return yup.string().nullable();
    }

    if (typeof value === "string") {
      // Check if it looks like a required field
      const isRequired = !value.includes("To be provided") && value.trim().length > 0;
      let schema = yup.string();
      if (isRequired && value.length > 0) {
        schema = schema.required(`${key} is required`);
      }
      return schema;
    }

    if (typeof value === "number") {
      return yup.number().typeError(`${key} must be a number`);
    }

    if (typeof value === "boolean") {
      return yup.boolean().typeError(`${key} must be a boolean`);
    }

    if (Array.isArray(value)) {
      if (value.length > 0 && typeof value[0] === "object") {
        // Array of objects - create schema for first object but make all fields optional
        // This prevents validation errors when array items have different structures
        const itemShape: Record<string, any> = {};
        Object.keys(value[0]).forEach((k) => {
          const fieldSchema = processValue(k, value[0][k]);
          // Make all fields in array items optional to avoid validation errors
          itemShape[k] = fieldSchema.nullable().notRequired();
        });
        return yup.array().of(yup.object().shape(itemShape).noUnknown(true));
      }
      // Empty array or array of primitives - no strict validation
      return yup.array().nullable().notRequired();
    }

    if (typeof value === "object") {
      const nestedShape: Record<string, any> = {};
      Object.entries(value).forEach(([k, v]) => {
        nestedShape[k] = processValue(k, v);
      });
      return yup.object().shape(nestedShape);
    }

    return yup.mixed();
  }

  Object.entries(data).forEach(([key, value]) => {
    shape[key] = processValue(key, value);
  });

  // Return schema with noUnknown(false) to allow extra fields and be more lenient
  return yup.object().shape(shape).noUnknown(false);
}

