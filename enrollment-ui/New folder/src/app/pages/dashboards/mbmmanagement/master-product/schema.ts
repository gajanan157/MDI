import * as Yup from "yup";

export const addMasterProductSchema = Yup.object({
  productName: Yup.string().required("Product Name is required"),
  insurerId: Yup.string().required("Insurance company is required"),
  uin: Yup.string().required("UIN is required"),
  documents: Yup.array()
    .transform((value) => value?.filter(Boolean) ?? [])
    .of(
      Yup.mixed<File>()
        .test("fileType", "Only PDF allowed", (file) =>
          file ? file.type === "application/pdf" : true,
        )
        .test("fileSize", "Max size 10MB", (file) =>
          file ? file.size <= 10 * 1024 * 1024 : true,
        ),
    )
    .default([]),
});

export const productSchema = Yup.object({
  productName: Yup.string().required("Product Name is required"),
  productType: Yup.string().required("Product Type is required"),
  uin: Yup.string().required("UIN is required"),
  insurerId: Yup.string().required("Insurance company is required"),
  documents: Yup.array()
    .transform((value) => value?.filter(Boolean) ?? [])
    .of(
      Yup.mixed<File>()
        .test("fileType", "Only PDF allowed", (file) =>
          file ? file.type === "application/pdf" : true,
        )
        .test("fileSize", "Max size 10MB", (file) =>
          file ? file.size <= 10 * 1024 * 1024 : true,
        ),
    )
    .default([]),
});
