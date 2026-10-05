import * as Yup from 'yup'

export interface TenentFormValues {
   tenentName: string,
  dispalyOrder?: string,
  region?: string,
  shardKey?: string,
}


export const schema= Yup.object().shape({
  tenentName: Yup.string().trim().required("Tenent Name is required"),
  dispalyOrder: Yup.string(),
  region: Yup.string(),
  shardKey: Yup.string(),
});

