import { extractApiFieldErrors } from "@/app/api/apiService";
import { UseFormSetError, Path } from "react-hook-form";

interface ApiErrorResponse {
  success?: boolean;
  message?: string;
  errorPayload?: unknown;
  error?:
    | Record<string, string>
    | { code?: string; fields?: Record<string, string>; mobileNumber?: string; email?: string };
}

function setFormFieldErrors<T extends Record<string, unknown>>(
  fieldErrors: Record<string, string>,
  setError: UseFormSetError<T>,
  fieldMap?: Record<string, Path<T>>,
): void {
  Object.entries(fieldErrors).forEach(([apiField, message]) => {
    if (typeof message !== "string" || !message.trim()) return;

    const formField = (fieldMap?.[apiField] ?? apiField) as Path<T>;
    setError(formField, {
      type: "server",
      message,
    });
  });
}

export const handleFormApiErrors = <T extends Record<string, any>>(
  apiResponse: ApiErrorResponse,
  setError: UseFormSetError<T>,
  fieldMap?: Record<string, Path<T>>,
): void => {
  // PATCH keeps `error` as a toast string; field keys (e.g. insurerCode) live on errorPayload.
  const payloadFieldErrors = extractApiFieldErrors(apiResponse.errorPayload);
  if (Object.keys(payloadFieldErrors).length > 0) {
    setFormFieldErrors(payloadFieldErrors, setError, fieldMap);
    return;
  }

  if (!apiResponse?.error || typeof apiResponse.error === "string") return;

  // POST 409 conflicts: error.fields on the structured error object (existing behaviour).
  const fieldErrors =
    typeof apiResponse.error.fields === "object" && apiResponse.error.fields !== null
      ? apiResponse.error.fields
      : (apiResponse.error as Record<string, string>);

  setFormFieldErrors(fieldErrors, setError, fieldMap);
};
