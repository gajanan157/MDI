import { AxiosInstance } from "axios";

export const downloadFile = async ({
  client,
  url,
  fileName = "download.xlsx",
  method = "GET",
  data,
  params, 
}: {
  client: AxiosInstance;
  url: string;
  fileName?: string;
  method?: "GET" | "POST";
  data?: any;
  params?: any;
}) => {
  const res = await client({
    url,
    method,
    data,
    params, 
    responseType: "blob",
  });
  const contentType =
    res.headers?.["content-type"] ||
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

  const blob = new Blob([res.data], { type: contentType });

  const downloadUrl = window.URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = downloadUrl;
  link.setAttribute("download", fileName);

  document.body.appendChild(link);
  link.click();
  link.remove();

  window.URL.revokeObjectURL(downloadUrl);
};
export const downloadFile2 = async ({
  client,
  url,
  fileName = "download.pdf",
  method = "GET",
  data,
  params, 
}: {
  client: AxiosInstance;
  url: string;
  fileName?: string;
  method?: "GET";
  data?: any;
  params?: any;
}) => {
  const res = await client({
    url,
    method,
    data,
    params, // ✅ use params for query
    responseType: "blob",
  });
  const contentType =
    res.headers?.["content-type"] || "application/pdf";

  const blob = new Blob([res.data], { type: contentType });

  const downloadUrl = window.URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = downloadUrl;
  link.setAttribute("download", fileName);

  document.body.appendChild(link);
  link.click();
  link.remove();

  window.URL.revokeObjectURL(downloadUrl);
};


export const refreshPage = (): void => {
  window.location.reload();
};